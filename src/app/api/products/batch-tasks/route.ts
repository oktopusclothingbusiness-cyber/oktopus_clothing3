import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, { requiredRole: 'admin', allowAppSecret: true });
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    const body = await request.json();
    const { action, mode, filter, payload } = body;

    if (!action || !mode || !filter) {
      return NextResponse.json({ message: 'Missing required parameters: action, mode, filter.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Construct MongoDB filter query
    const query: any = {};

    if (!filter.allProducts) {
      const conditions: any[] = [];

      if (typeof filter.targetPrice === 'number' && !isNaN(filter.targetPrice)) {
        conditions.push({ price: filter.targetPrice });
      }

      if (typeof filter.priceMin === 'number' || typeof filter.priceMax === 'number') {
        const priceCond: any = {};
        if (typeof filter.priceMin === 'number' && !isNaN(filter.priceMin)) priceCond.$gte = filter.priceMin;
        if (typeof filter.priceMax === 'number' && !isNaN(filter.priceMax)) priceCond.$lte = filter.priceMax;
        conditions.push({ price: priceCond });
      }

      if (Array.isArray(filter.categories) && filter.categories.length > 0) {
        conditions.push({ category: { $in: filter.categories } });
      }

      if (filter.searchQuery && typeof filter.searchQuery === 'string' && filter.searchQuery.trim()) {
        const q = filter.searchQuery.trim();
        conditions.push({
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
          ],
        });
      }

      if (conditions.length > 0) {
        query.$and = conditions;
      }
    }

    // DRY RUN PREVIEW MODE
    if (mode === 'preview') {
      const matchingProducts = await db
        .collection('products')
        .find(query)
        .project({
          name: 1,
          price: 1,
          originalPrice: 1,
          sizes: 1,
          colors: 1,
          stock: 1,
          category: 1,
          imageUrls: 1,
        })
        .toArray();

      return NextResponse.json(
        {
          success: true,
          count: matchingProducts.length,
          previewProducts: matchingProducts.slice(0, 50), // Sample top 50 products
          querySummary: filter,
        },
        { status: 200 }
      );
    }

    // EXECUTE MODE
    if (mode === 'execute') {
      let updateDoc: any = {};
      let taskDescription = '';

      switch (action) {
        case 'PRICE_UPDATE': {
          const newPrice = parseFloat(payload?.newPrice);
          if (isNaN(newPrice) || newPrice < 0) {
            return NextResponse.json({ message: 'Invalid target price provided.' }, { status: 400 });
          }

          const setFields: any = { price: newPrice, updatedAt: new Date() };
          if (payload?.updateOriginalPrice) {
            // Optional: set original price equal to current price before updating
            setFields.originalPrice = payload?.originalPriceValue ? parseFloat(payload.originalPriceValue) : newPrice;
          }

          updateDoc = { $set: setFields };
          taskDescription = `Updated product prices to ₹${newPrice}`;
          if (filter.targetPrice) taskDescription += ` (where price was ₹${filter.targetPrice})`;
          break;
        }

        case 'ADD_SIZE': {
          const sizeToAdd = payload?.size?.toString().trim();
          if (!sizeToAdd) {
            return NextResponse.json({ message: 'Size string is required.' }, { status: 400 });
          }

          updateDoc = {
            $addToSet: { sizes: sizeToAdd },
            $set: { updatedAt: new Date() },
          };
          taskDescription = `Added size "${sizeToAdd}" to matching products`;
          break;
        }

        case 'REMOVE_SIZE': {
          const sizeToRemove = payload?.size?.toString().trim();
          if (!sizeToRemove) {
            return NextResponse.json({ message: 'Size string to remove is required.' }, { status: 400 });
          }

          updateDoc = {
            $pull: { sizes: sizeToRemove },
            $set: { updatedAt: new Date() },
          };
          taskDescription = `Removed size "${sizeToRemove}" from matching products`;
          break;
        }

        case 'STOCK_UPDATE': {
          const stockVal = parseInt(payload?.stockValue, 10);
          if (isNaN(stockVal)) {
            return NextResponse.json({ message: 'Invalid stock value provided.' }, { status: 400 });
          }

          const stockMode = payload?.stockMode || 'set';
          if (stockMode === 'add') {
            updateDoc = { $inc: { stock: stockVal }, $set: { updatedAt: new Date() } };
            taskDescription = `Added ${stockVal} units to stock`;
          } else if (stockMode === 'subtract') {
            updateDoc = { $inc: { stock: -stockVal }, $set: { updatedAt: new Date() } };
            taskDescription = `Subtracted ${stockVal} units from stock`;
          } else {
            updateDoc = { $set: { stock: stockVal, updatedAt: new Date() } };
            taskDescription = `Set stock level to ${stockVal}`;
          }
          break;
        }

        case 'CATEGORY_ASSIGN': {
          const catIds: string[] = Array.isArray(payload?.categoryIds) ? payload.categoryIds : [];
          if (catIds.length === 0) {
            return NextResponse.json({ message: 'Select at least one category.' }, { status: 400 });
          }

          const catMode = payload?.categoryMode || 'add';
          if (catMode === 'remove') {
            updateDoc = { $pullAll: { category: catIds }, $set: { updatedAt: new Date() } };
            taskDescription = `Removed categories from matching products`;
          } else {
            updateDoc = { $addToSet: { category: { $each: catIds } }, $set: { updatedAt: new Date() } };
            taskDescription = `Assigned categories to matching products`;
          }
          break;
        }

        default:
          return NextResponse.json({ message: `Unsupported batch action: ${action}` }, { status: 400 });
      }

      // Execute MongoDB bulk update
      const result = await db.collection('products').updateMany(query, updateDoc);

      // Record Audit Log
      const logEntry = {
        action,
        taskDescription,
        adminEmail: auth.user?.email || 'admin',
        filterUsed: filter,
        payloadUsed: payload,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        executedAt: new Date(),
      };

      await db.collection('batch_logs').insertOne(logEntry);

      return NextResponse.json(
        {
          success: true,
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
          taskDescription,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ message: 'Invalid mode. Supported modes: preview, execute.' }, { status: 400 });

  } catch (error: any) {
    console.error('Batch Task Execution Error:', error);
    return NextResponse.json({ message: error?.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
