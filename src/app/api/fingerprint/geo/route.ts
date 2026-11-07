import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitorId, fingerprintId, coords } = body;

    if ((!visitorId && !fingerprintId) || !coords?.latitude || !coords?.longitude) {
      return NextResponse.json({ message: 'Invalid payload: missing visitor identifier or coordinates' }, { status: 400 });
    }

    const lat = Number(coords.latitude);
    const lon = Number(coords.longitude);
    const accuracy = typeof coords.accuracyMeters === 'number' ? Number(coords.accuracyMeters) : undefined;
    let streetAddress = coords.streetAddress || '';

    // If street address not provided by client, reverse geocode server-side
    if (!streetAddress) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
          {
            signal: controller.signal,
            headers: { 'User-Agent': 'OktopusClothing-ReverseGeo/1.0' },
          }
        );
        clearTimeout(timeout);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          streetAddress = geoData.display_name || '';
        }
      } catch {
        // fail gracefully
      }
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('visitor_fingerprints');
    const now = new Date();

    const query = {
      $or: [
        ...(visitorId ? [{ visitorId }, { knownVisitorIds: visitorId }] : []),
        ...(fingerprintId ? [{ fingerprintId }, { knownFingerprintIds: fingerprintId }] : []),
      ],
    };

    const updateDoc = {
      $set: {
        pinpointGeo: {
          latitude: lat,
          longitude: lon,
          accuracyMeters: accuracy,
          streetAddress,
          source: 'gps',
          capturedAt: now,
        },
        'analytics.lastSeenAt': now,
        updatedAt: now,
      },
    };

    await collection.updateOne(query, updateDoc);

    return NextResponse.json({
      success: true,
      streetAddress,
      latitude: lat,
      longitude: lon,
    });
  } catch (error) {
    console.error('Failed to update pinpoint geo:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
