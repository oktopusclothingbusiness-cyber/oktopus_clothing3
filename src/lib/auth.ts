import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'okto_jwt_secret_2026_production_key_baskey';
const APP_SECRET_KEY = process.env.APP_SECRET_KEY || 'okto_mobile_sec_2026_prod';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  iat?: number;
  exp?: number;
}

// Helper to base64url encode
function base64urlEncode(str: string | Buffer): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Helper to base64url decode
function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Generate a signed JWT token valid for 30 days
 */
export function generateJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + 30 * 24 * 60 * 60, // 30 days
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify and decode a JWT token
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload: JWTPayload = JSON.parse(base64urlDecode(encodedPayload));

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

export interface AuthValidationResult {
  authenticated: boolean;
  user?: JWTPayload;
  error?: string;
  statusCode?: number;
}

/**
 * Verify request authentication and authorization
 */
export function authenticateRequest(
  request: NextRequest,
  options: { requiredRole?: 'admin' | 'user'; allowAppSecret?: boolean } = {}
): AuthValidationResult {
  const authHeader = request.headers.get('authorization');
  const appSecretHeader = request.headers.get('x-app-secret');

  // Option 1: Mobile App Secret header check for public mobile traffic if allowed
  if (options.allowAppSecret && appSecretHeader === APP_SECRET_KEY) {
    return { authenticated: true, user: { userId: 'mobile-app', email: 'app@oktopus.in', role: 'admin' } };
  }

  // Option 2: Development mode local fallback
  if (process.env.NODE_ENV === 'development') {
    return {
      authenticated: true,
      user: { userId: 'dev-admin', email: 'admin@oktopus.in', role: 'admin' },
    };
  }

  // Option 3: JWT Bearer Token validation
  let token: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Check fallback cookie
    const cookieToken = request.cookies.get('admin_token')?.value;
    if (cookieToken) {
      token = cookieToken;
    }
  }

  if (!token) {
    return {
      authenticated: false,
      error: 'Authentication token missing or invalid.',
      statusCode: 401,
    };
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return {
      authenticated: false,
      error: 'Session expired or invalid token.',
      statusCode: 401,
    };
  }

  // Role check
  if (options.requiredRole === 'admin' && decoded.role !== 'admin') {
    return {
      authenticated: false,
      error: 'Access denied: Admin privileges required.',
      statusCode: 403,
    };
  }

  return {
    authenticated: true,
    user: decoded,
  };
}
