
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { sendOrderConfirmationEmail } from '@/lib/mail';
import { ObjectId } from 'mongodb';

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
    
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (user) {
        await sendOrderConfirmationEmail({
            to: user.email,
            orderId: result.insertedId.toString(),
            userName,
            orderDate: orderData.createdAt,
            total,
            products
        });
    }

    return NextResponse.json({ message: 'Order created successfully', orderId: result.insertedId }, { status: 201 });

  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
