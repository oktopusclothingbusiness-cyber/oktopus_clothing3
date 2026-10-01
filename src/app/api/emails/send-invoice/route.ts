
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendInvoiceEmail } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ message: 'Valid Order ID is required.' }, { status: 400 });
    }
    
    // In a real app, you would add authentication to ensure only admins can do this.
    const client = await clientPromise;
    const db = client.db();

    const orderQuery: any = {
      $or: [
        { orderId: orderId },
        { invoiceNumber: orderId },
        ...(ObjectId.isValid(orderId) ? [{ _id: new ObjectId(orderId) }] : []),
      ],
    };

    const order = await db.collection('orders').findOne(orderQuery);

    if (!order) {
        return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    let user: any = null;
    if (order.userId && ObjectId.isValid(order.userId)) {
      user = await db.collection('users').findOne({ _id: new ObjectId(order.userId) });
    }

    const recipientEmail = user?.email || order.customer?.email || order.shippingAddress?.email;
    if (!recipientEmail) {
      return NextResponse.json({ message: 'Customer email not found for this order.' }, { status: 404 });
    }
    
    const settings = await db.collection('settings').findOne({ _id: 'global' as any }) as any;

    await sendInvoiceEmail({
      to: recipientEmail,
      order: order, 
      settings: settings,
      attachPdf: true,
    });

    return NextResponse.json({ message: 'Invoice sent successfully.' }, { status: 200 });

  } catch (error: any) {
    console.error('Failed to send invoice email:', error);
    return NextResponse.json({ message: error?.message || 'Failed to send invoice email.' }, { status: 500 });
  }
}

    
