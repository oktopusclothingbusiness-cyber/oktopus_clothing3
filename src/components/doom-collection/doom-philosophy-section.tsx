'use client';

import * as React from 'react';
import { DOOM_CAMPAIGN_CONFIG } from '@/lib/doom-campaign-config';
import {
  DoomRunicText,
  DoomRune,
  DoomRuneDivider,
  DoomCornerReticles,
  DoomCornerBrackets,
  DoomCipherRibbon,
} from './doom-runes';

export function DoomPhilosophySection() {
  const tenets = [
    {
      num: '01',
      title: 'AMBITION',
      rune: 'A',
      runeLabel: 'A / AMBITION',
      quote: DOOM_CAMPAIGN_CONFIG.philosophy.ambition,
      punchline: DOOM_CAMPAIGN_CONFIG.punchlines.makeEmpire,
    },
    {
      num: '02',
      title: 'AUTHORITY',
      rune: 'V',
      runeLabel: 'V / AUTHORITY',
      quote: DOOM_CAMPAIGN_CONFIG.philosophy.authority,
      punchline: DOOM_CAMPAIGN_CONFIG.punchlines.authority,
    },
    {
      num: '03',
      title: 'PERFECTION',
      rune: 'P',
      runeLabel: 'P / PERFECTION',
      quote: DOOM_CAMPAIGN_CONFIG.philosophy.perfection,
      punchline: DOOM_CAMPAIGN_CONFIG.punchlines.standards,
    },
    {
      num: '04',
      title: 'LEGACY',
      rune: 'L',
      runeLabel: 'L / LEGACY',
      quote: DOOM_CAMPAIGN_CONFIG.philosophy.legacy,
      punchline: DOOM_CAMPAIGN_CONFIG.punchlines.differentOrder,
    },
  ];

  return (
    <section id="creed" className="relative py-16 sm:py-24 bg-transparent px-4 sm:px-6 lg:px-12 overflow-hidden">
      {/* Decorative Outer Hairline Rules */}
      <div className="max-w-6xl mx-auto px-4 mb-10">
        <DoomRuneDivider runeColor="#8E815A" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-12 sm:space-y-16">
        
        {/* ======================================================== */}
        {/* LEAD EDITORIAL PHILOSOPHY ON DR. DOOM */}
        {/* ======================================================== */}
        <div className="relative max-w-3xl mx-auto text-center space-y-5">
          {/* Section Category Tag with Corner Reticles */}
          <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded bg-[#0E130F] border border-[#2D382D]">
            <DoomCornerReticles color="#8E815A" className="text-[10px]" />
            <span className="text-[10px] sm:text-xs font-mono tracking-[0.3em] text-[#C1B188] uppercase font-semibold">
              DOCTRINE OF LATVERIA
            </span>
          </div>

          {/* Lead Headline: An empire is first built in the mind. */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bebas tracking-wide text-[#F2F1DD] uppercase leading-tight">
            &ldquo;{DOOM_CAMPAIGN_CONFIG.philosophy.intro}&rdquo;
          </h2>

          {/* Minimal Character Synopsis */}
          <p className="text-sm sm:text-base text-[#A1AAA3] font-sans leading-relaxed max-w-2xl mx-auto">
            Monarch of Latveria. Master of science and sorcery. Victor Von Doom was never built to obey. 
            Guided by unyielding intellect and an absolute refusal to submit to fate, his sovereign will dictates order from chaos.
          </p>

          {/* Runic Title Inscription */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#8E815A]/60" />
            <DoomRunicText text="VICTOR VON DOOM" size={14} runeColor="#8E815A" />
            <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#8E815A]/60" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4 MINIMAL PHILOSOPHICAL TENETS WITH CORNER ANGLES & RUNES */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {tenets.map((tenet) => (
            <div
              key={tenet.num}
              className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-xl bg-[#0E130F]/80 backdrop-blur-sm border border-[#2D382D] hover:border-[#8E815A] transition-all duration-300 shadow-md"
            >
              {/* Technical Corner Angles & Plus Reticles */}
              <DoomCornerBrackets color="#8E815A" size={8} className="opacity-40 group-hover:opacity-90 transition-opacity" />
              <DoomCornerReticles color="#8E815A" className="text-[9px] opacity-35 group-hover:opacity-80 transition-opacity" />

              {/* Card Header: Coordinate & Latverian Cipher Glyph */}
              <div className="flex items-center justify-between pb-4 border-b border-[#2D382D]/80">
                <span className="text-[10px] font-mono tracking-widest text-[#7B8F7C]">
                  {tenet.num}
                </span>

                <div className="p-1 rounded bg-[#161E17] border border-[#2D382D] group-hover:border-[#8E815A]/80 transition-colors">
                  <DoomRune char={tenet.rune} size={16} color="#C1B188" />
                </div>
              </div>

              {/* Card Body: Title & Philosophical Quote */}
              <div className="space-y-3 py-5">
                <h3 className="text-base sm:text-lg font-bebas tracking-widest text-[#F2F1DD] uppercase">
                  {tenet.title}
                </h3>
                <p className="text-xs sm:text-sm font-serif italic text-[#C1B188] leading-relaxed">
                  &ldquo;{tenet.quote}&rdquo;
                </p>
              </div>

              {/* Card Footer: Short aggressive punchline */}
              <div className="pt-3 border-t border-[#2D382D]/80">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#7B8F7C] group-hover:text-[#A1AAA3] transition-colors">
                  {tenet.punchline}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ======================================================== */}
        {/* MINIMAL LATVERIAN CIPHER RUNES RIBBON */}
        {/* ======================================================== */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-center gap-3">
            <span className="h-[1px] flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[#494333]" />
            <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#7B8F7C]">
              LATVERIAN CIPHER ARCHIVE
            </span>
            <span className="h-[1px] flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[#494333]" />
          </div>

          <DoomCipherRibbon runeColor="#8E815A" />
        </div>

        {/* Decorative Lower Hairline Rule */}
        <div className="pt-2">
          <DoomRuneDivider runeColor="#8E815A" />
        </div>
      </div>
    </section>
  );
}

