import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authenticateRequest, authenticateRequestAsync } from '@/lib/auth';
import {
  ALL_ROLES,
  ALPHA_ADMIN_EMAIL,
  CUSTOM_ROLE_COLOR_THEMES,
  CustomRole,
  Permission,
} from '@/lib/rbac';

// Helper to check Alpha Admin authorization
function isAlphaAdminUser(user?: { email?: string; role?: string } | null): boolean {
  if (!user) return false;
  const email = user.email?.toLowerCase().trim();
  return email === ALPHA_ADMIN_EMAIL || user.role === 'alpha_admin';
}

// GET single custom role by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(request, { allowStaff: true, allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = await params;
    const client = await clientPromise;
    const db = client.db();

    const role = await db.collection<CustomRole>('custom_roles').findOne({ id });
    if (!role) {
      return NextResponse.json({ message: `Custom role '${id}' not found.` }, { status: 404 });
    }

    const userCount = await db.collection('users').countDocuments({ role: id });

    return NextResponse.json({ role: { ...role, userCount } }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to get custom role:', error);
    return NextResponse.json({ message: error?.message || 'Failed to fetch custom role' }, { status: 500 });
  }
}

// PUT update custom role (STRICTLY Master Alpha Admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequestAsync(request);
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    if (!isAlphaAdminUser(auth.user)) {
      return NextResponse.json(
        { message: 'Access Denied: Only the Master Alpha Admin (rbaskeydomi2018@gmail.com) can define or edit custom roles.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (ALL_ROLES.includes(id as any)) {
      return NextResponse.json({ message: 'Built-in system roles cannot be modified through the custom roles endpoint.' }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, colorTheme, permissions } = body;

    const client = await clientPromise;
    const db = client.db();

    const existing = await db.collection<CustomRole>('custom_roles').findOne({ id });
    if (!existing) {
      return NextResponse.json({ message: `Custom role '${id}' not found.` }, { status: 404 });
    }

    const updateFields: Partial<CustomRole> & { updatedAt: Date } = {
      updatedAt: new Date(),
    };

    if (typeof name === 'string' && name.trim()) {
      updateFields.name = name.trim();
      updateFields.title = name.trim();
    }

    if (description !== undefined) {
      updateFields.description = String(description).trim();
    }

    if (colorTheme && CUSTOM_ROLE_COLOR_THEMES[colorTheme]) {
      const theme = CUSTOM_ROLE_COLOR_THEMES[colorTheme];
      updateFields.colorTheme = colorTheme;
      updateFields.color = theme.color;
      updateFields.badgeClassName = theme.badgeClassName;
    }

    if (Array.isArray(permissions)) {
      updateFields.permissions = permissions.filter((p: any) => typeof p === 'string') as Permission[];
    }

    await db.collection('custom_roles').updateOne(
      { id },
      { $set: updateFields }
    );

    const updated = await db.collection<CustomRole>('custom_roles').findOne({ id });

    return NextResponse.json({
      message: `Custom role '${updated?.name || id}' updated successfully.`,
      role: updated,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to update custom role:', error);
    return NextResponse.json({ message: error?.message || 'Failed to update custom role' }, { status: 500 });
  }
}

// DELETE a custom role (STRICTLY Master Alpha Admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequestAsync(request);
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    if (!isAlphaAdminUser(auth.user)) {
      return NextResponse.json(
        { message: 'Access Denied: Only the Master Alpha Admin (rbaskeydomi2018@gmail.com) can delete custom roles.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Guard built-in system roles
    if (ALL_ROLES.includes(id as any)) {
      return NextResponse.json(
        { message: 'Built-in system roles cannot be deleted.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const existing = await db.collection<CustomRole>('custom_roles').findOne({ id });
    if (!existing) {
      return NextResponse.json({ message: `Custom role '${id}' not found.` }, { status: 404 });
    }

    // Safely reassign any users holding this custom role back to standard 'user'
    const userCount = await db.collection('users').countDocuments({ role: id });
    if (userCount > 0) {
      await db.collection('users').updateMany(
        { role: id },
        { $set: { role: 'user', updatedAt: new Date() } }
      );
    }

    // Delete custom role from database
    await db.collection('custom_roles').deleteOne({ id });

    return NextResponse.json({
      message: `Custom role '${existing.name}' deleted successfully. ${userCount} assigned user(s) reassigned to default customer role.`,
      deletedId: id,
      reassignedUsersCount: userCount,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to delete custom role:', error);
    return NextResponse.json({ message: error?.message || 'Failed to delete custom role' }, { status: 500 });
  }
}
