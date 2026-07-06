
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET the current settings
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // There should only ever be one settings document.
    const settings = await db.collection('settings').findOne({ _id: 'global' as any });
    
    return NextResponse.json(settings || {}, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST (create or update) settings
export async function POST(request: Request) {
  try {
    const settingsData = await request.json();
    
    const client = await clientPromise;
    const db = client.db();

    // Use upsert to create the document if it doesn't exist, or update it if it does.
    const result = await db.collection('settings').updateOne(
        { _id: 'global' as any }, // Use a fixed ID to ensure only one settings document exists
        { $set: settingsData },
        { upsert: true }
    );

    return NextResponse.json({ message: 'Settings saved successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
