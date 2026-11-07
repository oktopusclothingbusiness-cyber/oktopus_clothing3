import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get('visitorId');
    const fingerprintId = searchParams.get('fingerprintId');

    if (!visitorId && !fingerprintId) {
      return NextResponse.json({ message: 'Visitor ID or Fingerprint ID required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const visitor = await db.collection('visitor_fingerprints').findOne({
      $or: [
        ...(visitorId ? [{ visitorId }, { knownVisitorIds: visitorId }] : []),
        ...(fingerprintId ? [{ fingerprintId }, { knownFingerprintIds: fingerprintId }] : []),
      ],
    });

    if (!visitor || !Array.isArray(visitor.viewedProducts) || visitor.viewedProducts.length === 0) {
      // Return top trending or newest products as default recommendation
      const defaultProducts = await db
        .collection('products')
        .find({ stock: { $gt: 0 } })
        .sort({ createdAt: -1 })
        .limit(8)
        .toArray();

      return NextResponse.json({
        hasHistory: false,
        recentlyViewed: [],
        recommended: defaultProducts.map((p) => ({
          id: p._id.toString(),
          name: p.name,
          price: p.price,
          category: p.category,
          images: p.images || [],
        })),
      });
    }

    const viewed = visitor.viewedProducts;
    // Sort recently viewed
    const sortedViewed = [...viewed].sort(
      (a: any, b: any) => new Date(b.lastViewedAt).getTime() - new Date(a.lastViewedAt).getTime()
    );

    // Count top categories from visitor history
    const categoryFrequency: Record<string, number> = {};
    for (const item of viewed) {
      if (item.category) {
        categoryFrequency[item.category] = (categoryFrequency[item.category] || 0) + (item.viewCount || 1);
      }
    }

    const favoriteCategories = Object.keys(categoryFrequency).sort(
      (a, b) => categoryFrequency[b] - categoryFrequency[a]
    );

    // Exclude product IDs already viewed heavily
    const viewedIds = viewed.map((v: any) => v.productId);

    // Recommend in-stock products matching their top categories
    const recommendedQuery: any = {
      stock: { $gt: 0 },
    };

    if (favoriteCategories.length > 0) {
      recommendedQuery.category = { $in: favoriteCategories };
    }

    const recommendedFromDb = await db
      .collection('products')
      .find(recommendedQuery)
      .limit(10)
      .toArray();

    return NextResponse.json({
      hasHistory: true,
      favoriteCategories,
      recentlyViewed: sortedViewed.slice(0, 10),
      recommended: recommendedFromDb.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        price: p.price,
        category: p.category,
        images: p.images || [],
      })),
    });
  } catch (error) {
    console.error('Failed to get visitor recommendations:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

