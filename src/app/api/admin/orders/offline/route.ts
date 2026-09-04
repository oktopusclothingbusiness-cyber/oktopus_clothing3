import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json(
        { message: auth.error || 'Unauthorized: Admin access required.' },
        { status: auth.statusCode || 401 }
      );
    }

    const body = await request.json();
    const { customer, items, paymentMethod, orderStatus, discount = 0, notes = '' } = body;

    // Validation
    if (!customer || !customer.name || !customer.name.trim()) {
      return NextResponse.json({ message: 'Customer name is required.' }, { status: 400 });
    }

    if (!customer.mobile || !customer.mobile.trim()) {
      return NextResponse.json({ message: 'Customer mobile number is required.' }, { status: 400 });
    }

    if (!customer.address || !customer.address.trim()) {
      return NextResponse.json({ message: 'Customer address is required.' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'At least one product item must be selected.' }, { status: 400 });
    }

    // Process and validate items
    const formattedProducts = [];
    let subtotal = 0;

    for (const item of items) {
      if (!item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return NextResponse.json(
          { message: `Invalid item details for: ${item.name || 'Unknown item'}` },
          { status: 400 }
        );
      }

      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      formattedProducts.push({
        productId: item.productId ? String(item.productId) : '',
        name: String(item.name).trim(),
        quantity: Number(item.quantity),
        price: Number(item.price),
        size: item.size ? String(item.size).trim() : 'Standard',
        color: item.color ? String(item.color).trim() : 'Standard',
        imageUrl: item.imageUrl || null,
      });
    }

    const discountAmount = Math.max(0, Number(discount) || 0);
    const total = Math.max(0, subtotal - discountAmount);

    const client = await clientPromise;
    const db = client.db();

    // Decrement product inventory stock
    for (const prod of formattedProducts) {
      if (prod.productId && ObjectId.isValid(prod.productId)) {
        try {
          await db.collection('products').updateOne(
            { _id: new ObjectId(prod.productId) },
            { $inc: { stock: -prod.quantity } }
          );
        } catch (stockErr) {
          console.warn(`Failed to decrement stock for product ${prod.productId}:`, stockErr);
        }
      }
    }

    const orderDoc = {
      userId: `offline_${Date.now()}`,
      userName: customer.name.trim(),
      products: formattedProducts,
      subtotal,
      discount: discountAmount,
      shipping: 0,
      total,
      shippingAddress: {
        name: customer.name.trim(),
        mobile: customer.mobile.trim(),
        email: customer.email ? customer.email.trim() : '',
        address: customer.address.trim(),
        instructions: notes ? notes.trim() : 'In-store counter purchase',
      },
      status: orderStatus || 'delivered', // Default delivered for offline counter sale
      orderSource: 'offline',
      isOfflineSale: true,
      paymentDetails: {
        paymentMethod: paymentMethod || 'cash',
        paymentStatus: 'paid',
        offlineNotes: notes ? notes.trim() : 'Offline sale',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('orders').insertOne(orderDoc);

    return NextResponse.json(
      {
        success: true,
        message: 'Offline sale recorded successfully.',
        orderId: result.insertedId.toString(),
        order: {
          ...orderDoc,
          _id: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create offline order:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
