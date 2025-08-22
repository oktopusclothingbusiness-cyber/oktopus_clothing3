
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET all products
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const products = await db.collection('products').find({}).toArray();
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST a new product
export async function POST(request: Request) {
  try {
    const product = await request.json();
    
    // Basic validation
    if (!product.name || !product.price || !product.imageUrl) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('products').insertOne({
      ...product,
      createdAt: new Date(),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
