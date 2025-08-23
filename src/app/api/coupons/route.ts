
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET all coupons
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const coupons = await db.collection('coupons').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(coupons, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch coupons:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST a new coupon
export async function POST(request: Request) {
  try {
    const coupon = await request.json();
    
    if (!coupon.code || !coupon.discountPercentage) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const existingCoupon = await db.collection('coupons').findOne({ code: coupon.code.toUpperCase() });
    if (existingCoupon) {
      return NextResponse.json({ message: 'Coupon code already exists.' }, { status: 409 });
    }

    const result = await db.collection('coupons').insertOne({
      ...coupon,
      code: coupon.code.toUpperCase(),
      isActive: coupon.isActive ?? true,
      createdAt: new Date(),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create coupon:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
