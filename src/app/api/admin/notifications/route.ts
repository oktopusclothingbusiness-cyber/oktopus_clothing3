import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';

export type NotificationItem = {
  id: string;
  category: 'inventory' | 'image' | 'performance' | 'orders';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  productId?: string;
  orderId?: string;
  imageUrl?: string;
  actionType: 'RESTOCK' | 'EDIT_PRODUCT' | 'VIEW_ORDERS' | 'CUSTOM';
  actionText: string;
  actionUrl?: string;
  timestamp: string;
};

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const notifications: NotificationItem[] = [];
    const now = new Date().toISOString();

    // 1. Scan Products Collection
    const products = await db.collection('products').find({}).toArray();

    for (const p of products) {
      const productId = p._id.toString();
      const pName = p.name || 'Unnamed Product';
      const stock = typeof p.stock === 'number' ? p.stock : 0;
      const imageUrls: string[] = Array.isArray(p.imageUrls) ? p.imageUrls : [];
      const rawFirstImage = (imageUrls.length > 0 ? imageUrls[0] : '').trim();
      let firstImage = '';
      if (rawFirstImage.startsWith('http://') || rawFirstImage.startsWith('https://') || rawFirstImage.startsWith('/')) {
        firstImage = rawFirstImage;
      } else if (rawFirstImage.startsWith('www.')) {
        firstImage = `https://${rawFirstImage}`;
      }

      // A. Out of Stock Alert
      if (stock === 0) {
        notifications.push({
          id: `out-of-stock-${productId}`,
          category: 'inventory',
          severity: 'critical',
          title: `Out of Stock: ${pName}`,
          description: `Product stock is 0. Customers cannot place orders for this item.`,
          productId,
          imageUrl: firstImage,
          actionType: 'RESTOCK',
          actionText: 'Restock (+50)',
          timestamp: now,
        });
      }
      // B. Low Stock Alert (< 10)
      else if (stock < 10) {
        notifications.push({
          id: `low-stock-${productId}`,
          category: 'inventory',
          severity: 'warning',
          title: `Low Stock Alert: ${pName}`,
          description: `Only ${stock} unit(s) remaining in stock. Consider restocking soon.`,
          productId,
          imageUrl: firstImage,
          actionType: 'RESTOCK',
          actionText: 'Restock (+50)',
          timestamp: now,
        });
      }

      // C. Broken / Missing Image Alert
      const hasMissingImages =
        imageUrls.length === 0 ||
        imageUrls.some(
          (url) => !url || typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/'))
        );

      if (hasMissingImages) {
        notifications.push({
          id: `broken-img-${productId}`,
          category: 'image',
          severity: 'critical',
          title: `Broken Image URL: ${pName}`,
          description: `Product image URL is missing, invalid, or broken.`,
          productId,
          imageUrl: firstImage,
          actionType: 'EDIT_PRODUCT',
          actionText: 'Fix Image URL',
          timestamp: now,
        });
      }

      // D. Slow / Heavy Image Resource Alert (placeholders, unoptimized URLs)
      const isSlowImage = imageUrls.some(
        (url) => url.includes('placehold.co') || url.includes('ezgif.com') || url.includes('dummyimage.com')
      );

      if (isSlowImage) {
        notifications.push({
          id: `slow-img-${productId}`,
          category: 'performance',
          severity: 'warning',
          title: `Slow Image Resource: ${pName}`,
          description: `Using placeholder or uncompressed image host. This slows down page load on mobile devices.`,
          productId,
          imageUrl: firstImage,
          actionType: 'EDIT_PRODUCT',
          actionText: 'Update Image Host',
          timestamp: now,
        });
      }

      // E. Missing Category Assignment Alert
      if (!p.category || (Array.isArray(p.category) && p.category.length === 0)) {
        notifications.push({
          id: `no-cat-${productId}`,
          category: 'performance',
          severity: 'info',
          title: `Uncategorized Product: ${pName}`,
          description: `Product is not assigned to any category. It will not show up in category pages.`,
          productId,
          imageUrl: firstImage,
          actionType: 'EDIT_PRODUCT',
          actionText: 'Assign Category',
          timestamp: now,
        });
      }
    }

    // 2. Scan Orders Collection
    const pendingOrdersCount = await db.collection('orders').countDocuments({ status: 'pending' });
    if (pendingOrdersCount > 0) {
      notifications.push({
        id: 'pending-orders-alert',
        category: 'orders',
        severity: pendingOrdersCount > 5 ? 'critical' : 'warning',
        title: `${pendingOrdersCount} Pending Order(s) Awaiting Processing`,
        description: `Customer orders are pending fulfillment. Accept and ship orders promptly.`,
        actionType: 'VIEW_ORDERS',
        actionText: 'View Orders',
        actionUrl: '/admin/orders',
        timestamp: now,
      });
    }

    // Sort by Critical first, then Warning, then Info
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    notifications.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return NextResponse.json(
      {
        success: true,
        totalAlerts: notifications.length,
        criticalCount: notifications.filter((n) => n.severity === 'critical').length,
        warningCount: notifications.filter((n) => n.severity === 'warning').length,
        notifications,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Failed to generate admin notifications:', error);
    return NextResponse.json({ message: error?.message || 'Internal server error.' }, { status: 500 });
  }
}
