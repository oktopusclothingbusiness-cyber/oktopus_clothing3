'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/utils';
import type { Category } from '@/context/category-context';

interface DesktopCategoryGridProps {
  categories: Category[];
  loading?: boolean;
}

export function DesktopCategoryGrid({ categories, loading }: DesktopCategoryGridProps) {
  // Use up to 6 real categories
  const displayCategories = React.useMemo(() => {
    return (categories || []).filter((c) => c && c.name).slice(0, 6);
  }, [categories]);

  return (
    <section className="bg-background py-16 lg:py-24 border-b border-white/10 select-none">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-zinc-500">
              COLLECTIONS • DIRECTORY
            </span>
            <h2 className="text-4xl lg:text-6xl font-black font-bebas tracking-tight text-foreground mt-1">
              CURATED CATEGORIES
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-lg">
              Explore active collections across heavyweight oversized tees, luxury hoodies, and custom graphic drops.
            </p>
          </div>

          <Link
            href="/products"
            className="text-xs font-mono font-bold text-foreground hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors group"
          >
            <span>VIEW ALL APPAREL</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 3x2 Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 bg-zinc-900 border border-white/10 animate-pulse" />
              ))
            : displayCategories.map((cat, idx) => {
                const category = cat as Category & {
                  landscape_image_url?: string;
                  hero_image_url?: string;
                  gender?: string;
                  item_count?: number;
                };
                const categoryHref = category.id
                  ? `/products?category=${category.id}`
                  : '/products';
                const bannerImg =
                  category.landscape_image_url ||
                  category.hero_image_url ||
                  category.imageUrl ||
                  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000';

                return (
                  <Link href={categoryHref} key={category.id || idx} className="block group">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="relative h-60 lg:h-64 overflow-hidden border border-white/10 bg-zinc-950 shadow-md group-hover:border-white/30 transition-colors"
                    >
                      {/* Background Image */}
                      <Image
                        src={getOptimizedImageUrl(bannerImg, 800)}
                        alt={category.name}
                        fill
                        sizes="(max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />

                      {/* Scrim Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-colors duration-300 group-hover:bg-black/50" />

                      {/* Card Overlay Content */}
                      <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase px-2 py-0.5 bg-black/80 border border-white/15">
                            {category.gender || 'UNISEX'}
                          </span>
                          {category.item_count ? (
                            <span className="text-[10px] font-mono tracking-wider text-zinc-400 font-bold">
                              {category.item_count} PIECES
                            </span>
                          ) : null}
                        </div>

                        <div>
                          <h3 className="text-3xl font-black font-bebas tracking-wide uppercase text-white group-hover:text-amber-400 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider mt-1 flex items-center gap-1 group-hover:text-zinc-200">
                            <span>EXPLORE DROP</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}
