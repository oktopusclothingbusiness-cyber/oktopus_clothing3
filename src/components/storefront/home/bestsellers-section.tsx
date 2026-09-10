'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import { StorefrontProduct } from '@/types/storefront';
import { StorefrontProductGrid } from '../product-grid';

interface BestsellersSectionProps {
  products: StorefrontProduct[];
  loading?: boolean;
}

export function BestsellersSection({ products, loading }: BestsellersSectionProps) {
  // Select products marked as featured / bestseller or top 4
  const bestsellers = products.filter((p) => p.featured || p.badge === 'BESTSELLER').slice(0, 4);
  const displayProducts = bestsellers.length >= 2 ? bestsellers : products.slice(0, 4);

  return (
    <section className="w-full bg-[#0A0A0A] border-b border-[#222222] py-16 md:py-24 text-[#FAF9F6]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-[0.25em] text-[#0F824B] uppercase">
              <Flame className="w-3.5 h-3.5" />
              <span>HIGH ROTATION</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-black tracking-tight uppercase text-white">
              THE ONES EVERYONE WANTS.
            </h2>
            <p className="text-xs font-mono text-[#8B8B86] uppercase tracking-wider">
              CONSISTENT REORDER SILHOUETTES // PROVEN STREET ESSENTIALS
            </p>
          </div>

          <Link
            href="/collections/bestsellers"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#FAF9F6] hover:text-[#0F824B] transition-colors group"
          >
            <span>SHOP ALL BESTSELLERS</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <StorefrontProductGrid products={displayProducts} loading={loading} />
      </div>
    </section>
  );
}
