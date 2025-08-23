
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// DELETE a coupon by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid coupon ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('coupons').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Coupon not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Coupon deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete coupon:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT (update) a coupon by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid coupon ID.' }, { status: 400 });
        }

        const couponData = await request.json();
        const { _id, id: couponId, ...updateData } = couponData;

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('coupons').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Coupon not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Coupon updated successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Failed to update coupon:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
