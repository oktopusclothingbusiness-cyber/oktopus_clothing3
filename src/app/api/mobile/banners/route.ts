import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';

// GET active mobile hero banners
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const banners = await db.collection('promotions').find({ isActive: true }).sort({ order: 1 }).toArray();
    return NextResponse.json(banners, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch mobile banners:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
