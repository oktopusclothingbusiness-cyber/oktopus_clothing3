'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, History } from 'lucide-react';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { StorefrontHeader } from '@/components/storefront/header';
import { StorefrontFooter } from '@/components/storefront/footer';
import { PageBanner } from '@/components/storefront/page-banner';
import { STOREFRONT_DROPS } from '@/data/storefront-data';

export default function ArchivePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAF9F6] font-sans antialiased selection:bg-[#0F824B] selection:text-[#0A0A0A]">
      <AnnouncementBar />
      <StorefrontHeader />

      {/* DYNAMIC DATABASE BANNER FOR ARCHIVE PAGE */}
      <PageBanner
        placement="archive_page"
        fallbackTitle="THE OKTOPUS ARCHIVE"
        fallbackDescription="A CHRONOLOGICAL RECORD OF EVERY NUMBERED OKTOPUS RELEASE. EXPLORE PAST CAPSULES, VAULTED COLORWAYS, AND DESIGN EVOLUTION."
        fallbackCtaText="EXPLORE VAULT"
        fallbackCtaLink="/archive"
      />

      <main className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 md:py-24">
        {/* Drops Timeline List */}
        <div className="space-y-12">
          {STOREFRONT_DROPS.map((drop, idx) => (
            <div
              key={drop.dropNumber}
              className="group border border-[#222222] hover:border-[#444444] rounded-2xl overflow-hidden bg-[#0E0E0E] grid grid-cols-1 lg:grid-cols-12 transition-all duration-300 shadow-xl"
            >
              {/* Image side (7 cols) */}
              <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-[16/9] w-full overflow-hidden bg-[#141414]">
                <Image
                  src={drop.heroImage}
                  alt={drop.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.75] group-hover:brightness-[0.85]"
                  unoptimized
                />
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-mono font-bold tracking-widest px-3 py-1 bg-[#0A0A0A]/90 backdrop-blur-sm border border-[#292929] text-[#0F824B] rounded-full uppercase">
                    DROP {drop.dropNumber} // {idx === 0 ? 'ACTIVE RELEASE' : 'VAULTED'}
                  </span>
                </div>
              </div>

              {/* Info side (5 cols) */}
              <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6 text-left">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 font-mono text-xs text-[#8B8B86]">
                    <span>{drop.season}</span>
                    <span>•</span>
                    <span className="text-[#0F824B] font-bold">{drop.releaseDate}</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-display font-black uppercase text-white tracking-wide group-hover:text-[#0F824B] transition-colors">
                    {drop.title}
                  </h2>

                  <p className="text-xs font-mono text-[#8B8B86] uppercase leading-relaxed">
                    {drop.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-[#1F1F1F] flex items-center justify-between">
                  <span className="text-xs font-mono text-[#FAF9F6]">
                    {drop.itemCount} SILHOUETTES
                  </span>

                  <Link
                    href={`/collections/${drop.slug}`}
                    className="inline-flex items-center gap-2 bg-[#0F824B] hover:bg-[#0b663a] text-[#0A0A0A] font-mono font-extrabold text-xs uppercase tracking-widest py-3 px-6 rounded-full transition-all group shadow-md"
                  >
                    <span>EXPLORE DROP</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
