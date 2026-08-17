import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { validateNextMobileHeaders } from '@/lib/mobileSecurityNext';
import { formatCategoryForMobile } from '@/lib/formatCategory';

export async function GET(request: NextRequest) {
  try {
    const headerCheck = await validateNextMobileHeaders(request);
    if (!headerCheck.valid) return headerCheck.response!;

    const client = await clientPromise;
    const db = client.db();

    const categories = await db.collection('categories').find({}).toArray();
    const formattedCategories = await Promise.all(
      categories.map((cat) => formatCategoryForMobile(cat, db))
    );

    return NextResponse.json(formattedCategories, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch v1 mobile categories:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
