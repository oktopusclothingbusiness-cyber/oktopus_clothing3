'use client';

import React from 'react';
import Image from 'next/image';
import { Instagram, ArrowUpRight } from 'lucide-react';
import { SOCIAL_GALLERY_IMAGES } from '@/data/storefront-data';

export function SocialWallSection() {
  return (
    <section className="w-full bg-[#0A0A0A] border-b border-[#222222] py-16 md:py-24 text-[#FAF9F6]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-[0.25em] text-[#0F824B] uppercase">
              <Instagram className="w-3.5 h-3.5" />
              <span>STREET COMMUNITY</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-black tracking-tight uppercase text-white">
              FROM THE OKTOPUS WORLD
            </h2>
            <p className="text-xs font-mono text-[#8B8B86] uppercase tracking-wider">
              SPOTTED IN CITIES ACROSS THE NATION. TAG @OKTOPUS TO BE FEATURED.
            </p>
          </div>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#FAF9F6] hover:text-[#0F824B] transition-colors group"
          >
            <span>JOIN @OKTOPUS</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* 6 Images Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {SOCIAL_GALLERY_IMAGES.map((img, i) => (
            <div
              key={i}
              className="group relative aspect-square overflow-hidden rounded-sm border border-[#222222] bg-[#141414]"
            >
              <Image
                src={img.url}
                alt={img.caption}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110 brightness-90 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end text-left">
                <span className="text-[10px] font-mono text-[#0F824B] font-bold">
                  {img.handle}
                </span>
                <span className="text-[9px] font-mono text-white line-clamp-1">
                  {img.caption}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
