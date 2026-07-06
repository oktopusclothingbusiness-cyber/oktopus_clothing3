import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// DELETE a reward by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid reward ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('rewards').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Reward not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Reward deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete reward:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT (update) a reward by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid reward ID.' }, { status: 400 });
        }

        const rewardData = await request.json();
        const { _id, id: rewardId, ...updateData } = rewardData;

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('rewards').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Reward not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Reward updated successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Failed to update reward:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
