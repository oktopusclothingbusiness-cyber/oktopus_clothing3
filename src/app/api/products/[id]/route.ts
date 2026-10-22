
import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authenticateRequestAsync } from '@/lib/auth';

// GET a single product by ID (Public)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid product ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const product = await db.collection('products').findOne({ _id: new ObjectId(id) });

    if (!product) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch product by id:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// DELETE a product by ID (Strictly requires products:delete permission)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateRequestAsync(request, { requiredPermission: 'products:delete' });
    if (!auth.authenticated) {
      return NextResponse.json(
        { message: auth.error || 'Access denied: products:delete permission required.' },
        { status: auth.statusCode || 403 }
      );
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid product ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('products').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT (update) a product by ID (Requires products:edit permission)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateRequestAsync(request, { requiredPermission: 'products:edit', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json(
        { message: auth.error || 'Access denied: products:edit permission required.' },
        { status: auth.statusCode || 403 }
      );
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid product ID.' }, { status: 400 });
    }

    const productData = await request.json();
    const { _id, id: productId, ...updateData } = productData; // Exclude _id and id from update payload

    if (typeof updateData.featured === 'undefined') {
      delete updateData.featured;
    }

    if (updateData.originalPrice === '') {
      updateData.originalPrice = undefined;
    }

    if (typeof updateData.isMobileExclusive !== 'undefined') {
      updateData.isMobileExclusive = Boolean(updateData.isMobileExclusive);
    }
    
    if (updateData.category && !Array.isArray(updateData.category)) {
      updateData.category = [updateData.category];
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product updated successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
