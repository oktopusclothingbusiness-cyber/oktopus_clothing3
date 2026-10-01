
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET a user's cart
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Invalid user ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const rawCart = Array.isArray(user.cart) ? user.cart : [];

    // Identify any cart items that need product population (missing name or price, or legacy format)
    const productIdsToFetch: ObjectId[] = [];
    rawCart.forEach((item: any) => {
      const pid = item.productId || item.product || item.id || item._id;
      if (pid && typeof pid === 'string' && ObjectId.isValid(pid)) {
        productIdsToFetch.push(new ObjectId(pid));
      }
    });

    const productsMap = new Map<string, any>();
    if (productIdsToFetch.length > 0) {
      try {
        const prods = await db.collection('products').find({ _id: { $in: productIdsToFetch } }).toArray();
        prods.forEach((p) => productsMap.set(p._id.toString(), p));
      } catch (err) {
        console.warn('Failed to populate cart products:', err);
      }
    }

    const normalizedCart = rawCart.map((item: any) => {
      const rawId = item.id || item.productId || (typeof item.product === 'string' ? item.product : item.product?._id) || item._id;
      const pidStr = rawId ? String(rawId) : '';
      const prod = productsMap.get(pidStr);

      const price = Number(item.price !== undefined ? item.price : prod?.price || 0);
      const name = item.name || prod?.name || 'Apparel Item';

      let imageUrls: string[] = [];
      if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
        imageUrls = item.imageUrls.filter(Boolean);
      } else if (item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.trim()) {
        imageUrls = [item.imageUrl.trim()];
      } else if (Array.isArray(prod?.imageUrls) && prod.imageUrls.length > 0) {
        imageUrls = prod.imageUrls.filter(Boolean);
      } else if (prod?.imageUrl && typeof prod.imageUrl === 'string' && prod.imageUrl.trim()) {
        imageUrls = [prod.imageUrl.trim()];
      }

      return {
        id: pidStr,
        _id: pidStr,
        productId: pidStr,
        name,
        price,
        cost: Number(item.cost !== undefined ? item.cost : prod?.cost || 0),
        imageUrls,
        imageUrl: imageUrls[0] || '',
        quantity: Math.max(1, Number(item.quantity) || 1),
        size: item.size || 'M',
        color: item.color || 'Standard',
        fabricQuality: item.fabricQuality || '',
      };
    });

    return NextResponse.json({ cart: normalizedCart }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch user cart:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT (update/overwrite) a user's cart
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: userId } = await params;
        if (!ObjectId.isValid(userId)) {
            return NextResponse.json({ message: 'Invalid user ID.' }, { status: 400 });
        }

        const { cart } = await request.json();

        if (!Array.isArray(cart)) {
             return NextResponse.json({ message: 'Cart data must be an array.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { cart: cart } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Cart updated successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Failed to update user cart:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
