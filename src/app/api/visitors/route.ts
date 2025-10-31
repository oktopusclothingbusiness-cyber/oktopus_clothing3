
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { subDays } from 'date-fns';

// POST to log a visitor
export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const currentHour = new Date().getUTCHours(); // Get hour in UTC

    await db.collection('visitors').updateOne(
      { _id: today },
      { 
        $inc: { 
          count: 1,
          [`hourlyCounts.${currentHour}`]: 1
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ message: 'Visitor logged.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to log visitor:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// GET to retrieve visitor counts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');

    const client = await clientPromise;
    const db = client.db();
    
    let query = {};
    if (period !== 'all') {
        // Default to last 7 days if no specific valid period is given
        const days = period === '30' ? 30 : 7;
        const dateLimit = subDays(new Date(), days);
        const dateStrings = Array.from({ length: days }, (_, i) => {
            const d = subDays(new Date(), i);
            return d.toISOString().split('T')[0];
        });
        query = { _id: { $in: dateStrings }};
    }

    const visitors = await db.collection('visitors').find(query).sort({ _id: 1 }).toArray();

    return NextResponse.json(visitors, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch visitors:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
