
import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET all products or search for products
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('q');
    const categoryId = searchParams.get('category');


    let query: any = {};
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    
    if (categoryId) {
      query.category = categoryId;
    }


    const products = await db.collection('products').find(query).toArray();
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
    if (!product.name || !product.price || !product.imageUrls || !Array.isArray(product.imageUrls) || product.imageUrls.length === 0) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }
    
    if (!Array.isArray(product.category)) {
      product.category = [];
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('products').insertOne({
      ...product,
      featured: product.featured || false, // Default featured to false
      isHero: product.isHero || false,
      rating: product.rating || 4.5,
      stock: product.stock || 100,
      cost: product.cost || 0,
      createdAt: new Date(),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
