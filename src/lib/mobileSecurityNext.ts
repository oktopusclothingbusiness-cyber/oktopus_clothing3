import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import firebaseAdmin from '@/lib/firebaseAdmin';

const MOBILE_HMAC_SECRET = process.env.MOBILE_HMAC_SECRET || 'okto_mobile_sec_2026_prod';
const JWT_SECRET = process.env.JWT_SECRET || 'okto_jwt_secret_2026_production_key_baskey';

export async function validateNextMobileHeaders(request: NextRequest, body: any = null) {
  const platform = request.headers.get('x-platform');
  const appSignature = request.headers.get('x-app-signature');

  if (!platform || !['android', 'ios'].includes(platform.toLowerCase())) {
    return {
      valid: false,
      response: NextResponse.json(
        { message: 'Invalid or missing x-platform header. Allowed values: android, ios.' },
        { status: 400 }
      ),
    };
  }

  if (!appSignature) {
    return {
      valid: false,
      response: NextResponse.json(
        { message: 'Missing x-app-signature header. Mobile client verification required.' },
        { status: 400 }
      ),
    };
  }

  try {
    const rawBody = body ? JSON.stringify(body) : '';
    const expectedSignatureHex = crypto.createHmac('sha256', MOBILE_HMAC_SECRET).update(rawBody).digest('hex');
    const expectedSignatureBase64 = crypto.createHmac('sha256', MOBILE_HMAC_SECRET).update(rawBody).digest('base64');

    if (
      appSignature !== expectedSignatureHex &&
      appSignature !== expectedSignatureBase64 &&
      process.env.NODE_ENV === 'production'
    ) {
      return {
        valid: false,
        response: NextResponse.json(
          { message: 'Invalid x-app-signature. HMAC signature verification failed.' },
          { status: 401 }
        ),
      };
    }
  } catch (err) {
    console.error('Error validating mobile HMAC signature:', err);
  }

  return { valid: true };
}

export async function authenticateNextMobileRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { message: 'Authentication token missing or invalid format. Header format: Bearer <token>' },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return {
      authenticated: false,
      response: NextResponse.json({ message: 'Authentication token missing.' }, { status: 401 }),
    };
  }

  // 1. Try JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { authenticated: true, user: decoded };
  } catch (jwtErr) {
    // 2. Try Firebase Admin token
    try {
      const decodedFirebaseToken = await firebaseAdmin.auth().verifyIdToken(token);
      return {
        authenticated: true,
        user: {
          userId: decodedFirebaseToken.uid,
          phone: decodedFirebaseToken.phone_number || '',
          email: decodedFirebaseToken.email || '',
          firebaseUid: decodedFirebaseToken.uid,
          role: 'user',
        },
      };
    } catch (firebaseErr) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { message: 'Invalid, expired, or unauthenticated session token.' },
          { status: 401 }
        ),
      };
    }
  }
}
