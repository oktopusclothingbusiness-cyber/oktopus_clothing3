
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// DELETE a size chart by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid size chart ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('sizeCharts').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Size chart not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Size chart deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete size chart:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT (update) a size chart by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid size chart ID.' }, { status: 400 });
        }

        const chartData = await request.json();
        const { _id, ...updateData } = chartData;

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('sizeCharts').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Size chart not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Size chart updated successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Failed to update size chart:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}

// GET a single size chart by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid size chart ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const sizeChart = await db.collection('sizeCharts').findOne({ _id: new ObjectId(id) });

    if (!sizeChart) {
      return NextResponse.json({ message: 'Size chart not found.' }, { status: 404 });
    }

    return NextResponse.json(sizeChart, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch size chart:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
