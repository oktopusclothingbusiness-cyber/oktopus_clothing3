import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';

// GET single poster
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid poster ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const poster = await db.collection('posters').findOne({ _id: new ObjectId(id) });
    if (!poster) {
      return NextResponse.json({ message: 'Poster not found.' }, { status: 404 });
    }

    return NextResponse.json({ ...poster, id: poster._id.toString() }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch poster:', error);
    return NextResponse.json({ message: 'Failed to fetch poster.' }, { status: 500 });
  }
}

// PUT update poster
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(request, { requiredPermission: 'content:edit', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid poster ID.' }, { status: 400 });
    }

    const data = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const updateFields: any = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updateFields.title = data.title.trim();
    if (data.description !== undefined) updateFields.description = data.description.trim();
    if (data.desktopImageUrl !== undefined) updateFields.desktopImageUrl = data.desktopImageUrl.trim();
    if (data.mobileImageUrl !== undefined) updateFields.mobileImageUrl = data.mobileImageUrl.trim();
    if (data.redirectPath !== undefined) updateFields.redirectPath = data.redirectPath.trim();
    if (data.targetPages !== undefined) updateFields.targetPages = Array.isArray(data.targetPages) ? data.targetPages : ['all'];
    if (data.displayDurationSeconds !== undefined) updateFields.displayDurationSeconds = Number(data.displayDurationSeconds);
    if (data.durationDays !== undefined) updateFields.durationDays = Number(data.durationDays);
    if (data.startDate !== undefined) updateFields.startDate = data.startDate;
    if (data.endDate !== undefined) updateFields.endDate = data.endDate;
    if (data.isActive !== undefined) updateFields.isActive = Boolean(data.isActive);
    if (data.priority !== undefined) updateFields.priority = Number(data.priority);

    // If durationDays changed and no custom endDate was provided, recalculate endDate
    if (data.durationDays && !data.endDate && updateFields.startDate) {
      const start = new Date(updateFields.startDate);
      updateFields.endDate = new Date(start.getTime() + Number(data.durationDays) * 24 * 60 * 60 * 1000).toISOString();
    }

    const result = await db.collection('posters').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Poster not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Poster updated successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to update poster:', error);
    return NextResponse.json({ message: 'Failed to update poster.' }, { status: 500 });
  }
}

// DELETE poster
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(request, { requiredPermission: 'content:edit', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid poster ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('posters').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Poster not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Poster deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete poster:', error);
    return NextResponse.json({ message: 'Failed to delete poster.' }, { status: 500 });
  }
}
