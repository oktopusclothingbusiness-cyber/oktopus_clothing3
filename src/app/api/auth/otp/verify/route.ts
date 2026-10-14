import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { generateJWT } from '@/lib/auth';
import { getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const body = await request.json().catch(() => ({}));
    const { email, otp, purpose = 'signup', userData } = body;

    // Strict policy: OTP verification is solely for signup email validation
    if (purpose !== 'signup') {
      return NextResponse.json(
        { message: 'Email OTP is strictly reserved for new account verification.' },
        { status: 400 }
      );
    }

    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Email and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    const cleanOtp = String(otp).trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      return NextResponse.json(
        { message: 'Verification code must be exactly 6 digits.' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const client = await clientPromise;
    const db = client.db();

    // 1. Fetch OTP record
    const otpRecord = await db.collection('otps').findOne({
      email: normalizedEmail,
      purpose: 'signup',
    });

    if (!otpRecord) {
      return NextResponse.json(
        { message: 'Verification code has expired or was not requested. Please request a new code.' },
        { status: 400 }
      );
    }

    // 2. Check expiration timestamp
    if (otpRecord.expiresAt && new Date() > new Date(otpRecord.expiresAt)) {
      await db.collection('otps').deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { message: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // 3. Brute-force protection: Max 5 incorrect attempts
    if ((otpRecord.attempts || 0) >= 5) {
      await db.collection('otps').deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { message: 'Too many incorrect attempts. This code is invalidated. Please request a new code.' },
        { status: 429 }
      );
    }

    // 4. Verify cryptographic hash
    const inputHash = crypto.createHash('sha256').update(cleanOtp).digest('hex');
    if (inputHash !== otpRecord.otpHash) {
      await db.collection('otps').updateOne(
        { _id: otpRecord._id },
        { $inc: { attempts: 1 } }
      );
      const remainingAttempts = 5 - ((otpRecord.attempts || 0) + 1);
      return NextResponse.json(
        {
          message: `Incorrect code. ${remainingAttempts > 0 ? `${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.` : 'Code invalidated.'}`,
        },
        { status: 400 }
      );
    }

    // 5. Code is valid: Burn the OTP immediately
    await db.collection('otps').deleteOne({ _id: otpRecord._id });

    // 6. Complete Signup Registration
    const existingUser = await db.collection('users').findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists. Please log in with your password.' },
        { status: 409 }
      );
    }

    const { firstName, lastName, password } = userData || {};
    if (!firstName || !password) {
      return NextResponse.json(
        { message: 'First name and password are required to complete registration.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = normalizedEmail === 'rbaskeydomi2018@gmail.com' ? 'admin' : 'user';

    const insertResult = await db.collection('users').insertOne({
      firstName: String(firstName).trim(),
      lastName: String(lastName || '').trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      status: 'active',
      isBlocked: false,
      isEmailVerified: true,
      registrationIp: ip,
      lastLoginIp: ip,
      knownIps: [ip],
      lastLoginAt: new Date(),
      cart: [],
      wishlist: [],
      oktocoins: 100, // 100 bonus OktoCoins for verifying email
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newUser = await db.collection('users').findOne({ _id: insertResult.insertedId });
    const { password: _, ...userWithoutPassword } = newUser as any;

    const userPayload: any = {
      ...userWithoutPassword,
      id: userWithoutPassword._id.toString(),
      _id: userWithoutPassword._id.toString(),
    };

    const token = generateJWT({
      userId: userPayload.id,
      email: userPayload.email,
      role: userPayload.role || 'user',
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Email verified and account created successfully!',
        token,
        user: userPayload,
        isNewUser: true,
      },
      { status: 201 }
    );

    // Set cookie for web sessions
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;

  } catch (error: any) {
    console.error('OTP Verify Route Error:', error);
    return NextResponse.json(
      { message: error?.message || 'Failed to verify code. Please try again.' },
      { status: 500 }
    );
  }
}
