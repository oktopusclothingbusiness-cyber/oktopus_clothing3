import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

type Category = {
    _id: ObjectId;
    id: string;
    name: string;
    imageUrl: string;
}

// Helper function to find a key in an object case-insensitively with alias support
const findFlexibleKey = (item: any, ...possibleKeys: string[]) => {
    if (!item || typeof item !== 'object') return undefined;
    for (const pk of possibleKeys) {
        const found = Object.keys(item).find(k => k.toLowerCase().trim() === pk.toLowerCase().trim());
        if (found && item[found] !== undefined && item[found] !== null && item[found] !== '') {
            return found;
        }
    }
    return undefined;
};

// Helper function to convert string values to the correct type
const parseProduct = (item: any, categoryMap: Map<string, Category>, rowIndex: number) => {
    const errors: string[] = [];

    const nameKey = findFlexibleKey(item, 'name', 'product_name', 'product name', 'title');
    const productName = nameKey ? item[nameKey]?.toString().trim() : '';

    const priceKey = findFlexibleKey(item, 'price', 'unit_price', 'amount', 'mrp', 'price_inr');
    const rawPriceStr = priceKey ? item[priceKey]?.toString().replace(/[^0-9.]/g, '') : '';
    const parsedPrice = parseFloat(rawPriceStr);

    if (!productName) errors.push('Missing product name');
    if (isNaN(parsedPrice)) errors.push('Invalid price');

    const categoriesKey = findFlexibleKey(item, 'categories', 'category', 'category_name', 'category_ids');
    const categoryNamesStr = categoriesKey ? item[categoriesKey]?.toString().trim() : '';
    const categoryNames = categoryNamesStr.split(',').map((name: string) => name.trim().toLowerCase()).filter(Boolean);
    const categoryIds = categoryNames.map((name: string) => categoryMap.get(name)?.id).filter((id: string | undefined): id is string => Boolean(id));

    if (categoryIds.length === 0 && categoryNames.length > 0) {
        errors.push(`Categories '${categoryNames.join(', ')}' not found`);
    } else if (categoryIds.length === 0 && categoryNames.length === 0) {
        // Fall back to default general category if none specified
        const defaultCat = Array.from(categoryMap.values())[0];
        if (defaultCat) {
            categoryIds.push(defaultCat.id);
        } else {
            errors.push('At least one category is required');
        }
    }

    const imageUrlsKey = findFlexibleKey(item, 'imageUrls', 'image_urls', 'images', 'image', 'image_url');
    const imageUrlsValue = imageUrlsKey ? item[imageUrlsKey] : '';
    const imageUrls = typeof imageUrlsValue === 'string'
        ? imageUrlsValue.split(',').map((url: string) => url.trim()).filter(Boolean)
        : Array.isArray(imageUrlsValue) ? imageUrlsValue : [];
    
    if (imageUrls.length === 0) errors.push('Missing imageUrls');

    const sizesKey = findFlexibleKey(item, 'sizes', 'size');
    const colorsKey = findFlexibleKey(item, 'colors', 'color');
    const featuredKey = findFlexibleKey(item, 'featured', 'is_featured');
    const isHeroKey = findFlexibleKey(item, 'isHero', 'is_hero', 'hero');
    const originalPriceKey = findFlexibleKey(item, 'originalPrice', 'original_price', 'list_price');
    const costKey = findFlexibleKey(item, 'cost', 'cost_price', 'item_cost');
    const discountPercentageKey = findFlexibleKey(item, 'discountPercentage', 'discount_percentage', 'discount');
    const ratingKey = findFlexibleKey(item, 'rating');
    const stockKey = findFlexibleKey(item, 'stock', 'inventory', 'quantity', 'qty');
    const descriptionKey = findFlexibleKey(item, 'description', 'desc', 'details');

    let colorImages: Record<string, string[]> | undefined = undefined;
    const colorImagesKey = findFlexibleKey(item, 'colorImages', 'color_images', 'images_by_color');
    if (colorImagesKey && item[colorImagesKey]) {
        const val = item[colorImagesKey];
        if (typeof val === 'object' && !Array.isArray(val)) {
            colorImages = val;
        } else if (typeof val === 'string') {
            try {
                const parsed = JSON.parse(val);
                if (typeof parsed === 'object' && !Array.isArray(parsed)) {
                    colorImages = parsed;
                }
            } catch {
                const mapObj: Record<string, string[]> = {};
                val.split(';').forEach(part => {
                    const [cName, urlsStr] = part.split(':');
                    if (cName && urlsStr) {
                        const urls = urlsStr.split(',').map(u => u.trim()).filter(Boolean);
                        if (urls.length > 0) {
                            mapObj[cName.trim()] = urls;
                        }
                    }
                });
                if (Object.keys(mapObj).length > 0) {
                    colorImages = mapObj;
                }
            }
        }
    }

    return {
        product: {
            name: productName,
            description: descriptionKey ? item[descriptionKey]?.toString() || '' : '',
            price: isNaN(parsedPrice) ? 0 : parsedPrice,
            cost: costKey && item[costKey] ? parseFloat(item[costKey].toString().replace(/[^0-9.]/g, '')) || 0 : 0,
            originalPrice: originalPriceKey && item[originalPriceKey] ? parseFloat(item[originalPriceKey].toString().replace(/[^0-9.]/g, '')) || undefined : undefined,
            discountPercentage: discountPercentageKey && item[discountPercentageKey] ? parseInt(item[discountPercentageKey].toString(), 10) || 0 : 0,
            rating: ratingKey && item[ratingKey] ? parseFloat(item[ratingKey].toString()) || 4.5 : 4.5,
            stock: stockKey && item[stockKey] ? parseInt(item[stockKey].toString(), 10) || 100 : 100,
            imageUrls: imageUrls,
            colorImages: colorImages,
            category: categoryIds,
            sizes: sizesKey && item[sizesKey] ? item[sizesKey].toString().split(',').map((s: string) => s.trim()).filter(Boolean) : [],
            colors: colorsKey && item[colorsKey] ? item[colorsKey].toString().split(',').map((c: string) => c.trim()).filter(Boolean) : [],
            featured: (featuredKey && item[featuredKey]?.toString().toUpperCase()) === 'TRUE',
            isHero: (isHeroKey && item[isHeroKey]?.toString().toUpperCase()) === 'TRUE',
            createdAt: new Date(),
        },
        errors,
        rowIndex,
        name: productName || `Row ${rowIndex + 2}`
    };
};

export async function POST(request: Request) {
    try {
        const productsData = await request.json();
        
        if (!Array.isArray(productsData) || productsData.length === 0) {
            return NextResponse.json({ message: 'No product data provided in file.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const categoriesCollection = db.collection('categories');
        
        // Fetch existing categories and create a map for quick lookups
        const existingCategories = await categoriesCollection.find({}).toArray();
        const categoryMap = new Map<string, Category>();
        existingCategories.forEach(c => {
            categoryMap.set(c.name.toLowerCase(), { ...c, id: c._id.toString() } as Category);
        });

        // Identify and create new categories
        const newCategoryNames = new Set<string>();
        productsData.forEach(item => {
            const categoriesKey = findFlexibleKey(item, 'categories', 'category', 'category_name');
            const categoryNamesStr = categoriesKey ? item[categoriesKey]?.toString().trim() : '';
            const categoryNames = categoryNamesStr.split(',').map((name: string) => name.trim()).filter(Boolean);
            
            categoryNames.forEach((name: string) => {
                if (name && !categoryMap.has(name.toLowerCase())) {
                    newCategoryNames.add(name);
                }
            });
        });

        if (newCategoryNames.size > 0) {
            const newCategories = Array.from(newCategoryNames).map(name => ({
                _id: new ObjectId(),
                name: name,
                imageUrl: 'https://placehold.co/400x400.png',
                createdAt: new Date()
            }));
            
            if (newCategories.length > 0) {
                await categoriesCollection.insertMany(newCategories);
                newCategories.forEach(c => {
                    categoryMap.set(c.name.toLowerCase(), { ...c, id: c._id.toString() } as Category);
                });
            }
        }

        const parsedResult = productsData.map((item, index) => parseProduct(item, categoryMap, index));
        
        const productsWithErrors = parsedResult.filter(p => p.errors.length > 0);

        if (productsWithErrors.length > 0) {
            const errorDetails = productsWithErrors.slice(0, 5).map(p => `${p.name}: ${p.errors.join(', ')}`).join('; ');
            return NextResponse.json({
                message: `Found errors in ${productsWithErrors.length} products. Please fix them and try again.`,
                details: errorDetails,
            }, { status: 400 });
        }
        
        const productsToInsert = parsedResult.map(p => p.product);

        const result = await db.collection('products').insertMany(productsToInsert);

        return NextResponse.json({ message: `${result.insertedCount} products uploaded successfully.` }, { status: 201 });

    } catch (error: any) {
        console.error('Bulk Upload Error:', error);
        return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
    }
}
