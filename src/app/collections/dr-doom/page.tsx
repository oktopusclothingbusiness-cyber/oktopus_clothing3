'use client';

import * as React from 'react';
import { DoomHeader } from '@/components/doom-collection/doom-header';
import { DoomHero } from '@/components/doom-collection/doom-hero';
import { DoomPhilosophySection } from '@/components/doom-collection/doom-philosophy-section';
import { DoomProductGrid } from '@/components/doom-collection/doom-product-grid';
import { DoomOutro } from '@/components/doom-collection/doom-outro';
import { DoomFooter } from '@/components/doom-collection/doom-footer';
import { DoomMobileNav } from '@/components/doom-collection/doom-mobile-nav';
import { DoomCursor } from '@/components/doom-collection/doom-cursor';

export default function DoomCollectionPage() {
  return (
    <div className="doom-collection relative min-h-screen bg-[#050705] text-[#F2F1DD] selection:bg-[#394F3F] selection:text-[#F2F1DD] overflow-x-hidden">
      {/* Desktop Custom Doom Mouse Pointer */}
      <DoomCursor />
      {/* ======================================================== */}
      {/* UNIFIED CONTINUOUS BACKGROUND PATTERN ACROSS ENTIRE PAGE */}
      {/* ======================================================== */}
      <div
        className="fixed inset-0 pointer-events-none opacity-45 bg-repeat bg-[length:900px_900px] mix-blend-luminosity z-0"
        style={{
          backgroundImage: "url('/doom/doom-texture.jpg')",
        }}
      />

      {/* Atmospheric Vignette Shroud (Preserves continuous darkness & text legibility) */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 80% at 50% 25%, rgba(5,7,5,0.45) 0%, rgba(5,7,5,0.85) 65%, #050705 100%)',
        }}
      />

      {/* Customized Dr. Doom Header & Navbar */}
      <DoomHeader />

      {/* Main Campaign Canvas — Seamless flow without artificial section cutoffs */}
      <main className="relative z-10 w-full overflow-hidden">
        {/* Hero Section with Prominent Pattern & Clear Foreground Focus */}
        <DoomHero />

        {/* The Sovereign Edition — "Pieces" Section just below the Hero Section */}
        <DoomProductGrid />

        {/* Minimal Philosophical Section on Dr. Doom with Cipher Runes & Technical Corner Angles */}
        <DoomPhilosophySection />

        {/* Closing Campaign Section (The Crown is Forged) */}
        <DoomOutro />
      </main>

      {/* Customized Dr. Doom Footer */}
      <DoomFooter />

      {/* Customized Dr. Doom Mobile Bottom Navbar */}
      <DoomMobileNav />
    </div>
  );
}
