
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET all rewards
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const rewards = await db.collection('rewards').find({}).toArray();
    return NextResponse.json(rewards, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch rewards:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST a new reward
export async function POST(request: Request) {
  try {
    const reward = await request.json();
    
    if (!reward.name || !reward.imageUrl || !Array.isArray(reward.sizes)) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('rewards').insertOne({
      ...reward,
      createdAt: new Date(),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create reward:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
