
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET a user's cart
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: userId } = params;
    
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Invalid user ID.' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ cart: user.cart || [] }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch user cart:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT (update/overwrite) a user's cart
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id: userId } = params;
        if (!ObjectId.isValid(userId)) {
            return NextResponse.json({ message: 'Invalid user ID.' }, { status: 400 });
        }

        const { cart } = await request.json();

        if (!Array.isArray(cart)) {
             return NextResponse.json({ message: 'Cart data must be an array.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { cart: cart } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Cart updated successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Failed to update user cart:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
