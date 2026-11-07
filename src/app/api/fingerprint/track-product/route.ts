import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getClientIp } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitorId, fingerprintId, product } = body;

    if ((!visitorId && !fingerprintId) || !product?.productId) {
      return NextResponse.json({ message: 'Missing visitor or product details' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('visitor_fingerprints');
    const now = new Date();

    const query = {
      $or: [
        ...(visitorId ? [{ visitorId }] : []),
        ...(fingerprintId ? [{ fingerprintId }] : []),
      ],
    };

    const visitor = await collection.findOne(query);

    if (!visitor) {
      // If visitor document hasn't been created yet, let initial harvester create it
      return NextResponse.json({ message: 'Visitor not found yet' }, { status: 202 });
    }

    const existingProducts = visitor.viewedProducts || [];
    const prodIndex = existingProducts.findIndex((p: any) => p.productId === product.productId);

    if (prodIndex > -1) {
      // Product already in list - increment count and update last viewed time
      await collection.updateOne(
        { ...query, 'viewedProducts.productId': product.productId },
        {
          $inc: { 'viewedProducts.$.viewCount': 1 },
          $set: {
            'viewedProducts.$.lastViewedAt': now,
            'viewedProducts.$.price': product.price ?? existingProducts[prodIndex].price,
            'viewedProducts.$.title': product.title || existingProducts[prodIndex].title,
            'viewedProducts.$.imageUrl': product.imageUrl || existingProducts[prodIndex].imageUrl,
            'analytics.lastSeenAt': now,
            updatedAt: now,
          },
        }
      );
    } else {
      // New product view - push to viewedProducts
      const newProductItem = {
        productId: product.productId,
        title: product.title || 'Product',
        slug: product.slug || product.productId,
        price: product.price || 0,
        imageUrl: product.imageUrl || '',
        category: product.category || 'General',
        firstViewedAt: now,
        lastViewedAt: now,
        viewCount: 1,
      };

      await collection.updateOne(query, {
        $push: { viewedProducts: newProductItem as any } as any,
        $set: {
          'analytics.lastSeenAt': now,
          updatedAt: now,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to track product view:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
