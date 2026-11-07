import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pincode, visitorId, fingerprintId } = body;

    const cleanPincode = String(pincode || '').trim().replace(/\D/g, '');

    if (cleanPincode.length !== 6) {
      return NextResponse.json(
        { message: 'Please enter a valid 6-digit Indian PIN code.' },
        { status: 400 }
      );
    }

    let city = 'India';
    let state = '';
    let district = '';

    // Check India Post API with timeout
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPincode}`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'OktopusClothing-Delivery/1.0' },
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          district = po.District || '';
          state = po.State || '';
          city = po.Block && po.Block !== 'NA' ? po.Block : district || state;
        }
      }
    } catch {
      // fallback gracefully
    }

    // Update visitor profile if visitorId or fingerprintId provided
    if (visitorId || fingerprintId) {
      try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('visitor_fingerprints');

        const query = {
          $or: [
            ...(visitorId ? [{ visitorId }, { knownVisitorIds: visitorId }] : []),
            ...(fingerprintId ? [{ fingerprintId }, { knownFingerprintIds: fingerprintId }] : []),
          ],
        };

        await collection.updateOne(query, {
          $set: {
            'geo.postalCode': cleanPincode,
            'geo.city': city,
            'geo.region': state,
            'geo.district': district,
            'analytics.lastSeenAt': new Date(),
            updatedAt: new Date(),
          },
        });
      } catch (dbErr) {
        console.error('Failed to update visitor delivery location:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      pincode: cleanPincode,
      city,
      district,
      state,
      deliveryDays: 3,
      isDeliverable: true,
      freeDeliveryAbove: 999,
    });
  } catch (error) {
    console.error('Pincode check error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

