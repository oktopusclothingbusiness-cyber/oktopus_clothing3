import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { code, orderTotal, userId } = await request.json();

    if (!code || orderTotal === undefined) {
      return NextResponse.json({ message: 'Coupon code and order total are required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // 1. Find Coupon in mobileCoupons Collection
    const coupon = await db.collection('mobileCoupons').findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    });

    if (!coupon) {
      return NextResponse.json({ message: 'Invalid or expired mobile app coupon code.' }, { status: 404 });
    }

    // 2. Min Order Amount Check
    if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
      return NextResponse.json({
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required for coupon ${coupon.code}.`,
      }, { status: 400 });
    }

    // 3. First App Order Rule Check
    if (coupon.userType === 'first_app_order') {
      if (!userId) {
        return NextResponse.json({ message: 'Please log in to apply first app order discount.' }, { status: 400 });
      }

      const previousOrdersCount = await db.collection('orders').countDocuments({ userId });
      if (previousOrdersCount > 0) {
        return NextResponse.json({ message: `Coupon ${coupon.code} is valid only on your first mobile app purchase.` }, { status: 400 });
      }
    }

    // 4. Calculate Discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((orderTotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountCap && coupon.maxDiscountCap > 0) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountCap);
      }
    } else if (coupon.discountType === 'flat') {
      discountAmount = Math.min(coupon.discountValue, orderTotal);
    }

    const finalTotal = Math.max(0, orderTotal - discountAmount);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalTotal,
      message: `Coupon ${coupon.code} applied successfully! You saved ₹${discountAmount}.`,
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to apply mobile coupon:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
