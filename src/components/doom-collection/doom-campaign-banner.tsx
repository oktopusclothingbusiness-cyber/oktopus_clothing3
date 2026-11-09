'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { DOOM_CAMPAIGN_CONFIG } from '@/lib/doom-campaign-config';
import { DoomRune, DoomRunicText } from './doom-runes';

interface DoomCampaignBannerProps {
  className?: string;
}

export function DoomCampaignBanner({ className = '' }: DoomCampaignBannerProps) {
  return (
    <div
      data-campaign="dr-doom"
      className={`relative w-full overflow-hidden rounded-2xl border border-[#494333] bg-[#050705] transition-all group ${className}`}
      style={{
        boxShadow: '0 8px 30px -10px rgba(5, 7, 5, 0.85)',
      }}
    >
      {/* Background Patina Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 bg-cover bg-center transition-opacity duration-700 group-hover:opacity-55"
        style={{
          backgroundImage: "url('/doom/doom-texture.jpg')",
        }}
      />

      {/* Dark Overlay for Text Readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(5, 7, 5, 0.94) 0%, rgba(5, 7, 5, 0.85) 55%, rgba(5, 7, 5, 0.94) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-5 sm:p-7 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4 sm:gap-5 max-w-xl">
          {/* Latverian Runic Insignia */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden border border-[#8E815A]/60 bg-[#1B231C] shadow-md flex items-center justify-center p-2">
            <DoomRune char="D" size={28} color="#C1B188" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="block text-[10px] sm:text-[11px] font-mono tracking-widest text-[#C1B188] uppercase">
                {DOOM_CAMPAIGN_CONFIG.title}
              </span>
              <span className="text-[#494333]">•</span>
              <DoomRunicText text="DOOM" size={12} runeColor="#8E815A" />
            </div>

            {/* Campaign Headline: A NEW ORDER BEGINS. */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bebas tracking-wider text-[#F2F1DD] uppercase m-0 leading-none">
              {DOOM_CAMPAIGN_CONFIG.headlines.banner}
            </h2>

            <p className="text-xs sm:text-sm text-[#A1AAA3] font-sans">
              {DOOM_CAMPAIGN_CONFIG.punchlines.quietPower} {DOOM_CAMPAIGN_CONFIG.punchlines.differentOrder}
            </p>
          </div>
        </div>

        {/* Right CTA */}
        <div className="w-full sm:w-auto flex items-center justify-end shrink-0 pt-2 sm:pt-0">
          <Link
            href="/collections/dr-doom"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#1B231C] hover:bg-[#2D382D] active:bg-[#141A15] text-[#F2F1DD] text-xs sm:text-sm font-semibold tracking-wider uppercase border border-[#8E815A] hover:border-[#C1B188] shadow-md transition-all duration-300 group/btn"
          >
            <span>Explore Collection</span>
            <ChevronRight className="w-4 h-4 text-[#C1B188] transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
