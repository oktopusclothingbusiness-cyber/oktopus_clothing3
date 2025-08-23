
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid product ID.' }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();
        const productsCollection = db.collection('products');

        // Unset any existing hero product
        await productsCollection.updateMany(
            { isHero: true },
            { $set: { isHero: false } }
        );

        // Set the new hero product
        const result = await productsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { isHero: true } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Hero product set successfully.' }, { status: 200 });

    } catch (error) {
        console.error('Failed to set hero product:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
