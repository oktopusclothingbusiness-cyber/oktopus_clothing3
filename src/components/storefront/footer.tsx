'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function StorefrontFooter() {
  return (
    <footer className="w-full bg-[#0A0A0A] border-t border-[#222222] text-[#FAF9F6] pt-16 pb-12">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-[#222222]">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <Link
              href="/"
              className="text-2xl font-display font-black tracking-[0.25em] uppercase text-white hover:text-[#0F824B] transition-colors inline-block"
            >
              OKTOPUS
            </Link>
            <p className="text-xs font-mono tracking-widest text-[#8B8B86] uppercase">
              WEAR THE UNUSUAL. // IDENTITY-DRIVEN STREETWEAR.
            </p>
            <p className="text-xs font-mono text-[#8B8B86] leading-relaxed max-w-sm">
              Engineered with 240+ GSM pure cotton, drop-shoulder geometry, and high-density industrial prints. Made to be noticed.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 text-[10px] font-mono px-2.5 py-1 border border-[#292929] rounded-sm text-[#0F824B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F824B] animate-pulse" />
                DROP 04 IS ACTIVE
              </span>
            </div>
          </div>

          {/* SHOP Column */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#8B8B86]">
              // SHOP
            </p>
            <ul className="space-y-2.5 text-xs font-mono uppercase">
              <li>
                <Link
                  href="/collections/new-arrivals"
                  className="text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
                >
                  NEW ARRIVALS
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/bestsellers"
                  className="text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
                >
                  BEST SELLERS
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/drop-04"
                  className="text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
                >
                  DROP 04 RELEASE
                </Link>
              </li>
              <li>
                <Link
                  href="/collections"
                  className="text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
                >
                  COLLECTION WALL
                </Link>
              </li>
              <li>
                <Link
                  href="/archive"
                  className="text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
                >
                  VAULTED ARCHIVE
                </Link>
              </li>
            </ul>
          </div>

          {/* INFO Column */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#8B8B86]">
              // INFO
            </p>
            <ul className="space-y-2.5 text-xs font-mono uppercase">
              <li>
                <Link
                  href="/about"
                  className="text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
                >
                  ABOUT OKTOPUS
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
                >
                  CONTACT & SUPPORT
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-policy"
                  className="text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
                >
                  SHIPPING & DELIVERY
                </Link>
              </li>
              <li>
                <Link
                  href="/return-policy"
                  className="text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
                >
                  RETURNS & EXCHANGES
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
                >
                  TRACK YOUR ORDER
                </Link>
              </li>
            </ul>
          </div>

          {/* FOLLOW Column */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#8B8B86]">
              // FOLLOW
            </p>
            <ul className="space-y-2.5 text-xs font-mono uppercase">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
                >
                  <span>INSTAGRAM</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
                >
                  <span>YOUTUBE</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
                >
                  <span>COMMUNITY</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#8B8B86]">
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/privacy-policy"
              className="hover:text-[#FAF9F6] transition-colors"
            >
              PRIVACY POLICY
            </Link>
            <Link
              href="/terms-and-conditions"
              className="hover:text-[#FAF9F6] transition-colors"
            >
              TERMS & CONDITIONS
            </Link>
            <Link
              href="/return-policy"
              className="hover:text-[#FAF9F6] transition-colors"
            >
              REFUND & CANCELLATION
            </Link>
            <Link
              href="/shipping-policy"
              className="hover:text-[#FAF9F6] transition-colors"
            >
              SHIPPING POLICY
            </Link>
          </div>
          <p>© 2026 OKTOPUS CLOTHING. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
}
