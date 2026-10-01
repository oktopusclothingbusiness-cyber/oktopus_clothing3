import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authenticateRequest } from '@/lib/auth';
import { generateInvoicePdfBuffer } from '@/lib/invoicePdf';
import { getShortOrderId } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'Invalid invoice ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    let invoice: any = null;
    if (ObjectId.isValid(id)) {
      invoice = await db.collection('invoices').findOne({ _id: new ObjectId(id) });
    }
    if (!invoice) {
      invoice = await db.collection('invoices').findOne({ invoiceNumber: id });
    }
    // Fallback: check orders
    if (!invoice && ObjectId.isValid(id)) {
      invoice = await db.collection('orders').findOne({ _id: new ObjectId(id) });
    }

    if (!invoice) {
      return NextResponse.json({ message: 'Invoice not found.' }, { status: 404 });
    }

    const shortCode = getShortOrderId(invoice._id.toString());
    const invoiceNumber = invoice.invoiceNumber 
      ? String(invoice.invoiceNumber).replace(/^#/, '') 
      : `OKT-${shortCode}`;

    const pdfPayload: any = {
      _id: invoice._id.toString(),
      userName: invoice.customer?.name || invoice.userName || 'Customer',
      products: invoice.products || [],
      total: Number(invoice.total) || 0,
      subtotal: Number(invoice.subtotal) || 0,
      shipping: Number(invoice.shipping) || 0,
      discount: Number(invoice.discount) || 0,
      shippingAddress: {
        address: invoice.customer?.address || invoice.shippingAddress?.address || 'Address not specified',
        mobile: invoice.customer?.mobile || invoice.shippingAddress?.mobile || '',
      },
      createdAt: invoice.createdAt,
      paymentDetails: invoice.paymentDetails || { paymentStatus: 'pending' },
      invoiceNumber,
      notes: invoice.notes,
      dispatchMode: invoice.dispatchMode || 'Express Shipping',
    };

    const pdfBuffer = await generateInvoicePdfBuffer(pdfPayload);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Invoice-${invoiceNumber}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Failed to generate PDF:', error);
    return NextResponse.json({ message: error?.message || 'Failed to generate PDF.' }, { status: 500 });
  }
}
