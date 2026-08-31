'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileFooter } from '@/components/mobile-footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/product-card';
import { useProduct } from '@/context/product-context';
import { useCategory } from '@/context/category-context';
import {
  Search,
  SlidersHorizontal,
  Truck,
  ShieldCheck,
  RefreshCw,
  Gift,
  ChevronRight,
  ShoppingBag,
  Tag,
  Flame,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function ProductListComponent() {
  const { products, loading: productsLoading } = useProduct();
  const { categories, loading: categoriesLoading } = useCategory();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [priceFilter, setPriceFilter] = React.useState<'all' | 'under999' | '1000to1999' | 'above2000'>('all');
  const [sortOption, setSortOption] = React.useState<'newest' | 'price_asc' | 'price_desc' | 'rating'>('newest');
  const [localSearch, setLocalSearch] = React.useState('');

  const searchQuery = searchParams.get('q');
  const categoryIdParam = searchParams.get('category');

  const loading = productsLoading || categoriesLoading;

  React.useEffect(() => {
    if (categoryIdParam) {
      setSelectedCategory(categoryIdParam);
    }
  }, [categoryIdParam]);

  const activeCategoryName = React.useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find((c) => c.id === selectedCategory)?.name || null;
  }, [selectedCategory, categories]);

  // FILTERED & SORTED PRODUCTS
  const filteredProducts = React.useMemo(() => {
    let result = products.filter((p) => typeof p.stock === 'number' && p.stock > 0);

    // Search Query (URL parameter or Local search input)
    const effectiveSearch = localSearch.trim() || searchQuery || '';
    if (effectiveSearch) {
      const q = effectiveSearch.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          (product.description && product.description.toLowerCase().includes(q))
      );
    }

    // Category Filter
    if (selectedCategory) {
      result = result.filter((product) => product.category && product.category.includes(selectedCategory));
    }

    // Price Range Filter
    if (priceFilter === 'under999') {
      result = result.filter((p) => p.price <= 999);
    } else if (priceFilter === '1000to1999') {
      result = result.filter((p) => p.price >= 1000 && p.price <= 1999);
    } else if (priceFilter === 'above2000') {
      result = result.filter((p) => p.price >= 2000);
    }

    // Sorting
    return [...result].sort((a, b) => {
      if (sortOption === 'price_asc') return a.price - b.price;
      if (sortOption === 'price_desc') return b.price - a.price;
      if (sortOption === 'rating') return (b.rating || 0) - (a.rating || 0);
      // Newest default
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [products, localSearch, searchQuery, selectedCategory, priceFilter, sortOption]);

  // FEATURED HIGHLIGHTS (Top 4 products for spotlight section)
  const featuredProducts = React.useMemo(() => {
    return products.filter((p) => p.featured || p.isHero).slice(0, 4);
  }, [products]);

  const getPageTitle = () => {
    if (searchQuery) return `Search results for "${searchQuery}"`;
    if (activeCategoryName) return `${activeCategoryName} Collection`;
    return 'Premium Collections';
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      {/* SECTION 1: HERO SPOTLIGHT BANNER (REDUCED HEIGHT & COMPACT DISPLAY) */}
      <section className="relative overflow-hidden border-b bg-muted/40 py-6 md:py-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col gap-2">
            {/* BREADCRUMB */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/products" className="hover:text-foreground transition-colors">
                Store
              </Link>
              {activeCategoryName && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-foreground font-bold">{activeCategoryName}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight capitalize">{getPageTitle()}</h1>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Discover premium streetwear, heavyweight essentials, and custom designer apparel.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: INTERACTIVE FILTER & SEARCH STRIP */}
      <section className="sticky top-14 z-30 bg-background/95 backdrop-blur-md border-b py-3">
        <div className="container mx-auto px-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* CATEGORY PILLS FILTER */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full font-medium transition-all shrink-0 border',
                  selectedCategory === null
                    ? 'bg-primary text-primary-foreground font-bold border-primary shadow-xs'
                    : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                All Items
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full font-medium transition-all shrink-0 border',
                    selectedCategory === cat.id
                      ? 'bg-primary text-primary-foreground font-bold border-primary shadow-xs'
                      : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* SEARCH & SORT CONTROLS */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-56">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search apparel..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-lg"
                />
                {localSearch && (
                  <button onClick={() => setLocalSearch('')} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* SORT SELECTOR */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="h-9 px-3 rounded-lg border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* SECONDARY PRICE RANGE PILLS */}
          <div className="flex items-center gap-2 text-xs pt-1">
            <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3" /> Price:
            </span>
            <button
              onClick={() => setPriceFilter('all')}
              className={cn(
                'px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all border',
                priceFilter === 'all' ? 'bg-secondary text-primary font-bold border-primary/40' : 'text-muted-foreground border-transparent hover:bg-secondary'
              )}
            >
              All Prices
            </button>
            <button
              onClick={() => setPriceFilter('under999')}
              className={cn(
                'px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all border',
                priceFilter === 'under999' ? 'bg-secondary text-primary font-bold border-primary/40' : 'text-muted-foreground border-transparent hover:bg-secondary'
              )}
            >
              Under ₹999
            </button>
            <button
              onClick={() => setPriceFilter('1000to1999')}
              className={cn(
                'px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all border',
                priceFilter === '1000to1999' ? 'bg-secondary text-primary font-bold border-primary/40' : 'text-muted-foreground border-transparent hover:bg-secondary'
              )}
            >
              ₹1,000 - ₹1,999
            </button>
            <button
              onClick={() => setPriceFilter('above2000')}
              className={cn(
                'px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all border',
                priceFilter === 'above2000' ? 'bg-secondary text-primary font-bold border-primary/40' : 'text-muted-foreground border-transparent hover:bg-secondary'
              )}
            >
              ₹2,000+
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURED TRENDING SPOTLIGHT */}
      {!selectedCategory && !localSearch && !searchQuery && featuredProducts.length > 0 && (
        <section className="py-6 bg-muted/20 border-b">
          <div className="container mx-auto px-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-bold tracking-tight">Featured Spotlight</h2>
                <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 font-bold">
                  Top Picks
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: MAIN PRODUCTS SHOWCASE GRID */}
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight">
              Catalog Items <span className="text-muted-foreground text-xs font-normal">({filteredProducts.length})</span>
            </h2>
          </div>
        </div>

        {/* DESKTOP VIEW GRID */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden group rounded-xl">
                <Skeleton className="relative aspect-[3/4]" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </Card>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className="col-span-full py-16 text-center space-y-3">
              <Tag className="h-12 w-12 text-muted-foreground/40 mx-auto" />
              <h3 className="text-lg font-bold">No Products Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                We couldn't find any products matching your active filters or search terms.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory(null);
                  setPriceFilter('all');
                  setLocalSearch('');
                }}
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </div>

        {/* MOBILE TOUCH-OPTIMIZED GRID */}
        <div className="md:hidden grid grid-cols-2 gap-3 pb-16">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden rounded-xl">
                <Skeleton className="relative aspect-[3/4]" />
                <div className="p-2 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </Card>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => <ProductCard key={product.id} product={product} isMobile={true} />)
          ) : (
            <div className="col-span-2 py-12 text-center space-y-2">
              <p className="text-sm font-semibold">No products found.</p>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  setSelectedCategory(null);
                  setPriceFilter('all');
                  setLocalSearch('');
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* SECTION 5: TRUST & E-COMMERCE PERKS BAR */}
      <section className="border-t bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-primary/10 text-primary shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold">Free Express Delivery</h4>
                <p className="text-[10px] text-muted-foreground">On all orders above ₹999</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-600 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold">Premium Quality Fabric</h4>
                <p className="text-[10px] text-muted-foreground">100% Cotton & Heavyweight</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-blue-500/10 text-blue-600 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold">100% Secure Checkout</h4>
                <p className="text-[10px] text-muted-foreground">Razorpay, UPI & Cards</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-purple-500/10 text-purple-600 shrink-0">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold">Oktocoin Loyalty Rewards</h4>
                <p className="text-[10px] text-muted-foreground">Earn points on every buy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <MobileFooter />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ProductListComponent />
    </React.Suspense>
  );
}
