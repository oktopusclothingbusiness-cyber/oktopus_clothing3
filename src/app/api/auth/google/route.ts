import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import firebaseAdmin from '@/lib/firebaseAdmin';
import { generateJWT } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken, email, name, firstName, lastName, googleId, photo, profilePictureUrl, authProvider } = body;

    let firebaseUid = '';
    if (idToken) {
      try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
        firebaseUid = decodedToken.uid;
      } catch (tokenErr) {
        console.warn('Firebase ID token verification failed in Google Auth route:', tokenErr);
      }
    }

    const userEmail = email ? email.toLowerCase().trim() : '';
    if (!userEmail) {
      return NextResponse.json({ message: 'Email is required for Google authentication.' }, { status: 400 });
    }

    const effectiveFirstName = firstName || (name ? name.split(' ')[0] : 'User');
    const effectiveLastName = lastName || (name && name.includes(' ') ? name.split(' ').slice(1).join(' ') : '');
    const effectivePhoto = photo || profilePictureUrl || '';
    const effectiveGoogleId = googleId || firebaseUid || '';

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    // 1. Search for existing user by email, googleId, or firebaseUid
    let user = await usersCollection.findOne({
      $or: [
        { email: userEmail },
        ...(effectiveGoogleId ? [{ googleId: effectiveGoogleId }] : []),
        ...(firebaseUid ? [{ firebaseUid }] : []),
      ],
    });

    if (user) {
      // User exists -> Update profile details if updated info is available
      const updateFields: any = { updatedAt: new Date() };

      if (effectiveGoogleId && !user.googleId) {
        updateFields.googleId = effectiveGoogleId;
      }
      if (firebaseUid && !user.firebaseUid) {
        updateFields.firebaseUid = firebaseUid;
      }
      if (effectivePhoto && user.profilePictureUrl !== effectivePhoto) {
        updateFields.profilePictureUrl = effectivePhoto;
      }
      if (effectiveFirstName && (!user.firstName || user.firstName === 'User')) {
        updateFields.firstName = effectiveFirstName;
      }
      if (effectiveLastName && !user.lastName) {
        updateFields.lastName = effectiveLastName;
      }
      if (authProvider && !user.authProvider) {
        updateFields.authProvider = authProvider;
      }

      if (Object.keys(updateFields).length > 1) {
        await usersCollection.updateOne({ _id: user._id }, { $set: updateFields });
        user = { ...user, ...updateFields };
      }

      const { password, ...userWithoutPassword } = (user as any) || {};

      const token = generateJWT({
        userId: (user as any)._id.toString(),
        email: (user as any).email,
        role: (user as any).role || 'user',
      });

      const response = NextResponse.json(
        {
          message: 'Login successful.',
          user: userWithoutPassword,
          token,
          isNewUser: false,
        },
        { status: 200 }
      );

      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      return response;
    } else {
      // User is new -> Create user record and award 100 welcome Oktocoins
      const newUser = {
        firstName: effectiveFirstName,
        lastName: effectiveLastName,
        email: userEmail,
        googleId: effectiveGoogleId,
        firebaseUid: firebaseUid || '',
        profilePictureUrl: effectivePhoto,
        authProvider: authProvider || 'google',
        oktocoins: 100, // 100 Welcome Oktocoins
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

      const response = NextResponse.json(
        {
          message: 'User created and logged in successfully.',
          user: userWithoutPassword,
          token,
          isNewUser: true,
        },
        { status: 200 }
      );

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
