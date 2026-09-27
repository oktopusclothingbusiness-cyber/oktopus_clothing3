
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// POST a new custom design
export async function POST(request: Request) {
  try {
    const { 
      userId, 
      userName, 
      designUrl, 
      mockupUrl,
      placement,
      notes, 
      tshirtColor, 
      tshirtSize, 
      printArea, 
      colorName, 
      viewImageUrl, 
      colorId, 
      selectedView,
      fabricQuality,
      price,
      transform,
    } = await request.json();

    if (!userId || !userName || !designUrl || !tshirtColor || !tshirtSize || !printArea) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const designData = {
      userId,
      userName,
      designUrl, // This is a base64 data URI of the raw user-uploaded graphic file
      mockupUrl: mockupUrl || null, // Rendered snapshot of the design placed on the exact tshirt
      placement: placement || transform || null, // Coordinates: xPercent, yPercent, widthPercent, heightPercent, rotation
      tshirtColor, // Primary or selected view image URL
      colorName: colorName || '',
      viewImageUrl: viewImageUrl || tshirtColor,
      colorId: colorId || '',
      selectedView: selectedView || 'Front',
      tshirtSize,
      fabricQuality: fabricQuality || 'Regular',
      price: price || 499,
      printArea,
      transform: transform || placement || null,
      notes: notes || '',
      status: 'pending', // Initial status: pending, approved, rejected
      createdAt: new Date(),
    };

    const result = await db.collection('customDesigns').insertOne(designData);

    return NextResponse.json({ message: 'Design submitted successfully', designId: result.insertedId }, { status: 201 });

  } catch (error) {
    console.error('Failed to submit custom design:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// GET all custom designs (for admin)
export async function GET(request: Request) {
  try {
    // In a real app, you'd protect this endpoint to ensure only admins can access it.
    const client = await clientPromise;
    const db = client.db();
    const designs = await db.collection('customDesigns').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(designs, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch custom designs:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
