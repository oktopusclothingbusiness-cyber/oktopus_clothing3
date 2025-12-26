
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendDataRequestEmail } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Valid User ID is required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    if (!user) {
        return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }
    
    // Send email to admin
    await sendDataRequestEmail({
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      userId: user._id.toString(),
    });

    return NextResponse.json({ message: 'Data request submitted successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Failed to submit data request:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
