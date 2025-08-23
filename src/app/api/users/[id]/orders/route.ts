
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: userId } = params;
    
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Invalid user ID.' }, { status: 400 });
    }
    
    // In a real app, you should verify that the logged-in user is requesting their own orders.
    // We'll skip that for now and assume the request is authorized.

    const client = await clientPromise;
    const db = client.db();

    const orders = await db.collection('orders').find({ userId: userId }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch user orders:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
