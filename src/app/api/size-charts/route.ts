
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET all size charts
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const sizeCharts = await db.collection('sizeCharts').find({}).sort({ name: 1 }).toArray();
    return NextResponse.json(sizeCharts, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch size charts:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST a new size chart
export async function POST(request: Request) {
  try {
    const chart = await request.json();
    
    if (!chart.name || !chart.imageUrl) {
      return NextResponse.json({ message: 'Missing required fields (name, imageUrl).' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('sizeCharts').insertOne({
      ...chart,
      createdAt: new Date(),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create size chart:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
