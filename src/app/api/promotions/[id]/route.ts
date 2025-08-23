
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// DELETE a promotion by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid promotion ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('promotions').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Promotion not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Promotion deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete promotion:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT (update) a promotion by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid promotion ID.' }, { status: 400 });
        }

        const promotionData = await request.json();
        const { _id, id: promotionId, ...updateData } = promotionData;

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('promotions').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Promotion not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Promotion updated successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Failed to update promotion:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
