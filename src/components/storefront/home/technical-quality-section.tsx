'use client';

import React, { useState } from 'react';
import { TECHNICAL_SPECS } from '@/data/storefront-data';
import { ShieldCheck, Plus, Minus } from 'lucide-react';

export function TechnicalQualitySection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleIndex = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="w-full bg-[#0E0E0E] border-b border-[#222222] py-16 md:py-24 text-[#FAF9F6]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="max-w-2xl mb-12 space-y-2 text-left">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-[0.25em] text-[#0F824B] uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FABRICATION STANDARDS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight uppercase text-white">
            WHY OKTOPUS
          </h2>
          <p className="text-xs font-mono text-[#8B8B86] uppercase tracking-wider">
            ZERO COMPROMISE TEXTILE ENGINEERING // DESIGNED TO OUTLAST FAST FASHION.
          </p>
        </div>

        {/* 4 Technical Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TECHNICAL_SPECS.map((spec, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={spec.number}
                onClick={() => toggleIndex(idx)}
                className={`p-6 border rounded-sm transition-all duration-300 cursor-pointer flex flex-col justify-between select-none ${
                  isExpanded
                    ? 'bg-[#141414] border-[#0F824B] shadow-lg'
                    : 'bg-[#111111] border-[#222222] hover:border-[#444444]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-2xl font-bold text-[#0F824B]">
                      {spec.number}
                    </span>
                    <button
                      aria-label="Toggle details"
                      className="p-1 text-[#8B8B86] hover:text-[#0F824B] transition-colors"
                    >
                      {isExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>

                  <h3 className="text-lg font-display font-black uppercase tracking-wider text-white mb-2">
                    {spec.title}
                  </h3>
                  <p className="text-[11px] font-mono text-[#8B8B86] uppercase mb-4">
                    {spec.subtitle}
                  </p>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 text-xs font-mono text-[#E5E5E5] leading-relaxed uppercase pt-2 border-t border-[#222222] ${
                    isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 md:max-h-40 md:opacity-100'
                  }`}
                >
                  {spec.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
