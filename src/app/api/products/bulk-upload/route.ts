
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

type Category = {
    _id: ObjectId;
    id: string;
    name: string;
    imageUrl: string;
}

// Helper function to convert string values to the correct type
const parseProduct = (item: any, categoryMap: Map<string, Category>) => {
    const categoryName = item.category?.trim().toLowerCase();
    const category = categoryMap.get(categoryName);
    return {
        name: item.name,
        description: item.description || '',
        price: parseFloat(item.price),
        originalPrice: item.originalPrice ? parseFloat(item.originalPrice) : undefined,
        discountPercentage: item.discountPercentage ? parseInt(item.discountPercentage, 10) : 0,
        rating: item.rating ? parseFloat(item.rating) : 4.5,
        stock: item.stock ? parseInt(item.stock, 10) : 100,
        imageUrls: (item.imageUrls || '').split(',').map((url: string) => url.trim()).filter((url: string) => url),
        category: category ? category.id : '', // Use category ID
        sizes: (item.sizes || '').split(',').map((s: string) => s.trim()).filter((s: string) => s),
        colors: (item.colors || '').split(',').map((c: string) => c.trim()).filter((c: string) => c),
        featured: item.featured === 'TRUE' || item.featured === true,
        isHero: item.isHero === 'TRUE' || item.isHero === true,
        createdAt: new Date(),
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
            const categoryName = item.category?.trim();
            if (categoryName && !categoryMap.has(categoryName.toLowerCase())) {
                newCategoryNames.add(categoryName);
            }
        });

        if (newCategoryNames.size > 0) {
            const newCategories = Array.from(newCategoryNames).map(name => ({
                name: name,
                imageUrl: 'https://placehold.co/400x400.png', // Default placeholder
                createdAt: new Date()
            }));
            const result = await categoriesCollection.insertMany(newCategories);
            
            // Query the newly inserted categories to get their full documents including the _id
            const insertedIds = Object.values(result.insertedIds);
            const newlyCreatedCategories = await categoriesCollection.find({ _id: { $in: insertedIds } }).toArray();

            // Add the newly created categories to our map
            newlyCreatedCategories.forEach(c => {
                 categoryMap.set(c.name.toLowerCase(), { ...c, id: c._id.toString() } as Category);
            });
        }


        const productsToInsert = productsData.map(item => parseProduct(item, categoryMap));

        // Validate products
        const invalidProducts = productsToInsert.filter(p => !p.name || isNaN(p.price) || !p.category || p.imageUrls.length === 0);
        if (invalidProducts.length > 0) {
            return NextResponse.json({ 
                message: `Invalid data for ${invalidProducts.length} products. Please check name, price, category, and imageUrls.`,
                errors: invalidProducts.map(p => p.name)
            }, { status: 400 });
        }

        const result = await db.collection('products').insertMany(productsToInsert);

        return NextResponse.json({ message: `${result.insertedCount} products uploaded successfully.` }, { status: 201 });

    } catch (error) {
        console.error('Bulk Upload Error:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
