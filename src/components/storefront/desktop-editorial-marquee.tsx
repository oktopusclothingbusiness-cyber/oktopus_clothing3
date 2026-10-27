'use client';

import * as React from 'react';

export function DesktopEditorialMarquee() {
  const statement = [
    '240 GSM COMBED COTTON',
    'ARCHITECTURAL BOXY SILHOUETTE',
    'HIGH-DENSITY SCREEN ART',
    'RELAXED DROP SHOULDER',
    'BORN FROM ART',
    'ZERO COMPROMISE',
  ];

  return (
    <div className="w-full bg-zinc-950 border-y border-white/10 py-5 overflow-hidden select-none">
      <div className="flex whitespace-nowrap items-center text-xs md:text-sm font-mono font-bold tracking-[0.25em] text-zinc-500 uppercase">
        <div className="flex items-center gap-8 animate-marquee">
          {Array.from({ length: 4 }).flatMap((_, i) =>
            statement.map((item, idx) => (
              <span key={`${i}-${idx}`} className="flex items-center gap-8">
                <span className="hover:text-white transition-colors">{item}</span>
                <span className="text-zinc-700 font-mono font-bold">•</span>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
