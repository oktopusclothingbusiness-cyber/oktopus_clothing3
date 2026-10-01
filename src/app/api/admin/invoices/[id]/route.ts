import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authenticateRequest } from '@/lib/auth';

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
    if (updates.paymentStatus) {
      allowedFields['paymentDetails.paymentStatus'] = updates.paymentStatus;
      if (updates.paymentStatus === 'paid') {
        allowedFields['paymentDetails.paidAt'] = new Date();
      }
    }
    if (updates.paymentMethod) {
      allowedFields['paymentDetails.paymentMethod'] = updates.paymentMethod;
    }
    if (updates.transactionRef !== undefined) {
      allowedFields['paymentDetails.transactionRef'] = updates.transactionRef;
    }
    if (updates.notes !== undefined) {
      allowedFields.notes = updates.notes;
    }
    if (updates.dueDate !== undefined) {
      allowedFields.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
    }
    allowedFields.updatedAt = new Date();

    const result = await db.collection('invoices').updateOne(
      { _id: new ObjectId(id) },
      { $set: allowedFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Invoice not found.' }, { status: 404 });
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
    const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid invoice ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('invoices').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Invoice not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Invoice deleted successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to delete invoice:', error);
    return NextResponse.json({ message: error?.message || 'Internal server error' }, { status: 500 });
  }
}
