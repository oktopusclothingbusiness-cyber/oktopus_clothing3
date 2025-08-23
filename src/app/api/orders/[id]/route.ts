
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// This file is for a dynamic route segment. For example: /api/orders/123

// GET a single order by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid order ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const order = await db.collection('orders').findOne({ _id: new ObjectId(id) });

    if (!order) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}


// PUT (update) an order by ID, e.g., to change its status
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid order ID.' }, { status: 400 });
    }
    
    // In a real app, you would add authentication to ensure only admins can do this.
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['pending', 'accepted', 'rejected', 'packed', 'shipped', 'delivered', 'paid'];
    if (!status || !validStatuses.includes(status)) {
        return NextResponse.json({ message: 'Invalid status provided.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: status } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: `Order status updated to ${status}.` }, { status: 200 });

  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
