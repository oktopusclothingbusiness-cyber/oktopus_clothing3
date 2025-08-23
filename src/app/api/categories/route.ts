
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET all categories
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const categories = await db.collection('categories').find({}).toArray();
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST a new category
export async function POST(request: Request) {
  try {
    const category = await request.json();
    
    if (!category.name || !category.imageUrl) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('categories').insertOne({
      ...category,
      createdAt: new Date(),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
