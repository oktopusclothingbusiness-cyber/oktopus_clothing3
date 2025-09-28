
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// DELETE a trend by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid trend ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('trends').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Trend not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Trend deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete trend:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT (update) a trend by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid trend ID.' }, { status: 400 });
        }

        const trendData = await request.json();
        const { _id, id: trendId, ...updateData } = trendData;

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('trends').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Trend not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Trend updated successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Failed to update trend:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
