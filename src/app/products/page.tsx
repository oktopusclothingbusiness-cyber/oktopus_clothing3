'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { StorefrontHeader } from '@/components/storefront/header';
import { StorefrontFooter } from '@/components/storefront/footer';
import { MobileFooter } from '@/components/mobile-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProduct, Product as DBProduct } from '@/context/product-context';
import { useCategory } from '@/context/category-context';
import { SlidersHorizontal, ChevronDown, ChevronUp, X, Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Structured Product Data Model
export type Product = {
  id: string;
  slug: string;
  name: string;
  variantName: string;
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
  badge?: string;
  images: string[];
  sizes: string[];
  available: boolean;
  collections: string[];
  createdAt?: string;
  salesCount?: number;
};

export type ProductFilters = {
  availability: boolean;
  minPrice?: number;
  maxPrice?: number;
  sizes: string[];
};

export type SortOption =
  | 'featured'
  | 'relevant'
  | 'best_selling'
  | 'title_asc'
  | 'title_desc'
  | 'price_asc'
  | 'price_desc'
  | 'date_asc'
  | 'date_desc';

const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    slug: 'unusual-identity-heavyweight-tee',
    name: 'Unusual Identity Heavyweight Tee',
    variantName: '240 GSM COMBED COTTON',
    price: 1299,
    compareAtPrice: 1999,
    discountPercent: 35,
    badge: 'Bestseller',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    available: true,
    collections: ['heavyweight-tees', 'all-products', 'bestsellers'],
    createdAt: '2026-01-10',
    salesCount: 420,
  },
  {
    id: 'prod-02',
    slug: 'signal-oversized-graphic-tee',
    name: 'Signal Oversized Graphic Tee',
    variantName: '240 GSM COMBED COTTON',
    price: 1499,
    compareAtPrice: 2199,
    discountPercent: 31,
    badge: 'Trending',
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    available: true,
    collections: ['heavyweight-tees', 'all-products', 'trending'],
    createdAt: '2026-02-01',
    salesCount: 310,
  },
  {
    id: 'prod-03',
    slug: 'drop-04-acid-washed-box-tee',
    name: 'Drop 04 Acid Washed Box Tee',
    variantName: '260 GSM VINTAGE COTTON',
    price: 1699,
    compareAtPrice: 2499,
    discountPercent: 32,
    badge: 'New Arrival',
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    available: true,
    collections: ['heavyweight-tees', 'all-products', 'new-arrivals'],
    createdAt: '2026-02-15',
    salesCount: 190,
  },
  {
    id: 'prod-04',
    slug: 'oktopus-uniform-heavyweight-hoodie',
    name: 'Oktopus Uniform Heavyweight Hoodie',
    variantName: '400 GSM FLEECE COTTON',
    price: 2999,
    compareAtPrice: 3999,
    discountPercent: 25,
    badge: 'Bestseller',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=800&auto=format&fit=crop',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    available: true,
    collections: ['hoodies', 'all-products', 'bestsellers'],
    createdAt: '2026-01-05',
    salesCount: 510,
  },
  {
    id: 'prod-05',
    slug: 'monochrome-cyber-graphic-tee',
    name: 'Monochrome Cyber Graphic Tee',
    variantName: '240 GSM COMBED COTTON',
    price: 1399,
    compareAtPrice: 1999,
    discountPercent: 30,
    badge: 'Trending',
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    available: true,
    collections: ['heavyweight-tees', 'all-products', 'trending'],
    createdAt: '2026-01-20',
    salesCount: 280,
  },
  {
    id: 'prod-06',
    slug: 'raw-edge-drop-shoulder-tee',
    name: 'Raw Edge Drop Shoulder Tee',
    variantName: '240 GSM HEAVYWEIGHT COTTON',
    price: 1199,
    compareAtPrice: 1799,
    discountPercent: 33,
    badge: 'New Arrival',
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',
    ],
    sizes: ['M', 'L', 'XL'],
    available: true,
    collections: ['heavyweight-tees', 'all-products', 'new-arrivals'],
    createdAt: '2026-02-18',
    salesCount: 140,
  },
  {
    id: 'prod-07',
    slug: 'tactical-oversized-zip-hoodie',
    name: 'Tactical Oversized Zip Hoodie',
    variantName: '420 GSM TERRY FLEECE',
    price: 3499,
    compareAtPrice: 4499,
    discountPercent: 22,
    badge: 'Bestseller',
    images: [
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    available: true,
    collections: ['hoodies', 'all-products', 'bestsellers'],
    createdAt: '2025-12-15',
    salesCount: 460,
  },
  {
    id: 'prod-08',
    slug: 'essential-blackout-heavy-tee',
    name: 'Essential Blackout Heavy Tee',
    variantName: '240 GSM COMBED COTTON',
    price: 1099,
    compareAtPrice: 1599,
    discountPercent: 31,
    badge: undefined,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    available: true,
    collections: ['heavyweight-tees', 'all-products'],
    createdAt: '2025-11-20',
    salesCount: 610,
  },
  {
    id: 'prod-09',
    slug: 'rebel-graphic-heavy-tee',
    name: 'Rebel Graphic Heavy Tee',
    variantName: '240 GSM COMBED COTTON',
    price: 1349,
    compareAtPrice: 1899,
    discountPercent: 29,
    badge: 'Trending',
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    available: true,
    collections: ['heavyweight-tees', 'all-products', 'trending'],
    createdAt: '2026-01-28',
    salesCount: 230,
  },
  {
    id: 'prod-10',
    slug: 'distressed-vintage-box-tee',
    name: 'Distressed Vintage Box Tee',
    variantName: '260 GSM VINTAGE COTTON',
    price: 1599,
    compareAtPrice: 2299,
    discountPercent: 30,
    badge: 'New Arrival',
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
    ],
    sizes: ['M', 'L', 'XL'],
    available: true,
    collections: ['heavyweight-tees', 'all-products', 'new-arrivals'],
    createdAt: '2026-02-10',
    salesCount: 160,
  },
  {
    id: 'prod-11',
    slug: 'core-logo-pullover-hoodie',
    name: 'Core Logo Pullover Hoodie',
    variantName: '380 GSM HEAVY FLEECE',
    price: 2799,
    compareAtPrice: 3699,
    discountPercent: 24,
    badge: 'Bestseller',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=800&auto=format&fit=crop',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    available: true,
    collections: ['hoodies', 'all-products', 'bestsellers'],
    createdAt: '2026-01-02',
    salesCount: 390,
  },
  {
    id: 'prod-12',
    slug: 'stealth-black-oversized-tee',
    name: 'Stealth Black Oversized Tee',
    variantName: '240 GSM COMBED COTTON',
    price: 1199,
    compareAtPrice: 1699,
    discountPercent: 29,
    badge: undefined,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    available: true,
    collections: ['heavyweight-tees', 'all-products'],
    createdAt: '2025-10-15',
    salesCount: 520,
  },
];

// Product Card exact component for YAWI catalog format
function CatalogProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = React.useState(false);
  const images = (product.images || []).filter((u: string) => typeof u === 'string' && u.length > 0);
  const image1 = images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518';
  const image2 = images[1] || image1;

  const price = product.price || 0;
  const compareAtPrice = product.compareAtPrice;
  const discountPercent =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : product.discountPercent || null;

  return (
    <Link href={`/products/${product.id}`} className="group block text-left font-sans">
      {/* 4:5 Card Container */}
      <div
        className="relative aspect-[4/5] w-full overflow-hidden bg-[#121212] rounded-md border border-white/10 group-hover:border-[#0F824B]/60 transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={image1}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-all duration-500 ease-out ${
            isHovered && image2 !== image1 ? 'opacity-0 scale-100' : 'opacity-100 scale-100 group-hover:scale-105'
          }`}
          unoptimized
        />
        {image2 !== image1 && (
          <Image
            src={image2}
            alt={`${product.name} alternate`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-all duration-500 ease-out absolute inset-0 ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
            unoptimized
          />
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none z-10">
          {product.badge && (
            <span className="text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 bg-[#0A0A0A] text-white border border-white/20 rounded uppercase">
              {product.badge}
            </span>
          )}
          {discountPercent ? (
            <span className="text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 bg-[#0F824B] text-white rounded uppercase">
              -{discountPercent}%
            </span>
          ) : null}
        </div>
      </div>

      {/* Card Info Details */}
      <div className="pt-2.5 pb-1 flex flex-col space-y-0.5">
        <h3 className="text-xs md:text-sm font-bebas font-bold uppercase tracking-wide text-white group-hover:text-[#0F824B] transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-[11px] font-mono text-zinc-400 line-clamp-1 uppercase">
          {product.variantName || '240 GSM COMBED COTTON'}
        </p>
        <div className="flex items-center gap-2 pt-0.5 font-mono text-xs md:text-sm">
          <span className="font-bold text-white">
            ₹{price.toLocaleString('en-IN')}
          </span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-zinc-500 line-through text-xs">
              ₹{compareAtPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function ProductsCatalogContent() {
  const { products: dbProducts, loading: dbLoading } = useProduct();
  const searchParams = useSearchParams();
  const router = useRouter();

  // State Management
  const [activeCategory, setActiveCategory] = React.useState<string>('all');
  const [filterPanelOpen, setFilterPanelOpen] = React.useState<boolean>(false);
  const [visibleCount, setVisibleCount] = React.useState<number>(8);
  const [sortOption, setSortOption] = React.useState<SortOption>('featured');

  // Filters State
  const [filters, setFilters] = React.useState<ProductFilters>({
    availability: false,
    minPrice: undefined,
    maxPrice: undefined,
    sizes: [],
  });

  // URL State sync
  const categoryParam = searchParams.get('category') || 'all';
  const sortParam = (searchParams.get('sort') as SortOption) || 'featured';

  React.useEffect(() => {
    if (categoryParam) setActiveCategory(categoryParam);
    if (sortParam) setSortOption(sortParam);
  }, [categoryParam, sortParam]);

  // Combine database products with fallback seed data
  const allProducts = React.useMemo<Product[]>(() => {
    if (dbProducts && dbProducts.length > 0) {
      const converted: Product[] = dbProducts.map((db, idx) => ({
        id: db.id || (db as any)._id?.toString() || `db-${idx}`,
        slug: (db.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: db.name || 'Unnamed Streetwear Piece',
        variantName: db.category?.[0] || '240 GSM COMBED COTTON',
        price: db.price || 0,
        compareAtPrice: db.originalPrice && db.originalPrice > db.price ? db.originalPrice : undefined,
        discountPercent: db.discountPercentage,
        badge: db.isHero || db.featured ? 'Bestseller' : idx % 3 === 0 ? 'Trending' : idx % 2 === 0 ? 'New Arrival' : undefined,
        images: (db.imageUrls && db.imageUrls.length > 0) ? db.imageUrls : [SEED_PRODUCTS[idx % SEED_PRODUCTS.length].images[0]],
        sizes: db.sizes && db.sizes.length > 0 ? db.sizes : ['S', 'M', 'L', 'XL'],
        available: typeof db.stock === 'number' ? db.stock > 0 : true,
        collections: db.category || ['all-products'],
        createdAt: db.createdAt || '2026-01-01',
        salesCount: 100 + idx * 25,
      }));
      return converted;
    }
    return SEED_PRODUCTS;
  }, [dbProducts]);

  // Category Filtering
  const categoryFiltered = React.useMemo(() => {
    if (activeCategory === 'all' || activeCategory === 'all-products') {
      return allProducts;
    }
    if (activeCategory === 'new-arrivals') {
      return allProducts.filter((p) => p.badge === 'New Arrival' || p.collections.includes('new-arrivals'));
    }
    if (activeCategory === 'bestsellers') {
      return allProducts.filter((p) => p.badge === 'Bestseller' || p.collections.includes('bestsellers'));
    }
    if (activeCategory === 'trending') {
      return allProducts.filter((p) => p.badge === 'Trending' || p.collections.includes('trending'));
    }
    return allProducts.filter(
      (p) =>
        p.collections.some((c) => c.toLowerCase() === activeCategory.toLowerCase()) ||
        p.variantName.toLowerCase().includes(activeCategory.toLowerCase())
    );
  }, [allProducts, activeCategory]);

  // Filter Panel Filtering
  const filteredProducts = React.useMemo(() => {
    let result = [...categoryFiltered];

    if (filters.availability) {
      result = result.filter((p) => p.available);
    }
    if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
      result = result.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
      result = result.filter((p) => p.price <= filters.maxPrice!);
    }
    if (filters.sizes.length > 0) {
      result = result.filter((p) => p.sizes.some((sz) => filters.sizes.includes(sz)));
    }

    // Sort Options
    return result.sort((a, b) => {
      if (sortOption === 'title_asc') return a.name.localeCompare(b.name);
      if (sortOption === 'title_desc') return b.name.localeCompare(a.name);
      if (sortOption === 'price_asc') return a.price - b.price;
      if (sortOption === 'price_desc') return b.price - a.price;
      if (sortOption === 'date_asc') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      if (sortOption === 'date_desc') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (sortOption === 'best_selling') return (b.salesCount || 0) - (a.salesCount || 0);
      if (sortOption === 'relevant') return (b.discountPercent || 0) - (a.discountPercent || 0);
      // Featured default
      return (b.compareAtPrice ? 1 : 0) - (a.compareAtPrice ? 1 : 0);
    });
  }, [categoryFiltered, filters, sortOption]);

  const displayedProducts = React.useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.availability) count++;
    if (filters.minPrice !== undefined) count++;
    if (filters.maxPrice !== undefined) count++;
    if (filters.sizes.length > 0) count += filters.sizes.length;
    return count;
  }, [filters]);

  const resetFilters = () => {
    setFilters({
      availability: false,
      minPrice: undefined,
      maxPrice: undefined,
      sizes: [],
    });
  };

  const handleSizeToggle = (sz: string) => {
    setFilters((prev) => {
      const exists = prev.sizes.includes(sz);
      return {
        ...prev,
        sizes: exists ? prev.sizes.filter((s) => s !== sz) : [...prev.sizes, sz],
      };
    });
  };

  const updateCategoryUrl = (cat: string) => {
    setActiveCategory(cat);
    setVisibleCount(8);
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', cat);
    router.replace(`/products?${params.toString()}`, { scroll: false });
  };

  const updateSortUrl = (sort: SortOption) => {
    setSortOption(sort);
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    router.replace(`/products?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAF9F6] font-sans antialiased selection:bg-[#0F824B] selection:text-white">
      {/* 1. ANNOUNCEMENT BAR */}
      <AnnouncementBar />

      {/* 2. MAIN NAVIGATION */}
      <StorefrontHeader />

      <main>
        {/* 3 & 4. COLLECTION HEADER & IMAGE */}
        <section className="relative w-full overflow-hidden bg-[#121212] border-b border-white/10">
          <div className="relative w-full aspect-[3.5/1] min-h-[220px] max-h-[360px] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2000&auto=format&fit=crop"
              alt="Oktopus All Products Collection Banner"
              fill
              priority
              className="object-cover object-center brightness-75 contrast-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
          </div>

          {/* 5. COLLECTION TITLE */}
          <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 -mt-16 pb-6 text-left">
            <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#0F824B] uppercase block mb-1">
              // OKTOPUS CATALOGUE
            </span>
            <h1 className="text-4xl md:text-6xl font-bebas font-black uppercase tracking-tight text-white leading-none">
              ALL PRODUCTS
            </h1>
          </div>

          {/* 6. CATEGORY NAVIGATION (HORIZONTAL TEXT/LINK PILLS) */}
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 pb-6 border-t border-white/10 pt-4 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-6 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 whitespace-nowrap">
              <button
                onClick={() => updateCategoryUrl('all')}
                className={cn(
                  'transition-colors py-1 border-b-2',
                  activeCategory === 'all'
                    ? 'text-white border-[#0F824B]'
                    : 'border-transparent hover:text-white'
                )}
              >
                ALL PRODUCTS
              </button>
              <button
                onClick={() => updateCategoryUrl('new-arrivals')}
                className={cn(
                  'transition-colors py-1 border-b-2',
                  activeCategory === 'new-arrivals'
                    ? 'text-white border-[#0F824B]'
                    : 'border-transparent hover:text-white'
                )}
              >
                NEW ARRIVAL
              </button>
              <button
                onClick={() => updateCategoryUrl('bestsellers')}
                className={cn(
                  'transition-colors py-1 border-b-2',
                  activeCategory === 'bestsellers'
                    ? 'text-white border-[#0F824B]'
                    : 'border-transparent hover:text-white'
                )}
              >
                BESTSELLER
              </button>
              <button
                onClick={() => updateCategoryUrl('trending')}
                className={cn(
                  'transition-colors py-1 border-b-2',
                  activeCategory === 'trending'
                    ? 'text-white border-[#0F824B]'
                    : 'border-transparent hover:text-white'
                )}
              >
                TRENDING
              </button>
              <button
                onClick={() => updateCategoryUrl('heavyweight-tees')}
                className={cn(
                  'transition-colors py-1 border-b-2',
                  activeCategory === 'heavyweight-tees'
                    ? 'text-white border-[#0F824B]'
                    : 'border-transparent hover:text-white'
                )}
              >
                HEAVYWEIGHT TEES
              </button>
              <button
                onClick={() => updateCategoryUrl('hoodies')}
                className={cn(
                  'transition-colors py-1 border-b-2',
                  activeCategory === 'hoodies'
                    ? 'text-white border-[#0F824B]'
                    : 'border-transparent hover:text-white'
                )}
              >
                HOODIES
              </button>
              <Link
                href="/custom-design"
                className="text-[#0F824B] hover:underline py-1"
              >
                CUSTOM STUDIO
              </Link>
            </div>
          </div>
        </section>

        {/* 7. FILTER / SORT TOOLBAR */}
        <section className="sticky top-16 z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10 py-3.5">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between gap-4 font-mono text-xs">
            {/* LEFT: Show Filter / Filter Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFilterPanelOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#121212] hover:bg-zinc-800 border border-white/10 text-white rounded-xs transition-colors font-bold uppercase"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#0F824B]" />
                <span>{filterPanelOpen ? 'HIDE FILTER' : 'SHOW FILTER'}</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 bg-[#0F824B] text-white text-[10px] px-1.5 py-0.2 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-zinc-400 hover:text-white underline text-[11px] uppercase font-bold"
                >
                  RESET
                </button>
              )}
            </div>

            {/* RIGHT: Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 hidden sm:inline uppercase">SORT BY:</span>
              <select
                value={sortOption}
                onChange={(e) => updateSortUrl(e.target.value as SortOption)}
                className="bg-[#121212] border border-white/10 text-white rounded-xs px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#0F824B] uppercase"
              >
                <option value="featured">Featured</option>
                <option value="relevant">Most relevant</option>
                <option value="best_selling">Best selling</option>
                <option value="title_asc">Alphabetically, A-Z</option>
                <option value="title_desc">Alphabetically, Z-A</option>
                <option value="price_asc">Price, low to high</option>
                <option value="price_desc">Price, high to low</option>
                <option value="date_asc">Date, old to new</option>
                <option value="date_desc">Date, new to old</option>
              </select>
            </div>
          </div>

          {/* 8. COLLAPSIBLE FILTER PANEL */}
          {filterPanelOpen && (
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-4 pb-2 border-t border-white/10 mt-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6 text-left">
                {/* Availability Filter */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-mono font-bold text-[#0F824B] uppercase tracking-wider">
                    AVAILABILITY
                  </h4>
                  <label className="flex items-center gap-2 text-xs font-mono text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.availability}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, availability: e.target.checked }))
                      }
                      className="accent-[#0F824B] rounded-xs"
                    />
                    <span>In stock only</span>
                  </label>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-mono font-bold text-[#0F824B] uppercase tracking-wider">
                    PRICE RANGE (₹)
                  </h4>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="From"
                      value={filters.minPrice !== undefined ? filters.minPrice : ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          minPrice: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                      className="h-8 text-xs bg-[#121212] border-white/10 text-white"
                    />
                    <span className="text-zinc-500">-</span>
                    <Input
                      type="number"
                      placeholder="To"
                      value={filters.maxPrice !== undefined ? filters.maxPrice : ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          maxPrice: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                      className="h-8 text-xs bg-[#121212] border-white/10 text-white"
                    />
                  </div>
                </div>

                {/* Size Filter */}
                <div className="space-y-2 sm:col-span-2">
                  <h4 className="text-[11px] font-mono font-bold text-[#0F824B] uppercase tracking-wider">
                    SIZE
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                      const isSelected = filters.sizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          onClick={() => handleSizeToggle(sz)}
                          className={cn(
                            'px-3 py-1 text-xs font-mono font-bold border rounded-xs uppercase transition-colors',
                            isSelected
                              ? 'bg-[#0F824B] text-white border-[#0F824B]'
                              : 'border-white/10 text-zinc-300 hover:border-white/40'
                          )}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 8 & 9. DENSE PRODUCT GRID & LOAD MORE */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-10">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-mono text-zinc-400 uppercase">
              SHOWING {displayedProducts.length} OF {filteredProducts.length} PRODUCTS
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayedProducts.map((product) => (
              <CatalogProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* 10. LOAD MORE PRODUCTS BUTTON */}
          {visibleCount < filteredProducts.length && (
            <div className="pt-12 text-center">
              <Button
                onClick={() => setVisibleCount((prev) => prev + 8)}
                className="bg-[#121212] hover:bg-[#0F824B] text-white border border-white/20 hover:border-[#0F824B] px-8 py-3 text-xs font-mono font-bold uppercase tracking-widest rounded-xs transition-colors shadow-md"
              >
                LOAD MORE PRODUCTS
              </Button>
            </div>
          )}
        </section>

        {/* 10, 11, 12. QUALITY FEATURE SECTIONS */}
        <section className="border-t border-white/10 py-16 bg-[#0E0E0E]">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-16">
            {/* Feature 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 relative aspect-[16/10] rounded-lg overflow-hidden border border-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop"
                  alt="Premium 240 GSM Quality"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="md:col-span-6 text-left space-y-3 md:pl-6">
                <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#0F824B] uppercase">
                  // FEATURE 01
                </span>
                <h3 className="text-3xl md:text-4xl font-bebas font-black uppercase text-white tracking-tight">
                  PREMIUM 240 GSM HEAVYWEIGHT COTTON
                </h3>
                <p className="text-xs md:text-sm font-mono text-zinc-400 leading-relaxed max-w-lg">
                  Engineered with 100% combed cotton featuring structured drop-shoulder geometry and dense knitting that preserves form after repeated wear and wash cycles.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 md:order-2 relative aspect-[16/10] rounded-lg overflow-hidden border border-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop"
                  alt="Made to Express You"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="md:col-span-6 md:order-1 text-left space-y-3 md:pr-6">
                <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#0F824B] uppercase">
                  // FEATURE 02
                </span>
                <h3 className="text-3xl md:text-4xl font-bebas font-black uppercase text-white tracking-tight">
                  ENGINEERED TO EXPRESS YOU
                </h3>
                <p className="text-xs md:text-sm font-mono text-zinc-400 leading-relaxed max-w-lg">
                  Unapologetic boxy cuts tailored for movement and presence. Designed specifically for individuals who refuse to compromise on identity or utility.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 relative aspect-[16/10] rounded-lg overflow-hidden border border-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=1200&auto=format&fit=crop"
                  alt="High-Definition Artwork Prints"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="md:col-span-6 text-left space-y-3 md:pl-6">
                <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#0F824B] uppercase">
                  // FEATURE 03
                </span>
                <h3 className="text-3xl md:text-4xl font-bebas font-black uppercase text-white tracking-tight">
                  HIGH-DEFINITION ARTWORK PRINTS
                </h3>
                <p className="text-xs md:text-sm font-mono text-zinc-400 leading-relaxed max-w-lg">
                  Precision screen-printed and DTG graphic hits that hold sharp contrast, deep saturation, and clean lines without cracking or fading.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 13. CLOSING BRAND STATEMENT */}
        <section className="border-t border-b border-white/10 py-16 bg-[#0A0A0A] text-center">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-4">
            <span className="text-xs font-mono font-bold tracking-[0.3em] text-[#0F824B] uppercase block">
              // OKTOPUS CLOTHING
            </span>
            <h2 className="text-3xl md:text-5xl font-bebas font-black uppercase tracking-wider text-white max-w-3xl mx-auto">
              WEAR THE UNUSUAL. BUILT FOR IDENTITY.
            </h2>
            <p className="text-xs md:text-sm font-mono text-zinc-400 max-w-xl mx-auto leading-relaxed uppercase">
              Streetwear crafted for expression, heavy utility, and 240+ GSM premium comfort.
            </p>
          </div>
        </section>
      </main>

      {/* 14. FOOTER */}
      <StorefrontFooter />
      <MobileFooter />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-white font-mono text-xs">Loading Catalog...</div>}>
      <ProductsCatalogContent />
    </React.Suspense>
  );
}
