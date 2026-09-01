import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

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
        const catConds: any[] = [];
        for (const catIdOrName of filter.categories) {
          if (!catIdOrName || catIdOrName === 'all') continue;

          const terms: any[] = [catIdOrName];

          try {
            let catDoc: any = null;
            if (ObjectId.isValid(catIdOrName)) {
              catDoc = await db.collection('categories').findOne({ _id: new ObjectId(catIdOrName) });
            }
            if (!catDoc) {
              catDoc = await db.collection('categories').findOne({
                $or: [
                  { id: catIdOrName },
                  { name: { $regex: `^${catIdOrName}$`, $options: 'i' } }
                ]
              });
            }

            if (catDoc) {
              if (catDoc._id) terms.push(catDoc._id.toString());
              if (catDoc.id) terms.push(catDoc.id);
              if (catDoc.name) {
                terms.push(catDoc.name);
                terms.push(catDoc.name.toLowerCase());
                terms.push(new RegExp(`^${catDoc.name.trim()}$`, 'i'));
              }
            } else {
              terms.push(new RegExp(`^${catIdOrName.trim()}$`, 'i'));
            }
          } catch (e) {
            terms.push(new RegExp(`^${catIdOrName.trim()}$`, 'i'));
          }

          catConds.push(
            { category: { $in: terms } },
            { category: { $elemMatch: { $in: terms } } }
          );
        }

        if (catConds.length > 0) {
          conditions.push({ $or: catConds });
        }
      }

      if (filter.productId && typeof filter.productId === 'string' && filter.productId !== 'all') {
        const idStr = filter.productId.trim();
        if (ObjectId.isValid(idStr)) {
          conditions.push({ $or: [{ _id: new ObjectId(idStr) }, { id: idStr }] });
        } else {
          conditions.push({ id: idStr });
        }
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
          description: 1,
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

        case 'DESCRIPTION_UPDATE': {
          const descMode = payload?.descriptionMode || 'set';
          const descText = payload?.descriptionText?.toString() || '';
          const findText = payload?.descriptionFindText?.toString() || '';
          const replaceText = payload?.descriptionReplaceText?.toString() || '';

          if (descMode === 'clear') {
            updateDoc = { $set: { description: '', updatedAt: new Date() } };
            taskDescription = `Cleared description for matching products`;
          } else if (descMode === 'append') {
            if (!descText.trim()) {
              return NextResponse.json({ message: 'Description text to append is required.' }, { status: 400 });
            }
            updateDoc = [
              {
                $set: {
                  description: {
                    $concat: [
                      { $ifNull: ['$description', ''] },
                      { $cond: [{ $eq: [{ $ifNull: ['$description', ''] }, ''] }, '', ' '] },
                      descText,
                    ],
                  },
                  updatedAt: new Date(),
                },
              },
            ];
            taskDescription = `Appended text to descriptions of matching products`;
          } else if (descMode === 'replace') {
            if (!findText) {
              return NextResponse.json({ message: 'Find text is required for replace mode.' }, { status: 400 });
            }
            updateDoc = [
              {
                $set: {
                  description: {
                    $replaceAll: {
                      input: { $ifNull: ['$description', ''] },
                      find: findText,
                      replacement: replaceText,
                    },
                  },
                  updatedAt: new Date(),
                },
              },
            ];
            taskDescription = `Replaced "${findText}" with "${replaceText}" in descriptions`;
          } else {
            // 'set' / 'overwrite'
            updateDoc = { $set: { description: descText, updatedAt: new Date() } };
            taskDescription = descText
              ? `Set description to "${descText.length > 35 ? descText.slice(0, 35) + '...' : descText}"`
              : `Cleared description for matching products`;
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
