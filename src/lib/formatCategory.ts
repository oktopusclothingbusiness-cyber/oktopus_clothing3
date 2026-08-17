import { Db, ObjectId } from 'mongodb';

export interface FeaturedProduct {
  id: string;
  name: string;
  image_url: string;
  price: string;
}

export interface MobileCategoryResponse {
  _id: string;
  id: string;
  name: string;
  description: string;
  hero_image_url: string;
  icon_name: string;
  item_count: number;
  accent_color: string;
  bg_tint: string;
  gender?: string;
  colorToken?: string;
  featured_products: FeaturedProduct[];
}

const DEFAULT_CATEGORY_METADATA: Record<string, {
  description: string;
  hero_image_url: string;
  icon_name: string;
  accent_color: string;
  bg_tint: string;
  default_featured: FeaturedProduct[];
}> = {
  'french terry': {
    description: 'Premium 400 GSM heavy loopback cotton engineered for relaxed streetwear fits.',
    hero_image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    icon_name: 'shirt',
    accent_color: '#D4A02E',
    bg_tint: '#FAF6E8',
    default_featured: [
      { id: 'p1', name: 'Heavy Terry Tee', image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500', price: '₹1,499' },
      { id: 'p2', name: 'Boxy Loopback Tee', image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500', price: '₹1,699' },
    ],
  },
  'oversized tees': {
    description: 'Heavyweight boxy cut cotton tees crafted for maximum comfort and streetwear styling.',
    hero_image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    icon_name: 'square',
    accent_color: '#A1CF6B',
    bg_tint: '#F3FDF0',
    default_featured: [
      { id: 'p3', name: 'Oversized Drop-Shoulder Tee', image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500', price: '₹1,299' },
      { id: 'p4', name: 'Vintage Acid Wash Tee', image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500', price: '₹1,499' },
    ],
  },
  'sweatshirts': {
    description: 'Cozy fleece-lined streetwear crewnecks built for everyday layering.',
    hero_image_url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80',
    icon_name: 'layers',
    accent_color: '#FF5E7E',
    bg_tint: '#FFF0F3',
    default_featured: [
      { id: 'p5', name: 'Minimalist Fleece Crewneck', image_url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500', price: '₹2,199' },
      { id: 'p6', name: 'Heavyweight Ribbed Sweatshirt', image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500', price: '₹2,499' },
    ],
  },
  'hoodies': {
    description: 'Heavyweight pullover hoodies with double-lined hood and drop shoulders.',
    hero_image_url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80',
    icon_name: 'zap',
    accent_color: '#3B82F6',
    bg_tint: '#EFF6FF',
    default_featured: [
      { id: 'p7', name: 'Signature Heavy Hoodie', image_url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=500', price: '₹2,799' },
      { id: 'p8', name: 'Boxy French Terry Hoodie', image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500', price: '₹2,999' },
    ],
  },
  'cargo pants': {
    description: 'Technical utility cargo pants with multi-pocket storage and relaxed tapered fit.',
    hero_image_url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80',
    icon_name: 'box',
    accent_color: '#8B5CF6',
    bg_tint: '#F5F3FF',
    default_featured: [
      { id: 'p9', name: 'Tactical Utility Cargo', image_url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=500', price: '₹2,499' },
      { id: 'p10', name: 'Relaxed Fit Cargo Joggers', image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500', price: '₹2,299' },
    ],
  },
  'women': {
    description: 'Curated streetwear essentials designed with modern oversized silhouettes.',
    hero_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    icon_name: 'tag',
    accent_color: '#EC4899',
    bg_tint: '#FDF2F8',
    default_featured: [
      { id: 'p11', name: 'Oversized Crop Tee', image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500', price: '₹1,299' },
      { id: 'p12', name: 'Relaxed Drop Hoodie', image_url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=500', price: '₹2,499' },
    ],
  },
};

export async function formatCategoryForMobile(cat: any, db: Db): Promise<MobileCategoryResponse> {
  const name = String(cat.name || 'Category').trim();
  const nameKey = name.toLowerCase();
  const meta = DEFAULT_CATEGORY_METADATA[nameKey] || {
    description: `Premium streetwear ${name} engineered for comfort and modern relaxed fits.`,
    hero_image_url: cat.imageUrl || cat.hero_image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
    icon_name: 'shirt',
    accent_color: '#D4A02E',
    bg_tint: '#FAF6E8',
    default_featured: [
      { id: 'p_def1', name: `${name} Classic`, image_url: cat.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500', price: '₹1,499' },
      { id: 'p_def2', name: `${name} Boxy Fit`, image_url: cat.imageUrl || 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500', price: '₹1,699' },
    ],
  };

  const idStr = cat._id ? cat._id.toString() : (cat.id || 'cat_001');

  // Query actual products matching this category
  let matchingProducts: any[] = [];
  try {
    matchingProducts = await db.collection('products').find({
      $or: [
        { category: name },
        { category: idStr },
        { category: { $in: [name, idStr] } },
      ],
    }).limit(4).toArray();
  } catch (e) {
    // Fallback if query fails
  }

  // Calculate item count
  let itemCount = cat.item_count;
  if (typeof itemCount !== 'number') {
    itemCount = matchingProducts.length > 0 ? matchingProducts.length : 14;
  }

  // Format featured products array
  let featuredProducts: FeaturedProduct[] = [];
  if (matchingProducts.length > 0) {
    featuredProducts = matchingProducts.slice(0, 3).map((p: any) => {
      const priceVal = typeof p.price === 'number' ? `₹${p.price.toLocaleString('en-IN')}` : String(p.price || '₹1,499');
      const imgUrl = Array.isArray(p.imageUrls) && p.imageUrls.length > 0
        ? p.imageUrls[0]
        : (p.imageUrl || meta.hero_image_url);
      return {
        id: p._id ? p._id.toString() : String(p.id || 'p_0'),
        name: String(p.name || 'Product'),
        image_url: String(imgUrl),
        price: priceVal.startsWith('₹') ? priceVal : `₹${priceVal}`,
      };
    });
  }

  // If featured_products explicitly stored in cat object, use it
  if (Array.isArray(cat.featured_products) && cat.featured_products.length > 0) {
    featuredProducts = cat.featured_products.map((fp: any, idx: number) => ({
      id: String(fp.id || fp._id || `fp_${idx}`),
      name: String(fp.name || 'Product'),
      image_url: String(fp.image_url || fp.imageUrl || meta.hero_image_url),
      price: String(fp.price || '₹1,499'),
    }));
  }

  // Fallback if no featured products found
  if (featuredProducts.length === 0) {
    featuredProducts = meta.default_featured;
  }

  return {
    _id: idStr,
    id: idStr,
    name,
    description: cat.description || meta.description,
    hero_image_url: cat.hero_image_url || cat.imageUrl || meta.hero_image_url,
    icon_name: cat.icon_name || meta.icon_name,
    item_count: itemCount,
    accent_color: cat.accent_color || cat.colorToken || meta.accent_color,
    bg_tint: cat.bg_tint || meta.bg_tint,
    gender: cat.gender || 'Unisex',
    colorToken: cat.colorToken || cat.accent_color || meta.accent_color,
    featured_products: featuredProducts,
  };
}
