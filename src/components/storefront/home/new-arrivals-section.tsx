'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { StorefrontProduct } from '@/types/storefront';
import { StorefrontProductGrid } from '../product-grid';

interface NewArrivalsSectionProps {
  products: StorefrontProduct[];
  loading?: boolean;
}

export function NewArrivalsSection({ products, loading }: NewArrivalsSectionProps) {
  // Show new arrival products
  const newProducts = products.slice(0, 4);

  return (
    <section className="w-full bg-[#0A0A0A] border-b border-[#222222] py-16 md:py-24 text-[#FAF9F6]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#0F824B] uppercase">
              // RECENT ARRIVALS
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-black tracking-tight uppercase text-white">
              NEW ARRIVALS
            </h2>
            <p className="text-xs font-mono text-[#8B8B86] uppercase tracking-wider">
              LATEST DROP: DROP 04 / SEPTEMBER 2026
            </p>
          </div>

          <Link
            href="/collections/new-arrivals"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#FAF9F6] hover:text-[#0F824B] transition-colors group"
          >
            <span>VIEW ALL NEW ARRIVALS</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <StorefrontProductGrid products={newProducts} loading={loading} />
      </div>
    </section>
  );
}
