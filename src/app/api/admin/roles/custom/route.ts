import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authenticateRequestAsync } from '@/lib/auth';
import {
  ALL_ROLES,
  ALPHA_ADMIN_EMAIL,
  CUSTOM_ROLE_COLOR_THEMES,
  CustomRole,
  Permission,
} from '@/lib/rbac';

// Helper to sanitize slug
function slugifyRole(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (base.startsWith('custom_')) {
    return base;
  }
  return `custom_${base}`;
}

// GET all custom roles
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequestAsync(request, { allowStaff: true, allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const customRoles = await db
      .collection<CustomRole>('custom_roles')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Compute user counts for each custom role
    const rolesWithCounts = await Promise.all(
      customRoles.map(async (role) => {
        const userCount = await db.collection('users').countDocuments({ role: role.id });
        return {
          ...role,
          userCount,
        };
      })
    );

    return NextResponse.json({ roles: rolesWithCounts }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to get custom roles:', error);
    return NextResponse.json({ message: error?.message || 'Failed to fetch custom roles' }, { status: 500 });
  }
}

// POST create a new custom role (STRICTLY Master Alpha Admin)
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequestAsync(request);
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    // STRICT CHECK: Only Alpha Admin can create custom roles
    const userEmail = auth.user?.email?.toLowerCase().trim();
    const userRole = auth.user?.role;
    const isMaster = userEmail === ALPHA_ADMIN_EMAIL || userRole === 'alpha_admin';

    if (!isMaster) {
      return NextResponse.json(
        {
          message: 'Access Denied: Only the Master Alpha Admin (rbaskeydomi2018@gmail.com) can create and define custom roles.',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, id: rawId, description, colorTheme = 'indigo', permissions = [] } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ message: 'Role title/name is required.' }, { status: 400 });
    }

    const roleId = rawId ? slugifyRole(rawId) : slugifyRole(name);

    // Validate that role ID does not clash with any built-in system role
    if (ALL_ROLES.includes(roleId as any)) {
      return NextResponse.json(
        { message: `Role identifier '${roleId}' clashes with a built-in system role. Please choose a different name.` },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if role identifier already exists
    const existing = await db.collection('custom_roles').findOne({ id: roleId });
    if (existing) {
      return NextResponse.json(
        { message: `A custom role with identifier '${roleId}' already exists.` },
        { status: 409 }
      );
    }

    const theme = CUSTOM_ROLE_COLOR_THEMES[colorTheme] || CUSTOM_ROLE_COLOR_THEMES.indigo;

    const newRole: CustomRole = {
      id: roleId,
      name: name.trim(),
      title: name.trim(),
      description: (description || '').trim(),
      color: theme.color,
      badgeClassName: theme.badgeClassName,
      colorTheme,
      permissions: Array.isArray(permissions) ? (permissions.filter((p: any) => typeof p === 'string') as Permission[]) : [],
      createdBy: userEmail || ALPHA_ADMIN_EMAIL,
      createdAt: new Date(),
      updatedAt: new Date(),
      userCount: 0,
      isCustom: true,
    };

    await db.collection('custom_roles').insertOne(newRole as any);

    return NextResponse.json(
      {
        message: `Custom role '${newRole.name}' created successfully.`,
        role: newRole,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Failed to create custom role:', error);
    return NextResponse.json({ message: error?.message || 'Failed to create custom role' }, { status: 500 });
  }
}
