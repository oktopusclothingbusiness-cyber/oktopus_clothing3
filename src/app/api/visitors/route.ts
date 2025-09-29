
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { subDays } from 'date-fns';

// POST to log a visitor
export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    await db.collection('visitors').updateOne(
      { _id: today },
      { $inc: { count: 1 } },
      { upsert: true }
    );

    return NextResponse.json({ message: 'Visitor logged.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to log visitor:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// GET to retrieve visitor counts for the last 7 days
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), i);
      return d.toISOString().split('T')[0];
    });

    const visitors = await db.collection('visitors').find({
      _id: { $in: last7Days }
    }).toArray();

    return NextResponse.json(visitors, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch visitors:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
