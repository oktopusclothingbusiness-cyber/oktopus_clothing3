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
    if (!id) {
      return NextResponse.json({ message: 'Missing order identifier.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const query: any = {
      $or: [
        { orderId: id },
        { invoiceNumber: id },
        ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : []),
      ],
    };

    const order = await db.collection('orders').findOne(query);

    if (!order) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    // Ensure non-admin users can only view their own order
    if (auth.user?.role !== 'admin' && auth.user?.userId !== 'mobile-app' && auth.user?.userId !== order.userId) {
      return NextResponse.json({ message: 'Access denied: You can only view your own orders.' }, { status: 403 });
    }

    const orderWithId = {
      ...order,
      id: order._id.toString(),
      orderId: order.orderId || order.invoiceNumber || order._id.toString(),
    };
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
    if (!id) {
      return NextResponse.json({ message: 'Missing order identifier.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const query: any = {
      $or: [
        { orderId: id },
        { invoiceNumber: id },
        ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : []),
      ],
    };

    const existingOrder = await db.collection('orders').findOne(query);
    if (!existingOrder) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    const updateData = await request.json();
    const { status, deliveryDate, paymentStatus } = updateData;

    const updateFields: any = {};
    if (status) updateFields.status = status;
    if (deliveryDate) updateFields.deliveryDate = deliveryDate;
    if (paymentStatus) {
      updateFields['paymentDetails.paymentStatus'] = paymentStatus;
    }
    updateFields.updatedAt = new Date();

    const result = await db.collection('orders').updateOne(
      { _id: existingOrder._id },
      { $set: updateFields }
    );

    let responseMessage = 'Order updated successfully.';
    
    // Optionally trigger email & push notification when status changes
    if (status) {
      const updatedOrder = await db.collection('orders').findOne({ _id: existingOrder._id });
      if (updatedOrder) {
        let customerEmail = updatedOrder.shippingAddress?.email;
        if (!customerEmail && updatedOrder.userId) {
          try {
            const userDoc = await db.collection('users').findOne(
              ObjectId.isValid(updatedOrder.userId) 
                ? { _id: new ObjectId(updatedOrder.userId) } 
                : { id: updatedOrder.userId }
            );
            if (userDoc?.email) {
              customerEmail = userDoc.email;
            }
          } catch (e) {
            console.warn('Could not resolve user email for order status update:', e);
          }
        }

        if (customerEmail) {
          try {
            await sendOrderStatusUpdateEmail({
              to: customerEmail,
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
          const displayCode = updatedOrder.orderId || updatedOrder.invoiceNumber || updatedOrder._id.toString().slice(-6);
          triggerUserEventPushNotification({
            userId: updatedOrder.userId,
            email: customerEmail,
            title: `Order #${displayCode} Shipped 🚚`,
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
        if (!id) {
          return NextResponse.json({ message: 'Missing order identifier.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const query: any = {
          $or: [
            { orderId: id },
            { invoiceNumber: id },
            ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : []),
          ],
        };

        const existingOrder = await db.collection('orders').findOne(query);
        if (!existingOrder) {
          return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
        }

        await db.collection('orders').deleteOne({ _id: existingOrder._id });

        // Also clean up matching invoice if present
        await db.collection('invoices').deleteOne({
          $or: [
            { _id: existingOrder._id },
            ...(existingOrder.orderId ? [{ orderId: existingOrder.orderId }, { invoiceNumber: existingOrder.orderId }] : []),
          ],
        });

        return NextResponse.json({ message: 'Order deleted successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Failed to delete order:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
