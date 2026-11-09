'use client';

import * as React from 'react';
import { useProduct } from '@/context/product-context';
import { useCategory } from '@/context/category-context';
import { DoomProductCard } from './doom-product-card';
import { filterDoomCollectionProducts, DOOM_CAMPAIGN_CONFIG } from '@/lib/doom-campaign-config';
import { Skeleton } from '@/components/ui/skeleton';
import { DoomRune, DoomCornerReticles } from './doom-runes';

export function DoomProductGrid() {
  const { products, loading: productsLoading } = useProduct();
  const { categories, loading: categoriesLoading } = useCategory();

  // Dynamically find the Dr. Doom category ID from category context, or fallback to config
  const doomCategoryId = React.useMemo(() => {
    const matched = categories.find((c) => (c.name || '').toLowerCase().includes('doom'));
    return matched?.id || matched?._id || DOOM_CAMPAIGN_CONFIG.categoryId;
  }, [categories]);

  // Strictly filter products assigned to the Dr. Doom category
  const doomProducts = React.useMemo(() => {
    return filterDoomCollectionProducts(products, doomCategoryId);
  }, [products, doomCategoryId]);

  const loading = productsLoading || categoriesLoading;

  return (
    <section id="collection-grid" className="relative py-16 sm:py-24 bg-transparent px-4 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Section Heading: THE SOVEREIGN EDITION */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#2D382D] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <DoomRune char="D" size={11} color="#C1B188" />
              <span className="block text-xs font-mono tracking-widest text-[#C1B188] uppercase">
                {DOOM_CAMPAIGN_CONFIG.title}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bebas tracking-wide text-[#F2F1DD] uppercase m-0 leading-none">
              {DOOM_CAMPAIGN_CONFIG.headlines.products}
            </h2>
            <p className="text-xs sm:text-sm text-[#A1AAA3] font-sans pt-0.5">
              {DOOM_CAMPAIGN_CONFIG.punchlines.standards}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#A1AAA3]">
              {doomProducts.length} {doomProducts.length === 1 ? 'Piece' : 'Pieces'}
            </span>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-[#0E130F] border border-[#494333] p-3 space-y-3">
                <Skeleton className="w-full aspect-[3/4] rounded-lg bg-[#161E17]" />
                <Skeleton className="w-3/4 h-4 bg-[#161E17]" />
                <Skeleton className="w-1/2 h-4 bg-[#161E17]" />
                <Skeleton className="w-full h-9 bg-[#161E17]" />
              </div>
            ))}
          </div>
        ) : doomProducts.length === 0 ? (
          /* Empty State - Only Dr. Doom category products are shown */
          <div className="relative py-20 text-center rounded-2xl bg-[#0E130F]/90 border border-[#494333] space-y-3 px-4">
            <DoomCornerReticles color="#8E815A" className="text-sm opacity-50" />
            <h3 className="text-xl sm:text-2xl font-bebas tracking-wide text-[#F2F1DD] uppercase">
              Release In Preparation
            </h3>
            <p className="text-xs sm:text-sm text-[#A1AAA3] max-w-md mx-auto">
              Pieces for the Dr. Doom Collection are currently being cataloged and will appear here shortly.
            </p>
          </div>
        ) : (
          /* Native 2-Column Mobile Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {doomProducts.map((product, idx) => (
              <DoomProductCard
                key={product._id || product.id || idx}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
