import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET all posters or filter active for current page
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const page = searchParams.get('page');

    const query: any = {};
    if (activeOnly) {
      query.isActive = true;
    }

    const posters = await db.collection('posters')
      .find(query)
      .sort({ priority: 1, createdAt: -1 })
      .toArray();

    const now = new Date();

    // If activeOnly is requested, filter by valid date window and target pages
    let filtered = posters.map((p: any) => ({
      ...p,
      id: p._id.toString(),
    }));

    if (activeOnly) {
      filtered = filtered.filter((poster: any) => {
        // Date window check
        if (poster.startDate) {
          const start = new Date(poster.startDate);
          if (now < start) return false;
        }
        if (poster.endDate) {
          const end = new Date(poster.endDate);
          if (now > end) return false;
        }

        // Target page check
        if (page) {
          const targets: string[] = Array.isArray(poster.targetPages) ? poster.targetPages : ['all'];
          if (targets.includes('all')) return true;

          // Check direct path or path match
          const normalizedPage = page.toLowerCase();
          const matches = targets.some((target) => {
            const normalizedTarget = target.trim().toLowerCase();
            if (normalizedTarget === 'all') return true;
            if (normalizedTarget === normalizedPage) return true;
            // Support wildcards e.g. /store/*
            if (normalizedTarget.endsWith('*')) {
              const prefix = normalizedTarget.slice(0, -1);
              return normalizedPage.startsWith(prefix);
            }
            return false;
          });

          if (!matches) return false;
        }

        return true;
      });
    }

    return NextResponse.json(filtered, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch posters:', error);
    return NextResponse.json({ message: 'Failed to fetch posters.' }, { status: 500 });
  }
}

// POST create a new poster
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.title || !data.desktopImageUrl) {
      return NextResponse.json(
        { message: 'Title and desktop poster image URL are required.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Calculate dates if durationDays is specified
    const startDate = data.startDate ? new Date(data.startDate) : new Date();
    let endDate = data.endDate ? new Date(data.endDate) : null;

    if (!endDate && data.durationDays && Number(data.durationDays) > 0) {
      endDate = new Date(startDate.getTime() + Number(data.durationDays) * 24 * 60 * 60 * 1000);
    }

    const newPoster = {
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      desktopImageUrl: data.desktopImageUrl.trim(),
      mobileImageUrl: data.mobileImageUrl ? data.mobileImageUrl.trim() : data.desktopImageUrl.trim(),
      redirectPath: data.redirectPath ? data.redirectPath.trim() : '',
      targetPages: Array.isArray(data.targetPages) && data.targetPages.length > 0 ? data.targetPages : ['all'],
      displayDurationSeconds: Number(data.displayDurationSeconds) >= 0 ? Number(data.displayDurationSeconds) : 8,
      durationDays: Number(data.durationDays) >= 0 ? Number(data.durationDays) : 7,
      startDate: startDate.toISOString(),
      endDate: endDate ? endDate.toISOString() : null,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      priority: Number(data.priority) || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('posters').insertOne(newPoster);

    return NextResponse.json(
      { ...newPoster, id: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create poster:', error);
    return NextResponse.json({ message: 'Failed to create poster.' }, { status: 500 });
  }
}
