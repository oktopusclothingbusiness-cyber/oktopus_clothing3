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
    const invoicesCollection = db.collection('invoices');

    // Aggregate user order history, invoices, cart data, and contact info
    const enrichedUsers = await Promise.all(
      users.map(async (u: any) => {
        const userIdStr = u._id ? u._id.toString() : '';
        const userEmail = (u.email || '').toLowerCase().trim();
        const userMobile = (u.mobile || u.phone || '').trim();

        const orderMatchConditions: any[] = [];
        if (userIdStr) orderMatchConditions.push({ userId: userIdStr });
        if (userEmail) {
          orderMatchConditions.push({ userId: userEmail });
          orderMatchConditions.push({ customerEmail: userEmail });
          orderMatchConditions.push({ 'shippingAddress.email': userEmail });
        }
        if (userMobile) {
          orderMatchConditions.push({ 'shippingAddress.mobile': userMobile });
          orderMatchConditions.push({ 'shippingAddress.phone': userMobile });
        }

        const invoiceMatchConditions: any[] = [];
        if (userIdStr) invoiceMatchConditions.push({ userId: userIdStr });
        if (userEmail) {
          invoiceMatchConditions.push({ userId: userEmail });
          invoiceMatchConditions.push({ 'customer.email': userEmail });
        }
        if (userMobile) {
          invoiceMatchConditions.push({ 'customer.mobile': userMobile });
        }

        const [userOrders, userInvoices] = await Promise.all([
          orderMatchConditions.length > 0
            ? ordersCollection.find({ $or: orderMatchConditions }).sort({ createdAt: -1 }).toArray()
            : [],
          invoiceMatchConditions.length > 0
            ? invoicesCollection.find({ $or: invoiceMatchConditions }).sort({ createdAt: -1 }).toArray()
            : [],
        ]);

        // Deduplicate records that exist in both orders and invoices
        const seenCodes = new Set<string>();
        const unifiedRecords: any[] = [];

        for (const ord of userOrders) {
          const ordId = ord._id.toString();
          const code = (ord.orderId || ord.invoiceNumber || ordId).toLowerCase();
          seenCodes.add(code);
          seenCodes.add(ordId);
          unifiedRecords.push({
            _id: ordId,
            orderId: ord.orderId || ord.invoiceNumber || ordId,
            total: Number(ord.total) || 0,
            status: ord.status || 'pending',
            createdAt: ord.createdAt,
            shippingAddress: ord.shippingAddress,
            orderSource: ord.orderSource || (ord.isOfflineSale ? 'offline' : 'online'),
          });
        }

        for (const inv of userInvoices) {
          const invId = inv._id.toString();
          const code = (inv.invoiceNumber || inv.orderId || invId).toLowerCase();
          if (!seenCodes.has(code) && !seenCodes.has(invId)) {
            seenCodes.add(code);
            seenCodes.add(invId);
            unifiedRecords.push({
              _id: invId,
              orderId: inv.invoiceNumber || inv.orderId || invId,
              total: Number(inv.total) || 0,
              status: inv.paymentDetails?.paymentStatus === 'paid' ? 'accepted' : 'pending',
              createdAt: inv.createdAt,
              shippingAddress: {
                address: inv.customer?.address,
                email: inv.customer?.email,
                mobile: inv.customer?.mobile,
                phone: inv.customer?.mobile,
              },
              orderSource: 'admin_invoice',
            });
          }
        }

        unifiedRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const totalOrders = unifiedRecords.length;
        const totalSpent = unifiedRecords.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
        const lastOrder = unifiedRecords.length > 0 ? unifiedRecords[0] : null;

        // Cart items and count
        const cartArray = Array.isArray(u.cart) ? u.cart : [];
        const cartCount = cartArray.reduce((acc: number, item: any) => acc + (Number(item.quantity) || 1), 0);

        // Address fallback from last order or invoice shipping address
        let effectiveAddress = u.address || '';
        if (!effectiveAddress && lastOrder?.shippingAddress) {
          const sa = lastOrder.shippingAddress;
          const parts = [sa.street, sa.address, sa.city, sa.state, sa.postalCode || sa.pincode].filter(Boolean);
          if (parts.length > 0) {
            effectiveAddress = parts.join(', ');
          }
        }

        // Phone fallback from last order or invoice shipping phone
        const effectiveMobile = u.mobile || u.phone || lastOrder?.shippingAddress?.phone || lastOrder?.shippingAddress?.mobile || '';

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
