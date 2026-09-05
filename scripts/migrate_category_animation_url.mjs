import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb+srv://rbaskeyofficial:rbaskeyofficial@cluster0.lnstw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function migrateCategoryAnimationUrl() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const categoriesCollection = db.collection('categories');

    const categories = await categoriesCollection.find({}).toArray();
    console.log(`Found ${categories.length} categories in database.`);

    let updatedCount = 0;
    for (const cat of categories) {
      const currentUrl = cat.animation_video_url ?? cat.splash_animation_url ?? null;
      
      const updateDoc = {
        animation_video_url: currentUrl,
        splash_animation_url: currentUrl,
      };

      const res = await categoriesCollection.updateOne(
        { _id: cat._id },
        { $set: updateDoc }
      );

      if (res.modifiedCount > 0) {
        updatedCount++;
      }
    }

    console.log(`[SUCCESS] Category animation URL migration complete. Updated ${updatedCount} categories.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

migrateCategoryAnimationUrl();
