'use client';

import React from 'react';

export function EditorialStatementSection() {
  return (
    <section className="w-full bg-[#0E0E0E] border-b border-[#222222] py-20 md:py-32 text-center text-[#FAF9F6] relative overflow-hidden select-none">
      {/* Background subtle watermark text */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <span className="text-[18vw] font-display font-black tracking-tighter uppercase whitespace-nowrap">
          OKTOPUS
        </span>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 relative z-10 space-y-6">
        <span className="text-xs font-mono font-bold tracking-[0.3em] text-[#0F824B] uppercase block">
          // THE MANIFESTO
        </span>

        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tight uppercase leading-[0.95] text-white">
          NOT FOR EVERYONE. <br />
          <span className="text-[#8B8B86]">AND THAT’S THE POINT.</span>
        </h2>

        <p className="text-xs sm:text-sm font-mono text-[#8B8B86] max-w-xl mx-auto uppercase tracking-wider leading-relaxed">
          We do not engineer basics for the masses. We build identifiers for those who refuse to blend into the background noise.
        </p>
      </div>
    </section>
  );
}
