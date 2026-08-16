import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { validateNextMobileHeaders, authenticateNextMobileRequest } from '@/lib/mobileSecurityNext';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const headerCheck = await validateNextMobileHeaders(request, body);
    if (!headerCheck.valid) return headerCheck.response!;

    const { cartItems } = body;
    if (!Array.isArray(cartItems)) {
      return NextResponse.json({ message: 'cartItems must be an array.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const productsCollection = db.collection('products');

    const syncedCart = [];
    const outOfStockItems = [];

    for (const item of cartItems) {
      if (!item.productId) continue;

      let product: any = null;
      try {
        if (ObjectId.isValid(item.productId)) {
          product = await productsCollection.findOne({ _id: new ObjectId(item.productId) });
        }
      } catch (e) {
        // Ignore invalid ObjectId formatting
      }

      if (!product) {
        outOfStockItems.push({ ...item, reason: 'Product no longer available' });
        continue;
      }

      const stock = product.stock ?? 10;
      if (stock <= 0) {
        outOfStockItems.push({ ...item, reason: 'Out of stock' });
      } else {
        const adjustedQuantity = Math.min(item.quantity || 1, stock);
        syncedCart.push({
          productId: item.productId,
          size: item.size || 'M',
          color: item.color || 'Black',
          quantity: adjustedQuantity,
          price: product.price || 0,
          name: product.name || '',
          imageUrl: product.imageUrl || '',
        });
      }
    }

    // Optional user cart update if auth present
    const authCheck = await authenticateNextMobileRequest(request);
    if (authCheck.authenticated && authCheck.user?.userId) {
      try {
        await db.collection('users').updateOne(
          { _id: new ObjectId(authCheck.user.userId) },
          { $set: { cart: syncedCart, updatedAt: new Date() } }
        );
      } catch (err) {
        // Non-blocking
      }
    }

    return NextResponse.json(
      {
        synced: true,
        cart: syncedCart,
        outOfStockItems,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cart Quick Sync Error:', error);
    return NextResponse.json({ message: 'Failed to sync cart items.' }, { status: 500 });
  }
}
