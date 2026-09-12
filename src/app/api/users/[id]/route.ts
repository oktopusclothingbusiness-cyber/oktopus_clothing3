import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { triggerUserEventPushNotification } from '@/lib/pushNotifications';

// DELETE a user by ID
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid user ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT (update) a user by ID
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid user ID.' }, { status: 400 });
    }

    const body = await request.json();
    const {
      role,
      firstName,
      lastName,
      mobile,
      address,
      profilePictureUrl,
      oktocoins,
      pushToken,
      personalization,
    } = body;

    const client = await clientPromise;
    const db = client.db();

    const existingUser = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!existingUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const updateData: { [key: string]: any } = { updatedAt: new Date() };

    if (role) {
      if (!['user', 'admin'].includes(role)) {
        return NextResponse.json({ message: 'Invalid role specified.' }, { status: 400 });
      }
      updateData.role = role;
    }

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (mobile !== undefined) updateData.mobile = mobile;
    if (address !== undefined) updateData.address = address;
    if (profilePictureUrl !== undefined) updateData.profilePictureUrl = profilePictureUrl;

    if (pushToken !== undefined) {
      updateData.pushToken = pushToken;
    }

    if (personalization !== undefined && typeof personalization === 'object') {
      updateData.personalization = {
        ...(existingUser.personalization || {}),
        ...personalization,
      };
    }

    let coinDiff = 0;
    if (oktocoins !== undefined) {
      const newBalance = parseInt(oktocoins, 10);
      if (!isNaN(newBalance)) {
        const oldBalance = typeof existingUser.oktocoins === 'number' ? existingUser.oktocoins : 0;
        coinDiff = newBalance - oldBalance;
        updateData.oktocoins = newBalance;
      } else {
        return NextResponse.json({ message: 'Invalid Oktocoins value.' }, { status: 400 });
      }
    }

    if (Object.keys(updateData).length === 1) {
      return NextResponse.json({ message: 'No update fields provided.' }, { status: 400 });
    }

    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // Trigger push notification if Oktocoins were earned
    if (coinDiff > 0) {
      triggerUserEventPushNotification({
        userId: id,
        title: `You Earned ${coinDiff} Oktocoins! 🪙`,
        body: 'Your rewards balance has been updated.',
        deepLink: '/rewards',
      }).catch((err) => console.error('Failed to trigger coins push notification:', err));
    }

    const { password, ...userWithoutPassword } = result;

    return NextResponse.json(
      { message: 'User updated successfully.', user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
