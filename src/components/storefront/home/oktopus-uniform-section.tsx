'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Layers } from 'lucide-react';
import { OKTOPUS_UNIFORM_PIECES } from '@/data/storefront-data';

export function OktopusUniformSection() {
  const totalLookPrice = OKTOPUS_UNIFORM_PIECES.reduce((sum, p) => sum + p.price, 0);

  return (
    <section className="w-full bg-[#0A0A0A] border-b border-[#222222] py-16 md:py-24 text-[#FAF9F6]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-[0.25em] text-[#0F824B] uppercase">
              <Layers className="w-3.5 h-3.5" />
              <span>CURATED COMPLETE LOOK</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-black tracking-tight uppercase text-white">
              THE OKTOPUS UNIFORM
            </h2>
            <p className="text-xs font-mono text-[#8B8B86] uppercase tracking-wider">
              TEE + CARGO + CAP // COMPLETE 3-PIECE SIGNATURE COMBO
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right font-mono text-xs hidden sm:block">
              <span className="text-[#8B8B86]">BUNDLE TOTAL: </span>
              <span className="text-white font-bold">₹{totalLookPrice.toLocaleString('en-IN')}</span>
            </div>
            <Link
              href="/collections/drop-04"
              className="inline-flex items-center gap-2 text-xs font-mono font-extrabold uppercase tracking-widest text-[#0A0A0A] bg-[#FFFFFF] hover:bg-[#0F824B] px-6 py-3 rounded-sm transition-all duration-200 group shadow-md"
            >
              <span>SHOP THE LOOK</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* 3 Pieces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OKTOPUS_UNIFORM_PIECES.map((piece) => (
            <div
              key={piece.id}
              className="group border border-[#222222] hover:border-[#444444] bg-[#0E0E0E] rounded-sm overflow-hidden flex flex-col justify-between transition-all"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#141414]">
                <Image
                  src={piece.imageUrl}
                  alt={piece.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#0A0A0A]/90 border border-[#292929] text-[#0F824B] rounded-xs uppercase">
                    {piece.role}
                  </span>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between border-t border-[#1F1F1F]">
                <div>
                  <h4 className="text-xs font-display font-bold uppercase tracking-wider text-[#FAF9F6]">
                    {piece.name}
                  </h4>
                  <p className="text-xs font-mono text-[#8B8B86] mt-0.5">
                    ₹{piece.price.toLocaleString('en-IN')}
                  </p>
                </div>

                <Link
                  href="/collections/drop-04"
                  className="text-xs font-mono text-[#0F824B] hover:underline uppercase font-bold"
                >
                  VIEW →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
