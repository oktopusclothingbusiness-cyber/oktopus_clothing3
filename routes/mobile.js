import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import clientPromise from '../lib/mongodb.js';
import firebaseAdmin from '../lib/firebaseAdmin.js';
import mobileAuth from '../middleware/mobileAuth.js';
import { authMobileRateLimiter } from '../middleware/mobileSecurity.js';
import { formatCategoryForMobile } from '../lib/formatCategory.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'okto_jwt_secret_2026_production_key_baskey';

/**
 * GET /api/v1/mobile/categories
 * Returns categories formatted with description, hero_image_url, icon_name, item_count, accent_color, bg_tint, and featured_products
 */
router.get('/categories', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db();

    const categories = await db.collection('categories').find({}).toArray();
    const formattedCategories = await Promise.all(
      categories.map((cat) => formatCategoryForMobile(cat, db))
    );

    return res.status(200).json(formattedCategories);
  } catch (error) {
    console.error('Express mobile categories error:', error);
    return res.status(500).json({ message: 'Failed to fetch categories.' });
  }
});

// Helper function to compare semver versions
function isVersionLower(current, minimum) {
  const c = (current || '0.0.0').split('.').map(Number);
  const m = (minimum || '0.0.0').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const cv = c[i] || 0;
    const mv = m[i] || 0;
    if (cv < mv) return true;
    if (cv > mv) return false;
  }
  return false;
}

/**
 * 1. POST /api/v1/mobile/auth/firebase-phone
 * Handles Mobile Firebase ID Token Exchange, user provisioning, 100 Oktocoins bonus, returns session JWT.
 */
router.post('/auth/firebase-phone', authMobileRateLimiter, async (req, res) => {
  try {
    const { idToken, firstName, lastName } = req.body || {};

    if (!idToken) {
      return res.status(400).json({ message: 'Missing required field: idToken.' });
    }

    let decodedToken;
    try {
      decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    } catch (err) {
      // In dev fallback / testing mode, allow token string if mock
      if (process.env.NODE_ENV === 'development' && idToken.startsWith('mock-token-')) {
        decodedToken = { uid: idToken.replace('mock-token-', 'uid_'), phone_number: '+919999999999' };
      } else {
        return res.status(401).json({ message: 'Invalid or expired Firebase ID token.', error: err.message });
      }
    }

    const firebaseUid = decodedToken.uid;
    const phone = decodedToken.phone_number || '';

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    let user = await usersCollection.findOne({
      $or: [{ firebaseUid }, ...(phone ? [{ phone }] : [])],
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const newUserDoc = {
        firebaseUid,
        phone,
        firstName: firstName || '',
        lastName: lastName || '',
        oktocoins: 100, // Default 100 Oktocoins welcome bonus
        role: 'user',
        cart: [],
        wishlist: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUserDoc);
      user = { _id: result.insertedId, ...newUserDoc };
    } else {
      // Update names if provided
      const updateFields = {};
      if (firstName && !user.firstName) updateFields.firstName = firstName;
      if (lastName && !user.lastName) updateFields.lastName = lastName;
      if (!user.firebaseUid) updateFields.firebaseUid = firebaseUid;

      if (Object.keys(updateFields).length > 0) {
        updateFields.updatedAt = new Date();
        await usersCollection.updateOne({ _id: user._id }, { $set: updateFields });
        user = { ...user, ...updateFields };
      }
    }

    // Generate App Session JWT (valid for 30 days)
    const tokenPayload = {
      userId: user._id.toString(),
      phone: user.phone || '',
      role: user.role || 'user',
      firebaseUid: user.firebaseUid || '',
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });

    return res.status(200).json({
      success: true,
      isNewUser,
      token,
      user: {
        _id: user._id,
        phone: user.phone || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        oktocoins: user.oktocoins ?? 100,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    console.error('Firebase Phone Auth Error:', error);
    return res.status(500).json({ message: 'Internal server error during mobile authentication.' });
  }
});

/**
 * 2. GET /api/v1/mobile/config/app-version
 * Returns compatibility, minimum version, forced update flag, update URL.
 */
router.get('/config/app-version', (req, res) => {
  try {
    const platform = (req.query.platform || '').toString().toLowerCase();
    const version = (req.query.version || '1.0.0').toString();

    const minSupportedVersion = '1.0.0';
    const latestVersion = '1.0.4';
    const forceUpdate = isVersionLower(version, minSupportedVersion);

    const updateUrl =
      platform === 'ios'
        ? 'https://apps.apple.com/app/oktopus-clothing/id123456789'
        : 'https://play.google.com/store/apps/details?id=com.oktopus.clothing';

    return res.status(200).json({
      forceUpdate,
      latestVersion,
      minSupportedVersion,
      maintenanceMode: false,
      updateUrl,
    });
  } catch (error) {
    console.error('App Version Config Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve app version configuration.' });
  }
});

/**
 * 3. GET /api/v1/mobile/home/layout
 * Aggregated payload for mobile home page (Garment bubbles, Hero banners, Design themes, Oktocoins).
 */
router.get('/home/layout', mobileAuth, async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Fetch updated user oktocoins
    let oktocoins = 100;
    if (req.user && req.user.userId) {
      try {
        const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.userId) });
        if (user && typeof user.oktocoins === 'number') {
          oktocoins = user.oktocoins;
        }
      } catch (e) {
        // Fallback
      }
    }

    const bubbles = [
      { id: 'oversized', title: 'Oversized Tees', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500' },
      { id: 'french-terry', title: 'French Terry', imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500' },
      { id: 'sweatshirts', title: 'Sweatshirts', imageUrl: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500' },
      { id: 'hoodies', title: 'Hoodies', imageUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=500' },
    ];

    const heroBanners = [
      { id: 'bengali-drop', title: 'Bengali Typography', discountText: '20% OFF', bannerUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1000' },
    ];

    const designThemes = [
      { id: 'marvel', title: 'Marvel Co.', imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500' },
      { id: 'dc', title: 'DC Universe', imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500' },
      { id: 'anime', title: 'Anime Vibes', imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500' },
      { id: 'abstract', title: 'Abstract Art', imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500' },
      { id: 'bengali', title: 'Bengali Drop', imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500' },
    ];

    return res.status(200).json({
      oktocoins,
      bubbles,
      heroBanners,
      designThemes,
    });
  } catch (error) {
    console.error('Mobile Home Layout Error:', error);
    return res.status(500).json({ message: 'Failed to fetch homepage layout.' });
  }
});

/**
 * 4. POST /api/v1/mobile/cart/quick-sync
 * Syncs local cart with MongoDB and checks realtime inventory availability.
 */
router.post('/cart/quick-sync', async (req, res) => {
  try {
    const { cartItems } = req.body || {};

    if (!Array.isArray(cartItems)) {
      return res.status(400).json({ message: 'cartItems must be an array.' });
    }

    const client = await clientPromise;
    const db = client.db();
    const productsCollection = db.collection('products');

    const syncedCart = [];
    const outOfStockItems = [];

    for (const item of cartItems) {
      if (!item.productId) continue;

      let product = null;
      try {
        if (ObjectId.isValid(item.productId)) {
          product = await productsCollection.findOne({ _id: new ObjectId(item.productId) });
        }
      } catch (e) {
        // Ignore invalid ObjectId formatting
      }

      if (!product) {
        outOfStockItems.push({ ...item, reason: 'Product no longer available' });
        continue;
      }

      // Check stock availability
      const stock = product.stock ?? 10;
      if (stock <= 0) {
        outOfStockItems.push({ ...item, reason: 'Out of stock' });
      } else {
        const adjustedQuantity = Math.min(item.quantity || 1, stock);
        syncedCart.push({
          productId: item.productId,
          size: item.size || 'M',
          color: item.color || 'Black',
          quantity: adjustedQuantity,
          price: product.price || 0,
          name: product.name || '',
          imageUrl: product.imageUrl || '',
        });
      }
    }

    // Optional user cart update if authorization token present
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.userId) {
          await db.collection('users').updateOne(
            { _id: new ObjectId(decoded.userId) },
            { $set: { cart: syncedCart, updatedAt: new Date() } }
          );
        }
      } catch (err) {
        // Non-blocking if auth fails during cart sync
      }
    }

    return res.status(200).json({
      synced: true,
      cart: syncedCart,
      outOfStockItems,
    });
  } catch (error) {
    console.error('Cart Quick Sync Error:', error);
    return res.status(500).json({ message: 'Failed to sync cart items.' });
  }
});

/**
 * 5. GET /api/v1/mobile/rewards/balance
 * Returns active Oktocoin balance, transaction history log, and available redemption vouchers.
 */
router.get('/rewards/balance', mobileAuth, async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db();

    let balance = 100;
    let history = [];

    if (req.user && req.user.userId) {
      try {
        const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.userId) });
        if (user) {
          balance = user.oktocoins ?? 100;
          history = user.coinHistory || [
            {
              id: 'tx_welcome_100',
              type: 'CREDIT',
              description: 'Welcome Mobile Registration Bonus',
              amount: 100,
              createdAt: user.createdAt || new Date(),
            },
          ];
        }
      } catch (e) {
        // Fallback
      }
    }

    // Fetch active redemption vouchers from rewards/coupons collection
    let vouchers = [];
    try {
      vouchers = await db.collection('rewards').find({ active: { $ne: false } }).limit(10).toArray();
      if (!vouchers || vouchers.length === 0) {
        vouchers = [
          { id: 'v_100_off', title: '₹100 OFF Voucher', coinCost: 100, code: 'OKTO100' },
          { id: 'v_200_off', title: '₹200 OFF Voucher', coinCost: 200, code: 'OKTO200' },
        ];
      }
    } catch (e) {
      vouchers = [
        { id: 'v_100_off', title: '₹100 OFF Voucher', coinCost: 100, code: 'OKTO100' },
      ];
    }

    return res.status(200).json({
      balance,
      history,
      vouchers,
    });
  } catch (error) {
    console.error('Rewards Balance Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve rewards balance.' });
  }
});

export default router;
