import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { triggerUserEventPushNotification } from '@/lib/pushNotifications';
import { ALL_ROLES, ALPHA_ADMIN_EMAIL } from '@/lib/rbac';
import { authenticateRequestAsync } from '@/lib/auth';

// DELETE a user by ID
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateRequestAsync(request, { requiredPermission: 'users:delete' });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Forbidden' }, { status: auth.statusCode || 403 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid user ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const targetUser = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!targetUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // Protect Master Alpha Admin from deletion
    if (
      targetUser.email?.toLowerCase().trim() === ALPHA_ADMIN_EMAIL ||
      targetUser.role === 'alpha_admin'
    ) {
      return NextResponse.json(
        { message: 'The Master Alpha Admin account is protected and cannot be deleted.' },
        { status: 403 }
      );
    }

    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT (update) a user by ID
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid user ID.' }, { status: 400 });
    }

    const body = await request.json();
    const {
      role,
      firstName,
      lastName,
      mobile,
      address,
      profilePictureUrl,
      oktocoins,
      pushToken,
      personalization,
      status,
      isBlocked,
      suspendedReason,
    } = body;

    const client = await clientPromise;
    const db = client.db();

    const existingUser = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!existingUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const isMasterUser =
      existingUser.email?.toLowerCase().trim() === ALPHA_ADMIN_EMAIL;

    // Protect Master Alpha Admin from demotion or suspension
    if (isMasterUser) {
      if (role && role !== 'alpha_admin') {
        return NextResponse.json(
          { message: 'The Master Alpha Admin role is permanently protected and cannot be modified.' },
          { status: 403 }
        );
      }
      if (status === 'suspended' || isBlocked === true) {
        return NextResponse.json(
          { message: 'The Master Alpha Admin account cannot be suspended or blocked.' },
          { status: 403 }
        );
      }
    }

    const updateData: { [key: string]: any } = { updatedAt: new Date() };

    if (role) {
      let isValidRole = ALL_ROLES.includes(role as any);
      if (!isValidRole) {
        // Check if role is an active custom role in MongoDB
        const customRoleDoc = await db.collection('custom_roles').findOne({ id: role });
        if (customRoleDoc) {
          isValidRole = true;
        }
      }

      if (!isValidRole) {
        return NextResponse.json(
          { message: `Invalid role specified: '${role}'.` },
          { status: 400 }
        );
      }

      // Check permission to manage roles
      const auth = await authenticateRequestAsync(request, { requiredPermission: 'users:manage_roles' });
      if (!auth.authenticated) {
        return NextResponse.json(
          { message: auth.error || 'Forbidden: Insufficient privileges to change user roles.' },
          { status: auth.statusCode || 403 }
        );
      }

      // Only Alpha Admin can assign the alpha_admin role
      if (role === 'alpha_admin' && auth.user?.role !== 'alpha_admin') {
        return NextResponse.json(
          { message: 'Forbidden: Only the Master Alpha Admin can grant Alpha Admin privileges.' },
          { status: 403 }
        );
      }

      updateData.role = role;
    }

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (mobile !== undefined) updateData.mobile = mobile;
    if (address !== undefined) updateData.address = address;
    if (profilePictureUrl !== undefined) updateData.profilePictureUrl = profilePictureUrl;

    if (status !== undefined || isBlocked !== undefined) {
      const auth = await authenticateRequestAsync(request, { requiredPermission: 'users:edit' });
      if (!auth.authenticated) {
        return NextResponse.json(
          { message: auth.error || 'Forbidden: Insufficient privileges to modify user account status.' },
          { status: auth.statusCode || 403 }
        );
      }
    }

    if (status !== undefined) {
      if (!['active', 'suspended'].includes(status)) {
        return NextResponse.json({ message: 'Invalid status specified.' }, { status: 400 });
      }
      updateData.status = status;
      updateData.isBlocked = status === 'suspended';
      if (status === 'suspended') {
        updateData.suspendedAt = new Date();
      } else {
        updateData.suspendedAt = null;
        updateData.suspendedReason = null;
      }
    }

    if (isBlocked !== undefined) {
      const blocked = Boolean(isBlocked);
      updateData.isBlocked = blocked;
      updateData.status = blocked ? 'suspended' : 'active';
      if (blocked) {
        updateData.suspendedAt = new Date();
      } else {
        updateData.suspendedAt = null;
        updateData.suspendedReason = null;
      }
    }

    if (suspendedReason !== undefined) {
      updateData.suspendedReason = suspendedReason;
    }

    if (pushToken !== undefined) {
      updateData.pushToken = pushToken;
    }

    if (personalization !== undefined && typeof personalization === 'object') {
      updateData.personalization = {
        ...(existingUser.personalization || {}),
        ...personalization,
      };
    }

    let coinDiff = 0;
    if (oktocoins !== undefined) {
      const newBalance = parseInt(oktocoins, 10);
      if (!isNaN(newBalance)) {
        const oldBalance = typeof existingUser.oktocoins === 'number' ? existingUser.oktocoins : 0;
        coinDiff = newBalance - oldBalance;
        updateData.oktocoins = newBalance;
      } else {
        return NextResponse.json({ message: 'Invalid Oktocoins value.' }, { status: 400 });
      }
    }

    if (Object.keys(updateData).length === 1) {
      return NextResponse.json({ message: 'No update fields provided.' }, { status: 400 });
    }

    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // Trigger push notification if Oktocoins were earned
    if (coinDiff > 0) {
      triggerUserEventPushNotification({
        userId: id,
        title: `You Earned ${coinDiff} Oktocoins!`,
        body: 'Your rewards balance has been updated.',
        deepLink: '/rewards',
      }).catch((err) => console.error('Failed to trigger coins push notification:', err));
    }

    const { password, ...userWithoutPassword } = result;

    return NextResponse.json(
      { message: 'User updated successfully.', user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
