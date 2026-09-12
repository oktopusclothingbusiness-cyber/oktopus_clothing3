import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authenticateRequest } from '@/lib/auth';
import { getShortOrderId } from '@/lib/utils';

// GET /api/mobile/orders/[id]/invoice - Fetch invoice metadata and links for Mobile App
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(request, { allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = await params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid or missing Order ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const order = await db.collection('orders').findOne({ _id: new ObjectId(id) });
    if (!order) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    // Access control: Ensure user can only view their own order invoice or admin
    if (auth.user?.role !== 'admin' && auth.user?.userId !== 'mobile-app' && auth.user?.userId !== order.userId) {
      return NextResponse.json({ message: 'Access denied: You can only view your own order invoices.' }, { status: 403 });
    }

    const settings = await db.collection('settings').findOne({ _id: 'global' as any });
    const shortCode = getShortOrderId(id);
    const invoiceNum = `OKT-${shortCode}`;

    const host = request.headers.get('host') || 'localhost:9002';
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;

    return NextResponse.json({
      invoiceNum,
      shortOrderId: shortCode,
      order: {
        ...order,
        id: order._id.toString(),
      },
      settings: settings || null,
      webInvoiceUrl: `${baseUrl}/invoice/${id}`,
      pdfDownloadUrl: `${baseUrl}/api/mobile/orders/${id}/invoice/pdf`,
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch mobile order invoice:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
