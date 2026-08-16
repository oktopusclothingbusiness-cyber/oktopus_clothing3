import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { validateNextMobileHeaders, authenticateNextMobileRequest } from '@/lib/mobileSecurityNext';

export async function GET(request: NextRequest) {
  try {
    const headerCheck = await validateNextMobileHeaders(request);
    if (!headerCheck.valid) return headerCheck.response!;

    const authCheck = await authenticateNextMobileRequest(request);
    if (!authCheck.authenticated) return authCheck.response!;

    const client = await clientPromise;
    const db = client.db();

    let balance = 100;
    let history: any[] = [];

    if (authCheck.user && authCheck.user.userId) {
      try {
        const user = await db.collection('users').findOne({ _id: new ObjectId(authCheck.user.userId) });
        if (user) {
          balance = user.oktocoins ?? 100;
          history = user.coinHistory || [
            {
              id: 'tx_welcome_100',
              type: 'CREDIT',
              description: 'Welcome Mobile Registration Bonus',
              amount: 100,
              createdAt: user.createdAt || new Date(),
            },
          ];
        }
      } catch (e) {
        // Fallback
      }
    }

    let vouchers: any[] = [];
    try {
      vouchers = await db.collection('rewards').find({ active: { $ne: false } }).limit(10).toArray();
      if (!vouchers || vouchers.length === 0) {
        vouchers = [
          { id: 'v_100_off', title: '₹100 OFF Voucher', coinCost: 100, code: 'OKTO100' },
          { id: 'v_200_off', title: '₹200 OFF Voucher', coinCost: 200, code: 'OKTO200' },
        ];
      }
    } catch (e) {
      vouchers = [
        { id: 'v_100_off', title: '₹100 OFF Voucher', coinCost: 100, code: 'OKTO100' },
      ];
    }

    return NextResponse.json(
      {
        balance,
        history,
        vouchers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Rewards Balance Error:', error);
    return NextResponse.json({ message: 'Failed to retrieve rewards balance.' }, { status: 500 });
  }
}
