
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET all colors
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const colors = await db.collection('colors').find({}).sort({ createdAt: 1 }).toArray();
    
    // Normalize images array on each color
    const normalizedColors = colors.map((c: any) => {
      const images = Array.isArray(c.images) && c.images.length > 0 
        ? c.images.filter(Boolean) 
        : (c.imageUrl ? [c.imageUrl] : []);
      return {
        ...c,
        imageUrl: c.imageUrl || images[0] || '',
        images,
      };
    });

    return NextResponse.json(normalizedColors, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch colors:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST a new color
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;
    let images: string[] = Array.isArray(body.images) ? body.images.map((s: any) => String(s).trim()).filter(Boolean) : [];
    let imageUrl: string = body.imageUrl ? String(body.imageUrl).trim() : '';

    if (images.length > 0 && !imageUrl) {
      imageUrl = images[0];
    } else if (imageUrl && images.length === 0) {
      images = [imageUrl];
    }
    
    if (!name || (!imageUrl && images.length === 0)) {
      return NextResponse.json({ message: 'Missing required fields: name and at least one image.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('colors').insertOne({
      name,
      imageUrl,
      images,
      createdAt: new Date(),
    });

    return NextResponse.json({ insertedId: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Failed to create color:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
