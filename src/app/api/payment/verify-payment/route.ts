
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// The Razorpay key secret is now hardcoded.
// Replace with your actual key secret.
const RAZORPAY_KEY_SECRET = "YOUR_RAZORPAY_KEY_SECRET_HERE";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internal_order_id } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !internal_order_id) {
       return NextResponse.json({ message: 'Missing payment details.' }, { status: 400 });
    }
    
    if (!ObjectId.isValid(internal_order_id)) {
        return NextResponse.json({ message: 'Invalid internal order ID.' }, { status: 400 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is authentic, update the order in the database
      const client = await clientPromise;
      const db = client.db();

      await db.collection('orders').updateOne(
        { _id: new ObjectId(internal_order_id) },
        { 
          $set: { 
            status: 'paid',
            paymentDetails: {
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
              verifiedAt: new Date()
            }
          }
        }
      );

      return NextResponse.json({ message: 'Payment verified successfully.' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Invalid payment signature.' }, { status: 400 });
    }

  } catch (error) {
    console.error('Razorpay Verify Payment Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
