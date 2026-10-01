import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Public GET for invoice display (/invoice/[id])
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'Missing invoice identifier.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // 1. Check invoices collection by ObjectId or invoiceNumber
    let invoice: any = null;
    if (ObjectId.isValid(id)) {
      invoice = await db.collection('invoices').findOne({ _id: new ObjectId(id) });
    }
    if (!invoice) {
      invoice = await db.collection('invoices').findOne({ invoiceNumber: id });
    }

    // 2. Check orders collection
    if (!invoice && ObjectId.isValid(id)) {
      invoice = await db.collection('orders').findOne({ _id: new ObjectId(id) });
    }

    if (!invoice) {
      return NextResponse.json({ message: 'Invoice not found.' }, { status: 404 });
    }

    // Format standard invoice response
    const formattedInvoice = {
      _id: invoice._id.toString(),
      userName: invoice.customer?.name || invoice.userName || 'Customer',
      products: invoice.products || [],
      total: Number(invoice.total) || 0,
      subtotal: Number(invoice.subtotal) || 0,
      shipping: Number(invoice.shipping) || 0,
      discount: Number(invoice.discount) || 0,
      shippingAddress: {
        address: invoice.customer?.address || invoice.shippingAddress?.address || 'N/A',
        mobile: invoice.customer?.mobile || invoice.shippingAddress?.mobile || 'N/A',
      },
      createdAt: invoice.createdAt,
      paymentDetails: invoice.paymentDetails || { paymentStatus: 'pending' },
      invoiceNumber: invoice.invoiceNumber,
      notes: invoice.notes,
      dispatchMode: invoice.dispatchMode,
    };

    return NextResponse.json(formattedInvoice, { status: 200 });
  } catch (error: any) {
    console.error('Failed to get public invoice:', error);
    return NextResponse.json({ message: error?.message || 'Internal server error.' }, { status: 500 });
  }
}
