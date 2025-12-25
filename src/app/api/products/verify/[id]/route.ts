
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const products = await clientPromise.then(client => client.db().collection('products'));
    
    let product;

    // First, try to find by a full, valid ObjectId
    if (ObjectId.isValid(id)) {
        product = await products.findOne({ _id: new ObjectId(id) });
    }

    // If not found by full ID, try to match against the end of the ObjectId string (for short IDs)
    if (!product) {
       // Corrected Regex:
       // This now searches for a document where the string representation of _id ends with the provided id.
       // This works because findOne can also accept a query that will be evaluated on the server.
       // We need to convert _id to string for the regex to work. A simpler way is to query on the string version
       // if we store it, but for now we can do a slower text search.
       // A better way is to use a regex on the string representation.
       const allProducts = await products.find({}).toArray();
       product = allProducts.find(p => p._id.toString().endsWith(id));
    }

    if (!product) {
      // Return a proper JSON response for "Not Found"
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
