import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authenticateRequest } from '@/lib/auth';

// PUT update mobile coupon status or details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('mobileCoupons').updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Mobile coupon not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Mobile coupon updated successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to update mobile coupon:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// DELETE mobile coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = await params;

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('mobileCoupons').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Mobile coupon not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Mobile coupon deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete mobile coupon:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
