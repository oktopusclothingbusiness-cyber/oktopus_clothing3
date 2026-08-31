import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { actionType, productId, amount } = await request.json();

    if (!actionType || !productId) {
      return NextResponse.json({ message: 'Missing actionType or productId.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    if (actionType === 'RESTOCK') {
      const restockAmount = typeof amount === 'number' ? amount : 50;

      // Handle ObjectId vs String ID lookup
      let filterQuery: any = { id: productId };
      if (ObjectId.isValid(productId)) {
        filterQuery = { $or: [{ _id: new ObjectId(productId) }, { id: productId }] };
      }

      const result = await db.collection('products').updateOne(
        filterQuery,
        {
          $inc: { stock: restockAmount },
          $set: { updatedAt: new Date() },
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
      }

      return NextResponse.json(
        { success: true, message: `Successfully added ${restockAmount} items to stock.` },
        { status: 200 }
      );
    }

    return NextResponse.json({ message: `Unsupported action type: ${actionType}` }, { status: 400 });

  } catch (error: any) {
    console.error('Notification Quick Action Error:', error);
    return NextResponse.json({ message: error?.message || 'Internal server error.' }, { status: 500 });
  }
}
