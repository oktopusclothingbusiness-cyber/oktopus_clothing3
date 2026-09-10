'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ArrowUpDown, X, Check, ArrowRight } from 'lucide-react';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { StorefrontHeader } from '@/components/storefront/header';
import { StorefrontFooter } from '@/components/storefront/footer';
import { StorefrontProductGrid } from '@/components/storefront/product-grid';
import { useProduct } from '@/context/product-context';
import { SEED_STOREFRONT_PRODUCTS, STOREFRONT_COLLECTIONS, STOREFRONT_DROPS, toStorefrontProduct } from '@/data/storefront-data';
import { StorefrontProduct, SortOption } from '@/types/storefront';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Black', 'Blue', 'White', 'Grey', 'Lime'];
const FITS = ['Oversized', 'Relaxed', 'Drop Shoulder'];

export default function CollectionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = String(params.slug || 'all').toLowerCase();
  const signalParam = searchParams.get('signal');

  const { products: dbProducts, loading } = useProduct();

  // Filters State
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedFit, setSelectedFit] = useState<string>('');
  const [selectedSignal, setSelectedSignal] = useState<string>(signalParam || '');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(3500);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [visibleCount, setVisibleCount] = useState<number>(8);

  useEffect(() => {
    if (signalParam) {
      setSelectedSignal(signalParam);
    }
  }, [signalParam]);

  // Find collection metadata
  const collectionMeta = useMemo(() => {
    if (slug.startsWith('drop-')) {
      const drop = STOREFRONT_DROPS.find((d) => d.slug === slug);
      if (drop) {
        return {
          title: `DROP ${drop.dropNumber}`,
          subtitle: drop.season,
          description: drop.description,
        };
      }
    }
    const col = STOREFRONT_COLLECTIONS.find((c) => c.slug === slug);
    if (col) {
      return {
        title: col.title,
        subtitle: col.subtitle || 'CURATED CAPSULE',
        description: col.description,
      };
    }
    if (slug === 'new-arrivals') {
      return {
        title: 'NEW ARRIVALS',
        subtitle: 'LATEST RELEASES',
        description: 'The newest silhouettes crafted with 240+ GSM pure combed cotton.',
      };
    }
    if (slug === 'bestsellers') {
      return {
        title: 'BEST SELLERS',
        subtitle: 'HIGH ROTATION SILHOUETTES',
        description: 'Our most demanded streetwear garments and staple everyday pieces.',
      };
    }
    return {
      title: 'ALL CATALOG',
      subtitle: 'COMPLETE OKTOPUS CATALOG',
      description: 'Engineered oversized tees, heavyweight fleece, and identity-driven garments.',
    };
  }, [slug]);

  // Merge database products with seed catalog
  const rawProducts = useMemo(() => {
    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map(toStorefrontProduct);
    }
    return SEED_STOREFRONT_PRODUCTS;
  }, [dbProducts]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let list = [...rawProducts];

    // Slug / collection filter
    if (slug !== 'all' && slug !== 'catalog') {
      if (slug === 'bestsellers') {
        list = list.filter((p) => p.featured || p.badge === 'BESTSELLER');
      } else if (slug === 'new-arrivals') {
        list = list.filter((p) => p.badge === 'NEW' || p.badge === 'DROP 04' || p.isHero);
      } else {
        list = list.filter(
          (p) =>
            p.collectionIds.includes(slug) ||
            p.tags.some((t) => t.toLowerCase().includes(slug)) ||
            (p.signal && p.signal.toLowerCase() === slug)
        );
      }
    }

    // Interactive Filters
    if (selectedSize) {
      list = list.filter((p) => p.sizes.includes(selectedSize));
    }
    if (selectedColor) {
      list = list.filter((p) =>
        p.colors.some((c) => c.name.toLowerCase().includes(selectedColor.toLowerCase()))
      );
    }
    if (selectedFit) {
      list = list.filter((p) => (p.fit || '').toLowerCase().includes(selectedFit.toLowerCase()));
    }
    if (selectedSignal) {
      list = list.filter((p) => p.signal === selectedSignal);
    }
    if (inStockOnly) {
      list = list.filter((p) => p.available);
    }
    list = list.filter((p) => p.price <= maxPrice);

    // Sorting
    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => (b.badge === 'NEW' ? 1 : -1));
    } else if (sortBy === 'best_selling') {
      list.sort((a, b) => (b.featured ? 1 : -1));
    }

    return list;
  }, [rawProducts, slug, selectedSize, selectedColor, selectedFit, selectedSignal, inStockOnly, maxPrice, sortBy]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  const clearFilters = () => {
    setSelectedSize('');
    setSelectedColor('');
    setSelectedFit('');
    setSelectedSignal('');
    setInStockOnly(false);
    setMaxPrice(3500);
  };

  const activeFilterCount =
    (selectedSize ? 1 : 0) +
    (selectedColor ? 1 : 0) +
    (selectedFit ? 1 : 0) +
    (selectedSignal ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (maxPrice < 3500 ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAF9F6] font-sans antialiased selection:bg-[#0F824B] selection:text-[#0A0A0A]">
      <AnnouncementBar />
      <StorefrontHeader />

      <main className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12 md:py-20">
        {/* Collection Editorial Header */}
        <div className="space-y-3 mb-12">
          <span className="text-xs font-mono font-bold tracking-[0.3em] text-[#0F824B] uppercase">
            // {collectionMeta.subtitle}
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black uppercase tracking-tight text-white">
            {collectionMeta.title}
          </h1>
          <p className="text-xs sm:text-sm font-mono text-[#8B8B86] uppercase tracking-wider max-w-2xl leading-relaxed">
            {collectionMeta.description}
          </p>
        </div>

        {/* Filter & Sort Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#222222]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#111111] hover:bg-[#1A1A1A] border border-[#292929] hover:border-[#FAF9F6] rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#0F824B]" />
              <span>FILTERS</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#0F824B] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs font-mono text-[#8B8B86] hover:text-[#0F824B] underline uppercase"
              >
                CLEAR ALL
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-[#8B8B86] hidden sm:inline">
              {filteredProducts.length} SILHOUETTES
            </span>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#8B8B86]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-[#111111] border border-[#292929] text-[#FAF9F6] px-3 py-2 rounded-sm text-xs font-mono uppercase focus:border-[#0F824B] outline-none"
              >
                <option value="featured">SORT: FEATURED</option>
                <option value="newest">SORT: NEWEST</option>
                <option value="best_selling">SORT: BEST SELLING</option>
                <option value="price_asc">PRICE: LOW TO HIGH</option>
                <option value="price_desc">PRICE: HIGH TO LOW</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {selectedSize && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141414] border border-[#292929] text-xs font-mono text-[#0F824B] rounded-xs">
                SIZE: {selectedSize}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSize('')} />
              </span>
            )}
            {selectedColor && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141414] border border-[#292929] text-xs font-mono text-[#0F824B] rounded-xs">
                COLOR: {selectedColor}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedColor('')} />
              </span>
            )}
            {selectedSignal && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141414] border border-[#292929] text-xs font-mono text-[#0F824B] rounded-xs">
                SIGNAL: {selectedSignal}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSignal('')} />
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141414] border border-[#292929] text-xs font-mono text-[#0F824B] rounded-xs">
                IN STOCK ONLY
                <X className="w-3 h-3 cursor-pointer" onClick={() => setInStockOnly(false)} />
              </span>
            )}
          </div>
        )}

        {/* Product Grid */}
        <StorefrontProductGrid products={displayedProducts} loading={loading} />

        {/* Load More Button */}
        {displayedProducts.length < filteredProducts.length && (
          <div className="mt-16 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 4)}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#141414] hover:bg-[#FFFFFF] text-[#FAF9F6] hover:text-[#0A0A0A] border border-[#292929] text-xs font-mono font-extrabold uppercase tracking-widest rounded-sm transition-all duration-200 group"
            >
              <span>LOAD MORE SILHOUETTES</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </main>

      {/* Slide-over Filter Drawer */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-start animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setFilterDrawerOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-[#0E0E0E] text-[#FAF9F6] border-r border-[#292929] p-6 flex flex-col justify-between h-full z-10 shadow-2xl overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#222222] mb-6">
                <h3 className="text-base font-display font-extrabold uppercase tracking-wider text-white">
                  FILTERS
                </h3>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="p-1 text-[#8B8B86] hover:text-[#0F824B]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Size Filter */}
              <div className="mb-6">
                <p className="text-xs font-mono font-bold tracking-wider text-[#8B8B86] uppercase mb-3">
                  SIZE
                </p>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize((prev) => (prev === sz ? '' : sz))}
                      className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border rounded-xs transition-all ${
                        selectedSize === sz
                          ? 'bg-[#0F824B] text-white border-[#0F824B]'
                          : 'border-[#292929] text-[#FAF9F6] hover:border-[#0F824B]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div className="mb-6">
                <p className="text-xs font-mono font-bold tracking-wider text-[#8B8B86] uppercase mb-3">
                  COLOR
                </p>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor((prev) => (prev === c ? '' : c))}
                      className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border rounded-xs transition-all ${
                        selectedColor === c
                          ? 'bg-[#0F824B] text-white border-[#0F824B]'
                          : 'border-[#292929] text-[#FAF9F6] hover:border-[#0F824B]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Signal Filter */}
              <div className="mb-6">
                <p className="text-xs font-mono font-bold tracking-wider text-[#8B8B86] uppercase mb-3">
                  SIGNAL
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {['RAW', 'DARK', 'LOUD', 'MINIMAL', 'CHAOTIC', 'UNKNOWN'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSignal((prev) => (prev === s ? '' : s))}
                      className={`py-1.5 text-xs font-mono font-bold uppercase border rounded-xs text-center transition-all ${
                        selectedSignal === s
                          ? 'bg-[#0F824B] text-white border-[#0F824B]'
                          : 'border-[#292929] text-[#FAF9F6] hover:border-[#0F824B]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-[#8B8B86]">MAX PRICE</span>
                  <span className="text-white font-bold">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="999"
                  max="3500"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#0F824B] cursor-pointer"
                />
              </div>

              {/* In Stock Toggle */}
              <div className="mb-6 flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#FAF9F6]">IN STOCK ONLY</span>
                <button
                  onClick={() => setInStockOnly((prev) => !prev)}
                  className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
                    inStockOnly ? 'bg-[#0F824B]' : 'bg-[#292929]'
                  }`}
                >
                  <div
                    className={`bg-black w-3.5 h-3.5 rounded-full transition-transform ${
                      inStockOnly ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#222222] space-y-2">
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="w-full py-3 bg-[#0F824B] hover:bg-white text-[#0A0A0A] font-mono font-extrabold text-xs uppercase tracking-widest rounded-sm transition-colors"
              >
                APPLY FILTERS
              </button>
              <button
                onClick={clearFilters}
                className="w-full py-2 text-xs font-mono text-[#8B8B86] hover:text-white uppercase"
              >
                RESET ALL
              </button>
            </div>
          </div>
        </div>
      )}

      <StorefrontFooter />
    </div>
  );
}
