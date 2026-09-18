import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface ExpoPushMessage {
  to: string;
  sound?: 'default' | null;
  title: string;
  body: string;
  data?: Record<string, any>;
  ttl?: number;
  expiration?: number;
  priority?: 'default' | 'normal' | 'high';
  badge?: number;
  channelId?: string;
  categoryId?: string;
  attachments?: Array<{ url: string }>;
}

export interface PushDispatchResult {
  success: boolean;
  totalSent: number;
  failedCount: number;
  tickets?: any[];
  error?: string;
}

/**
 * Send push notifications in batches of 100 via Expo Push API
 */
export async function sendExpoPushNotifications(messages: ExpoPushMessage[]): Promise<PushDispatchResult> {
  if (!messages || messages.length === 0) {
    return { success: true, totalSent: 0, failedCount: 0, tickets: [] };
  }

  // Filter valid Expo push tokens
  const validMessages = messages.filter(
    (msg) => typeof msg.to === 'string' && (msg.to.startsWith('ExponentPushToken[') || msg.to.startsWith('ExpoPushToken['))
  );

  if (validMessages.length === 0) {
    return {
      success: false,
      totalSent: 0,
      failedCount: messages.length,
      error: 'No valid Expo push tokens provided.',
    };
  }

  // Batching into chunks of 100 as per Expo guidelines
  const BATCH_SIZE = 100;
  const batches: ExpoPushMessage[][] = [];
  for (let i = 0; i < validMessages.length; i += BATCH_SIZE) {
    batches.push(validMessages.slice(i, i + BATCH_SIZE));
  }

  let totalSent = 0;
  let failedCount = 0;
  const allTickets: any[] = [];

  for (const batch of batches) {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(batch),
      });

      const resData = await response.json();

      if (response.ok && resData.data) {
        const tickets = Array.isArray(resData.data) ? resData.data : [resData.data];
        allTickets.push(...tickets);
        for (const ticket of tickets) {
          if (ticket.status === 'ok') {
            totalSent++;
          } else {
            failedCount++;
          }
        }
      } else {
        console.error('Expo Push API Error Response:', resData);
        failedCount += batch.length;
      }
    } catch (err) {
      console.error('Failed to dispatch batch to Expo Push API:', err);
      failedCount += batch.length;
    }
  }

  return {
    success: totalSent > 0,
    totalSent,
    failedCount,
    tickets: allTickets,
  };
}

/**
 * Trigger an automated push notification for a specific user ID or email
 */
export async function triggerUserEventPushNotification(params: {
  userId?: string;
  email?: string;
  title: string;
  body: string;
  deepLink?: string;
  imageUrl?: string;
  extraData?: Record<string, any>;
}): Promise<boolean> {
  try {
    const { userId, email, title, body, deepLink, imageUrl, extraData } = params;

    if (!userId && !email) return false;

    const client = await clientPromise;
    const db = client.db();
    const query: any = {};

    if (userId && ObjectId.isValid(userId)) {
      query._id = new ObjectId(userId);
    } else if (email) {
      query.email = email.toLowerCase().trim();
    } else if (userId) {
      query.userId = userId;
    }

    const user = await db.collection('users').findOne(query);

    if (!user || !user.pushToken) {
      return false;
    }

    const token = user.pushToken.trim();
    if (!token.startsWith('ExponentPushToken[') && !token.startsWith('ExpoPushToken[')) {
      return false;
    }

    const message: ExpoPushMessage = {
      to: token,
      sound: 'default',
      priority: 'high',
      channelId: 'high_importance',
      title,
      body,
      ...(imageUrl ? { attachments: [{ url: imageUrl }] } : {}),
      data: {
        ...(deepLink ? { url: deepLink, deepLink } : {}),
        ...(imageUrl ? { image: imageUrl, imageUrl } : {}),
        ...(extraData || {}),
      },
    };

    const result = await sendExpoPushNotifications([message]);
    return result.totalSent > 0;
  } catch (error) {
    console.error('Error triggering user event push notification:', error);
    return false;
  }
}
