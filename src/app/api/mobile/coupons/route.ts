import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';

// GET active mobile-exclusive coupons
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    // Fetch coupons from dedicated mobileCoupons collection
    const coupons = await db.collection('mobileCoupons').find({ isActive: true }).toArray();
    return NextResponse.json(coupons, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch mobile coupons:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST create a new mobile-exclusive coupon (Admin)
export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const body = await request.json();
    const { code, discountType, discountValue, minOrderAmount, maxDiscountCap, userType, expiryDate } = body;

    if (!code || !discountType || !discountValue) {
      return NextResponse.json({ message: 'Code, discount type, and discount value are required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const newCoupon = {
      code: code.toUpperCase().trim(),
      discountType: discountType || 'percentage', // 'percentage' | 'flat'
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount || 0),
      maxDiscountCap: Number(maxDiscountCap || 0),
      userType: userType || 'all_app_users', // 'all_app_users' | 'first_app_order'
      isAppOnly: true,
      isActive: true,
      createdAt: new Date(),
      expiryDate: expiryDate || null,
    };

    const result = await db.collection('mobileCoupons').insertOne(newCoupon);
    return NextResponse.json({ message: 'Mobile coupon created successfully', id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Failed to create mobile coupon:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
