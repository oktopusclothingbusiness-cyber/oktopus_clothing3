import { NextResponse } from 'next/server';
import crypto from 'crypto';
import clientPromise from '@/lib/mongodb';
import { getResendClient } from '@/lib/mail';
import { getClientIp, checkRateLimit } from '@/lib/rateLimit';

let isTtlIndexCreated = false;
async function ensureTtlIndex(db: any) {
  if (isTtlIndexCreated) return;
  try {
    await db.collection('otps').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await db.collection('otps').createIndex({ email: 1, purpose: 1 });
    isTtlIndexCreated = true;
  } catch (err) {
    console.warn('Failed to ensure OTP TTL index:', err);
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const body = await request.json().catch(() => ({}));
    const { email, purpose = 'signup' } = body;

    // Strict policy: OTP is ONLY used for signup email verification to preserve Resend quota
    if (purpose !== 'signup') {
      return NextResponse.json(
        { message: 'Email OTP is strictly reserved for new account verification.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ message: 'Valid email is required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ message: 'Please provide a valid email address.' }, { status: 400 });
    }

    // 1. Rate limiting: Max 3 OTP requests per 15 mins per email (conserves Resend quota)
    const emailLimit = checkRateLimit(`otp:send:email:${normalizedEmail}`, {
      max: 3,
      windowMs: 15 * 60 * 1000,
    });
    if (!emailLimit.success) {
      const minutes = Math.ceil(emailLimit.retryAfter / 60);
      return NextResponse.json(
        { message: `Too many verification requests. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before retrying.` },
        { status: 429 }
      );
    }

    // 2. IP rate limiting: Max 10 OTP requests per 15 mins per IP
    const ipLimit = checkRateLimit(`otp:send:ip:${ip}`, {
      max: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!ipLimit.success) {
      return NextResponse.json(
        { message: 'Too many requests from your network. Please try again later.' },
        { status: 429 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    await ensureTtlIndex(db);

    // 3. Ensure email is not already registered
    const existingUser = await db.collection('users').findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists. Please log in with your password.' },
        { status: 409 }
      );
    }

    // 4. Cooldown check: 60 seconds between resend requests
    const activeOtp = await db.collection('otps').findOne({ email: normalizedEmail, purpose: 'signup' });
    if (activeOtp && activeOtp.createdAt) {
      const elapsedSeconds = (Date.now() - new Date(activeOtp.createdAt).getTime()) / 1000;
      if (elapsedSeconds < 60) {
        const remaining = Math.ceil(60 - elapsedSeconds);
        return NextResponse.json(
          { message: `Please wait ${remaining}s before requesting a new code.`, retryAfter: remaining },
          { status: 429 }
        );
      }
    }

    // 5. Generate secure 6-digit random OTP
    const rawOtp = String(crypto.randomInt(100000, 1000000));
    const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 6. Store in MongoDB
    await db.collection('otps').updateOne(
      { email: normalizedEmail, purpose: 'signup' },
      {
        $set: {
          otpHash,
          attempts: 0,
          expiresAt,
          createdAt: new Date(),
          ip,
        },
      },
      { upsert: true }
    );

    // 7. Dispatch Email via Resend with Official OKTOPUS Branding
    const resend = getResendClient();
    const subject = `${rawOtp} is your OKTOPUS verification code`;

    await resend.emails.send({
      from: 'OKTOPUS CLOTHING <care@oktopusclothing.in>',
      to: normalizedEmail,
      subject,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="margin: 0; padding: 32px 16px; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);" cellspacing="0" cellpadding="0" border="0">
                  
                  <!-- OFFICIAL HEADER WITH BRAND LOGO -->
                  <tr>
                    <td align="center" style="padding: 32px 24px 20px; background-color: #0b0c10; border-bottom: 3px solid #ff4242;">
                      <a href="https://www.oktopusclothing.in" target="_blank" style="text-decoration: none; display: inline-block;">
                        <img 
                          src="https://www.oktopusclothing.in/logo2b.png" 
                          alt="OKTOPUS CLOTHING" 
                          width="190" 
                          style="display: block; max-width: 190px; height: auto; border: 0;"
                        />
                      </a>
                    </td>
                  </tr>

                  <!-- MAIN CONTENT -->
                  <tr>
                    <td style="padding: 36px 32px 28px; text-align: center;">
                      <h1 style="margin: 0 0 12px; font-size: 22px; font-weight: 800; color: #111827; letter-spacing: -0.5px;">
                        Verify Your Email Address
                      </h1>
                      <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #4b5563;">
                        Thank you for registering with <strong>OKTOPUS CLOTHING</strong>. Please use the one-time verification code below to verify your email address and activate your account.
                      </p>

                      <!-- OTP CODE DISPLAY -->
                      <div style="background-color: #f9fafb; border: 2px dashed #d1d5db; border-radius: 12px; padding: 20px 16px; margin: 0 auto 24px; max-width: 320px;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #111827; display: block; text-align: center; margin-left: 10px;">
                          ${rawOtp}
                        </span>
                      </div>

                      <p style="margin: 0 0 6px; font-size: 13px; color: #6b7280;">
                        This code is valid for <strong style="color: #111827;">10 minutes</strong>.
                      </p>
                      <p style="margin: 0 0 28px; font-size: 12px; color: #9ca3af;">
                        For your security, never share this code with anyone. OKTOPUS will never ask for your code.
                      </p>

                      <!-- OFFICIAL ASSISTANCE SECTION -->
                      <div style="background-color: #f3f4f6; border-radius: 10px; padding: 14px 18px; text-align: left; border-left: 4px solid #111827;">
                        <p style="margin: 0; font-size: 12px; color: #374151; line-height: 1.5;">
                          <strong>Need assistance?</strong> For any inquiries or support, please contact our team directly at:
                          <br />
                          <a href="mailto:oktopusclothing.business@gmail.com" style="color: #2563eb; font-weight: 600; text-decoration: underline;">
                            oktopusclothing.business@gmail.com
                          </a>
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- OFFICIAL FOOTER -->
                  <tr>
                    <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                      <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #374151;">
                        OKTOPUS CLOTHING &bull; A Unit of BASKEY Studio
                      </p>
                      <p style="margin: 0 0 12px; font-size: 11px; color: #6b7280; line-height: 1.5;">
                        Official Website: <a href="https://www.oktopusclothing.in" target="_blank" style="color: #4b5563; text-decoration: underline;">www.oktopusclothing.in</a>
                        <br />
                        Official Support: <a href="mailto:oktopusclothing.business@gmail.com" style="color: #4b5563; text-decoration: underline;">oktopusclothing.business@gmail.com</a>
                      </p>
                      <p style="margin: 0; font-size: 10px; color: #9ca3af; letter-spacing: 0.5px;">
                        &copy; ${new Date().getFullYear()} OKTOPUS CLOTHING. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email.',
      cooldownSeconds: 60,
    });
  } catch (error: any) {
    console.error('OTP Send Route Error:', error);
    return NextResponse.json(
      { message: error?.message || 'Failed to dispatch verification code. Please try again.' },
      { status: 500 }
    );
  }
}
