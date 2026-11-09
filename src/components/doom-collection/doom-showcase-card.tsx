'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DoomRune } from './doom-runes';
import { DOOM_CAMPAIGN_CONFIG } from '@/lib/doom-campaign-config';

interface DoomShowcaseCardProps {
  isMobile?: boolean;
  className?: string;
}

export function DoomShowcaseCard({ isMobile = false, className = '' }: DoomShowcaseCardProps) {
  // ========================================================
  // MOBILE RENDERING (Matches exact layout & height of ProductCard mobile)
  // ========================================================
  if (isMobile) {
    return (
      <Card className={`overflow-hidden group rounded-lg card-glass border border-[#8E815A]/60 hover:border-[#C1B188] transition-all duration-300 bg-[#050705] ${className}`}>
        <Link href="/collections/dr-doom" className="block">
          {/* Exact 3/4 Aspect Ratio Image Wrapper */}
          <div className="relative aspect-[3/4] bg-[#050705] overflow-hidden flex items-center justify-center p-2">
            {/* Background: Complex Texture Pattern */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-105 opacity-60"
              style={{ backgroundImage: "url('/doom/doom-texture.jpg')" }}
            />

            {/* Dark Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 45%, rgba(5, 7, 5, 0.35) 0%, rgba(5, 7, 5, 0.85) 75%, #050705 100%)',
              }}
            />

            {/* Dark Black Smoke Core behind Character */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full pointer-events-none"
              style={{ background: '#000000', filter: 'blur(14px)' }}
            />

            {/* Character Image (Hero Character: doom_char_v2.svg) */}
            <div className="relative z-10 w-24 aspect-[2124/2690] flex items-center justify-center">
              <Image
                src="/doom_char_v2.svg"
                alt="Dr. Doom Collection"
                width={212}
                height={269}
                className="w-full h-auto object-contain transition-transform duration-500 ease-in-out group-hover:scale-105 drop-shadow-[0_12px_20px_rgba(0,0,0,1)]"
                sizes="120px"
              />
            </div>

            {/* Top-Left Badge: Limited Edition with Latverian Rune */}
            <div className="absolute top-2 left-2 z-20">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#050705]/90 border border-[#8E815A]/70 text-[9px] font-mono tracking-wider text-[#C1B188] uppercase shadow-sm">
                <DoomRune char="D" size={9} color="#C1B188" />
                <span>Limited</span>
              </span>
            </div>
          </div>

          {/* Exact same p-2 space-y-1 content padding as mobile ProductCard */}
          <div className="p-2 space-y-1 bg-[#0E130F] border-t border-[#2D382D]">
            <h3 className="truncate text-sm font-semibold text-[#F2F1DD] group-hover:text-[#C1B188] transition-colors">
              The Sovereign Edition
            </h3>
            <div className="flex items-baseline gap-1">
              <p className="text-sm font-bold text-[#C1B188]">{DOOM_CAMPAIGN_CONFIG.title}</p>
            </div>
            <p className="text-xs text-[#7B8F7C] truncate flex items-center gap-1">
              <span>Explore Collection</span>
              <ArrowRight className="w-3 h-3 text-[#C1B188]" />
            </p>
          </div>
        </Link>
      </Card>
    );
  }

  // ========================================================
  // DESKTOP RENDERING (Matches exact layout & height of ProductCard desktop)
  // ========================================================
  return (
    <Card className={`overflow-hidden group border border-[#8E815A]/60 hover:border-[#C1B188] rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 bg-[#050705] ${className}`}>
      <Link href="/collections/dr-doom" className="block">
        {/* Exact 3/4 Aspect Ratio Image Wrapper */}
        <div className="relative aspect-[3/4] bg-[#050705] overflow-hidden flex items-center justify-center p-4">
          {/* Background: Complex Texture Pattern */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-105 opacity-65"
            style={{ backgroundImage: "url('/doom/doom-texture.jpg')" }}
          />

          {/* Dark Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 45%, rgba(5, 7, 5, 0.4) 0%, rgba(5, 7, 5, 0.85) 75%, #050705 100%)',
            }}
          />

          {/* Dark Black Smoke Core behind Character */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full pointer-events-none"
            style={{ background: '#000000', filter: 'blur(16px)' }}
          />

          {/* Character Image (Hero Character: doom_char_v2.svg) */}
          <div className="relative z-10 w-32 md:w-36 aspect-[2124/2690] flex items-center justify-center">
            <Image
              src="/doom_char_v2.svg"
              alt="Dr. Doom Collection"
              width={212}
              height={269}
              className="w-full h-auto object-contain transition-transform duration-500 ease-in-out group-hover:scale-105 drop-shadow-[0_16px_25px_rgba(0,0,0,1)]"
              sizes="160px"
            />
          </div>

          {/* Top-Left Badge: Limited Edition with Latverian Rune */}
          <div className="absolute top-3 left-3 z-20">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#050705]/90 border border-[#8E815A]/70 text-[10px] font-mono tracking-wider text-[#C1B188] uppercase shadow-sm">
              <DoomRune char="D" size={10} color="#C1B188" />
              <span>Limited Edition</span>
            </span>
          </div>
        </div>

        {/* Exact same CardContent p-4 text-center as desktop ProductCard */}
        <CardContent className="p-4 text-center bg-[#0E130F] border-t border-[#2D382D]">
          <h3 className="font-bold text-lg truncate font-serif text-[#F2F1DD] group-hover:text-[#C1B188] transition-colors">
            The Sovereign Edition
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-1 text-[#A1AAA3]">
            {DOOM_CAMPAIGN_CONFIG.title}
          </p>
          <div className="flex items-baseline justify-center gap-2 mt-2">
            <p className="text-xl font-bold font-mono text-[#C1B188] flex items-center gap-1.5">
              <span>Explore Drop</span>
              <ArrowRight className="w-4 h-4 text-[#C1B188]" />
            </p>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
