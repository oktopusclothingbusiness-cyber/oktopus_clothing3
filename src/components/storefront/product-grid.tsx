'use client';

import React from 'react';
import { StorefrontProduct } from '@/types/storefront';
import { StorefrontProductCard } from './product-card';

interface ProductGridProps {
  products: StorefrontProduct[];
  loading?: boolean;
}

export function StorefrontProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3 animate-pulse">
            <div className="aspect-[4/5] w-full bg-[#161616] rounded-sm border border-[#222222]" />
            <div className="h-4 bg-[#1F1F1F] rounded-xs w-3/4" />
            <div className="h-3 bg-[#1A1A1A] rounded-xs w-1/2" />
            <div className="h-4 bg-[#1F1F1F] rounded-xs w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="py-20 text-center text-[#8B8B86] font-mono border border-dashed border-[#222222] rounded-sm p-8">
        <p className="text-base text-[#FAF9F6] font-display uppercase tracking-widest font-bold">
          NO SILHOUETTES AVAILABLE.
        </p>
        <p className="text-xs mt-2">TRY ADJUSTING YOUR ACTIVE FILTERS OR SELECTION.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
      {products.map((product) => (
        <StorefrontProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
