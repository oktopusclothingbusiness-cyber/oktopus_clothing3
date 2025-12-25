
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // The product ID from the client might be the short version, so we search for it at the end of the ObjectId string.
    // This is less efficient than a direct lookup, but necessary if users only have short IDs.
    // A better long-term solution would be a dedicated, unique short ID field.
    const products = await clientPromise.then(client => client.db().collection('products'));
    
    let product;
    if (ObjectId.isValid(id)) {
        product = await products.findOne({ _id: new ObjectId(id) });
    }

    if (!product) {
       const regex = new RegExp(`${id}$`);
       product = await products.findOne({ _id: { $regex: id } });
    }

    if (!product) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }
    
    // Return only the necessary, public-safe information
    const verifiedProduct = {
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : '',
    };

    return NextResponse.json(verifiedProduct, { status: 200 });

  } catch (error) {
    console.error('Failed to verify product:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
