'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { StorefrontProduct } from '@/types/storefront';
import { StorefrontProductGrid } from '../product-grid';

interface ShopTheDropSectionProps {
  products: StorefrontProduct[];
  loading?: boolean;
}

export function ShopTheDropSection({ products, loading }: ShopTheDropSectionProps) {
  // Show first 4 or 8 items from Drop 04
  const displayProducts = products.slice(0, 4);

  return (
    <section className="w-full bg-[#0A0A0A] border-b border-[#222222] py-16 md:py-24 text-[#FAF9F6]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#0F824B] uppercase">
              // MERCHANDISE GRID
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-black tracking-tight uppercase text-white">
              SHOP THE DROP
            </h2>
            <p className="text-xs font-mono text-[#8B8B86] uppercase tracking-wider">
              LIMITED UNITS // 240 GSM HEAVYWEIGHT FOUNDATION
            </p>
          </div>

          <Link
            href="/collections/drop-04"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#FAF9F6] hover:text-[#0F824B] transition-colors group"
          >
            <span>VIEW ALL DROP 04</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4-column Product Grid */}
        <StorefrontProductGrid products={displayProducts} loading={loading} />
      </div>
    </section>
  );
}
