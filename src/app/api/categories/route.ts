import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { formatCategoryForMobile } from '@/lib/formatCategory';

// GET all categories formatted with square_image_url, landscape_image_url, hero_image_url, description, icon_name, item_count, accent_color, bg_tint, and featured_products
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    let categories = await db.collection('categories').find({}).toArray();

    const formattedCategories = await Promise.all(
      categories.map((cat) => formatCategoryForMobile(cat, db))
    );

    return NextResponse.json(formattedCategories, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

function isValidAnimationUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string' || !url.trim()) return true;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// POST a new category with full dual-image mobile fields and splash animation video
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      square_image_url,
      landscape_image_url,
      imageUrl,
      hero_image_url,
      description,
      icon_name,
      accent_color,
      bg_tint,
      gender,
      colorToken,
      animation_video_url,
      splash_animation_url,
    } = body;

    if (!name) {
      return NextResponse.json({ message: 'Missing required field: name.' }, { status: 400 });
    }

    const rawAnim = (animation_video_url !== undefined ? animation_video_url : splash_animation_url);
    if (rawAnim && !isValidAnimationUrl(rawAnim)) {
      return NextResponse.json(
        { message: 'Invalid animation_video_url. Must be a valid HTTP/HTTPS URL (e.g. Cloudinary, MP4, JSON, WebP, GIF).' },
        { status: 400 }
      );
    }

    const animUrl = rawAnim && typeof rawAnim === 'string' && rawAnim.trim() ? rawAnim.trim() : null;
    const sqImg = square_image_url || imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500';
    const landImg = landscape_image_url || hero_image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000';

    const client = await clientPromise;
    const db = client.db();

    const newCategory = {
      name,
      square_image_url: sqImg,
      landscape_image_url: landImg,
      imageUrl: sqImg,
      hero_image_url: landImg,
      description: description || `Premium ${name} collection for streetwear fits.`,
      icon_name: icon_name || 'shirt',
      accent_color: accent_color || colorToken || '#D4A02E',
      bg_tint: bg_tint || '#FAF6E8',
      gender: gender || 'Unisex',
      colorToken: colorToken || accent_color || '#D4A02E',
      animation_video_url: animUrl,
      splash_animation_url: animUrl,
      createdAt: new Date(),
    };

    const result = await db.collection('categories').insertOne(newCategory);
    return NextResponse.json({ ...newCategory, _id: result.insertedId, id: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
