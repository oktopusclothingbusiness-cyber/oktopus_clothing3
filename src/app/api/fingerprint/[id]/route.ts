import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authenticateRequestAsync } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequestAsync(request, { requiredPermission: 'view_customers' });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'Missing visitor ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const query: any = {
      $or: [
        { visitorId: id },
        { fingerprintId: id },
      ],
    };

    if (ObjectId.isValid(id)) {
      query.$or.push({ _id: new ObjectId(id) });
    }

    const visitor = await db.collection('visitor_fingerprints').findOne(query);

    if (!visitor) {
      return NextResponse.json({ message: 'Visitor record not found' }, { status: 404 });
    }

    return NextResponse.json(visitor);
  } catch (error) {
    console.error('Failed to get visitor details:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequestAsync(request, { requiredPermission: 'delete_data' });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = await params;
    const client = await clientPromise;
    const db = client.db();

    const query: any = {
      $or: [
        { visitorId: id },
        { fingerprintId: id },
      ],
    };

    if (ObjectId.isValid(id)) {
      query.$or.push({ _id: new ObjectId(id) });
    }

    const result = await db.collection('visitor_fingerprints').deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Visitor not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Visitor record deleted successfully' });
  } catch (error) {
    console.error('Failed to delete visitor:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

