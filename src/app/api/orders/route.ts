
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

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


// GET all orders (for admin)
export async function GET(request: Request) {
  try {
    // In a real app, you'd protect this endpoint to ensure only admins can access it.
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
    const { userId, userName, products, total, shippingAddress } = await request.json();

    if (!userId || !products || !total || !shippingAddress) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    // Geocode address if coordinates are not provided
    if (!shippingAddress.latitude || !shippingAddress.longitude) {
        const coordinates = await geocodeAddress(shippingAddress.address);
        if (coordinates) {
            shippingAddress.latitude = coordinates.latitude;
            shippingAddress.longitude = coordinates.longitude;
        }
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    const orderData = {
      userId,
      userName,
      products,
      total,
      shippingAddress,
      status: 'pending', // Initial status
      createdAt: new Date(),
      paymentDetails: {}
    };

    const result = await db.collection('orders').insertOne(orderData);
    
    return NextResponse.json({ message: 'Order created successfully', orderId: result.insertedId }, { status: 201 });

  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
