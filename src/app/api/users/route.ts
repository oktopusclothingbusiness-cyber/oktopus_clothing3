
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET all users
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const users = await db.collection('users').find({}, {
      projection: { password: 0 } // Exclude password field
    }).toArray();

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
