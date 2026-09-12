import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';
import { triggerUserEventPushNotification } from '@/lib/pushNotifications';

// GET mobile orders pipeline
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch mobile orders:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST create mobile app order
export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { userId, userName, products, total, shippingAddress, subtotal, discount, shipping, couponCode } = await request.json();

    if (!userId || !products || !total || !shippingAddress) {
      return NextResponse.json({ message: 'Missing required order fields.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const orderData = {
      userId,
      userName: userName || 'Mobile App Customer',
      products,
      subtotal,
      discount: discount || 0,
      shipping: shipping || 0,
      total,
      shippingAddress,
      couponCode: couponCode || null,
      source: 'mobile_app',
      status: 'pending',
      createdAt: new Date(),
      paymentDetails: {}
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
    }).catch((err) => console.error('Failed to trigger mobile order push notification:', err));

    return NextResponse.json({
      message: 'Mobile order created successfully',
      orderId: result.insertedId
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create mobile order:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
