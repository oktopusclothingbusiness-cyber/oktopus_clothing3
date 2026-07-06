
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendInvoiceEmail } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId || !ObjectId.isValid(orderId)) {
      return NextResponse.json({ message: 'Valid Order ID is required.' }, { status: 400 });
    }
    
    // In a real app, you would add authentication to ensure only admins can do this.
    const client = await clientPromise;
    const db = client.db();

    const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });

    if (!order) {
        return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    const user = await db.collection('users').findOne({ _id: new ObjectId(order.userId) });
    if (!user) {
        return NextResponse.json({ message: 'Customer not found for this order.' }, { status: 404 });
    }
    
    const settings = await db.collection('settings').findOne({ _id: 'global' as any }) as any;

    await sendInvoiceEmail({
      to: user.email,
      // @ts-ignore
      order: order, 
      settings: settings
    });

    return NextResponse.json({ message: 'Invoice sent successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Failed to send invoice email:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

    
