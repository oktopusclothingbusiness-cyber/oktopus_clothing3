
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

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
    const { userId, userName, cart, total, shippingAddress } = await request.json();

    if (!userId || !cart || !total || !shippingAddress) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const products = cart.map((item: any) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
    }));

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
