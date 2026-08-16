import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import firebaseAdmin from '@/lib/firebaseAdmin';
import { validateNextMobileHeaders } from '@/lib/mobileSecurityNext';

const JWT_SECRET = process.env.JWT_SECRET || 'okto_jwt_secret_2026_production_key_baskey';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const headerCheck = await validateNextMobileHeaders(request, body);
    if (!headerCheck.valid) return headerCheck.response!;

    const { idToken, firstName, lastName } = body;
    if (!idToken) {
      return NextResponse.json({ message: 'Missing required field: idToken.' }, { status: 400 });
    }

    let decodedToken: any;
    try {
      decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development' && idToken.startsWith('mock-token-')) {
        decodedToken = { uid: idToken.replace('mock-token-', 'uid_'), phone_number: '+919999999999' };
      } else {
        return NextResponse.json(
          { message: 'Invalid or expired Firebase ID token.', error: err?.message },
          { status: 401 }
        );
      }
    }

    const firebaseUid = decodedToken.uid;
    const phone = decodedToken.phone_number || '';

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    let user: any = await usersCollection.findOne({
      $or: [{ firebaseUid }, ...(phone ? [{ phone }] : [])],
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const newUserDoc = {
        firebaseUid,
        phone,
        firstName: firstName || '',
        lastName: lastName || '',
        oktocoins: 100, // Default 100 Oktocoins bonus
        role: 'user',
        cart: [],
        wishlist: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUserDoc);
      user = { _id: result.insertedId, ...newUserDoc };
    } else {
      const updateFields: any = {};
      if (firstName && !user.firstName) updateFields.firstName = firstName;
      if (lastName && !user.lastName) updateFields.lastName = lastName;
      if (!user.firebaseUid) updateFields.firebaseUid = firebaseUid;

      if (Object.keys(updateFields).length > 0) {
        updateFields.updatedAt = new Date();
        await usersCollection.updateOne({ _id: user._id }, { $set: updateFields });
        user = { ...user, ...updateFields };
      }
    }

    const tokenPayload = {
      userId: user._id.toString(),
      phone: user.phone || '',
      role: user.role || 'user',
      firebaseUid: user.firebaseUid || '',
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });

    return NextResponse.json(
      {
        success: true,
        isNewUser,
        token,
        user: {
          _id: user._id,
          phone: user.phone || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          oktocoins: user.oktocoins ?? 100,
          role: user.role || 'user',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Firebase Phone Auth API Error:', error);
    return NextResponse.json({ message: 'Internal server error during mobile authentication.' }, { status: 500 });
  }
}
