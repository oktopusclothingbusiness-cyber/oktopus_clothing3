import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';

// GET customization colors/palette for mobile app
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const colors = await db.collection('colors').find({}).sort({ createdAt: 1 }).toArray();

    const formattedColors = colors.map((c: any) => {
      const images = Array.isArray(c.images) && c.images.length > 0
        ? c.images.filter(Boolean)
        : (c.imageUrl ? [c.imageUrl] : []);

      return {
        _id: c._id ? c._id.toString() : '',
        id: c._id ? c._id.toString() : (c.id || ''),
        name: c.name || '',
        imageUrl: c.imageUrl || images[0] || '',
        images,
        createdAt: c.createdAt,
      };
    });

    return NextResponse.json(formattedColors, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch mobile palette:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
