
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// DELETE a user by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid user ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT (update) a user by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid user ID.' }, { status: 400 });
        }

        const body = await request.json();
        const { role, firstName, lastName } = body;
        
        const updateData: { [key: string]: any } = {};

        if (role) {
            if (!['user', 'admin'].includes(role)) {
               return NextResponse.json({ message: 'Invalid role specified.' }, { status: 400 });
            }
            updateData.role = role;
        }

        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: 'No update fields provided.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('users').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }
        
        const { password, ...userWithoutPassword } = result;

        return NextResponse.json({ message: 'User updated successfully.', user: userWithoutPassword }, { status: 200 });
    } catch (error) {
        console.error('Failed to update user:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
