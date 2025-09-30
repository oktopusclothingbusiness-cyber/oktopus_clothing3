
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET all colors
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const colors = await db.collection('colors').find({}).sort({ createdAt: 1 }).toArray();
    return NextResponse.json(colors, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch colors:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST a new color
export async function POST(request: Request) {
  try {
    const { name, hex } = await request.json();
    
    if (!name || !hex) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('colors').insertOne({
      name,
      hex,
      createdAt: new Date(),
    });

    return NextResponse.json(result.insertedId, { status: 201 });
  } catch (error) {
    console.error('Failed to create color:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
