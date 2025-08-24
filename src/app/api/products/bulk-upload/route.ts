
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
const parseProduct = (item: any, categoryMap: Map<string, Category>, rowIndex: number) => {
    const categoryName = item.category?.toString().trim().toLowerCase();
    const category = categoryMap.get(categoryName);
    
    const errors: string[] = [];
    if (!item.name) errors.push('Missing name');
    if (isNaN(parseFloat(item.price))) errors.push('Invalid price');
    if (!category) errors.push(`Category '${item.category}' not found`);
    const imageUrls = typeof item.imageUrls === 'string' ? item.imageUrls.split(',').map((url: string) => url.trim()).filter((url: string) => url) : [];
    if (imageUrls.length === 0) errors.push('Missing imageUrls');


    return {
        product: {
            name: item.name,
            description: item.description || '',
            price: parseFloat(item.price),
            originalPrice: item.originalPrice ? parseFloat(item.originalPrice) : undefined,
            discountPercentage: item.discountPercentage ? parseInt(item.discountPercentage, 10) : 0,
            rating: item.rating ? parseFloat(item.rating) : 4.5,
            stock: item.stock ? parseInt(item.stock, 10) : 100,
            imageUrls: imageUrls,
            category: category ? category.id : '', // Use category ID
            sizes: typeof item.sizes === 'string' ? (item.sizes || '').split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
            colors: typeof item.colors === 'string' ? (item.colors || '').split(',').map((c: string) => c.trim()).filter((c: string) => c) : [],
            featured: item.featured === 'TRUE' || item.featured === true,
            isHero: item.isHero === 'TRUE' || item.isHero === true,
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
            const categoryName = item.category?.toString().trim();
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
