
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET all popups
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const popups = await db.collection('popups').find({}).toArray();
    return NextResponse.json(popups, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch popups:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST a new popup
export async function POST(request: Request) {
  try {
    const popup = await request.json();
    
    if (!popup.title || !popup.imageUrl) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // If the new popup is active, ensure no others are
    if (popup.isActive) {
        await db.collection('popups').updateMany({ isActive: true }, { $set: { isActive: false } });
    }

    const result = await db.collection('popups').insertOne({
      ...popup,
      isActive: popup.isActive || false,
      createdAt: new Date(),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create popup:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
