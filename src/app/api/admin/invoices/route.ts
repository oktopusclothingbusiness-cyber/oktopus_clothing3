import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authenticateRequest } from '@/lib/auth';
import { sendInvoiceEmail } from '@/lib/mail';

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const status = searchParams.get('status') || 'all';

    const client = await clientPromise;
    const db = client.db();

    const query: any = {};

    if (status !== 'all') {
      query['paymentDetails.paymentStatus'] = status;
    }

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { 'customer.mobile': { $regex: search, $options: 'i' } },
      ];
    }

    const rawInvoices = await db
      .collection('invoices')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const invoices = rawInvoices.map((inv) => ({
      ...inv,
      _id: inv._id.toString(),
    }));

    // Calculate summary statistics
    const allInvoices = await db.collection('invoices').find({}).toArray();
    let totalAmount = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let sentCount = 0;

    for (const inv of allInvoices) {
      const amt = Number(inv.total) || 0;
      totalAmount += amt;
      if (inv.paymentDetails?.paymentStatus === 'paid') {
        paidCount++;
        paidAmount += amt;
      } else {
        pendingCount++;
        pendingAmount += amt;
      }
      if (inv.emailSent) {
        sentCount++;
      }
    }

    return NextResponse.json(
      {
        invoices,
        stats: {
          totalCount: allInvoices.length,
          totalAmount,
          paidCount,
          paidAmount,
          pendingCount,
          pendingAmount,
          sentCount,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Failed to fetch invoices:', error);
    return NextResponse.json({ message: error?.message || 'Failed to fetch invoices.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const body = await request.json();
    const {
      userId,
      customer,
      products,
      subtotal,
      discount = 0,
      shipping = 0,
      tax = 0,
      total,
      paymentDetails,
      notes,
      dueDate,
      customInvoiceNumber,
      dispatchMode = 'Express Shipping',
      sendEmail = true,
    } = body;

    // Validation
    if (!customer?.name || !customer?.email) {
      return NextResponse.json({ message: 'Customer name and email are required.' }, { status: 400 });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ message: 'At least one line item is required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Generate Invoice Number if not provided
    let invoiceNumber = customInvoiceNumber ? String(customInvoiceNumber).trim().toUpperCase() : '';
    if (!invoiceNumber) {
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      invoiceNumber = `OKT-INV-${randomCode}`;
    }

    // Ensure invoice number has prefix if plain
    if (!invoiceNumber.startsWith('OKT-')) {
      invoiceNumber = `OKT-${invoiceNumber}`;
    }

    const calculatedSubtotal = Number(subtotal) || products.reduce((acc: number, p: any) => acc + (Number(p.price) || 0) * (Number(p.quantity) || 1), 0);
    const calculatedDiscount = Math.max(0, Number(discount) || 0);
    const calculatedShipping = Math.max(0, Number(shipping) || 0);
    const calculatedTotal = Number(total) || Math.max(0, calculatedSubtotal + calculatedShipping - calculatedDiscount);

    const newInvoiceDoc: any = {
      invoiceNumber,
      userId: userId ? String(userId) : undefined,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        mobile: customer.mobile ? customer.mobile.trim() : '',
        address: customer.address ? customer.address.trim() : 'Standard Shipping Address',
      },
      products: products.map((item: any) => ({
        productId: item.productId ? String(item.productId) : undefined,
        name: item.name || 'Apparel Item',
        quantity: Math.max(1, Number(item.quantity) || 1),
        price: Number(item.price) || 0,
        size: item.size || 'Free Size',
        color: item.color || '',
        imageUrl: item.imageUrl || '',
      })),
      subtotal: calculatedSubtotal,
      discount: calculatedDiscount,
      shipping: calculatedShipping,
      tax: Number(tax) || 0,
      total: calculatedTotal,
      paymentDetails: {
        paymentStatus: paymentDetails?.paymentStatus === 'paid' ? 'paid' : 'pending',
        paymentMethod: paymentDetails?.paymentMethod || 'upi',
        transactionRef: paymentDetails?.transactionRef || '',
        paidAt: paymentDetails?.paymentStatus === 'paid' ? new Date() : undefined,
      },
      notes: notes ? String(notes).trim() : '',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      dispatchMode,
      source: 'admin_manual',
      emailSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await db.collection('invoices').insertOne(newInvoiceDoc);
    const invoiceId = insertResult.insertedId.toString();
    newInvoiceDoc._id = invoiceId;

    let emailSentResult: any = null;
    let emailError: string | null = null;

    // Send invoice email if requested
    if (sendEmail) {
      try {
        const settings = (await db.collection('settings').findOne({ _id: 'global' as any })) as any;

        // Build invoice payload matching invoice template format
        const invoicePayload: any = {
          _id: invoiceId,
          userName: customer.name.trim(),
          products: newInvoiceDoc.products,
          total: calculatedTotal,
          subtotal: calculatedSubtotal,
          shipping: calculatedShipping,
          discount: calculatedDiscount,
          shippingAddress: {
            address: newInvoiceDoc.customer.address,
            mobile: newInvoiceDoc.customer.mobile,
          },
          createdAt: newInvoiceDoc.createdAt,
          paymentDetails: newInvoiceDoc.paymentDetails,
          invoiceNumber,
          notes: newInvoiceDoc.notes,
          dispatchMode,
        };

        const mailRes = await sendInvoiceEmail({
          to: customer.email.trim(),
          order: invoicePayload,
          settings: settings || null,
          attachPdf: true,
        });

        if (mailRes.success) {
          await db.collection('invoices').updateOne(
            { _id: insertResult.insertedId },
            {
              $set: {
                emailSent: true,
                emailSentAt: new Date(),
                lastEmailId: mailRes.data?.id,
              },
            }
          );
          newInvoiceDoc.emailSent = true;
          newInvoiceDoc.emailSentAt = new Date();
          emailSentResult = mailRes.data;
        } else {
          emailError = (mailRes.error as any)?.message || 'Failed to dispatch email';
          await db.collection('invoices').updateOne(
            { _id: insertResult.insertedId },
            {
              $set: {
                emailSent: false,
                lastEmailError: emailError,
              },
            }
          );
        }
      } catch (err: any) {
        console.error('Failed to send invoice email during creation:', err);
        emailError = err?.message || 'Exception while sending email';
        await db.collection('invoices').updateOne(
          { _id: insertResult.insertedId },
          {
            $set: {
              emailSent: false,
              lastEmailError: emailError,
            },
          }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: sendEmail
          ? newInvoiceDoc.emailSent
            ? `Invoice #${invoiceNumber} issued and sent to ${customer.email}!`
            : `Invoice #${invoiceNumber} issued, but email could not be sent: ${emailError}`
          : `Invoice #${invoiceNumber} issued successfully!`,
        invoice: newInvoiceDoc,
        emailSent: newInvoiceDoc.emailSent,
        emailError,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Failed to issue invoice:', error);
    return NextResponse.json({ message: error?.message || 'Failed to issue invoice.' }, { status: 500 });
  }
}
