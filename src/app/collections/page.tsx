'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { StorefrontHeader } from '@/components/storefront/header';
import { StorefrontFooter } from '@/components/storefront/footer';
import { PageBanner } from '@/components/storefront/page-banner';
import { STOREFRONT_COLLECTIONS, STOREFRONT_DROPS } from '@/data/storefront-data';

export default function CollectionsIndexPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAF9F6] font-sans antialiased selection:bg-[#0F824B] selection:text-[#0A0A0A]">
      <AnnouncementBar />
      <StorefrontHeader />

      {/* DYNAMIC DATABASE BANNER FOR COLLECTIONS PAGE */}
      <PageBanner
        placement="collections_page"
        fallbackTitle="COLLECTIONS & DROPS"
        fallbackDescription="EXPLORE OUR DIVERSE CAPSULES. FROM ARCHITECTURAL DROP SILHOUETTES TO HEAVYWEIGHT GRAPHIC FOUNDATIONS."
        fallbackCtaText="EXPLORE DROPS"
        fallbackCtaLink="/collections"
      />

      <main className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 md:py-24">
        {/* Drops Grid */}
        <div className="mb-20">
          <div className="flex items-center justify-between pb-4 mb-8 border-b border-[#222222]">
            <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white">
              NUMBERED DROPS
            </h2>
            <Link
              href="/archive"
              className="text-xs font-mono text-[#8B8B86] hover:text-[#0F824B] uppercase font-bold"
            >
              VIEW DROP ARCHIVE →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STOREFRONT_DROPS.map((drop) => (
              <Link
                key={drop.dropNumber}
                href={`/collections/${drop.slug}`}
                className="group border border-[#222222] hover:border-[#444444] rounded-sm overflow-hidden bg-[#0E0E0E] flex flex-col justify-between transition-all"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#141414]">
                  <Image
                    src={drop.heroImage}
                    alt={drop.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                    unoptimized
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#0A0A0A] border border-[#292929] text-[#0F824B] rounded-xs uppercase">
                      DROP {drop.dropNumber}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[10px] font-mono text-[#8B8B86] uppercase block mb-1">
                      {drop.season}
                    </span>
                    <h3 className="text-sm font-display font-bold uppercase tracking-wide text-white group-hover:text-[#0F824B] transition-colors">
                      {drop.title}
                    </h3>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#1C1C1C] flex items-center justify-between text-xs font-mono text-[#8B8B86]">
                    <span>{drop.itemCount} PIECES</span>
                    <ArrowUpRight className="w-4 h-4 text-[#FAF9F6] group-hover:text-[#0F824B] transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Categories Wall */}
        <div>
          <div className="pb-4 mb-8 border-b border-[#222222]">
            <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white">
              PERMANENT CAPSULES
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STOREFRONT_COLLECTIONS.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.slug}`}
                className="group relative aspect-[16/9] overflow-hidden rounded-sm border border-[#222222] bg-[#121212]"
              >
                <Image
                  src={col.imageUrl}
                  alt={col.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-[0.7]"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent p-6 sm:p-8 flex flex-col justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 bg-[#0A0A0A]/80 border border-[#292929] text-[#0F824B] rounded-xs uppercase w-fit">
                    {col.badge || 'COLLECTION'}
                  </span>

                  <div className="space-y-1">
                    <h3 className="text-2xl sm:text-3xl font-display font-black uppercase text-white group-hover:text-[#0F824B] transition-colors">
                      {col.title}
                    </h3>
                    <p className="text-xs font-mono text-[#8B8B86] uppercase max-w-md">
                      {col.description}
                    </p>
                    <p className="text-[10px] font-mono text-[#0F824B] pt-2 font-bold">
                      EXPLORE CAPSULE →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
