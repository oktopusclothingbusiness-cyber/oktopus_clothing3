
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// DELETE a custom design request by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid design ID.' }, { status: 400 });
    }

    // In a real app, you would add authentication to ensure only admins can do this.
    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('customDesigns').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Design not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Design request deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete design request:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT (update) a custom design status by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid design ID.' }, { status: 400 });
        }

        const { status, price } = await request.json();
        
        // In a real app, you would add authentication to ensure only admins can do this.

        const validStatuses = ['pending', 'approved', 'rejected', 'paid'];
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json({ message: 'Invalid status provided.' }, { status: 400 });
        }
        
        const updateData: { status: string, price?: number } = { status };
        if (status === 'approved' && price) {
            updateData.price = price;
        }

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('customDesigns').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Design not found.' }, { status: 404 });
        }

        // TODO: Send email notification to user about status update
        
        return NextResponse.json({ message: 'Design status updated successfully.' }, { status: 200 });

    } catch (error) {
        console.error('Failed to update design status:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}

    