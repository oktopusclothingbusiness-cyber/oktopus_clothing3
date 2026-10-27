'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/utils';

export function DesktopBrandInterlude() {
  const lookbookImage = getOptimizedImageUrl(
    'https://i.ibb.co/LdxSvMMd/mrvl-model-5.png',
    1920
  );

  return (
    <section className="relative w-full bg-black py-20 lg:py-28 overflow-hidden border-b border-white/10 select-none">
      {/* Background Graphic Scrim */}
      <div className="absolute inset-0 z-0 opacity-25">
        <Image
          src={lookbookImage}
          alt="OKTOPUS Streetwear Lookbook"
          fill
          sizes="100vw"
          className="object-cover grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/60" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-2xl space-y-6">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 font-bold">
            DESIGN PHILOSOPHY • CRAFT
          </p>

          <h2 className="text-5xl lg:text-7xl font-black font-bebas tracking-tight text-white leading-[0.95]">
            BORN FROM ART.<br />
            <span className="text-zinc-500">ENGINEERED FOR THE STREET.</span>
          </h2>

          <p className="text-base lg:text-lg text-zinc-300 leading-relaxed font-normal">
            Every OKTOPUS garment is designed as a physical canvas—built with dense 240 GSM combed cotton, custom hand-separated graphics, and an architectural drop-shoulder cut that retains its silhouette season after season.
          </p>

          <div className="pt-2">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-none h-13 px-8 text-xs font-mono font-bold tracking-widest border-white/30 text-white hover:bg-white hover:text-black transition-all"
            >
              <Link href="/about" className="flex items-center gap-2">
                DISCOVER OUR CRAFT
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

