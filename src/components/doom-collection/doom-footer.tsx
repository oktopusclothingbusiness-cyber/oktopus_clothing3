'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, ArrowUp } from 'lucide-react';
import { DoomRuneDivider, DoomRunicText } from './doom-runes';
import { DOOM_CAMPAIGN_CONFIG } from '@/lib/doom-campaign-config';

export function DoomFooter() {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative z-10 w-full bg-transparent text-[#A1AAA3] pt-8 md:pt-12 pb-24 md:pb-12 border-t border-[#394F3F]/40 select-none">
      {/* Decorative Rune Divider */}
      <div className="max-w-5xl mx-auto px-4 mb-6 md:mb-10">
        <DoomRuneDivider runeColor="#8E815A" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        {/* ======================================================== */}
        {/* MOBILE VIEW: COMPACT, SHORT & MINIMAL */}
        {/* ======================================================== */}
        <div className="md:hidden flex flex-col items-center text-center space-y-3.5 pb-2">
          {/* Brand Logo */}
          <Link href="/store" className="inline-block">
            <div className="relative h-6 w-28">
              <Image
                src="/logo2w.png"
                alt="OKTOPUS"
                fill
                className="object-contain"
              />
            </div>
          </Link>

          {/* Title & Latverian Rune Inscription */}
          <div className="space-y-1">
            <span className="block text-[11px] font-mono font-bold tracking-[0.25em] text-[#C1B188] uppercase">
              {DOOM_CAMPAIGN_CONFIG.title}
            </span>
            <div className="pt-0.5">
              <DoomRunicText text="DR DOOM" size={11} runeColor="#8E815A" />
            </div>
          </div>

          {/* Compact Single-Row Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-[10px] font-mono text-[#A1AAA3] pt-1">
            <a href="#collection-grid" className="hover:text-[#C1B188] transition-colors">
              Collection
            </a>
            <span className="text-[#494333]">•</span>
            <Link href="/products" className="hover:text-[#C1B188] transition-colors">
              Store
            </Link>
            <span className="text-[#494333]">•</span>
            <Link href="/verify-product" className="hover:text-[#C1B188] transition-colors">
              Verify
            </Link>
            <span className="text-[#494333]">•</span>
            <Link href="/return-policy" className="hover:text-[#C1B188] transition-colors">
              Returns
            </Link>
          </div>

          {/* Minimal Copyright Bar */}
          <div className="pt-3 border-t border-[#2D382D]/70 w-full max-w-xs flex items-center justify-between text-[9px] font-mono text-[#7B8F7C]">
            <span>© 2026 OKTOPUS CLOTHING</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-[#C1B188] hover:text-[#F2F1DD] uppercase tracking-wider transition-colors"
            >
              <span>Top</span>
              <ArrowUp className="w-2.5 h-2.5 text-[#8E815A]" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP VIEW: FULL 4-COLUMN IMPERIAL ARCHIVE */}
        {/* ======================================================== */}
        <div className="hidden md:grid md:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-[#2D382D]/80">
          {/* Col 1: Brand & Latverian Seal */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/store" className="inline-block">
              <div className="relative h-7 w-32">
                <Image
                  src="/logo2w.png"
                  alt="OKTOPUS"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>

            <div className="space-y-1">
              <span className="block text-xs font-mono font-bold tracking-[0.25em] text-[#C1B188] uppercase">
                {DOOM_CAMPAIGN_CONFIG.title}
              </span>
              <p className="text-xs text-[#7B8F7C] font-sans leading-relaxed">
                Limited edition campaign release. Designed with power, authority, and relentless precision.
              </p>
            </div>

            <div className="pt-1">
              <DoomRunicText text="DR DOOM" size={14} runeColor="#8E815A" />
            </div>
          </div>

          {/* Col 2: The Collection */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono tracking-[0.25em] text-[#F2F1DD] uppercase font-bold">
              Campaign Archive
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <a
                  href="#collection-grid"
                  className="hover:text-[#C1B188] transition-colors"
                >
                  The Sovereign Edition
                </a>
              </li>
              <li>
                <a
                  href="#creed"
                  className="hover:text-[#C1B188] transition-colors"
                >
                  Imperial Creed
                </a>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-[#C1B188] transition-colors"
                >
                  All OKTOPUS Drops
                </Link>
              </li>
              <li>
                <Link
                  href="/custom-design"
                  className="hover:text-[#C1B188] transition-colors"
                >
                  Custom Atelier
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Authenticity & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono tracking-[0.25em] text-[#F2F1DD] uppercase font-bold">
              Authenticity
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link
                  href="/verify-product"
                  className="inline-flex items-center gap-1.5 hover:text-[#C1B188] transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8E815A]" />
                  <span>Verify Garment</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-[#C1B188] transition-colors"
                >
                  Our Craft & Metallurgy
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-policy"
                  className="hover:text-[#C1B188] transition-colors"
                >
                  Shipping & Dispatch
                </Link>
              </li>
              <li>
                <Link
                  href="/return-policy"
                  className="hover:text-[#C1B188] transition-colors"
                >
                  Returns & Exchanges
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Imperial Philosophy Note */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono tracking-[0.25em] text-[#F2F1DD] uppercase font-bold">
              Latverian Creed
            </h4>
            <p className="text-xs font-serif italic text-[#C1B188] leading-relaxed">
              &ldquo;{DOOM_CAMPAIGN_CONFIG.philosophy.authority}&rdquo;
            </p>
            <p className="text-[11px] font-mono text-[#7B8F7C] uppercase tracking-wider pt-1">
              {DOOM_CAMPAIGN_CONFIG.punchlines.makeEmpire}
            </p>
          </div>
        </div>

        {/* Desktop Bottom Bar */}
        <div className="hidden md:flex pt-8 flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#7B8F7C]">
          <div className="flex flex-wrap items-center justify-start gap-4">
            <span>© 2026 OKTOPUS CLOTHING</span>
            <span>•</span>
            <span className="text-[#C1B188]">DR. DOOM COLLECTION</span>
            <span>•</span>
            <span>ALL RIGHTS RESERVED</span>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1B231C] border border-[#394F3F] hover:border-[#8E815A] text-[#F2F1DD] hover:text-[#C1B188] transition-all text-[11px] font-mono tracking-wider uppercase"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3 h-3 text-[#8E815A]" />
          </button>
        </div>
      </div>
    </footer>
  );
}
