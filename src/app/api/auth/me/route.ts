import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyJWT, generateJWT } from '@/lib/auth';
import { isStaffRole, ALPHA_ADMIN_EMAIL } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    let token: string | null = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = request.cookies.get('admin_token')?.value || null;
    }

    if (!token) {
      return NextResponse.json(
        { authenticated: false, user: null, message: 'No active session token found.' },
        { status: 401 }
      );
    }

    const decoded = verifyJWT(token);
    if (!decoded) {
      return NextResponse.json(
        { authenticated: false, user: null, message: 'Invalid or expired session token.' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    let user: any = null;
    if (ObjectId.isValid(decoded.userId)) {
      user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    }
    if (!user && decoded.email) {
      user = await db.collection('users').findOne({ email: decoded.email.toLowerCase().trim() });
    }

    if (!user) {
      return NextResponse.json(
        { authenticated: false, user: null, message: 'User account not found in database.' },
        { status: 404 }
      );
    }

    // Always ensure Master Alpha Admin authority
    const isMaster = user.email?.toLowerCase().trim() === ALPHA_ADMIN_EMAIL;
    const currentDbRole = isMaster ? 'alpha_admin' : (user.role || 'user');

    const { password: _, ...userWithoutPassword } = user;
    const userPayload = {
      ...userWithoutPassword,
      id: user._id.toString(),
      _id: user._id.toString(),
      role: currentDbRole,
    };

    // If database role differs from the JWT token, refresh the token and cookie!
    const newToken = generateJWT({
      userId: user._id.toString(),
      email: user.email,
      role: currentDbRole,
    });

    const response = NextResponse.json({
      authenticated: true,
      user: userPayload,
      role: currentDbRole,
      isStaff: isStaffRole(currentDbRole),
      token: newToken,
    }, { status: 200 });

    response.cookies.set('admin_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Failed to resolve /api/auth/me:', error);
    return NextResponse.json({ message: 'Internal server error while verifying session.' }, { status: 500 });
  }
}
