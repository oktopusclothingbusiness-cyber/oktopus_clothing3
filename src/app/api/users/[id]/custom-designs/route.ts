
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: userId } = params;
    
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Invalid user ID.' }, { status: 400 });
    }
    
    // In a real app, you should verify that the logged-in user is requesting their own designs.

    const client = await clientPromise;
    const db = client.db();

    const designs = await db.collection('customDesigns').find({ userId: userId }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(designs, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch user designs:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

    