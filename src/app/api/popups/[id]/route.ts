
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// DELETE a popup by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid popup ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('popups').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Popup not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Popup deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete popup:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT (update) a popup by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid popup ID.' }, { status: 400 });
        }

        const popupData = await request.json();
        const { _id, id: popupId, ...updateData } = popupData;

        const client = await clientPromise;
        const db = client.db();
        
        // If this popup is being activated, ensure no other popups are active.
        if (updateData.isActive) {
            await db.collection('popups').updateMany({ _id: { $ne: new ObjectId(id) } }, { $set: { isActive: false } });
        }

        const result = await db.collection('popups').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Popup not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Popup updated successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Failed to update popup:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
