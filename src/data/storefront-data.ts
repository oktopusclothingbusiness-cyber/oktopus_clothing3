import { StorefrontProduct, CollectionItem, DropItem, SignalType } from '@/types/storefront';
import { Product as DbProduct } from '@/context/product-context';

export const STOREFRONT_DROPS: DropItem[] = [
  {
    dropNumber: '04',
    title: 'A NEW STATE OF EVERYDAY WEAR',
    season: 'AUTUMN / WINTER 2026',
    releaseDate: 'SEPTEMBER 2026',
    itemCount: 12,
    heroImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1600&auto=format&fit=crop',
    description: '12 limited release silhouettes engineered with 240 GSM pure cotton, drop shoulder architecture, and high-density industrial prints.',
    slug: 'drop-04',
  },
  {
    dropNumber: '03',
    title: 'SHADOW & FORM',
    season: 'MONSOON 2026',
    releaseDate: 'JULY 2026',
    itemCount: 8,
    heroImage: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1600&auto=format&fit=crop',
    description: 'Explorations in deep monochrome and architectural tailoring. Featuring oversized zip hoodies and cargo pants.',
    slug: 'drop-03',
  },
  {
    dropNumber: '02',
    title: 'RAW SIGNAL // ZERO NOISE',
    season: 'SUMMER 2026',
    releaseDate: 'APRIL 2026',
    itemCount: 10,
    heroImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop',
    description: 'High-contrast graphic garments with acid wash textures and heavy draping. Built to be noticed.',
    slug: 'drop-02',
  },
  {
    dropNumber: '01',
    title: 'GENESIS // FOUNDATION',
    season: 'SPRING 2026',
    releaseDate: 'JANUARY 2026',
    itemCount: 6,
    heroImage: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1600&auto=format&fit=crop',
    description: 'The debut Oktopus capsule. Core oversized tees and heavyweight fleece establishing our design DNA.',
    slug: 'drop-01',
  },
];

export const STOREFRONT_COLLECTIONS: CollectionItem[] = [
  {
    id: 'col-dark',
    slug: 'dark',
    title: 'DARK',
    subtitle: 'SHADOW SILHOUETTES',
    description: 'Monochrome heavyweights built with zero compromise and minimal branding.',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
    badge: 'CORE',
    itemCount: 8,
    signal: 'DARK',
  },
  {
    id: 'col-graphic',
    slug: 'graphic',
    title: 'GRAPHIC',
    subtitle: 'HIGH DEFINITION INK',
    description: 'Puff-printed, high-density screen graphics inspired by underground culture.',
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop',
    badge: 'TRENDING',
    itemCount: 14,
    signal: 'LOUD',
  },
  {
    id: 'col-raw',
    slug: 'raw',
    title: 'RAW',
    subtitle: 'TEXTURE & STRUCTURE',
    description: 'Unfinished hems, acid-wash textures, and relaxed draping designed for raw expression.',
    imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000&auto=format&fit=crop',
    badge: 'LIMITED',
    itemCount: 6,
    signal: 'RAW',
  },
  {
    id: 'col-archive',
    slug: 'archive',
    title: 'ARCHIVE',
    subtitle: 'VAULTED EDITIONS',
    description: 'Previous limited drops and archived pieces preserved in our permanent catalog.',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
    badge: 'VAULT',
    itemCount: 12,
    signal: 'MINIMAL',
  },
];

export const SIGNALS: { name: SignalType; label: string; tag: string; description: string }[] = [
  { name: 'RAW', label: 'RAW', tag: 'Uncut & Textured', description: 'Raw hems, wash variations, and natural heavyweight drape.' },
  { name: 'DARK', label: 'DARK', tag: 'Pure Monochrome', description: 'Black on black, pitch textures, brutalist minimalism.' },
  { name: 'LOUD', label: 'LOUD', tag: 'High Voltage', description: 'Bold statement typography, high-definition screen prints.' },
  { name: 'MINIMAL', label: 'MINIMAL', tag: 'Quiet Precision', description: 'Subtle micro-branding, engineered fits, clean seams.' },
  { name: 'CHAOTIC', label: 'CHAOTIC', tag: 'Deconstructed', description: 'Collage art, asymmetry, and unconventional proportions.' },
  { name: 'UNKNOWN', label: 'UNKNOWN', tag: 'Limited Experiments', description: 'Experimental one-off batches and unreleased prototypes.' },
];

export const TECHNICAL_SPECS = [
  {
    number: '01',
    title: 'HEAVYWEIGHT 240 GSM',
    subtitle: 'DENSE STRUCTURE // BETTER DRAPE',
    description: 'Crafted from high-density 240 GSM combed cotton. Provides a substantial hand-feel, structural drape, and zero body cling.',
  },
  {
    number: '02',
    title: 'OVERSIZED ENGINEERED FIT',
    subtitle: 'DROP SHOULDER SILHOUETTE',
    description: 'Precision drop-shoulder cut with relaxed chest and elongated sleeves designed for modern streetwear proportions.',
  },
  {
    number: '03',
    title: 'HIGH DEFINITION GRAPHICS',
    subtitle: 'PUFF & SCREEN HYBRID PRINTS',
    description: 'Screen-printed using crack-resistant, eco-friendly inks that retain their vibrancy and razor-sharp clarity after 50+ wash cycles.',
  },
  {
    number: '04',
    title: 'BUILT FOR REPEAT WEAR',
    subtitle: 'BIO-WASHED & PRE-SHRUNK',
    description: 'Pre-shrunk bio-wash treatment ensures soft touch, zero collar sag, and dimensional stability wash after wash.',
  },
];

export const OKTOPUS_UNIFORM_PIECES = [
  {
    id: 'uniform-tee',
    role: 'LAYER 01',
    name: 'DROP 04 OVERSIZED HEAVY TEE',
    price: 1799,
    imageUrl: 'https://m.media-amazon.com/images/X/bxt1/M/Ebxt1BRRIJUjrNQ.jpg',
  },
  {
    id: 'uniform-cargo',
    role: 'LAYER 02',
    name: 'UTILITY PARACHUTE CARGO',
    price: 2499,
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'uniform-cap',
    role: 'LAYER 03',
    name: 'SIGNAL EMBROIDERED CAP',
    price: 899,
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop',
  },
];

export const STOREFRONT_FAQS = [
  {
    category: 'PRODUCT',
    question: 'How does the oversized fit compare to standard sizing?',
    answer: 'All Oktopus garments are designed with an engineered oversized fit featuring dropped shoulders and a wider chest. If you prefer a relaxed streetwear look, choose your true size. If you want a standard, closer-to-body fit, size down one size.',
  },
  {
    category: 'FABRIC',
    question: 'What is the fabric composition and GSM?',
    answer: 'Our tees and hoodies are crafted from 100% long-staple combed cotton ranging from 240 GSM (t-shirts) to 420 GSM (heavyweight fleece hoodies), delivering a dense hand-feel and long-lasting durability.',
  },
  {
    category: 'CARE',
    question: 'How should I care for my Oktopus garments?',
    answer: 'Machine wash cold (30°C or below) inside out with like colors. Do not bleach. Tumble dry on low or hang dry in shade for best longevity. Do not iron directly on printed graphics.',
  },
  {
    category: 'SHIPPING',
    question: 'What are the delivery charges and delivery times?',
    answer: 'Orders above ₹999 qualify for FREE standard delivery across India. Standard orders below ₹999 incur a flat delivery charge of ₹100. Deliveries generally arrive in 3 to 7 business days depending on location.',
  },
  {
    category: 'RETURNS',
    question: 'What is the return and exchange policy?',
    answer: 'We accept returns and replacements exclusively in cases of transit damage, manufacturing defects, or wrong item shipped. A mandatory uncut continuous unboxing video within 24–48 hours of delivery is required.',
  },
];

export const SOCIAL_GALLERY_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    handle: '@oktopus.wear',
    caption: 'DROP 04 IN BANGALORE',
  },
  {
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    handle: '@signal.okto',
    caption: 'HEAVYWEIGHT 240 GSM',
  },
  {
    url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop',
    handle: '@wear_unusual',
    caption: 'DROP SHOULDER SILHOUETTE',
  },
  {
    url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800&auto=format&fit=crop',
    handle: '@oktopus.club',
    caption: 'CALM AADMI OVERSIZED',
  },
  {
    url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop',
    handle: '@street.okto',
    caption: 'DARK SIGNALS',
  },
  {
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
    handle: '@oktopus_official',
    caption: 'NOT BASIC // BUILT DIFFERENT',
  },
];

export const SEED_STOREFRONT_PRODUCTS: StorefrontProduct[] = [
  {
    id: '68ab4f0593d6e024bf740533',
    slug: 'sky-blue-premium-oversized-t-shirt',
    name: 'SKY BLUE PREMIUM OVERSIZED TEE',
    subtitle: 'DROP 04 // 240 GSM COMBED COTTON',
    price: 1799,
    compareAtPrice: 2199,
    badge: 'DROP 04',
    colors: [
      { name: 'Sky Blue', hex: '#7EB8DA', inStock: true },
      { name: 'Charcoal Black', hex: '#111111', inStock: true },
      { name: 'Bone White', hex: '#F3F0E8', inStock: true },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://m.media-amazon.com/images/X/bxt1/M/Ebxt1BRRIJUjrNQ.jpg',
      'https://m.media-amazon.com/images/X/bxt1/M/ebxt1R-RWB7sYZa.png',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    ],
    collectionIds: ['drop-04', 'graphic', 'oversized'],
    tags: ['Tee', 'Oversized', 'Drop 04', 'Heavyweight', 'Graphic'],
    signal: 'LOUD',
    fit: 'Oversized / Engineered Drop Shoulder',
    fabric: '100% Combed Cotton',
    gsm: 240,
    print: 'High Definition Screen & Puff Hybrid',
    finish: 'Bio-Washed & Pre-Shrunk',
    care: 'Cold Wash / Inside Out / Hang Dry',
    description: 'An oversized silhouette engineered with a 240 GSM combed cotton base and high-density industrial chest and back graphics. Dropped shoulders create a structured streetwear drape.',
    available: true,
    stock: 24,
    featured: true,
    isHero: true,
  },
  {
    id: '693b3c46f59b69ee5715c805',
    slug: 'premium-black-hoodie-pure-cotton',
    name: 'PREMIUM BLACK HEAVYWEIGHT HOODIE',
    subtitle: 'FLEECE 400 GSM // PURE COTTON',
    price: 2499,
    compareAtPrice: 2999,
    badge: 'BESTSELLER',
    colors: [
      { name: 'Washed Black', hex: '#161616', inStock: true },
      { name: 'Dark Slate', hex: '#26282B', inStock: true },
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    images: [
      'https://i.ibb.co/zTqttpgJ/hoodie-test-1-1.png',
      'https://i.ibb.co/9kfH1W1G/sw-1-1.png',
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1200&auto=format&fit=crop',
    ],
    collectionIds: ['dark', 'oversized', 'drop-04'],
    tags: ['Hoodie', 'Heavyweight', 'Bestseller', 'Dark'],
    signal: 'DARK',
    fit: 'Relaxed Streetwear Hoodie',
    fabric: '100% Combed Cotton Fleece',
    gsm: 400,
    print: 'Tone-on-tone puff embroidery',
    finish: 'Enzyme Washed',
    care: 'Machine Wash Cold / Do Not Iron Embroidery',
    description: 'Heavyweight 400 GSM fleece hoodie built for cold climates and structured layering. Generous hood with clean hidden cord construction and deep kangaroo pouch.',
    available: true,
    stock: 18,
    featured: true,
  },
  {
    id: '68ab4f0593d6e024bf74051d',
    slug: 'calm-aadmi-printed-premium-oversized-tshirt',
    name: 'CALM AADMI STATEMENT OVERSIZED TEE',
    subtitle: 'DROP 03 ARCHIVE // 240 GSM',
    price: 1599,
    compareAtPrice: 1999,
    badge: 'LIMITED',
    colors: [
      { name: 'Vintage Off-Black', hex: '#1F1F1F', inStock: true },
      { name: 'Raw Bone', hex: '#EBE7DE', inStock: true },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://m.media-amazon.com/images/X/bxt1/M/Hbxt1hUqg9QN2g9.png',
      'https://m.media-amazon.com/images/X/bxt1/M/Ebxt1BRRIJUjrNQ.jpg',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1200&auto=format&fit=crop',
    ],
    collectionIds: ['raw', 'graphic', 'archive'],
    tags: ['Tee', 'Oversized', 'Calm Aadmi', 'Archive'],
    signal: 'CALM',
    fit: 'Drop Shoulder Oversized',
    fabric: '100% Pure Cotton',
    gsm: 240,
    print: 'Micro Puff Screen Print',
    finish: 'Bio-Washed',
    care: 'Cold Gentle Cycle / Dry Flat',
    description: 'Our iconic "Calm Aadmi" print captured in a muted industrial aesthetic. 240 GSM pure cotton with thick 1-inch rib collar that will never lose its shape.',
    available: true,
    stock: 12,
    featured: true,
  },
  {
    id: '68ab4f0593d6e024bf740518',
    slug: 'black-oversized-hulk-printed-graphics-t-shirt',
    name: 'TITAN GRAPHIC OVERSIZED T-SHIRT',
    subtitle: 'DROP 04 INDUSTRIAL EDITION',
    price: 1699,
    compareAtPrice: 2099,
    badge: 'NEW',
    colors: [
      { name: 'Pitch Black', hex: '#0D0D0D', inStock: true },
      { name: 'Electric Lime Accent', hex: '#0F824B', inStock: true },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://m.media-amazon.com/images/X/bxt1/M/ebxt1R-RWB7sYZa.png',
      'https://i.ibb.co/zTqttpgJ/hoodie-test-1-1.png',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    ],
    collectionIds: ['graphic', 'dark', 'drop-04'],
    tags: ['Tee', 'Graphic', 'Drop 04', 'New Arrival'],
    signal: 'CHAOTIC',
    fit: 'Engineered Drop Shoulder',
    fabric: '100% Heavy Cotton',
    gsm: 240,
    print: 'High Density 8-Color Silk Screen',
    finish: 'Silicon Soft Wash',
    care: 'Cold Wash / Dry in Shade',
    description: 'Deconstructed back graphic statement tee featuring our signature neon typography and industrial framing. Bio-washed for a velvet-soft surface touch.',
    available: true,
    stock: 30,
    featured: true,
  },
];

export function toStorefrontProduct(p: DbProduct): StorefrontProduct {
  const slug = p.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const compareAtPrice = p.originalPrice || (p.price ? Math.round(p.price * 1.25) : undefined);
  const images = (p.imageUrls && p.imageUrls.length > 0)
    ? p.imageUrls
    : ['https://m.media-amazon.com/images/X/bxt1/M/Ebxt1BRRIJUjrNQ.jpg'];

  const colors = (p.colors && p.colors.length > 0)
    ? p.colors.map((c: string) => {
        let hex = '#111111';
        const clow = c.toLowerCase();
        if (clow.includes('blue')) hex = '#7EB8DA';
        else if (clow.includes('white')) hex = '#F3F0E8';
        else if (clow.includes('lime') || clow.includes('green')) hex = '#0F824B';
        else if (clow.includes('grey') || clow.includes('gray')) hex = '#8B8B86';
        else if (clow.includes('red')) hex = '#CB2222';
        return { name: c, hex, inStock: true };
      })
    : [{ name: 'Black', hex: '#111111', inStock: true }];

  const sizes = (p.sizes && p.sizes.length > 0)
    ? p.sizes
    : ['S', 'M', 'L', 'XL', 'XXL'];

  // Infer badge
  let badge: string | undefined = undefined;
  if (p.isHero) badge = 'DROP 04';
  else if (p.featured) badge = 'BESTSELLER';
  else if (p.stock !== undefined && p.stock < 10) badge = 'LOW STOCK';

  return {
    id: p.id || p._id || '',
    slug,
    name: p.name,
    subtitle: 'DROP 04 // 240 GSM COMBED COTTON',
    price: p.price,
    compareAtPrice,
    badge,
    colors,
    sizes,
    images,
    collectionIds: p.category || ['drop-04'],
    tags: p.category || [],
    signal: 'DARK',
    fit: 'Oversized / Engineered Drop Shoulder',
    fabric: '100% Combed Cotton',
    gsm: 240,
    print: 'High Definition Screen Print',
    finish: 'Bio-Washed & Pre-Shrunk',
    care: 'Cold Wash / Inside Out',
    description: p.description || 'An oversized silhouette engineered with a 240 GSM combed cotton base. Dropped shoulders create a relaxed streetwear drape.',
    available: p.stock === undefined || p.stock > 0,
    stock: p.stock,
    featured: p.featured,
    isHero: p.isHero,
  };
}
