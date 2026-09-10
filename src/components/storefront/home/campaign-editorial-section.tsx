'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export function CampaignEditorialSection() {
  return (
    <section className="relative w-full h-[65vh] min-h-[480px] bg-[#0A0A0A] overflow-hidden flex items-center justify-center border-b border-[#222222]">
      {/* Background Campaign Visual */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1800&auto=format&fit=crop"
          alt="Campaign Visual"
          fill
          className="object-cover brightness-[0.55] contrast-[1.1]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1000px] mx-auto px-6 text-center space-y-6">
        <span className="text-xs font-mono font-bold tracking-[0.3em] text-[#0F824B] uppercase block">
          // FASHION STATEMENT
        </span>

        <h2 className="text-4xl sm:text-6xl md:text-7xl font-display font-black uppercase text-white tracking-tight leading-none">
          BUILT DIFFERENT.
        </h2>

        <p className="text-xs sm:text-sm font-mono text-[#E5E5E5] max-w-lg mx-auto uppercase tracking-wider leading-relaxed">
          From yarn selection to final bio-wash finishing, every step is executed to challenge the ordinary.
        </p>

        <div className="pt-2">
          <Link
            href="/collections/all"
            className="inline-flex items-center gap-2.5 bg-[#FFFFFF] hover:bg-[#0F824B] text-white px-8 py-3.5 text-xs font-mono font-extrabold uppercase tracking-widest rounded-sm transition-all duration-200 shadow-2xl group"
          >
            <span>SHOP COLLECTION</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
