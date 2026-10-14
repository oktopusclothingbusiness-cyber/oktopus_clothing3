
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';

import { triggerUserEventPushNotification } from '@/lib/pushNotifications';

const MAPBOX_TOKEN = "pk.eyJ1Ijoib2t0b3B1c2MiLCJhIjoiY21keGUyNjU0MXhwYjJsc2FrcGZsd290eCJ9.mEjrHNxJYljQLhjVslo_iw";

// Function to geocode an address using Mapbox
const geocodeAddress = async (address: string) => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return { latitude, longitude };
    }
    return null;
  } catch (error) {
    console.error("Mapbox geocoding error:", error);
    return null;
  }
};


// GET all orders (for admin - requires Admin Auth)
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized access to orders.' }, { status: auth.statusCode || 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST a new order
export async function POST(request: Request) {
  try {
    const {
      userId,
      userName,
      products,
      total,
      shippingAddress,
      subtotal,
      discount,
      shipping,
      status,
      orderSource,
      isOfflineSale,
      paymentDetails,
    } = await request.json();

    if (!userId || !products || !total || !shippingAddress) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    // Geocode address if coordinates are not provided
    if ((!shippingAddress.latitude || !shippingAddress.longitude) && shippingAddress.address) {
        const coordinates = await geocodeAddress(shippingAddress.address);
        if (coordinates) {
            shippingAddress.latitude = coordinates.latitude;
            shippingAddress.longitude = coordinates.longitude;
        }
    }
    
    const client = await clientPromise;
    const db = client.db();

    // Verify whether any products are mobile app exclusive
    const appSecret = request.headers.get('x-app-secret');
    const platform = request.headers.get('x-platform');
    const isMobileAppReq =
      appSecret === 'okto_mobile_sec_2026_prod' ||
      platform === 'android' ||
      platform === 'ios' ||
      orderSource === 'app' ||
      orderSource === 'mobile' ||
      orderSource === 'mobile_app';
    if (!isMobileAppReq && Array.isArray(products) && products.length > 0) {
      const { ObjectId } = await import('mongodb');
      const rawIds = products.map((p: any) => p.productId || p.id || p._id).filter(Boolean);
      const validObjectIds = rawIds.filter((id: string) => ObjectId.isValid(id)).map((id: string) => new ObjectId(id));

      const exclusiveCount = await db.collection('products').countDocuments({
        $or: [
          { _id: { $in: validObjectIds }, isMobileExclusive: true },
          { id: { $in: rawIds }, isMobileExclusive: true },
        ],
      });

      if (exclusiveCount > 0) {
        return NextResponse.json(
          { message: 'One or more items in your order are exclusive to the OKTOPUS mobile app and cannot be purchased via web checkout.' },
          { status: 400 }
        );
      }
    }
    
    const orderData = {
      userId,
      userName,
      products,
      subtotal,
      discount,
      shipping,
      total,
      shippingAddress,
      status: status || 'pending', // Initial status
      orderSource: orderSource || (isOfflineSale ? 'offline' : 'online'),
      isOfflineSale: Boolean(isOfflineSale),
      createdAt: new Date(),
      paymentDetails: paymentDetails || {}
    };

    const result = await db.collection('orders').insertOne(orderData);
    const orderIdStr = result.insertedId.toString();

    // Trigger Order Confirmed push notification
    triggerUserEventPushNotification({
      userId,
      email: shippingAddress?.email,
      title: 'Order Confirmed! 🛍️',
      body: `Thank you for your order #${orderIdStr.slice(-6)}. We are preparing your drop!`,
      deepLink: '/orders',
    }).catch((err) => console.error('Failed to trigger order push notification:', err));
    
    return NextResponse.json({ message: 'Order created successfully', orderId: result.insertedId }, { status: 201 });

  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
