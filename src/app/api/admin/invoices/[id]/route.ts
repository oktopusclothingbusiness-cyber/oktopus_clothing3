import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authenticateRequest } from '@/lib/auth';
import { sendInvoiceEmail } from '@/lib/mail';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(request, { requiredPermission: 'invoices:view', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = await params;
    const client = await clientPromise;
    const db = client.db();

    let invoice: any = null;
    if (ObjectId.isValid(id)) {
      invoice = await db.collection('invoices').findOne({ _id: new ObjectId(id) });
    }
    if (!invoice) {
      invoice = await db.collection('invoices').findOne({ invoiceNumber: id });
    }

    if (!invoice) {
      return NextResponse.json({ message: 'Invoice not found.' }, { status: 404 });
    }

    return NextResponse.json({ ...invoice, _id: invoice._id.toString() }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to get invoice:', error);
    return NextResponse.json({ message: error?.message || 'Internal server error' }, { status: 500 });
  }
}

// Full update of an existing invoice & sync with orders collection
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(request, { requiredPermission: 'invoices:edit', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid invoice ID.' }, { status: 400 });
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
      dispatchMode = 'Express Shipping',
      sendEmail = false,
    } = body;

    if (!customer?.name || !customer?.email) {
      return NextResponse.json({ message: 'Customer name and email are required.' }, { status: 400 });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ message: 'At least one line item is required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Fetch existing invoice
    const existingInvoice = await db.collection('invoices').findOne({ _id: new ObjectId(id) });
    if (!existingInvoice) {
      return NextResponse.json({ message: 'Invoice not found.' }, { status: 404 });
    }

    const cleanEmail = customer.email.trim().toLowerCase();
    const cleanMobile = customer.mobile ? customer.mobile.trim() : '';

    // Determine unified customer/user ID
    let effectiveUserId = userId ? String(userId).trim() : '';
    if (!effectiveUserId && cleanEmail) {
      const matchedUser = await db.collection('users').findOne({
        $or: [
          { email: cleanEmail },
          ...(cleanMobile ? [{ mobile: cleanMobile }, { phone: cleanMobile }] : []),
        ],
      });
      if (matchedUser) {
        effectiveUserId = matchedUser._id.toString();
      } else {
        effectiveUserId = cleanEmail;
      }
    }

    const calculatedSubtotal =
      Number(subtotal) ||
      products.reduce((acc: number, p: any) => acc + (Number(p.price) || 0) * (Number(p.quantity) || 1), 0);
    const calculatedDiscount = Math.max(0, Number(discount) || 0);
    const calculatedShipping = Math.max(0, Number(shipping) || 0);
    const calculatedTotal =
      Number(total) || Math.max(0, calculatedSubtotal + calculatedShipping - calculatedDiscount);

    const formattedProducts = products.map((item: any) => ({
      productId: item.productId ? String(item.productId) : '',
      name: item.name || 'Apparel Item',
      quantity: Math.max(1, Number(item.quantity) || 1),
      price: Number(item.price) || 0,
      size: item.size || 'Free Size',
      color: item.color || '',
      imageUrl: item.imageUrl || '',
    }));

    const now = new Date();
    const invoiceNumber = existingInvoice.invoiceNumber || existingInvoice.orderId;

    const invoiceUpdateDoc: any = {
      userId: effectiveUserId,
      customer: {
        name: customer.name.trim(),
        email: cleanEmail,
        mobile: cleanMobile,
        address: customer.address ? customer.address.trim() : 'Standard Delivery',
      },
      products: formattedProducts,
      subtotal: calculatedSubtotal,
      discount: calculatedDiscount,
      shipping: calculatedShipping,
      tax: Number(tax) || 0,
      total: calculatedTotal,
      paymentDetails: {
        paymentStatus: paymentDetails?.paymentStatus === 'paid' ? 'paid' : 'pending',
        paymentMethod: paymentDetails?.paymentMethod || 'upi',
        transactionRef: paymentDetails?.transactionRef || '',
        paidAt:
          paymentDetails?.paymentStatus === 'paid'
            ? paymentDetails.paidAt
              ? new Date(paymentDetails.paidAt)
              : now
            : null,
      },
      notes: notes ? String(notes).trim() : '',
      dueDate: dueDate ? new Date(dueDate) : null,
      dispatchMode,
      updatedAt: now,
    };

    // 1. Update Invoices collection
    await db.collection('invoices').updateOne({ _id: new ObjectId(id) }, { $set: invoiceUpdateDoc });

    // 2. Synchronize corresponding order in 'orders' collection
    const orderUpdateDoc: any = {
      userId: effectiveUserId,
      userName: customer.name.trim(),
      products: formattedProducts,
      subtotal: calculatedSubtotal,
      discount: calculatedDiscount,
      shipping: calculatedShipping,
      tax: Number(tax) || 0,
      total: calculatedTotal,
      shippingAddress: {
        name: customer.name.trim(),
        mobile: cleanMobile,
        email: cleanEmail,
        address: customer.address ? customer.address.trim() : 'Standard Delivery',
        instructions: notes ? String(notes).trim() : 'Official Tax Invoice',
      },
      status: paymentDetails?.paymentStatus === 'paid' ? 'accepted' : 'pending',
      orderSource: 'admin_invoice',
      paymentDetails: {
        paymentStatus: paymentDetails?.paymentStatus === 'paid' ? 'paid' : 'pending',
        paymentMethod: paymentDetails?.paymentMethod || 'upi',
        transactionRef: paymentDetails?.transactionRef || '',
        paidAt:
          paymentDetails?.paymentStatus === 'paid'
            ? paymentDetails.paidAt
              ? new Date(paymentDetails.paidAt)
              : now
            : undefined,
      },
      notes: notes ? String(notes).trim() : '',
      dispatchMode,
      updatedAt: now,
    };

    const orderMatchQuery: any = {
      $or: [
        { _id: new ObjectId(id) },
        ...(invoiceNumber ? [{ orderId: invoiceNumber }, { invoiceNumber }] : []),
      ],
    };

    const existingOrder = await db.collection('orders').findOne(orderMatchQuery);
    if (existingOrder) {
      await db.collection('orders').updateOne({ _id: existingOrder._id }, { $set: orderUpdateDoc });
    } else {
      await db.collection('orders').insertOne({
        _id: new ObjectId(id),
        orderId: invoiceNumber,
        invoiceNumber: invoiceNumber,
        createdAt: existingInvoice.createdAt || now,
        ...orderUpdateDoc,
      });
    }

    const updatedInvoice = await db.collection('invoices').findOne({ _id: new ObjectId(id) });

    // 3. Re-send invoice email if requested
    let emailStatus = null;
    if (sendEmail && cleanEmail) {
      try {
        const emailOrder = {
          _id: id,
          orderId: invoiceNumber,
          invoiceNumber,
          userName: customer.name.trim(),
          products: formattedProducts,
          total: calculatedTotal,
          subtotal: calculatedSubtotal,
          discount: calculatedDiscount,
          shipping: calculatedShipping,
          shippingAddress: {
            name: customer.name.trim(),
            mobile: cleanMobile,
            email: cleanEmail,
            address: customer.address ? customer.address.trim() : 'Standard Delivery',
          },
          paymentDetails: invoiceUpdateDoc.paymentDetails,
          createdAt: existingInvoice.createdAt || now,
          dispatchMode,
          notes: notes ? String(notes).trim() : '',
        };
        const settings = (await db.collection('settings').findOne({ _id: 'global' as any })) as any;
        const emailResult = await sendInvoiceEmail({
          order: emailOrder as any,
          to: cleanEmail,
          settings: settings || null,
          attachPdf: true,
        });
        emailStatus = emailResult.success;
        if (emailResult.success) {
          await db.collection('invoices').updateOne(
            { _id: new ObjectId(id) },
            { $set: { emailSent: true, emailSentAt: new Date() } }
          );
        }
      } catch (err: any) {
        console.warn('Failed to resend updated invoice email:', err);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Invoice and associated order updated successfully.',
        invoice: { ...updatedInvoice, _id: updatedInvoice!._id.toString() },
        emailSent: emailStatus,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Failed to update invoice:', error);
    return NextResponse.json({ message: error?.message || 'Internal server error' }, { status: 500 });
  }
}

// Partial status update (PATCH)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid invoice ID.' }, { status: 400 });
    }

    const updates = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const allowedFields: any = {};
    const orderAllowedFields: any = {};

    if (updates.paymentStatus) {
      allowedFields['paymentDetails.paymentStatus'] = updates.paymentStatus;
      orderAllowedFields['paymentDetails.paymentStatus'] = updates.paymentStatus;
      orderAllowedFields.status = updates.paymentStatus === 'paid' ? 'accepted' : 'pending';
      if (updates.paymentStatus === 'paid') {
        const paidDate = new Date();
        allowedFields['paymentDetails.paidAt'] = paidDate;
        orderAllowedFields['paymentDetails.paidAt'] = paidDate;
      }
    }
    if (updates.paymentMethod) {
      allowedFields['paymentDetails.paymentMethod'] = updates.paymentMethod;
      orderAllowedFields['paymentDetails.paymentMethod'] = updates.paymentMethod;
    }
    if (updates.transactionRef !== undefined) {
      allowedFields['paymentDetails.transactionRef'] = updates.transactionRef;
      orderAllowedFields['paymentDetails.transactionRef'] = updates.transactionRef;
    }
    if (updates.notes !== undefined) {
      allowedFields.notes = updates.notes;
      orderAllowedFields.notes = updates.notes;
    }
    if (updates.dueDate !== undefined) {
      allowedFields.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
    }
    if (updates.userId !== undefined) {
      allowedFields.userId = updates.userId;
      orderAllowedFields.userId = updates.userId;
    }
    allowedFields.updatedAt = new Date();
    orderAllowedFields.updatedAt = new Date();

    const result = await db.collection('invoices').updateOne(
      { _id: new ObjectId(id) },
      { $set: allowedFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Invoice not found.' }, { status: 404 });
    }

    // Also sync payment status to orders collection
    if (Object.keys(orderAllowedFields).length > 0) {
      const inv = await db.collection('invoices').findOne({ _id: new ObjectId(id) });
      const invoiceNumber = inv?.invoiceNumber || inv?.orderId;
      await db.collection('orders').updateOne(
        {
          $or: [
            { _id: new ObjectId(id) },
            ...(invoiceNumber ? [{ orderId: invoiceNumber }, { invoiceNumber }] : []),
          ],
        },
        { $set: orderAllowedFields }
      );
    }

    const updatedDoc = await db.collection('invoices').findOne({ _id: new ObjectId(id) });
    return NextResponse.json(
      { success: true, message: 'Invoice updated successfully.', invoice: updatedDoc },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Failed to update invoice:', error);
    return NextResponse.json({ message: error?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(request, { requiredPermission: 'invoices:delete', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid invoice ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const inv = await db.collection('invoices').findOne({ _id: new ObjectId(id) });
    const invoiceNumber = inv?.invoiceNumber || inv?.orderId;

    const result = await db.collection('invoices').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Invoice not found.' }, { status: 404 });
    }

    // Also clean up linked order if it originated from admin invoice
    if (invoiceNumber) {
      await db.collection('orders').deleteOne({
        $or: [
          { _id: new ObjectId(id) },
          { orderId: invoiceNumber, orderSource: 'admin_invoice' },
          { invoiceNumber: invoiceNumber, orderSource: 'admin_invoice' },
        ],
      });
    }

    return NextResponse.json({ success: true, message: 'Invoice deleted successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to delete invoice:', error);
    return NextResponse.json({ message: error?.message || 'Internal server error' }, { status: 500 });
  }
}
