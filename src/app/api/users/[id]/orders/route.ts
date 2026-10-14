import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

    const userEmail = (user.email || '').toLowerCase().trim();
    const userMobile = (user.mobile || user.phone || '').trim();

    // 1. Unified match conditions across Orders
    const orderMatchConditions: any[] = [{ userId }];
    if (userEmail) {
      orderMatchConditions.push({ userId: userEmail });
      orderMatchConditions.push({ customerEmail: userEmail });
      orderMatchConditions.push({ 'shippingAddress.email': userEmail });
    }
    if (userMobile) {
      orderMatchConditions.push({ 'shippingAddress.mobile': userMobile });
      orderMatchConditions.push({ 'shippingAddress.phone': userMobile });
    }

    const matchedOrders = await db
      .collection('orders')
      .find({ $or: orderMatchConditions })
      .sort({ createdAt: -1 })
      .toArray();

    // 2. Unified match conditions across Invoices
    const invoiceMatchConditions: any[] = [{ userId }];
    if (userEmail) {
      invoiceMatchConditions.push({ userId: userEmail });
      invoiceMatchConditions.push({ 'customer.email': userEmail });
    }
    if (userMobile) {
      invoiceMatchConditions.push({ 'customer.mobile': userMobile });
    }

    const matchedInvoices = await db
      .collection('invoices')
      .find({ $or: invoiceMatchConditions })
      .sort({ createdAt: -1 })
      .toArray();

    // Build quick lookup map of matched invoices
    const invoiceByCode = new Map<string, any>();
    for (const inv of matchedInvoices) {
      const invIdStr = inv._id.toString();
      invoiceByCode.set(invIdStr, inv);
      if (inv.invoiceNumber) invoiceByCode.set(inv.invoiceNumber.toLowerCase(), inv);
      if (inv.orderId) invoiceByCode.set(inv.orderId.toLowerCase(), inv);
    }

    // Track order numbers/IDs to prevent duplicate rendering
    const existingOrderIds = new Set<string>();
    const unifiedList: any[] = [];

    // Add matched orders
    for (const order of matchedOrders) {
      const orderIdStr = order._id.toString();
      const code = (order.orderId || order.invoiceNumber || orderIdStr).toLowerCase();
      existingOrderIds.add(code);
      existingOrderIds.add(orderIdStr);

      const matchingInv =
        invoiceByCode.get(orderIdStr) ||
        (order.orderId ? invoiceByCode.get(order.orderId.toLowerCase()) : null) ||
        (order.invoiceNumber ? invoiceByCode.get(order.invoiceNumber.toLowerCase()) : null);

      const invoiceData =
        matchingInv ||
        (order.orderSource === 'admin_invoice'
          ? {
              _id: orderIdStr,
              invoiceNumber: order.invoiceNumber || order.orderId || `INV-${orderIdStr.slice(-6).toUpperCase()}`,
              userId: order.userId || userId,
              customer: {
                name: order.shippingAddress?.name || order.userName || user.firstName || 'Customer',
                email: order.shippingAddress?.email || order.customerEmail || userEmail,
                mobile: order.shippingAddress?.mobile || userMobile,
                address: order.shippingAddress?.address || 'Standard Delivery',
              },
              products: order.products || [],
              subtotal: order.subtotal || 0,
              discount: order.discount || 0,
              shipping: order.shipping || 0,
              tax: order.tax || 0,
              total: order.total || 0,
              paymentDetails: order.paymentDetails || {},
              notes: order.notes || order.shippingAddress?.instructions || '',
              dispatchMode: order.dispatchMode || 'Express Shipping',
              dueDate: order.dueDate,
              createdAt: order.createdAt,
            }
          : null);

      unifiedList.push({
        _id: orderIdStr,
        orderId: order.orderId || order.invoiceNumber || orderIdStr,
        invoiceNumber: order.invoiceNumber || order.orderId || null,
        invoiceId: matchingInv ? matchingInv._id.toString() : (order.orderSource === 'admin_invoice' ? orderIdStr : null),
        invoiceData,
        userId: order.userId,
        userName: order.userName || user.firstName || 'Customer',
        products: order.products || [],
        subtotal: order.subtotal || 0,
        discount: order.discount || 0,
        shipping: order.shipping || 0,
        tax: order.tax || 0,
        total: order.total || 0,
        status: order.status || 'pending',
        orderSource: order.orderSource || (order.isOfflineSale ? 'offline' : 'online'),
        isOfflineSale: Boolean(order.isOfflineSale),
        paymentDetails: order.paymentDetails || {},
        shippingAddress: order.shippingAddress || {},
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        type: order.orderSource === 'admin_invoice' ? 'invoice' : (order.isOfflineSale ? 'offline' : 'order'),
      });
    }

    // Add any standalone invoices that were not yet converted to orders
    for (const inv of matchedInvoices) {
      const invIdStr = inv._id.toString();
      const code = (inv.invoiceNumber || inv.orderId || invIdStr).toLowerCase();

      if (!existingOrderIds.has(code) && !existingOrderIds.has(invIdStr)) {
        existingOrderIds.add(code);
        existingOrderIds.add(invIdStr);

        unifiedList.push({
          _id: invIdStr,
          orderId: inv.invoiceNumber || inv.orderId || invIdStr,
          invoiceNumber: inv.invoiceNumber || inv.orderId,
          invoiceId: invIdStr,
          invoiceData: inv,
          userId: inv.userId || userId,
          userName: inv.customer?.name || user.firstName || 'Customer',
          products: inv.products || [],
          subtotal: inv.subtotal || 0,
          discount: inv.discount || 0,
          shipping: inv.shipping || 0,
          tax: inv.tax || 0,
          total: inv.total || 0,
          status: inv.paymentDetails?.paymentStatus === 'paid' ? 'accepted' : 'pending',
          orderSource: 'admin_invoice',
          isOfflineSale: false,
          paymentDetails: inv.paymentDetails || {},
          shippingAddress: {
            name: inv.customer?.name,
            email: inv.customer?.email,
            mobile: inv.customer?.mobile,
            address: inv.customer?.address,
          },
          createdAt: inv.createdAt,
          updatedAt: inv.updatedAt,
          type: 'invoice',
        });
      }
    }

    // Sort unified history descending by creation date
    unifiedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Asynchronous backfill: Link these matched records to the user ID if not linked yet
    const orderBackfillOr: any[] = [];
    if (userEmail) {
      orderBackfillOr.push({ customerEmail: userEmail });
      orderBackfillOr.push({ 'shippingAddress.email': userEmail });
      orderBackfillOr.push({ userId: userEmail });
    }
    if (userMobile) {
      orderBackfillOr.push({ 'shippingAddress.mobile': userMobile });
      orderBackfillOr.push({ 'shippingAddress.phone': userMobile });
    }

    if (orderBackfillOr.length > 0) {
      db.collection('orders')
        .updateMany(
          {
            $or: orderBackfillOr,
            userId: { $ne: userId },
          },
          { $set: { userId, updatedAt: new Date() } }
        )
        .catch((err) => console.warn('Could not backfill order userId:', err));
    }

    const invBackfillOr: any[] = [];
    if (userEmail) {
      invBackfillOr.push({ 'customer.email': userEmail });
      invBackfillOr.push({ userId: userEmail });
    }
    if (userMobile) {
      invBackfillOr.push({ 'customer.mobile': userMobile });
    }

    if (invBackfillOr.length > 0) {
      db.collection('invoices')
        .updateMany(
          {
            $or: invBackfillOr,
            userId: { $ne: userId },
          },
          { $set: { userId, updatedAt: new Date() } }
        )
        .catch((err) => console.warn('Could not backfill invoice userId:', err));
    }

    return NextResponse.json(unifiedList, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch user orders:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
