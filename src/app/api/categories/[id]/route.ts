
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// DELETE a category by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid category ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('categories').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Category deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete category:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT (update) a category by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid category ID.' }, { status: 400 });
        }

        const categoryData = await request.json();
        const { _id, id: categoryId, ...updateData } = categoryData;

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('categories').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Category updated successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Failed to update category:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
