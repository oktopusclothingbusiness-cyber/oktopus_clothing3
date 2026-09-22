import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// GET a single mobile product with variants by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authenticateRequest(request, { allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'Missing product ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    let query: any = {};
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { id }] };
    } else {
      query = { id };
    }

    const product = await db.collection('products').findOne(query, {
      projection: { cost: 0, supplierInfo: 0 } // Sanitize internal cost metrics
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch mobile product by id:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
