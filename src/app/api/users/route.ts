import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';

// GET all users (Requires Admin Auth)
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const users = await db.collection('users').find({}, {
      projection: { password: 0 } // Exclude password field
    }).sort({ createdAt: -1 }).toArray();

    const ordersCollection = db.collection('orders');

    // Aggregate user order history, cart data, and contact info
    const enrichedUsers = await Promise.all(
      users.map(async (u: any) => {
        const userIdStr = u._id ? u._id.toString() : '';
        const userEmail = (u.email || '').toLowerCase().trim();

        const matchConditions: any[] = [];
        if (userIdStr) matchConditions.push({ userId: userIdStr });
        if (userEmail) matchConditions.push({ customerEmail: userEmail });

        let lastOrder: any = null;
        let totalOrders = 0;
        let totalSpent = 0;

        if (matchConditions.length > 0) {
          const userOrders = await ordersCollection
            .find({ $or: matchConditions })
            .sort({ createdAt: -1 })
            .toArray();

          totalOrders = userOrders.length;
          if (userOrders.length > 0) {
            const first = userOrders[0];
            lastOrder = {
              _id: first._id.toString(),
              total: first.total,
              status: first.status,
              createdAt: first.createdAt,
              shippingAddress: first.shippingAddress,
            };
            totalSpent = userOrders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
          }
        }

        // Cart items and count
        const cartArray = Array.isArray(u.cart) ? u.cart : [];
        const cartCount = cartArray.reduce((acc: number, item: any) => acc + (Number(item.quantity) || 1), 0);

        // Address fallback from last order shipping address
        let effectiveAddress = u.address || '';
        if (!effectiveAddress && lastOrder?.shippingAddress) {
          const sa = lastOrder.shippingAddress;
          const parts = [sa.street, sa.address, sa.city, sa.state, sa.postalCode || sa.pincode].filter(Boolean);
          if (parts.length > 0) {
            effectiveAddress = parts.join(', ');
          }
        }

        // Phone fallback from last order shipping phone
        const effectiveMobile = u.mobile || u.phone || lastOrder?.shippingAddress?.phone || '';

        return {
          ...u,
          id: userIdStr,
          status: u.status || (u.isBlocked ? 'suspended' : 'active'),
          isBlocked: Boolean(u.isBlocked || u.status === 'suspended'),
          cart: cartArray,
          cartCount,
          lastOrder,
          totalOrders,
          totalSpent,
          address: effectiveAddress,
          mobile: effectiveMobile,
        };
      })
    );

    return NextResponse.json(enrichedUsers, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
