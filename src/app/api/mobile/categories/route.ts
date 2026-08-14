import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';

// GET app categories with circular avatars & gender mapping
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const categories = await db.collection('categories').find({}).toArray();
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch mobile categories:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
