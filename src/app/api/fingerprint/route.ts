import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getClientIp } from '@/lib/rateLimit';
import { resolveIpGeo } from '@/lib/ipGeo';
import { authenticateRequestAsync } from '@/lib/auth';
import { VisitorFingerprintData } from '@/lib/fingerprint';

// 30 minutes session threshold
const SESSION_GAP_MS = 30 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fpData: VisitorFingerprintData = body.fingerprint;
    const pageMeta = body.page || {};
    const userInfo = body.user || null; // If user is logged in

    if (!fpData || !fpData.fingerprintId || !fpData.visitorId) {
      return NextResponse.json({ message: 'Invalid fingerprint payload' }, { status: 400 });
    }

    const clientIp = getClientIp(request);
    const geo = await resolveIpGeo(request, clientIp);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('visitor_fingerprints');

    // Multi-tier visitor resolution
    // Tier 1: Stored visitor ID match (current or known alias)
    let existing = await collection.findOne({
      $or: [
        { visitorId: fpData.visitorId },
        { knownVisitorIds: fpData.visitorId },
      ],
    });

    // Tier 2: Composite fingerprint hash match (current or known alias)
    if (!existing && fpData.fingerprintId) {
      existing = await collection.findOne({
        $or: [
          { fingerprintId: fpData.fingerprintId },
          { knownFingerprintIds: fpData.fingerprintId },
        ],
      });
    }

    // Tier 3: Invariant Hardware + IP Network Match
    // Bridges Safari Private Browsing (localStorage wiped) and Apple canvas/audio noise injection
    if (!existing && clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1') {
      const hwOrConditions: any[] = [];
      if (fpData.hardwareFingerprint) {
        hwOrConditions.push({ hardwareFingerprint: fpData.hardwareFingerprint });
        hwOrConditions.push({ knownHardwareFingerprints: fpData.hardwareFingerprint });
      }
      if (fpData.gpuRenderer && fpData.hardwareConcurrency) {
        hwOrConditions.push({
          'device.os': fpData.deviceOs,
          'device.browser': fpData.browserType,
          'hardware.gpuRenderer': fpData.gpuRenderer,
          'hardware.cpuCores': fpData.hardwareConcurrency,
          'locale.timezone': fpData.timezone,
        });
      }

      if (hwOrConditions.length > 0) {
        existing = await collection.findOne({
          ip: clientIp,
          $or: hwOrConditions,
        });
      }
    } else if (!existing && (clientIp === '127.0.0.1' || clientIp === '::1' || !clientIp)) {
      // Local development fallback: match on stable hardware fingerprint
      if (fpData.hardwareFingerprint) {
        existing = await collection.findOne({
          $or: [
            { hardwareFingerprint: fpData.hardwareFingerprint },
            { knownHardwareFingerprints: fpData.hardwareFingerprint },
          ],
        });
      }
    }

    let visitCount = 1;
    let sessionCount = 1;
    const firstSeenAt = existing ? existing.analytics?.firstSeenAt || existing.firstSeenAt || existing.createdAt || now : now;
    let visitDates: string[] = existing?.analytics?.visitDates || existing?.visitDates || [];

    if (existing) {
      const lastSeen = new Date(existing.analytics?.lastSeenAt || existing.lastSeenAt || existing.updatedAt || 0).getTime();
      const isNewSession = now.getTime() - lastSeen > SESSION_GAP_MS;

      sessionCount = (existing.analytics?.sessionCount || existing.sessionCount || 1) + (isNewSession ? 1 : 0);
      visitCount = (existing.analytics?.visitCount || existing.visitCount || 1) + (isNewSession ? 1 : 0);

      if (!visitDates.includes(todayStr)) {
        visitDates.push(todayStr);
        // Keep last 30 distinct visit days
        if (visitDates.length > 30) visitDates = visitDates.slice(-30);
      }
    } else {
      visitDates = [todayStr];
    }

    // Prepare page history entry
    const pageEntry = {
      path: pageMeta.path || '/',
      title: pageMeta.title || '',
      referrer: pageMeta.referrer || '',
      timestamp: now,
    };

    // Linked user information if authenticated
    const customerInfo = userInfo?.id
      ? {
          userId: userInfo.id,
          email: userInfo.email || '',
          name: `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || userInfo.email || '',
          isRegistered: true,
          linkedAt: existing?.customer?.linkedAt || now,
        }
      : existing?.customer || {
          isRegistered: false,
        };

    const updateDoc: any = {
      $set: {
        visitorId: fpData.visitorId,
        fingerprintId: fpData.fingerprintId,
        ...(fpData.hardwareFingerprint ? { hardwareFingerprint: fpData.hardwareFingerprint } : {}),
        ip: clientIp,
        geo: {
          country: geo.country || existing?.geo?.country || 'Unknown',
          countryCode: geo.countryCode || existing?.geo?.countryCode || '',
          city: geo.city || existing?.geo?.city || 'Unknown',
          region: geo.region || existing?.geo?.region || '',
          postalCode: geo.postalCode || existing?.geo?.postalCode || '',
          latitude: geo.latitude ?? existing?.geo?.latitude,
          longitude: geo.longitude ?? existing?.geo?.longitude,
          isp: geo.isp || existing?.geo?.isp || 'Standard Network',
          carrier: geo.carrier || existing?.geo?.carrier || 'Broadband / Cellular',
          timezone: geo.timezone || fpData.timezone,
        },
        device: {
          os: fpData.deviceOs,
          osVersion: fpData.osVersion || '',
          deviceType: fpData.deviceType,
          platform: fpData.platform,
          browser: fpData.browserType,
          browserVersion: fpData.browserVersion,
          userAgent: fpData.userAgent,
        },
        display: {
          screenWidth: fpData.screenWidth,
          screenHeight: fpData.screenHeight,
          screenAvailWidth: fpData.screenAvailWidth,
          screenAvailHeight: fpData.screenAvailHeight,
          colorDepth: fpData.colorDepth,
          pixelRatio: fpData.pixelRatio,
          colorGamut: fpData.colorGamut,
          prefersColorScheme: fpData.prefersColorScheme,
        },
        hardware: {
          cpuCores: fpData.hardwareConcurrency,
          ramGB: fpData.deviceMemory,
          gpuRenderer: fpData.gpuRenderer,
          gpuVendor: fpData.gpuVendor,
          webglCanvasHash: fpData.webglCanvasHash,
          webglMaxTextureSize: fpData.webglMaxTextureSize,
          audioHash: fpData.audioHash,
          canvas2dHash: fpData.canvas2dHash,
        },
        capabilities: {
          touchPoints: fpData.touchPoints,
          hasTouch: fpData.hasTouch,
          hasAccelerometer: fpData.hasAccelerometer,
          hasGyroscope: fpData.hasGyroscope,
          hasOrientation: fpData.hasOrientation,
          hasAmbientLight: fpData.hasAmbientLight,
          batteryLevel: fpData.batteryLevel,
          batteryCharging: fpData.batteryCharging,
          storageQuotaMB: fpData.storageQuotaMB,
          storageUsageMB: fpData.storageUsageMB,
        },
        network: {
          networkType: fpData.networkType,
          downlink: fpData.downlink,
          rtt: fpData.rtt,
          saveData: fpData.saveData,
        },
        locale: {
          timezone: fpData.timezone,
          timezoneOffset: fpData.timezoneOffset,
          languages: fpData.languages,
          primaryLanguage: fpData.primaryLanguage,
        },
        analytics: {
          visitCount,
          sessionCount,
          firstSeenAt,
          lastSeenAt: now,
          lastPath: pageMeta.path || existing?.analytics?.lastPath || '/',
          visitDates,
        },
        customer: customerInfo,
        updatedAt: now,
      },
      $addToSet: {
        knownVisitorIds: fpData.visitorId,
        knownFingerprintIds: fpData.fingerprintId,
        ...(fpData.hardwareFingerprint ? { knownHardwareFingerprints: fpData.hardwareFingerprint } : {}),
      },
    };

    // If page path is valid, push to pageHistory (capped at 50)
    if (pageMeta.path) {
      updateDoc.$push = {
        pageHistory: {
          $each: [pageEntry],
          $slice: -50,
        },
      };
    }

    if (existing) {
      await collection.updateOne(
        { _id: existing._id },
        updateDoc
      );
    } else {
      updateDoc.$setOnInsert = {
        createdAt: now,
        viewedProducts: [],
      };
      await collection.updateOne(
        { visitorId: fpData.visitorId },
        updateDoc,
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      visitorId: fpData.visitorId,
      fingerprintId: fpData.fingerprintId,
      visitCount,
      sessionCount,
    });
  } catch (error) {
    console.error('Failed to log visitor fingerprint:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// GET all visitor fingerprints with filtering and statistics (Admin Only)
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequestAsync(request, { requiredPermission: 'view_customers', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();
    const filter = searchParams.get('filter') || 'all'; // 'all', 'anonymous', 'repeat', 'converted', 'viewed_products'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '25', 10)));
    const sortBy = searchParams.get('sortBy') || 'last_seen'; // 'last_seen', 'visits', 'products_count'

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('visitor_fingerprints');

    const query: any = {};

    // Filter type
    if (filter === 'anonymous') {
      query['customer.isRegistered'] = { $ne: true };
    } else if (filter === 'converted') {
      query['customer.isRegistered'] = true;
    } else if (filter === 'repeat') {
      query['analytics.visitCount'] = { $gte: 2 };
    } else if (filter === 'viewed_products') {
      query['viewedProducts.0'] = { $exists: true };
    }

    // Search query
    if (search) {
      const regex = { $regex: search, $options: 'i' };
      query.$or = [
        { visitorId: regex },
        { fingerprintId: regex },
        { ip: regex },
        { 'geo.city': regex },
        { 'geo.country': regex },
        { 'geo.isp': regex },
        { 'device.os': regex },
        { 'device.browser': regex },
        { 'customer.name': regex },
        { 'customer.email': regex },
        { 'viewedProducts.title': regex },
      ];
    }

    // Sort options
    let sortObj: any = { 'analytics.lastSeenAt': -1 };
    if (sortBy === 'visits') {
      sortObj = { 'analytics.visitCount': -1, 'analytics.lastSeenAt': -1 };
    } else if (sortBy === 'products_count') {
      sortObj = { 'viewedProducts.length': -1, 'analytics.lastSeenAt': -1 };
    }

    const totalVisitors = await collection.countDocuments(query);
    const visitors = await collection
      .find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Summary KPIs across the collection
    const todayStr = new Date().toISOString().split('T')[0];
    const [overallTotal, repeatCount, convertedCount, activeTodayCount, totalProductViewsAgg] = await Promise.all([
      collection.countDocuments({}),
      collection.countDocuments({ 'analytics.visitCount': { $gte: 2 } }),
      collection.countDocuments({ 'customer.isRegistered': true }),
      collection.countDocuments({ 'analytics.visitDates': todayStr }),
      collection.aggregate([
        { $unwind: '$viewedProducts' },
        { $group: { _id: null, totalViews: { $sum: '$viewedProducts.viewCount' } } },
      ]).toArray(),
    ]);

    const totalProductViews = totalProductViewsAgg[0]?.totalViews || 0;

    return NextResponse.json({
      visitors,
      pagination: {
        total: totalVisitors,
        page,
        limit,
        totalPages: Math.ceil(totalVisitors / limit) || 1,
      },
      stats: {
        totalVisitors: overallTotal,
        repeatVisitors: repeatCount,
        convertedUsers: convertedCount,
        activeToday: activeTodayCount,
        totalProductViews,
      },
    });
  } catch (error) {
    console.error('Failed to retrieve visitors:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

