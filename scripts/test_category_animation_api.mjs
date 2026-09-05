import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb+srv://rbaskeyofficial:rbaskeyofficial@cluster0.lnstw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Import formatter
import { formatCategoryForMobile } from '../lib/formatCategory.js';

function isValidAnimationUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) return true;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

async function testCategoryAnimation() {
  console.log('[START] Starting Category Splash Animation Video API Test...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const categoriesCollection = db.collection('categories');

    // 1. Check existing categories
    const categories = await categoriesCollection.find({}).toArray();
    console.log(`\n[STEP 1] Testing existing categories retrieval: Found ${categories.length} categories.`);
    const sample = categories[0];
    const formattedSample = await formatCategoryForMobile(sample, db);
    console.log(`   Sample category "${formattedSample.name}":`);
    console.log(`   - animation_video_url: ${formattedSample.animation_video_url}`);
    console.log(`   - splash_animation_url: ${formattedSample.splash_animation_url}`);

    if (!('animation_video_url' in formattedSample) || !('splash_animation_url' in formattedSample)) {
      throw new Error('FAILED: animation_video_url or splash_animation_url missing from formatted category output!');
    }
    console.log('   [SUCCESS] Key presence check PASSED.');

    // 2. Test URL Validator
    console.log('\n[STEP 2] Testing URL validation helper:');
    const validUrls = [
      'https://res.cloudinary.com/oktopus/video/upload/winterwear_splash.mp4',
      'https://assets.example.com/lottie/splash.json',
      'https://res.cloudinary.com/demo/image/upload/anim.webp',
      'http://example.com/splash.gif',
      null,
      '',
    ];
    const invalidUrls = [
      'not-a-url',
      'ftp://bad-protocol.com/video.mp4',
      'javascript:alert(1)',
    ];

    for (const u of validUrls) {
      if (!isValidAnimationUrl(u)) {
        throw new Error(`FAILED: valid URL rejected: ${u}`);
      }
    }
    for (const u of invalidUrls) {
      if (isValidAnimationUrl(u)) {
        throw new Error(`FAILED: invalid URL accepted: ${u}`);
      }
    }
    console.log('   [SUCCESS] URL validator correctly validated allowed and rejected invalid formats.');

    // 3. Test Inserting a category with animation_video_url
    console.log('\n[STEP 3] Testing Category Creation with animation_video_url:');
    const testVideoUrl = 'https://res.cloudinary.com/demo/video/upload/category_splash_test.mp4';
    const testCatDoc = {
      name: '__Test Animation Category__',
      square_image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
      landscape_image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
      hero_image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000',
      description: 'Category created by automated verification script',
      icon_name: 'shirt',
      accent_color: '#D4A02E',
      bg_tint: '#FAF6E8',
      gender: 'Unisex',
      colorToken: '#D4A02E',
      animation_video_url: testVideoUrl,
      splash_animation_url: testVideoUrl,
      createdAt: new Date(),
    };

    const insertResult = await categoriesCollection.insertOne(testCatDoc);
    const createdId = insertResult.insertedId;
    console.log(`   Created test category with _id: ${createdId}`);

    const retrieved = await categoriesCollection.findOne({ _id: createdId });
    const formattedRetrieved = await formatCategoryForMobile(retrieved, db);

    if (formattedRetrieved.animation_video_url !== testVideoUrl) {
      throw new Error(`FAILED: Expected ${testVideoUrl}, got ${formattedRetrieved.animation_video_url}`);
    }
    if (formattedRetrieved.splash_animation_url !== testVideoUrl) {
      throw new Error(`FAILED: Expected alias splash_animation_url to match`);
    }
    console.log('   [SUCCESS] Insert and formatted retrieval with animation_video_url PASSED.');

    // 4. Test Updating the Category Animation URL
    console.log('\n[STEP 4] Testing Category Update (PUT simulation):');
    const updatedVideoUrl = 'https://res.cloudinary.com/demo/video/upload/updated_splash.mp4';
    await categoriesCollection.updateOne(
      { _id: createdId },
      {
        $set: {
          animation_video_url: updatedVideoUrl,
          splash_animation_url: updatedVideoUrl,
          updatedAt: new Date(),
        }
      }
    );

    const updatedDoc = await categoriesCollection.findOne({ _id: createdId });
    const formattedUpdated = await formatCategoryForMobile(updatedDoc, db);

    if (formattedUpdated.animation_video_url !== updatedVideoUrl) {
      throw new Error(`FAILED: Expected updated URL ${updatedVideoUrl}, got ${formattedUpdated.animation_video_url}`);
    }
    console.log('   [SUCCESS] Category update with updated animation_video_url PASSED.');

    // 5. Test clearing animation URL
    console.log('\n[STEP 5] Testing Clearing animation_video_url:');
    await categoriesCollection.updateOne(
      { _id: createdId },
      {
        $set: {
          animation_video_url: null,
          splash_animation_url: null,
          updatedAt: new Date(),
        }
      }
    );

    const clearedDoc = await categoriesCollection.findOne({ _id: createdId });
    const formattedCleared = await formatCategoryForMobile(clearedDoc, db);
    if (formattedCleared.animation_video_url !== null) {
      throw new Error(`FAILED: Expected null after clearing animation_video_url, got ${formattedCleared.animation_video_url}`);
    }
    console.log('   [SUCCESS] Clearing animation_video_url PASSED.');

    // 6. Clean up
    console.log('\n[STEP 6] Cleaning up test document...');
    await categoriesCollection.deleteOne({ _id: createdId });
    console.log('   [SUCCESS] Clean up completed successfully.');

    console.log('\n[DONE] ALL TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n[ERROR] TEST FAILED:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

testCategoryAnimation();
