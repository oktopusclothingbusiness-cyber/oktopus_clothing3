'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/context/product-context';

interface DesktopFeaturedProductsProps {
  products: Product[];
  loading?: boolean;
}

export function DesktopFeaturedProducts({ products, loading }: DesktopFeaturedProductsProps) {
  const displayProducts = React.useMemo(() => {
    const featured = (products || []).filter((p) => p && (p.featured || p.isHero));
    if (featured.length >= 8) return featured.slice(0, 8);
    // If fewer than 8 marked featured, fill with best items from catalog
    return (products || []).slice(0, 8);
  }, [products]);

  return (
    <section className="bg-background py-16 lg:py-24 border-b border-white/10 select-none">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-zinc-500">
              CURATED EDIT • NEW RELEASES
            </span>
            <h2 className="text-4xl lg:text-6xl font-black font-bebas tracking-tight text-foreground mt-1">
              FEATURED DROPS
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-lg">
              Precision-printed 240 GSM heavy cotton tees and streetwear essentials built for daily wear.
            </p>
          </div>

          <Link
            href="/products"
            className="text-xs font-mono font-bold text-foreground hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors group"
          >
            <span>VIEW COMPLETE CATALOG</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4-Column Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
                  <Skeleton className="h-5 w-3/4 rounded" />
                  <Skeleton className="h-4 w-1/3 rounded" />
                </div>
              ))
            : displayProducts.map((product) => (
                <div key={product.id} className="transition-all duration-300">
                  <ProductCard product={product} isMobile={false} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
