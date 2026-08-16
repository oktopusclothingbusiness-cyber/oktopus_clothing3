import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { validateNextMobileHeaders, authenticateNextMobileRequest } from '@/lib/mobileSecurityNext';

export async function GET(request: NextRequest) {
  try {
    const headerCheck = await validateNextMobileHeaders(request);
    if (!headerCheck.valid) return headerCheck.response!;

    const authCheck = await authenticateNextMobileRequest(request);
    if (!authCheck.authenticated) return authCheck.response!;

    const client = await clientPromise;
    const db = client.db();

    let oktocoins = 100;
    if (authCheck.user && authCheck.user.userId) {
      try {
        const user = await db.collection('users').findOne({ _id: new ObjectId(authCheck.user.userId) });
        if (user && typeof user.oktocoins === 'number') {
          oktocoins = user.oktocoins;
        }
      } catch (e) {
        // Fallback
      }
    }

    const bubbles = [
      { id: 'oversized', title: 'Oversized Tees', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500' },
      { id: 'french-terry', title: 'French Terry', imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500' },
      { id: 'sweatshirts', title: 'Sweatshirts', imageUrl: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500' },
      { id: 'hoodies', title: 'Hoodies', imageUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=500' },
    ];

    const heroBanners = [
      { id: 'bengali-drop', title: 'Bengali Typography', discountText: '20% OFF', bannerUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1000' },
    ];

    const designThemes = [
      { id: 'marvel', title: 'Marvel Co.', imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500' },
      { id: 'dc', title: 'DC Universe', imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500' },
      { id: 'anime', title: 'Anime Vibes', imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500' },
      { id: 'abstract', title: 'Abstract Art', imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500' },
      { id: 'bengali', title: 'Bengali Drop', imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500' },
    ];

    return NextResponse.json(
      {
        oktocoins,
        bubbles,
        heroBanners,
        designThemes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Mobile Home Layout Error:', error);
    return NextResponse.json({ message: 'Failed to fetch homepage layout.' }, { status: 500 });
  }
}
