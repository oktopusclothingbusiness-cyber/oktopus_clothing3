'use server';

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// POST to apply a coupon code
export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();
    
    if (!code || typeof subtotal === 'undefined') {
      return NextResponse.json({ message: 'Coupon code and subtotal are required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const coupon = await db.collection('coupons').findOne({ 
        code: code.toUpperCase(),
        isActive: true
    });

    if (!coupon) {
      return NextResponse.json({ message: 'Coupon is invalid or has expired.' }, { status: 404 });
    }
    
    if (subtotal < coupon.minimumAmount) {
        return NextResponse.json({ message: `You need to spend at least ₹${coupon.minimumAmount} to use this coupon.` }, { status: 400 });
    }

    // Return the full coupon object on success
    return NextResponse.json(coupon, { status: 200 });

  } catch (error) {
    console.error('Failed to apply coupon:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
