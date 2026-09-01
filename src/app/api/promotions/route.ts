
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET promotions (supports optional ?placement=products_page filtering)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const placement = searchParams.get('placement');

    const client = await clientPromise;
    const db = client.db();

    let query: any = {};
    if (placement && placement !== 'all') {
      if (placement === 'home_page' || placement === 'mobile_banner') {
        query.$or = [
          { placement: placement },
          { placement: { $regex: `^${placement.trim()}$`, $options: 'i' } },
          { placement: { $exists: false } },
          { placement: null },
        ];
      } else {
        query.$or = [
          { placement: placement },
          { placement: { $regex: `^${placement.trim()}$`, $options: 'i' } }
        ];
      }
    }

    const promotions = await db.collection('promotions').find(query).toArray();
    return NextResponse.json(promotions, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch promotions:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST a new promotion
export async function POST(request: Request) {
  try {
    const promotion = await request.json();
    
    if (!promotion.title || !promotion.imageUrl) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('promotions').insertOne({
      ...promotion,
      placement: promotion.placement || 'home_page',
      isActive: typeof promotion.isActive === 'boolean' ? promotion.isActive : true,
      createdAt: new Date(),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create promotion:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
