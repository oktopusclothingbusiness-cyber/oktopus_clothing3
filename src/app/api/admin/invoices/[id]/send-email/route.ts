import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authenticateRequest } from '@/lib/auth';
import { sendInvoiceEmail } from '@/lib/mail';
import { getShortOrderId } from '@/lib/utils';

export async function POST(
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
      return NextResponse.json({ message: 'Valid Invoice ID is required.' }, { status: 400 });
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    const client = await clientPromise;
    const db = client.db();

    // Check invoices collection first
    let invoice: any = null;
    let isFromInvoicesCollection = true;

    if (ObjectId.isValid(id)) {
      invoice = await db.collection('invoices').findOne({ _id: new ObjectId(id) });
    }
    if (!invoice) {
      invoice = await db.collection('invoices').findOne({ invoiceNumber: id });
    }

    // Fallback: check orders collection if someone sends an invoice for an existing order
    if (!invoice && ObjectId.isValid(id)) {
      const order = await db.collection('orders').findOne({ _id: new ObjectId(id) });
      if (order) {
        isFromInvoicesCollection = false;
        invoice = order;
      }
    }

    if (!invoice) {
      return NextResponse.json({ message: 'Invoice or Order not found.' }, { status: 404 });
    }

    // Determine recipient email
    let recipientEmail = body.recipientEmail?.trim() || '';
    if (!recipientEmail) {
      if (invoice.customer?.email) {
        recipientEmail = invoice.customer.email;
      } else if (invoice.shippingAddress?.email) {
        recipientEmail = invoice.shippingAddress.email;
      } else if (invoice.userId) {
        // Look up user document
        const userDoc = await db.collection('users').findOne(
          ObjectId.isValid(invoice.userId) ? { _id: new ObjectId(invoice.userId) } : { id: invoice.userId }
        );
        if (userDoc?.email) {
          recipientEmail = userDoc.email;
        }
      }
    }

    if (!recipientEmail) {
      return NextResponse.json(
        { message: 'Could not determine recipient email address. Please provide one.' },
        { status: 400 }
      );
    }

    const settings = (await db.collection('settings').findOne({ _id: 'global' as any })) as any;

    const shortCode = getShortOrderId(invoice._id.toString());
    const invoiceNumber = invoice.invoiceNumber || `OKT-${shortCode}`;

    // Structure invoice payload matching email format
    const invoicePayload: any = {
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

    const mailRes = await sendInvoiceEmail({
      to: recipientEmail,
      order: invoicePayload,
      settings: settings || null,
      attachPdf: true,
    });

    if (!mailRes.success) {
      const errorMsg = (mailRes.error as any)?.message || 'Failed to dispatch email';
      if (isFromInvoicesCollection) {
        await db.collection('invoices').updateOne(
          { _id: invoice._id },
          { $set: { lastEmailError: errorMsg } }
        );
      }
      return NextResponse.json({ message: `Failed to send email: ${errorMsg}` }, { status: 500 });
    }

    // Update sent status
    if (isFromInvoicesCollection) {
      await db.collection('invoices').updateOne(
        { _id: invoice._id },
        {
          $set: {
            emailSent: true,
            emailSentAt: new Date(),
            lastEmailId: mailRes.data?.id,
            lastEmailError: null,
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Invoice #${invoiceNumber} successfully emailed to ${recipientEmail}!`,
        data: mailRes.data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Failed to send invoice email:', error);
    return NextResponse.json({ message: error?.message || 'Failed to send invoice email.' }, { status: 500 });
  }
}
