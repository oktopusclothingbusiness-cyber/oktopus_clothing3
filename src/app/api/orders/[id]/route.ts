import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendOrderStatusUpdateEmail } from '@/lib/mail';
import { authenticateRequest } from '@/lib/auth';

// This file is for a dynamic route segment. For example: /api/orders/123

// GET a single order by ID (Requires Authentication)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = authenticateRequest(request, { allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = params;
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
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid order ID.' }, { status: 400 });
    }
    
    const body = await request.json();
    const { status, paymentStatus } = body;
    
    let updateQuery: any = {};
    let responseMessage = '';

    if (status) {
        const validStatuses = ['pending', 'accepted', 'rejected', 'packed', 'shipped', 'delivered'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ message: 'Invalid status provided.' }, { status: 400 });
        }
        updateQuery['status'] = status;
        responseMessage = `Order status updated to ${status}.`;

    } else if (paymentStatus) {
         const validPaymentStatuses = ['pending', 'paid', 'paid externally'];
        if (!validPaymentStatuses.includes(paymentStatus)) {
            return NextResponse.json({ message: 'Invalid payment status provided.' }, { status: 400 });
        }
        updateQuery['paymentDetails.paymentStatus'] = paymentStatus;
        responseMessage = `Order payment status updated to ${paymentStatus}.`;
    } else {
        return NextResponse.json({ message: 'No valid update field provided.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateQuery },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }
    
    const updatedOrder = result;
    
    if(status && updatedOrder.status !== 'pending') {
      const user = await db.collection('users').findOne({ _id: new ObjectId(updatedOrder.userId) });

      if(user) {
          await sendOrderStatusUpdateEmail({
              to: user.email,
              orderId: updatedOrder._id.toString(),
              orderStatus: updatedOrder.status,
              userName: updatedOrder.userName
          });
      }
    }

    return NextResponse.json({ message: responseMessage }, { status: 200 });

  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// DELETE an order by ID (Requires Admin Privileges)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
        if (!auth.authenticated) {
          return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
        }

        const { id } = params;
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
