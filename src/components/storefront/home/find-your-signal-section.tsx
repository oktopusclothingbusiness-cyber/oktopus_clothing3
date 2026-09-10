'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { SIGNALS } from '@/data/storefront-data';
import { SignalType } from '@/types/storefront';

export function FindYourSignalSection() {
  const [activeSignal, setActiveSignal] = useState<SignalType>('RAW');
  const current = SIGNALS.find((s) => s.name === activeSignal) || SIGNALS[0];

  return (
    <section className="w-full bg-[#0A0A0A] border-b border-[#222222] py-16 md:py-24 text-[#FAF9F6]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="max-w-2xl mb-8 space-y-2 text-left">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-[0.25em] text-[#0F824B] uppercase">
            <Zap className="w-3.5 h-3.5" />
            <span>IDENTITY DISCOVERY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight uppercase text-white">
            FIND YOUR SIGNAL.
          </h2>
          <p className="text-xs font-mono text-[#8B8B86] uppercase tracking-wider">
            FILTER GARMENTS BY YOUR ENERGY, ATTITUDE, AND AESTHETIC CODE.
          </p>
        </div>

        {/* Interactive Signal Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-8">
          {SIGNALS.map((s) => (
            <button
              key={s.name}
              onClick={() => setActiveSignal(s.name)}
              className={`p-4 text-left border rounded-sm transition-all duration-200 ${
                activeSignal === s.name
                  ? 'bg-[#141414] border-[#0F824B] text-[#0F824B] shadow-lg'
                  : 'bg-[#0E0E0E] border-[#222222] text-[#8B8B86] hover:border-[#444444] hover:text-[#FAF9F6]'
              }`}
            >
              <div className="text-xs font-mono tracking-widest text-[#8B8B86] mb-1">
                // {s.name}
              </div>
              <div className="text-lg font-display font-bold uppercase tracking-wider text-white">
                {s.label}
              </div>
              <div className="text-[10px] font-mono text-[#8B8B86] mt-1 line-clamp-1">
                {s.tag}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Signal Showcase Box */}
        <div className="bg-[#111111] border border-[#292929] rounded-sm p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#0F824B] text-white rounded-xs uppercase">
                ACTIVE SIGNAL
              </span>
              <span className="text-xs font-mono text-[#8B8B86] uppercase">
                CODE: {current.name}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-black uppercase text-white tracking-wide">
              {current.tag}
            </h3>
            <p className="text-xs font-mono text-[#8B8B86] max-w-xl leading-relaxed uppercase">
              {current.description}
            </p>
          </div>

          <Link
            href={`/collections/all?signal=${current.name}`}
            className="inline-flex items-center gap-2 bg-[#0F824B] hover:bg-[#FFFFFF] text-[#0A0A0A] px-6 py-3 text-xs font-mono font-extrabold uppercase tracking-widest rounded-sm transition-all flex-shrink-0 group shadow-md"
          >
            <span>SHOP {current.name} SIGNAL</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
