import { NextRequest, NextResponse } from 'next/server';
import { isIpBlocked, isSuspiciousBotPath, recordViolation } from '@/lib/ipBlocker';

function extractClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp && realIp.trim()) return realIp.trim();

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp && cfIp.trim()) return cfIp.trim();

  return '127.0.0.1';
}

export function middleware(request: NextRequest) {
  const ip = extractClientIp(request);
  const pathname = request.nextUrl.pathname;

  // 1. Immediate Bot Scanner Probe Defense
  // If an external client scans for sensitive files (.env, .git, wp-admin, etc.), record violation immediately
  if (isSuspiciousBotPath(pathname)) {
    console.warn(`[SECURITY ALERT] Suspicious bot probe from IP ${ip} targeting ${pathname}`);
    recordViolation(ip, `Malicious probe targeting ${pathname}`);

    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Forbidden',
        message: 'Access denied: Suspicious request signature detected.',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 2. IP Blacklist / Ban Verification
  const blockStatus = isIpBlocked(ip);
  if (blockStatus.blocked) {
    const remainingSeconds = blockStatus.expiresAt
      ? Math.max(0, Math.ceil((blockStatus.expiresAt - Date.now()) / 1000))
      : null;

    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Forbidden',
        message: 'Access denied: Your IP address has been temporarily blocked due to suspicious activity.',
        reason: blockStatus.reason || 'Automated security lockout',
        retryAfter: remainingSeconds,
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          ...(remainingSeconds ? { 'Retry-After': remainingSeconds.toString() } : {}),
        },
      }
    );
  }

  return NextResponse.next();
}

// Intercept all API routes as well as root-level scanner probe attempts
export const config = {
  matcher: [
    '/api/:path*',
    '/.env:path*',
    '/.git:path*',
    '/wp-admin:path*',
    '/wp-login:path*',
    '/phpmyadmin:path*',
  ],
};
