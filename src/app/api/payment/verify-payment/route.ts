
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendOrderConfirmationEmail } from '@/lib/mail';

// The Razorpay key secret is now hardcoded.
// Replace with your actual key secret.
const RAZORPAY_KEY_SECRET = "I3hW7zcB4LYvNwO018cBDK2B";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internal_order_id, order_type } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !internal_order_id) {
       return NextResponse.json({ message: 'Missing payment details.' }, { status: 400 });
    }
    
    if (!ObjectId.isValid(internal_order_id)) {
        return NextResponse.json({ message: 'Invalid internal order ID.' }, { status: 400 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const client = await clientPromise;
      const db = client.db();
      
      let finalOrder;
      const settings = await db.collection('settings').findOne({ _id: 'global' });
      const shippingCharge = settings?.deliveryCharge || 0;

      if (order_type === 'custom_design') {
        // Handle custom design payment
        const customDesign = await db.collection('customDesigns').findOne({ _id: new ObjectId(internal_order_id) });
        if (!customDesign) {
            return NextResponse.json({ message: 'Custom design not found.' }, { status: 404 });
        }
        
        if (!customDesign.shippingAddress) {
             return NextResponse.json({ message: 'Shipping address not found for this custom design.' }, { status: 400 });
        }

        // Fetch color name from colors collection
        const colorDoc = await db.collection('colors').findOne({ imageUrl: customDesign.tshirtColor });
        const colorName = colorDoc ? colorDoc.name : 'Custom Color';

        const subtotal = customDesign.price;
        const total = subtotal + shippingCharge;

        // Create a new order from the custom design
        const orderData = {
          userId: customDesign.userId,
          userName: customDesign.userName,
          products: [{
            productId: customDesign._id.toString(),
            name: `Custom Design: ${customDesign._id.toString().slice(-6)}`,
            quantity: 1,
            price: customDesign.price,
            size: customDesign.tshirtSize,
            color: colorName,
          }],
          subtotal: subtotal,
          discount: 0,
          shipping: shippingCharge,
          total: total,
          shippingAddress: customDesign.shippingAddress,
          status: 'accepted',
          createdAt: new Date(),
          paymentDetails: {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            verifiedAt: new Date(),
            paymentStatus: 'paid'
          }
        };
        
        const result = await db.collection('orders').insertOne(orderData);
        finalOrder = { ...orderData, _id: result.insertedId };
        
        // Update custom design status to 'paid'
        await db.collection('customDesigns').updateOne(
            { _id: new ObjectId(internal_order_id) },
            { $set: { status: 'paid', orderId: result.insertedId } }
        );

      } else {
        // Handle regular cart payment
         const updatedOrderResult = await db.collection('orders').findOneAndUpdate(
            { _id: new ObjectId(internal_order_id) },
            { 
              $set: { 
                paymentDetails: {
                  razorpay_order_id,
                  razorpay_payment_id,
                  razorpay_signature,
                  verifiedAt: new Date(),
                  paymentStatus: 'paid'
                },
                status: 'accepted'
              }
            },
            { returnDocument: 'after' }
          );
          finalOrder = updatedOrderResult;
      }
      
      if (finalOrder) {
          const user = await db.collection('users').findOne({ _id: new ObjectId(finalOrder.userId) });
          if(user) {
               await sendOrderConfirmationEmail({
                    to: user.email,
                    orderId: finalOrder._id.toString(),
                    userName: finalOrder.userName,
                    orderDate: finalOrder.createdAt,
                    total: finalOrder.total,
                    products: finalOrder.products
                });
          }
      }

      return NextResponse.json({ message: 'Payment verified successfully.' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Invalid payment signature.' }, { status: 400 });
    }

  } catch (error) {
    console.error('Razorpay Verify Payment Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
