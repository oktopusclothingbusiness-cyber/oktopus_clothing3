import jwt from 'jsonwebtoken';
import firebaseAdmin from '../lib/firebaseAdmin.js';

const JWT_SECRET = process.env.JWT_SECRET || 'okto_jwt_secret_2026_production_key_baskey';

/**
 * Mobile Authentication Middleware
 * Extracts Bearer token, attempts backend JWT verification first,
 * and falls back to Firebase Admin SDK verifyIdToken if raw Firebase token is provided.
 */
export async function mobileAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication token missing or invalid format. Header format: Bearer <token>',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing.' });
  }

  // 1. Attempt primary backend JWT verification
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (jwtErr) {
    // 2. Fallback to Firebase Admin SDK token verification
    try {
      const decodedFirebaseToken = await firebaseAdmin.auth().verifyIdToken(token);
      req.user = {
        userId: decodedFirebaseToken.uid,
        phone: decodedFirebaseToken.phone_number || '',
        email: decodedFirebaseToken.email || '',
        firebaseUid: decodedFirebaseToken.uid,
        role: 'user',
        isFirebaseToken: true,
      };
      return next();
    } catch (firebaseErr) {
      console.error('Mobile Auth Failed - JWT & Firebase Admin Verification Failed:', {
        jwtError: jwtErr.message,
        firebaseError: firebaseErr.message,
      });
      return res.status(401).json({
        message: 'Invalid, expired, or unauthenticated session token.',
      });
    }
  }
}

export default mobileAuth;
