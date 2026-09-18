
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { generateJWT } from '@/lib/auth';
import { checkRateLimit, getClientIp, resetRateLimit } from '@/lib/rateLimit';
import { recordViolation } from '@/lib/ipBlocker';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // 1. IP-level rate limit (prevents distributed password spraying: 15 attempts per 15 min)
    const ipLimit = checkRateLimit(`ip:login:${ip}`, {
      max: 15,
      windowMs: 15 * 60 * 1000,
    });

    if (!ipLimit.success) {
      const violation = recordViolation(ip, 'Excessive login attempts across accounts');
      const minutes = Math.ceil(ipLimit.retryAfter / 60);
      return NextResponse.json(
        {
          success: false,
          message: violation.banned
            ? 'Access denied: Your IP address has been temporarily banned due to excessive login attempts.'
            : `Too many login attempts from this IP address. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
          retryAfter: ipLimit.retryAfter,
        },
        { status: violation.banned ? 403 : 429, headers: ipLimit.headers }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    const normalizedEmail = (email || '').toLowerCase().trim();
    const accountKey = `account:login:${ip}:${normalizedEmail}`;

    // 2. Targeted account rate limit (5 attempts per 15 min)
    const accountLimit = checkRateLimit(accountKey, {
      max: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!accountLimit.success) {
      const violation = recordViolation(ip, `Excessive login attempts for ${normalizedEmail}`);
      const minutes = Math.ceil(accountLimit.retryAfter / 60);
      return NextResponse.json(
        {
          success: false,
          message: violation.banned
            ? 'Access denied: Your IP address has been temporarily banned due to excessive login attempts.'
            : `Too many failed login attempts for this account. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
          retryAfter: accountLimit.retryAfter,
        },
        { status: violation.banned ? 403 : 429, headers: accountLimit.headers }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    // Login successful: reset rate limit tracking for this account and IP
    resetRateLimit(accountKey);
    resetRateLimit(`ip:login:${ip}`);

    const { password: _, ...userWithoutPassword } = user;
    const token = generateJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'user',
    });

    const response = NextResponse.json(
      { success: true, message: 'Login successful.', user: userWithoutPassword, token },
      { status: 200 }
    );

    // Set HTTP-only cookie for admin token authentication
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

