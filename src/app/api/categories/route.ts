import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { formatCategoryForMobile } from '@/lib/formatCategory';

// GET all categories formatted with hero_image_url, description, icon_name, item_count, accent_color, bg_tint, and featured_products
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    let categories = await db.collection('categories').find({}).toArray();

    // Seed default categories if empty
    if (categories.length === 0) {
      const defaultCats = [
        {
          name: 'French Terry',
          description: 'Premium 400 GSM heavy loopback cotton engineered for relaxed streetwear fits.',
          hero_image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
          imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500',
          icon_name: 'shirt',
          accent_color: '#D4A02E',
          bg_tint: '#FAF6E8',
          item_count: 14,
          createdAt: new Date(),
        },
        {
          name: 'Oversized Tees',
          description: 'Heavyweight boxy cut cotton tees crafted for maximum comfort and streetwear styling.',
          hero_image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
          imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
          icon_name: 'square',
          accent_color: '#A1CF6B',
          bg_tint: '#F3FDF0',
          item_count: 18,
          createdAt: new Date(),
        },
        {
          name: 'Sweatshirts',
          description: 'Cozy fleece-lined streetwear crewnecks built for everyday layering.',
          hero_image_url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80',
          imageUrl: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500',
          icon_name: 'layers',
          accent_color: '#FF5E7E',
          bg_tint: '#FFF0F3',
          item_count: 10,
          createdAt: new Date(),
        },
        {
          name: 'Hoodies',
          description: 'Heavyweight pullover hoodies with double-lined hood and drop shoulders.',
          hero_image_url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80',
          imageUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=500',
          icon_name: 'zap',
          accent_color: '#3B82F6',
          bg_tint: '#EFF6FF',
          item_count: 12,
          createdAt: new Date(),
        },
      ];
      await db.collection('categories').insertMany(defaultCats);
      categories = await db.collection('categories').find({}).toArray();
    }

    const formattedCategories = await Promise.all(
      categories.map((cat) => formatCategoryForMobile(cat, db))
    );

    return NextResponse.json(formattedCategories, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST a new category with full mobile-rich fields
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, imageUrl, hero_image_url, description, icon_name, accent_color, bg_tint, gender, colorToken } = body;

    if (!name) {
      return NextResponse.json({ message: 'Missing required field: name.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const newCategory = {
      name,
      imageUrl: imageUrl || hero_image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
      hero_image_url: hero_image_url || imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
      description: description || `Premium ${name} collection for streetwear fits.`,
      icon_name: icon_name || 'shirt',
      accent_color: accent_color || colorToken || '#D4A02E',
      bg_tint: bg_tint || '#FAF6E8',
      gender: gender || 'Unisex',
      colorToken: colorToken || accent_color || '#D4A02E',
      createdAt: new Date(),
    };

    const result = await db.collection('categories').insertOne(newCategory);
    return NextResponse.json({ ...newCategory, _id: result.insertedId, id: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
