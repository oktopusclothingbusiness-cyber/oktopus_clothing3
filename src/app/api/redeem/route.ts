import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const REWARD_COST = 500;

export async function POST(request: Request) {
  try {
    const { userId, rewardId, size, shippingAddress } = await request.json();

    if (!userId || !rewardId || !size || !shippingAddress) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }
    
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(rewardId)) {
        return NextResponse.json({ message: 'Invalid ID provided.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
        return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }
    
    if ((user.oktocoins || 0) < REWARD_COST) {
        return NextResponse.json({ message: 'Not enough Oktocoins.' }, { status: 403 });
    }

    const reward = await db.collection('rewards').findOne({ _id: new ObjectId(rewardId) });
    if (!reward) {
        return NextResponse.json({ message: 'Reward not found.' }, { status: 404 });
    }
    
    // Decrement user's points
    const updateUserResult = await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $inc: { oktocoins: -REWARD_COST } }
    );
    
    if (updateUserResult.modifiedCount === 0) {
        throw new Error('Failed to update user points.');
    }
    
    // Create a new order for the redeemed item
    const redeemedOrder = {
      userId,
      userName: `${user.firstName} ${user.lastName}`,
      products: [{
          productId: reward._id.toString(),
          name: reward.name,
          quantity: 1,
          price: 0, // It's a free item
          size: size,
          color: 'Reward'
      }],
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
      shippingAddress,
      status: 'accepted',
      createdAt: new Date(),
      paymentDetails: {
          paymentStatus: 'paid externally',
          notes: `Redeemed with ${REWARD_COST} Oktocoins`
      },
      isRedemption: true,
    };

    await db.collection('orders').insertOne(redeemedOrder);

    // TODO: Send an order confirmation email for the redeemed item

    return NextResponse.json({ message: 'Redemption successful!' }, { status: 200 });

  } catch (error: any) {
    console.error('Redemption Error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
