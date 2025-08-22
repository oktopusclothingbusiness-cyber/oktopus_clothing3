
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import shortid from 'shortid';

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    if (!amount) {
      return NextResponse.json({ message: 'Amount is required.' }, { status: 400 });
    }

    const payment_capture = 1;
    const totalAmount = amount * 100; // Amount in paise
    const currency = 'INR';

    const options = {
      amount: totalAmount.toString(),
      currency,
      receipt: shortid.generate(),
      payment_capture,
    };
    
    const response = await instance.orders.create(options);
    
    return NextResponse.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    }, { status: 200 });

  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
