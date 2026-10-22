import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import {
  UserRole,
  Permission,
  isStaffRole,
  hasPermission,
  ALPHA_ADMIN_EMAIL,
} from './rbac';

const JWT_SECRET = process.env.JWT_SECRET || 'okto_jwt_secret_2026_production_key_baskey';
const APP_SECRET_KEY = process.env.APP_SECRET_KEY || 'okto_mobile_sec_2026_prod';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
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

    // Auto-promote alpha admin email
    if (payload.email && payload.email.toLowerCase().trim() === ALPHA_ADMIN_EMAIL) {
      payload.role = 'alpha_admin';
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

export interface AuthenticateRequestOptions {
  requiredRole?: UserRole | UserRole[] | 'admin' | 'user';
  requiredPermission?: Permission;
  allowStaff?: boolean;
  allowAppSecret?: boolean;
}

/**
 * Extract auth token from Authorization header or admin_token cookie
 */
export function extractToken(request: NextRequest | Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check NextRequest cookies if available
  if ('cookies' in request && typeof (request as any).cookies?.get === 'function') {
    const cookieVal = (request as any).cookies.get('admin_token')?.value;
    if (cookieVal) return cookieVal;
  }

  // Fallback: parse raw Cookie header
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const parts = cookieHeader.split(';');
    for (const part of parts) {
      const [key, ...val] = part.trim().split('=');
      if (key === 'admin_token') {
        return decodeURIComponent(val.join('='));
      }
    }
  }

  return null;
}

/**
 * Synchronous verification of request authentication and authorization with RBAC
 */
export function authenticateRequest(
  request: NextRequest | Request,
  options: AuthenticateRequestOptions = {}
): AuthValidationResult {
  const appSecretHeader = request.headers.get('x-app-secret');

  // Option 1: Mobile App Secret header check for public mobile traffic if allowed
  if (options.allowAppSecret && appSecretHeader === APP_SECRET_KEY) {
    return {
      authenticated: true,
      user: { userId: 'mobile-app', email: 'app@oktopus.in', role: 'alpha_admin' },
    };
  }

  // Option 2: JWT Bearer Token / Cookie validation
  const token = extractToken(request);

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

  // Alpha Admin has unconditional master access
  if (
    decoded.role === 'alpha_admin' ||
    (decoded.email && decoded.email.toLowerCase().trim() === ALPHA_ADMIN_EMAIL)
  ) {
    return {
      authenticated: true,
      user: { ...decoded, role: 'alpha_admin' },
    };
  }

  // Role check
  if (options.requiredRole) {
    const required = Array.isArray(options.requiredRole)
      ? options.requiredRole
      : [options.requiredRole];

    const hasRoleMatch = required.some((req) => {
      if (req === 'admin') {
        return decoded.role === 'admin' || decoded.role === 'alpha_admin';
      }
      return decoded.role === req;
    });

    if (!hasRoleMatch) {
      return {
        authenticated: false,
        error: `Access denied: Required role (${required.join(', ')}) not met.`,
        statusCode: 403,
      };
    }
  }

  // Staff check
  if (options.allowStaff && !isStaffRole(decoded.role)) {
    return {
      authenticated: false,
      error: 'Access denied: Staff privileges required.',
      statusCode: 403,
    };
  }

  // Granular Permission check
  if (options.requiredPermission) {
    const permitted = hasPermission(decoded.role, options.requiredPermission, decoded.email);
    if (!permitted) {
      return {
        authenticated: false,
        error: `Access denied: Role '${decoded.role}' lacks '${options.requiredPermission}' permission.`,
        statusCode: 403,
      };
    }
  }

  return {
    authenticated: true,
    user: decoded,
  };
}

/**
 * Asynchronously verify request authentication, consulting MongoDB for live role state
 * to ensure that role changes (like demoting to products_manager) take effect immediately
 * without requiring client token refresh.
 */
export async function authenticateRequestAsync(
  request: NextRequest | Request,
  options: AuthenticateRequestOptions = {}
): Promise<AuthValidationResult> {
  const syncAuth = authenticateRequest(request, options);
  if (!syncAuth.authenticated || !syncAuth.user) {
    return syncAuth;
  }

  // Alpha Admin email is absolute master
  if (syncAuth.user.email && syncAuth.user.email.toLowerCase().trim() === ALPHA_ADMIN_EMAIL) {
    return {
      authenticated: true,
      user: { ...syncAuth.user, role: 'alpha_admin' },
    };
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    let dbUser: any = null;
    if (ObjectId.isValid(syncAuth.user.userId)) {
      dbUser = await db.collection('users').findOne({ _id: new ObjectId(syncAuth.user.userId) });
    }
    if (!dbUser && syncAuth.user.email) {
      dbUser = await db.collection('users').findOne({ email: syncAuth.user.email.toLowerCase().trim() });
    }

    if (dbUser) {
      const liveRole = dbUser.email?.toLowerCase().trim() === ALPHA_ADMIN_EMAIL
        ? 'alpha_admin'
        : (dbUser.role || 'user');

      syncAuth.user.role = liveRole;

      // Re-evaluate permissions against fresh live role from database
      if (options.requiredPermission) {
        const permitted = hasPermission(liveRole, options.requiredPermission, dbUser.email);
        if (!permitted) {
          return {
            authenticated: false,
            error: `Access denied: Role '${liveRole}' lacks '${options.requiredPermission}' permission.`,
            statusCode: 403,
          };
        }
      }

      if (options.requiredRole) {
        const required = Array.isArray(options.requiredRole)
          ? options.requiredRole
          : [options.requiredRole];

        const hasRoleMatch = required.some((req) => {
          if (req === 'admin') {
            return liveRole === 'admin' || liveRole === 'alpha_admin';
          }
          return liveRole === req;
        });

        if (!hasRoleMatch) {
          return {
            authenticated: false,
            error: `Access denied: Required role (${required.join(', ')}) not met.`,
            statusCode: 403,
          };
        }
      }

      if (options.allowStaff && !isStaffRole(liveRole)) {
        return {
          authenticated: false,
          error: 'Access denied: Staff privileges required.',
          statusCode: 403,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to verify live user role in MongoDB, falling back to token:', err);
  }

  return syncAuth;
}
