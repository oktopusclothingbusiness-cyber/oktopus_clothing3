import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';

// GET mobile product catalog
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('q');
    const categoryId = searchParams.get('category');

    const client = await clientPromise;
    const db = client.db();

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

    const products = await db.collection('products').find(query, {
      projection: { cost: 0, supplierInfo: 0 } // Sanitize internal cost metrics
    }).toArray();

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch mobile products:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
