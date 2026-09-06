import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Fetch shipping settings from database
    const settings = await db.collection('settings').findOne({ _id: 'global' as any });

    const standardDeliveryCharge = typeof settings?.deliveryCharge === 'number'
      ? Number(settings.deliveryCharge)
      : 100;

    const freeDeliveryThreshold = typeof settings?.freeDeliveryThreshold === 'number'
      ? Number(settings.freeDeliveryThreshold)
      : 999;

    const estimatedDeliveryDays = typeof settings?.estimatedDeliveryDays === 'number'
      ? Number(settings.estimatedDeliveryDays)
      : 10;

    const currency = settings?.currency || 'INR';

    // Optional dynamic cart calculation via query param ?subtotal=...
    const { searchParams } = new URL(request.url);
    const subtotalParam = searchParams.get('subtotal') || searchParams.get('cartTotal');

    if (subtotalParam !== null) {
      const subtotal = Math.max(0, parseFloat(subtotalParam) || 0);
      const isFreeDelivery = freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold;
      const deliveryCharge = isFreeDelivery ? 0 : standardDeliveryCharge;
      const amountNeededForFreeDelivery = isFreeDelivery
        ? 0
        : Math.max(0, freeDeliveryThreshold - subtotal);

      return NextResponse.json(
        {
          success: true,
          deliveryCharge,
          freeDeliveryThreshold,
          estimatedDeliveryDays,
          currency,
          standardDeliveryCharge,
          isFreeDelivery,
          amountNeededForFreeDelivery,
        },
        { status: 200 }
      );
    }

    // Default response strictly matching requested format
    return NextResponse.json(
      {
        success: true,
        deliveryCharge: standardDeliveryCharge,
        freeDeliveryThreshold,
        estimatedDeliveryDays,
        currency,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Failed to fetch shipping settings:', error);
    // Graceful fallback to default values
    return NextResponse.json(
      {
        success: true,
        deliveryCharge: 100,
        freeDeliveryThreshold: 999,
        estimatedDeliveryDays: 10,
        currency: 'INR',
      },
      { status: 200 }
    );
  }
}
