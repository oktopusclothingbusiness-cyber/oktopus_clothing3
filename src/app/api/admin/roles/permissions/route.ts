import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';
import {
  ROLE_PERMISSIONS,
  UserRole,
  Permission,
  ALL_STAFF_ROLES,
  ALPHA_ADMIN_EMAIL,
  CustomRole,
} from '@/lib/rbac';

const SETTINGS_KEY = 'role_permissions_matrix';

// GET role permissions mapping (defaults merged with custom settings and custom roles)
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { allowStaff: true, allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const [settingDoc, customRoles] = await Promise.all([
      db.collection('system_settings').findOne({ key: SETTINGS_KEY }),
      db.collection<CustomRole>('custom_roles').find({}).sort({ createdAt: -1 }).toArray(),
    ]);

    const customPermissions: Record<string, Permission[]> = settingDoc?.permissions || {};

    // Merge defaults with custom overrides for built-in roles
    const permissions: Record<string, Permission[]> = {
      ...ROLE_PERMISSIONS,
      ...customPermissions,
    };

    // Attach custom role permissions
    for (const customRole of customRoles) {
      permissions[customRole.id] = customRole.permissions || [];
    }

    // Ensure alpha_admin always has all permissions
    permissions.alpha_admin = [...ROLE_PERMISSIONS.alpha_admin];
    permissions.user = [];

    return NextResponse.json({
      permissions,
      customRoles,
      isCustomized: Boolean(settingDoc),
      updatedAt: settingDoc?.updatedAt || null,
      updatedBy: settingDoc?.updatedBy || null,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to get role permissions:', error);
    return NextResponse.json({ message: error?.message || 'Failed to fetch role permissions' }, { status: 500 });
  }
}

// PUT update role permissions mapping (Requires alpha_admin or admin with manage_team)
export async function PUT(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { requiredPermission: 'manage_team' });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Forbidden: Master admin access required.' }, { status: auth.statusCode || 403 });
    }

    const body = await request.json();
    const { permissions } = body;

    if (!permissions || typeof permissions !== 'object') {
      return NextResponse.json({ message: 'Invalid permissions payload format.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Sanitize payload to built-in staff roles
    const sanitizedPermissions: Partial<Record<string, Permission[]>> = {};

    for (const role of ALL_STAFF_ROLES) {
      if (role === 'alpha_admin') {
        sanitizedPermissions.alpha_admin = [...ROLE_PERMISSIONS.alpha_admin];
        continue;
      }
      if (Array.isArray(permissions[role])) {
        sanitizedPermissions[role] = permissions[role].filter((p: any) => typeof p === 'string') as Permission[];
      }
    }

    // Also update any custom roles whose permissions were modified
    const customRoles = await db.collection<CustomRole>('custom_roles').find({}).toArray();
    for (const customRole of customRoles) {
      if (Array.isArray(permissions[customRole.id])) {
        const updatedPerms = permissions[customRole.id].filter((p: any) => typeof p === 'string') as Permission[];
        sanitizedPermissions[customRole.id] = updatedPerms;
        await db.collection('custom_roles').updateOne(
          { id: customRole.id },
          { $set: { permissions: updatedPerms, updatedAt: new Date() } }
        );
      }
    }

    await db.collection('system_settings').updateOne(
      { key: SETTINGS_KEY },
      {
        $set: {
          key: SETTINGS_KEY,
          permissions: sanitizedPermissions,
          updatedAt: new Date(),
          updatedBy: auth.user?.email || ALPHA_ADMIN_EMAIL,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      message: 'Role permissions matrix updated successfully.',
      permissions: {
        ...ROLE_PERMISSIONS,
        ...sanitizedPermissions,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to update role permissions:', error);
    return NextResponse.json({ message: error?.message || 'Failed to update role permissions' }, { status: 500 });
  }
}

// DELETE reset to default permissions
export async function DELETE(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { requiredPermission: 'manage_team' });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Forbidden: Master admin access required.' }, { status: auth.statusCode || 403 });
    }

    const client = await clientPromise;
    const db = client.db();

    await db.collection('system_settings').deleteOne({ key: SETTINGS_KEY });

    return NextResponse.json({
      message: 'Role permissions reset to default successfully.',
      permissions: ROLE_PERMISSIONS,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to reset role permissions:', error);
    return NextResponse.json({ message: error?.message || 'Failed to reset role permissions' }, { status: 500 });
  }
}
