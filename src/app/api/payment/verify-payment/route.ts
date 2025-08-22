
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
       return NextResponse.json({ message: 'Missing payment details.' }, { status: 400 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Here you would typically save the payment details to your database
      // For example: await db.collection('payments').insertOne({ razorpay_order_id, razorpay_payment_id, ... });

      return NextResponse.json({ message: 'Payment verified successfully.' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Invalid payment signature.' }, { status: 400 });
    }

  } catch (error) {
    console.error('Razorpay Verify Payment Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
