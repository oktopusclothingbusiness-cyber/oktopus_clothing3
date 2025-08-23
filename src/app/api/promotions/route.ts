
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET all promotions
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const promotions = await db.collection('promotions').find({}).toArray();
    return NextResponse.json(promotions, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch promotions:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST a new promotion
export async function POST(request: Request) {
  try {
    const promotion = await request.json();
    
    if (!promotion.title || !promotion.imageUrl) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('promotions').insertOne({
      ...promotion,
      isActive: promotion.isActive || false,
      createdAt: new Date(),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create promotion:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
