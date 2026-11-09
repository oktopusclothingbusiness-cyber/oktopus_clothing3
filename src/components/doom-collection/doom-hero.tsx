'use client';

import * as React from 'react';
import Image from 'next/image';
import { DOOM_CAMPAIGN_CONFIG } from '@/lib/doom-campaign-config';
import {
  DoomRunicText,
  DoomRune,
  DoomCornerReticles,
  DoomCornerBrackets,
} from './doom-runes';

export function DoomHero() {
  const scrollToGrid = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById('collection-grid');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[90vh] md:min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-transparent px-4 py-16 sm:py-24">
      {/* Decorative Outer Hairline Grid Reticles */}
      <div className="absolute inset-x-8 sm:inset-x-16 top-6 h-[1px] bg-gradient-to-r from-transparent via-[#8E815A]/30 to-transparent pointer-events-none" />

      {/* Main Content Container (uses the unified page background already in place) */}
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center space-y-7 sm:space-y-8">
        
        {/* ======================================================== */}
        {/* CHARACTER STAGE WITH CONTAINED DEEP BLACK CLOUD */}
        {/* ======================================================== */}
        <div className="relative flex items-center justify-center select-none pb-1">
          {/* Deep Dark-Black Smoke Core directly behind character (Contained behind torso/hood so it NEVER bleeds down into text) */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[54%] w-[112%] h-[82%] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 65% 55% at 50% 48%, #000000 0%, #000000 45%, rgba(0, 0, 0, 0.95) 70%, transparent 100%)',
              filter: 'blur(20px)',
            }}
          />

          {/* Core Pitch-Black Silhouette Backing */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[54%] w-[90%] h-[72%] rounded-full pointer-events-none"
            style={{
              background: '#000000',
              filter: 'blur(15px)',
            }}
          />

          {/* Static Hero Character Image — doom_char_v2.svg ONLY (Static, crisp, grounded) */}
          <div className="relative z-10 w-44 sm:w-56 md:w-64 lg:w-72 aspect-[2124/2690] flex items-center justify-center">
            <Image
              src="/doom_char_v2.svg"
              alt="Dr. Doom"
              width={424}
              height={538}
              priority
              className="w-full h-auto object-contain drop-shadow-[0_22px_36px_rgba(0,0,0,1)]"
              sizes="(max-width: 640px) 176px, (max-width: 768px) 224px, 288px"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* HEADLINE & REVEAL SECTION (Elevated z-index, not overshadowed) */}
        {/* ======================================================== */}
        <div className="relative z-20 space-y-3.5 pt-2">
          {/* Dr. Doom Collection Brand Pill (Framed with Latverian Runes & clear spatial boundary) */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-md bg-[#0E130F]/95 border border-[#8E815A]/60 shadow-[0_4px_20px_rgba(0,0,0,0.9)] backdrop-blur-md">
            <DoomRune char="D" size={11} color="#C1B188" />
            <span className="text-xs sm:text-sm font-mono tracking-[0.3em] text-[#C1B188] uppercase font-semibold">
              {DOOM_CAMPAIGN_CONFIG.title}
            </span>
            <DoomRune char="D" size={11} color="#C1B188" />
          </div>

          {/* Hero Headline: POWER HAS A PRESENCE. */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bebas tracking-wider text-[#F2F1DD] uppercase leading-none drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
            {DOOM_CAMPAIGN_CONFIG.headlines.hero}
          </h1>

          {/* Insignia Reveal: BENEATH NO ONE. */}
          <div className="pt-1 flex flex-col items-center gap-2">
            <span className="text-xs sm:text-sm font-mono tracking-[0.35em] text-[#C1B188] uppercase font-bold">
              {DOOM_CAMPAIGN_CONFIG.headlines.insignia}
            </span>
            <div className="opacity-90 hover:opacity-100 transition-opacity">
              <DoomRunicText text="DR DOOM" size={18} runeColor="#8E815A" />
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#A1AAA3] font-sans pt-1 max-w-md mx-auto">
            {DOOM_CAMPAIGN_CONFIG.punchlines.neverBuilt} {DOOM_CAMPAIGN_CONFIG.punchlines.bornBeyond}
          </p>
        </div>

        {/* CTA Button — Premium Dark Shade with Reticle Accents */}
        <div className="relative z-20 pt-2">
          <button
            onClick={scrollToGrid}
            className="group relative px-8 py-3 rounded-lg bg-[#1B231C] hover:bg-[#2D382D] active:bg-[#151C16] text-[#F2F1DD] text-xs sm:text-sm font-mono font-medium tracking-[0.25em] uppercase border border-[#8E815A]/80 hover:border-[#C1B188] shadow-[0_12px_28px_rgba(0,0,0,0.9)] hover:shadow-[0_12px_32px_rgba(45,56,45,0.4)] transition-all duration-300"
          >
            <DoomCornerBrackets color="#8E815A" size={6} className="opacity-60 group-hover:opacity-100 transition-opacity" />
            <span>Explore Collection</span>
          </button>
        </div>
      </div>

      {/* Decorative Bottom Hairline */}
      <div className="absolute inset-x-8 sm:inset-x-16 bottom-4 h-[1px] bg-gradient-to-r from-transparent via-[#8E815A]/25 to-transparent pointer-events-none" />
    </section>
  );
}
