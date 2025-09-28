
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET all trends
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const trends = await db.collection('trends').find({}).toArray();
    return NextResponse.json(trends, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch trends:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST a new trend
export async function POST(request: Request) {
  try {
    const trend = await request.json();
    
    if (!trend.title || !trend.imageUrl) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('trends').insertOne({
      ...trend,
      isActive: trend.isActive || false,
      createdAt: new Date(),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create trend:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
