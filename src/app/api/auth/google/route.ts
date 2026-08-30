
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import firebaseAdmin from '@/lib/firebaseAdmin';
import { generateJWT } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { idToken, email, firstName, lastName, profilePictureUrl } = await request.json();

    let firebaseUid = '';
    if (idToken) {
      try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
        firebaseUid = decodedToken.uid;
      } catch (tokenErr) {
        console.warn('Firebase ID token verification failed in Google Auth route:', tokenErr);
      }
    }

    const userEmail = email;
    if (!userEmail || !firstName) {
      return NextResponse.json({ message: 'Email and first name are required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    let user = await usersCollection.findOne({
      $or: [
        { email: userEmail },
        ...(firebaseUid ? [{ firebaseUid }] : []),
      ],
    });

    if (user) {
      // User exists, update profile picture & firebaseUid if missing
      const updateFields: any = {};
      if (!user.profilePictureUrl && profilePictureUrl) {
        updateFields.profilePictureUrl = profilePictureUrl;
      }
      if (!user.firebaseUid && firebaseUid) {
        updateFields.firebaseUid = firebaseUid;
      }

      if (Object.keys(updateFields).length > 0) {
        await usersCollection.updateOne({ _id: user._id }, { $set: updateFields });
        user = { ...user, ...updateFields };
      }
      const { password, ...userWithoutPassword } = (user as any) || {};

      const token = generateJWT({
        userId: (user as any)._id.toString(),
        email: (user as any).email,
        role: (user as any).role || 'user',
      });


      const response = NextResponse.json({ message: 'Login successful.', user: userWithoutPassword, token }, { status: 200 });

      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      return response;
    } else {
      // User does not exist, create a new user
      const newUser = {
        firstName,
        lastName: lastName || '',
        email: userEmail,
        firebaseUid: firebaseUid || '',
        profilePictureUrl: profilePictureUrl || '',
        oktocoins: 100, // 100 Oktocoins welcome bonus
        role: userEmail === 'rbaskeydomi2018@gmail.com' ? 'admin' : 'user',
        cart: [],
        wishlist: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);
      const insertedUser = await usersCollection.findOne({ _id: result.insertedId });
      const { password, ...userWithoutPassword } = (insertedUser as any) || {};

      const token = generateJWT({
        userId: insertedUser!._id.toString(),
        email: insertedUser!.email,
        role: insertedUser!.role || 'user',
      });

      const response = NextResponse.json({ message: 'User created and logged in successfully.', user: userWithoutPassword, token }, { status: 201 });

      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      return response;
    }
  } catch (error) {
    console.error('Google Auth Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

