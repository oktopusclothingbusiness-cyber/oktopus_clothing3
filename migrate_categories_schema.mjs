import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb+srv://rbaskeyofficial:rbaskeyofficial@cluster0.lnstw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const DEFAULT_METADATA = {
  'french terry': {
    description: 'Premium 400 GSM heavy loopback cotton engineered for relaxed streetwear fits.',
    hero_image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    icon_name: 'shirt',
    accent_color: '#D4A02E',
    bg_tint: '#FAF6E8',
  },
  'oversized tees': {
    description: 'Heavyweight boxy cut cotton tees crafted for maximum comfort and streetwear styling.',
    hero_image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    icon_name: 'square',
    accent_color: '#A1CF6B',
    bg_tint: '#F3FDF0',
  },
  'sweatshirts': {
    description: 'Cozy fleece-lined streetwear crewnecks built for everyday layering.',
    hero_image_url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80',
    icon_name: 'layers',
    accent_color: '#FF5E7E',
    bg_tint: '#FFF0F3',
  },
  'hoodies': {
    description: 'Heavyweight pullover hoodies with double-lined hood and drop shoulders.',
    hero_image_url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80',
    icon_name: 'zap',
    accent_color: '#3B82F6',
    bg_tint: '#EFF6FF',
  },
  'cargo pants': {
    description: 'Technical utility cargo pants with multi-pocket storage and relaxed tapered fit.',
    hero_image_url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80',
    icon_name: 'box',
    accent_color: '#8B5CF6',
    bg_tint: '#F5F3FF',
  },
  'women': {
    description: 'Curated streetwear essentials designed with modern oversized silhouettes.',
    hero_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    icon_name: 'tag',
    accent_color: '#EC4899',
    bg_tint: '#FDF2F8',
  },
};

async function migrateCategoriesSchema() {
  console.log('Connecting to MongoDB database...');
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const categoriesCollection = db.collection('categories');

    const categories = await categoriesCollection.find({}).toArray();
    console.log(`Found ${categories.length} existing categories in MongoDB collection.`);

    let updatedCount = 0;

    for (const cat of categories) {
      const name = String(cat.name || '').trim();
      const nameKey = name.toLowerCase();

      const meta = DEFAULT_METADATA[nameKey] || {
        description: `Premium streetwear ${name} collection engineered for comfort and modern relaxed fits.`,
        hero_image_url: cat.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
        icon_name: 'shirt',
        accent_color: '#D4A02E',
        bg_tint: '#FAF6E8',
      };

      const updateFields = {
        description: cat.description || meta.description,
        hero_image_url: cat.hero_image_url || cat.imageUrl || meta.hero_image_url,
        icon_name: cat.icon_name || meta.icon_name,
        accent_color: cat.accent_color || cat.colorToken || meta.accent_color,
        bg_tint: cat.bg_tint || meta.bg_tint,
        colorToken: cat.colorToken || cat.accent_color || meta.accent_color,
        gender: cat.gender || 'Unisex',
        updatedAt: new Date(),
      };

      const result = await categoriesCollection.updateOne(
        { _id: cat._id },
        { $set: updateFields }
      );

      if (result.modifiedCount > 0 || result.matchedCount > 0) {
        updatedCount++;
        console.log(`✅ Updated category schema in DB: "${name}" (${cat._id})`);
      }
    }

    console.log(`\n🎉 SUCCESS: Successfully updated schema for ${updatedCount} MongoDB category documents!`);
  } catch (err) {
    console.error('Migration Failed:', err);
  } finally {
    await client.close();
    process.exit(0);
  }
}

migrateCategoriesSchema();
