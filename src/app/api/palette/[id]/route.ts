
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// PUT (update) a color by ID
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid color ID.' }, { status: 400 });
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.name) updateData.name = String(body.name).trim();

    let images: string[] | undefined = undefined;
    if (Array.isArray(body.images)) {
      images = body.images.map((s: any) => String(s).trim()).filter(Boolean);
      updateData.images = images;
    }

    if (body.imageUrl) {
      updateData.imageUrl = String(body.imageUrl).trim();
    } else if (images && images.length > 0) {
      updateData.imageUrl = images[0];
    }

    updateData.updatedAt = new Date();

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('colors').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Color not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Color updated successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to update color:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// DELETE a color by ID
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid color ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('colors').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Color not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Color deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete color:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
