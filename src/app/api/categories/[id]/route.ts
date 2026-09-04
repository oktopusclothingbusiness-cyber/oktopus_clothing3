
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

import { formatCategoryForMobile } from '@/lib/formatCategory';

function isValidAnimationUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string' || !url.trim()) return true;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// GET a category by ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db();

    let query: any = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { id }] };
    }

    const category = await db.collection('categories').findOne(query);

    if (!category) {
      return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
    }

    const formattedCategory = await formatCategoryForMobile(category, db);
    return NextResponse.json(formattedCategory, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch category by ID:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// DELETE a category by ID
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid category ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('categories').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
    }

    // Also, pull this categoryId from any size charts that use it
    await db.collection('sizeCharts').updateMany(
        { categoryIds: id },
        { $pull: { categoryIds: id } } as any
    );

    return NextResponse.json({ message: 'Category deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete category:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT (update) a category by ID
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid category ID.' }, { status: 400 });
        }

        const categoryData = await request.json();
        const { _id, id: categoryId, ...updateData } = categoryData;

        // Validate animation_video_url / splash_animation_url if provided
        if (updateData.animation_video_url !== undefined || updateData.splash_animation_url !== undefined) {
          const rawAnim = updateData.animation_video_url !== undefined ? updateData.animation_video_url : updateData.splash_animation_url;
          if (rawAnim && !isValidAnimationUrl(rawAnim)) {
            return NextResponse.json(
              { message: 'Invalid animation_video_url. Must be a valid HTTP/HTTPS URL (e.g. Cloudinary, MP4, JSON, WebP, GIF).' },
              { status: 400 }
            );
          }
          const animUrl = rawAnim && typeof rawAnim === 'string' && rawAnim.trim() ? rawAnim.trim() : null;
          updateData.animation_video_url = animUrl;
          updateData.splash_animation_url = animUrl;
        }

        updateData.updatedAt = new Date();
        
        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('categories').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
        }

        const updatedCategoryDoc = await db.collection('categories').findOne({ _id: new ObjectId(id) });
        const formatted = updatedCategoryDoc ? await formatCategoryForMobile(updatedCategoryDoc, db) : null;

        return NextResponse.json({
          message: 'Category updated successfully.',
          category: formatted,
          ...formatted,
        }, { status: 200 });
    } catch (error) {
        console.error('Failed to update category:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
