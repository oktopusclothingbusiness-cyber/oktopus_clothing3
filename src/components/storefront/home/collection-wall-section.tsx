'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { STOREFRONT_COLLECTIONS } from '@/data/storefront-data';

export function CollectionWallSection() {
  return (
    <section className="w-full bg-[#0A0A0A] border-b border-[#222222] py-16 md:py-24 text-[#FAF9F6]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#0F824B] uppercase">
              // DISCOVERY
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-black tracking-tight uppercase text-white">
              COLLECTION WALL
            </h2>
            <p className="text-xs font-mono text-[#8B8B86] uppercase tracking-wider">
              CURATED CAPSULES BY SILHOUETTE & ATTITUDE
            </p>
          </div>

          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#FAF9F6] hover:text-[#0F824B] transition-colors group"
          >
            <span>VIEW ALL COLLECTIONS</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* 4 Block Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {STOREFRONT_COLLECTIONS.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group relative block aspect-[16/10] sm:aspect-[16/9] overflow-hidden rounded-sm border border-[#222222] bg-[#121212]"
            >
              <Image
                src={col.imageUrl}
                alt={col.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-[0.7] group-hover:brightness-[0.8]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent p-6 sm:p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 bg-[#0A0A0A]/80 backdrop-blur-sm border border-[#292929] text-[#0F824B] rounded-xs uppercase">
                    {col.badge || 'COLLECTION'}
                  </span>
                  <div className="w-8 h-8 rounded-full border border-[#FAF9F6]/20 group-hover:border-[#0F824B] group-hover:bg-[#0F824B] flex items-center justify-center transition-all">
                    <ArrowUpRight className="w-4 h-4 text-[#FAF9F6] group-hover:text-[#0A0A0A] transition-colors" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-display font-black uppercase text-white group-hover:text-[#0F824B] transition-colors">
                    {col.title}
                  </h3>
                  <p className="text-xs font-mono text-[#8B8B86] uppercase line-clamp-1 max-w-md">
                    {col.description}
                  </p>
                  <p className="text-[10px] font-mono text-[#FAF9F6] pt-1">
                    {col.itemCount} SILHOUETTES AVAILABLE →
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
