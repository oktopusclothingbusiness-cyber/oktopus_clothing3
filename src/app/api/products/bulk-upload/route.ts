
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

type Category = {
    _id: ObjectId;
    id: string;
    name: string;
    imageUrl: string;
}

// Helper function to find a key in an object case-insensitively
const findCaseInsensitiveKey = (obj: any, key: string) => {
    return Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
};


// Helper function to convert string values to the correct type
const parseProduct = (item: any, categoryMap: Map<string, Category>, rowIndex: number) => {
    const errors: string[] = [];

    const categoryKey = findCaseInsensitiveKey(item, 'category');
    const categoryName = categoryKey ? item[categoryKey]?.toString().trim().toLowerCase() : undefined;
    const category = categoryName ? categoryMap.get(categoryName) : undefined;
    
    if (!item.name) errors.push('Missing name');
    if (isNaN(parseFloat(item.price))) errors.push('Invalid price');
    if (!category) errors.push(`Category '${categoryKey ? item[categoryKey] : 'undefined'}' not found`);

    const imageUrlsKey = findCaseInsensitiveKey(item, 'imageUrls');
    const imageUrlsValue = imageUrlsKey ? item[imageUrlsKey] : '';
    const imageUrls = typeof imageUrlsValue === 'string' ? imageUrlsValue.split(',').map((url: string) => url.trim()).filter((url: string) => url) : [];
    if (imageUrls.length === 0) errors.push('Missing imageUrls');

    const sizesKey = findCaseInsensitiveKey(item, 'sizes');
    const colorsKey = findCaseInsensitiveKey(item, 'colors');
    const featuredKey = findCaseInsensitiveKey(item, 'featured');
    const isHeroKey = findCaseInsensitiveKey(item, 'isHero');
    const originalPriceKey = findCaseInsensitiveKey(item, 'originalPrice');
    const costKey = findCaseInsensitiveKey(item, 'cost');
    const discountPercentageKey = findCaseInsensitiveKey(item, 'discountPercentage');
    const ratingKey = findCaseInsensitiveKey(item, 'rating');
    const stockKey = findCaseInsensitiveKey(item, 'stock');


    return {
        product: {
            name: item.name,
            description: item.description || '',
            price: parseFloat(item.price),
            cost: costKey && item[costKey] ? parseFloat(item[costKey]) : 0,
            originalPrice: originalPriceKey && item[originalPriceKey] ? parseFloat(item[originalPriceKey]) : undefined,
            discountPercentage: discountPercentageKey && item[discountPercentageKey] ? parseInt(item[discountPercentageKey], 10) : 0,
            rating: ratingKey && item[ratingKey] ? parseFloat(item[ratingKey]) : 4.5,
            stock: stockKey && item[stockKey] ? parseInt(item[stockKey], 10) : 100,
            imageUrls: imageUrls,
            category: category ? category.id : '', // Use category ID
            sizes: sizesKey && typeof item[sizesKey] === 'string' ? (item[sizesKey] || '').split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
            colors: colorsKey && typeof item[colorsKey] === 'string' ? (item[colorsKey] || '').split(',').map((c: string) => c.trim()).filter((c: string) => c) : [],
            featured: (featuredKey && item[featuredKey]?.toString().toUpperCase()) === 'TRUE',
            isHero: (isHeroKey && item[isHeroKey]?.toString().toUpperCase()) === 'TRUE',
            createdAt: new Date(),
        },
        errors,
        rowIndex,
        name: item.name || `Row ${rowIndex + 2}`
    };
};

export async function POST(request: Request) {
    try {
        const productsData = await request.json();
        
        if (!Array.isArray(productsData) || productsData.length === 0) {
            return NextResponse.json({ message: 'No product data provided.' }, { status: 400 });
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
            const categoryKey = findCaseInsensitiveKey(item, 'category');
            const categoryName = categoryKey ? item[categoryKey]?.toString().trim() : undefined;
            if (categoryName && !categoryMap.has(categoryName.toLowerCase())) {
                newCategoryNames.add(categoryName);
            }
        });

        if (newCategoryNames.size > 0) {
            const newCategories = Array.from(newCategoryNames).map(name => ({
                _id: new ObjectId(),
                name: name,
                imageUrl: 'https://placehold.co/400x400.png', // Default placeholder
                createdAt: new Date()
            }));
            
            if (newCategories.length > 0) {
                await categoriesCollection.insertMany(newCategories);
                 // Add the newly created categories to our map
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
