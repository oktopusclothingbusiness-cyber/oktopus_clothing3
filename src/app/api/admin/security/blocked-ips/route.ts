import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getBlockedIps, blockIp, unblockIp } from '@/lib/ipBlocker';

/**
 * GET /api/admin/security/blocked-ips
 * Retrieve all currently banned / blocked IPs
 */
export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request, { requiredRole: 'admin' });
  if (!auth.authenticated) {
    return NextResponse.json({ message: auth.error }, { status: auth.statusCode || 401 });
  }

  const blockedList = getBlockedIps();
  return NextResponse.json({
    success: true,
    total: blockedList.length,
    blockedIps: blockedList,
  });
}

/**
 * POST /api/admin/security/blocked-ips
 * Manually block or unblock an IP
 * Body: { action: 'block' | 'unblock', ip: string, durationSeconds?: number, reason?: string }
 */
export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request, { requiredRole: 'admin' });
  if (!auth.authenticated) {
    return NextResponse.json({ message: auth.error }, { status: auth.statusCode || 401 });
  }

  try {
    const body = await request.json();
    const { action, ip, durationSeconds, reason } = body;

    if (!ip || typeof ip !== 'string') {
      return NextResponse.json({ message: 'IP address is required.' }, { status: 400 });
    }

    const cleanIp = ip.trim();

    if (action === 'block') {
      blockIp(cleanIp, durationSeconds, reason || 'Manually blocked by administrator');
      return NextResponse.json({
        success: true,
        message: `IP ${cleanIp} has been blocked successfully.`,
      });
    }

    if (action === 'unblock') {
      const removed = unblockIp(cleanIp);
      return NextResponse.json({
        success: true,
        message: removed
          ? `IP ${cleanIp} has been unblocked.`
          : `IP ${cleanIp} was not in the blocked list.`,
      });
    }

    return NextResponse.json(
      { message: 'Invalid action. Allowed actions: "block", "unblock".' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Blocked IPs Admin API Error:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
