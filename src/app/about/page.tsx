'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, Layers } from 'lucide-react';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { StorefrontHeader } from '@/components/storefront/header';
import { StorefrontFooter } from '@/components/storefront/footer';
import { PageBanner } from '@/components/storefront/page-banner';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAF9F6] font-sans antialiased selection:bg-[#0F824B] selection:text-[#0A0A0A]">
      <AnnouncementBar />
      <StorefrontHeader />

      {/* DYNAMIC DATABASE BANNER FOR ABOUT PAGE */}
      <PageBanner
        placement="about_page"
        fallbackTitle="WE DON’T MAKE BASICS. WE MAKE IDENTIFIERS."
        fallbackDescription="OKTOPUS WAS FOUNDED ON A SINGLE PRINCIPLE: CLOTHING SHOULD NEVER BE AN INVISIBLE AFTERTHOUGHT."
        fallbackCtaText="EXPLORE OUR PHILOSOPHY"
        fallbackCtaLink="/about"
      />

      <main className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 md:py-24">
        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 border border-[#222222] bg-[#0E0E0E] rounded-2xl space-y-4">
            <ShieldCheck className="w-6 h-6 text-[#0F824B]" />
            <h3 className="text-xl font-display font-black uppercase tracking-wider text-white">
              TEXTILE DISCIPLINE
            </h3>
            <p className="text-xs font-mono text-[#8B8B86] uppercase leading-relaxed">
              We exclusively mill 240+ GSM combed cotton. Every roll is tested for shrinkage control, surface density, and yarn strength before cutting.
            </p>
          </div>

          <div className="p-8 border border-[#222222] bg-[#0E0E0E] rounded-2xl space-y-4">
            <Layers className="w-6 h-6 text-[#0F824B]" />
            <h3 className="text-xl font-display font-black uppercase tracking-wider text-white">
              ENGINEERED SILHOUETTE
            </h3>
            <p className="text-xs font-mono text-[#8B8B86] uppercase leading-relaxed">
              No off-the-shelf blanks. Every tee, hoodie, and cargo is engineered from custom pattern measurements featuring dropped shoulders and structured drape.
            </p>
          </div>

          <div className="p-8 border border-[#222222] bg-[#0E0E0E] rounded-2xl space-y-4">
            <Sparkles className="w-6 h-6 text-[#0F824B]" />
            <h3 className="text-xl font-display font-black uppercase tracking-wider text-white">
              SUSTAINED IDENTITY
            </h3>
            <p className="text-xs font-mono text-[#8B8B86] uppercase leading-relaxed">
              Screen and puff hybrid prints formulated to withstand 50+ wash cycles. Clothing built to become a cherished artifact in your wardrobe.
            </p>
          </div>
        </div>

        {/* Bottom CTA Box */}
        <div className="bg-[#111111] border border-[#292929] rounded-2xl p-8 md:p-12 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-display font-black uppercase text-white">
            FIND YOUR SIGNAL IN THE LATEST DROP
          </h2>
          <p className="text-xs font-mono text-[#8B8B86] uppercase max-w-md mx-auto">
            EXPLORE THE COMPLETE MERCHANDISE ARCHITECTURE OF OKTOPUS CLOTHING.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#0F824B] hover:bg-[#0b663a] text-[#0A0A0A] font-mono font-extrabold text-xs uppercase tracking-widest py-3.5 px-8 rounded-full transition-all group shadow-lg"
          >
            <span>SHOP CATALOG</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
