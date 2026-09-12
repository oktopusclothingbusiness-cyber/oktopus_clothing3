import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';
import { sendExpoPushNotifications, ExpoPushMessage } from '@/lib/pushNotifications';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    const totalUsers = await usersCollection.countDocuments({});
    const activePushSubscribers = await usersCollection.countDocuments({
      pushToken: { $exists: true, $type: 'string', $regex: /^Expo/ },
    });

    const recentLogs = await db
      .collection('push_notification_logs')
      .find({})
      .sort({ dispatchedAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json(
      {
        totalUsers,
        activePushSubscribers,
        recentLogs: recentLogs.map((log) => ({ ...log, id: log._id.toString() })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Failed to fetch push notification metadata:', error);
    return NextResponse.json({ message: error?.message || 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const body = await request.json();
    const { targetAudience, targetUserId, segmentFilter, title, body: messageBody, imageUrl, deepLink } = body;

    if (!title || !messageBody) {
      return NextResponse.json({ message: 'Title and Message Body are required fields.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    // Build database query based on target audience
    const query: any = {
      pushToken: { $exists: true, $type: 'string', $regex: /^Expo/ },
    };

    if (targetAudience === 'user') {
      if (!targetUserId) {
        return NextResponse.json({ message: 'Target User ID, Email, or Phone is required.' }, { status: 400 });
      }
      const trimmedTarget = targetUserId.trim();
      const userOr: any[] = [{ email: trimmedTarget.toLowerCase() }, { mobile: trimmedTarget }];
      if (ObjectId.isValid(trimmedTarget)) {
        userOr.push({ _id: new ObjectId(trimmedTarget) });
      }
      query.$or = userOr;
    } else if (targetAudience === 'segment' && segmentFilter) {
      const { fit, palette, focus } = segmentFilter;
      if (fit && fit !== 'all') {
        query['personalization.fit'] = { $regex: new RegExp(`^${fit}$`, 'i') };
      }
      if (palette && palette !== 'all') {
        query['personalization.palette'] = { $regex: new RegExp(`^${palette}$`, 'i') };
      }
      if (focus && focus !== 'all') {
        query['personalization.focus'] = { $regex: new RegExp(`^${focus}$`, 'i') };
      }
    }

    const targetUsers = await usersCollection.find(query).toArray();

    if (targetUsers.length === 0) {
      return NextResponse.json(
        {
          message: 'No users found matching your selected audience with an active push token.',
          totalFound: 0,
        },
        { status: 404 }
      );
    }

    const messages: ExpoPushMessage[] = targetUsers.map((user) => ({
      to: user.pushToken,
      sound: 'default',
      title: title.trim(),
      body: messageBody.trim(),
      data: {
        ...(deepLink ? { deepLink } : {}),
        ...(imageUrl ? { imageUrl } : {}),
      },
    }));

    // Dispatch batch to Expo Push API
    const dispatchResult = await sendExpoPushNotifications(messages);

    // Save log entry to database
    const logDoc = {
      title,
      body: messageBody,
      targetAudience: targetAudience || 'broadcast',
      targetUserId: targetUserId || null,
      segmentFilter: segmentFilter || null,
      deepLink: deepLink || null,
      imageUrl: imageUrl || null,
      recipientCount: targetUsers.length,
      successfulSent: dispatchResult.totalSent,
      failedCount: dispatchResult.failedCount,
      dispatchedAt: new Date(),
      dispatchedBy: auth.user?.email || 'admin',
    };

    await db.collection('push_notification_logs').insertOne(logDoc);

    return NextResponse.json(
      {
        message: `Push notification dispatched to ${dispatchResult.totalSent} device(s).`,
        recipientCount: targetUsers.length,
        successfulSent: dispatchResult.totalSent,
        failedCount: dispatchResult.failedCount,
        tickets: dispatchResult.tickets,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Failed to dispatch push notification:', error);
    return NextResponse.json({ message: error?.message || 'Internal server error.' }, { status: 500 });
  }
}
