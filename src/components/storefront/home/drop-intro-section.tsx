'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function DropIntroSection() {
  return (
    <section className="w-full bg-[#0A0A0A] border-b border-[#222222] py-16 md:py-24 text-[#FAF9F6]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#0F824B] uppercase">
                // RELEASE 004
              </span>
              <span className="h-px w-12 bg-[#292929]" />
              <span className="text-xs font-mono text-[#8B8B86] uppercase">
                SEPTEMBER 2026
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight uppercase text-white leading-[0.95]">
              A NEW STATE OF <br />
              <span className="text-[#8B8B86]">EVERYDAY WEAR.</span>
            </h2>

            <p className="text-sm font-mono text-[#8B8B86] max-w-xl leading-relaxed uppercase">
              12 carefully engineered pieces crafted with custom 240 GSM pure combed cotton and high-density industrial puff graphics. Strictly limited units per silhouette.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-between space-y-6">
            <div className="font-mono text-xs text-left lg:text-right space-y-1 text-[#8B8B86]">
              <p>STATUS: <span className="text-[#0F824B] font-bold">RELEASED & READY TO SHIP</span></p>
              <p>BATCH: <span className="text-white font-bold">12 SILHOUETTES</span></p>
              <p>WEIGHT: <span className="text-white font-bold">240 GSM - 400 GSM</span></p>
            </div>

            <Link
              href="/collections/drop-04"
              className="inline-flex items-center gap-2 text-xs font-mono font-extrabold uppercase tracking-widest text-[#0A0A0A] bg-[#FFFFFF] hover:bg-[#0F824B] px-6 py-3 rounded-sm transition-all duration-200 group shadow-md"
            >
              <span>EXPLORE DROP</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
