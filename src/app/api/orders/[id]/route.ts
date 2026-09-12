import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendOrderStatusUpdateEmail } from '@/lib/mail';
import { authenticateRequest } from '@/lib/auth';
import { triggerUserEventPushNotification } from '@/lib/pushNotifications';

// This file is for a dynamic route segment. For example: /api/orders/123

// GET a single order by ID (Requires Authentication)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authenticateRequest(request, { allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid order ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const order = await db.collection('orders').findOne({ _id: new ObjectId(id) });

    if (!order) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    // Ensure non-admin users can only view their own order
    if (auth.user?.role !== 'admin' && auth.user?.userId !== 'mobile-app' && auth.user?.userId !== order.userId) {
      return NextResponse.json({ message: 'Access denied: You can only view your own orders.' }, { status: 403 });
    }

    const orderWithId = { ...order, id: order._id.toString() };
    return NextResponse.json(orderWithId, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}


// PUT (update) an order by ID (Requires Admin Privileges)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid order ID.' }, { status: 400 });
    }

    const updateData = await request.json();
    const { status, deliveryDate } = updateData;

    const client = await clientPromise;
    const db = client.db();

    const updateFields: any = {};
    if (status) updateFields.status = status;
    if (deliveryDate) updateFields.deliveryDate = deliveryDate;

    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    let responseMessage = 'Order updated successfully.';
    
    // Optionally trigger email & push notification when status changes
    if (status) {
      const updatedOrder = await db.collection('orders').findOne({ _id: new ObjectId(id) });
      if (updatedOrder) {
        if (updatedOrder.shippingAddress?.email) {
          try {
            await sendOrderStatusUpdateEmail({
              to: updatedOrder.shippingAddress.email,
              orderId: updatedOrder._id.toString(),
              orderStatus: status,
              userName: updatedOrder.userName || 'Customer'
            });
            responseMessage += ' Email notification sent to customer.';
          } catch (emailError) {
            console.error('Failed to send status update email:', emailError);
            responseMessage += ' Warning: Failed to send email notification.';
          }
        }

        // Trigger Order Shipped / Out for Delivery push notification
        const statusLower = String(status).toLowerCase();
        if (['shipped', 'out_for_delivery', 'dispatch', 'dispatched'].includes(statusLower)) {
          triggerUserEventPushNotification({
            userId: updatedOrder.userId,
            email: updatedOrder.shippingAddress?.email,
            title: `Order #${id.slice(-6)} Shipped 🚚`,
            body: 'Your OKTOPUS shipment is on the way!',
            deepLink: '/track-order',
          }).catch((err) => console.error('Failed to trigger shipping push notification:', err));
        }
      }
    }

    return NextResponse.json({ message: responseMessage }, { status: 200 });

  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// DELETE an order by ID (Requires Admin Privileges)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
        if (!auth.authenticated) {
          return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
        }

        const { id } = await params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid order ID.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('orders').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Order deleted successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Failed to delete order:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
