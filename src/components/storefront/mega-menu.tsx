'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      onMouseLeave={onClose}
      className="absolute top-full left-0 w-full bg-[#0A0A0A]/98 backdrop-blur-xl border-b border-[#292929] shadow-2xl z-40 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10 grid grid-cols-12 gap-8 text-[#FAF9F6]">
        {/* Column 1: FEATURED */}
        <div className="col-span-3 border-r border-[#222222] pr-6">
          <p className="text-[11px] font-mono tracking-[0.2em] text-[#8B8B86] uppercase mb-5">
            // FEATURED
          </p>
          <ul className="space-y-3 font-display uppercase tracking-wider text-lg lg:text-xl font-bold">
            <li>
              <Link
                href="/collections/drop-04"
                onClick={onClose}
                className="group flex items-center justify-between text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
              >
                <span>NEW DROP: 04</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#0F824B] text-white font-bold rounded-sm">
                  LIVE
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/collections/bestsellers"
                onClick={onClose}
                className="group flex items-center justify-between text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
              >
                <span>BEST SELLERS</span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
            <li>
              <Link
                href="/collections/limited-edition"
                onClick={onClose}
                className="group flex items-center justify-between text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
              >
                <span>LIMITED EDITION</span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
            <li>
              <Link
                href="/collections/all"
                onClick={onClose}
                className="group flex items-center justify-between text-[#8B8B86] hover:text-[#FAF9F6] transition-colors text-base"
              >
                <span>VIEW ALL CATALOG</span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 2: COLLECTIONS */}
        <div className="col-span-3 border-r border-[#222222] pr-6">
          <p className="text-[11px] font-mono tracking-[0.2em] text-[#8B8B86] uppercase mb-5">
            // COLLECTIONS
          </p>
          <ul className="space-y-3 text-sm font-medium tracking-wide uppercase">
            <li>
              <Link
                href="/collections/graphic"
                onClick={onClose}
                className="text-[#FAF9F6] hover:text-[#0F824B] transition-colors block"
              >
                GRAPHIC TEES & HOODIES
              </Link>
            </li>
            <li>
              <Link
                href="/collections/oversized"
                onClick={onClose}
                className="text-[#FAF9F6] hover:text-[#0F824B] transition-colors block"
              >
                OVERSIZED SILHOUETTES
              </Link>
            </li>
            <li>
              <Link
                href="/collections/dark"
                onClick={onClose}
                className="text-[#FAF9F6] hover:text-[#0F824B] transition-colors block"
              >
                MINIMAL & BRUTALIST
              </Link>
            </li>
            <li>
              <Link
                href="/archive"
                onClick={onClose}
                className="text-[#FAF9F6] hover:text-[#0F824B] transition-colors block"
              >
                ARCHIVE (DROP 01 - 03)
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: BY SIGNAL */}
        <div className="col-span-3 border-r border-[#222222] pr-6">
          <p className="text-[11px] font-mono tracking-[0.2em] text-[#8B8B86] uppercase mb-5">
            // BY SIGNAL
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono uppercase">
            {['RAW', 'DARK', 'LOUD', 'CALM', 'CHAOTIC', 'UNKNOWN'].map((signal) => (
              <Link
                key={signal}
                href={`/collections/all?signal=${signal}`}
                onClick={onClose}
                className="px-3 py-2 border border-[#222222] text-[#FAF9F6] hover:border-[#0F824B] hover:text-[#0F824B] hover:bg-[#111111] transition-all text-center rounded-sm font-bold"
              >
                {signal}
              </Link>
            ))}
          </div>
        </div>

        {/* Column 4: EDITORIAL IMAGE */}
        <div className="col-span-3">
          <Link
            href="/collections/drop-04"
            onClick={onClose}
            className="group relative block aspect-[4/3] w-full overflow-hidden rounded-sm border border-[#292929]"
          >
            <Image
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop"
              alt="Drop 04 Editorial"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4">
              <span className="text-[10px] font-mono tracking-widest text-[#0F824B] font-bold">
                CAMPAIGN // DROP 04
              </span>
              <span className="text-sm font-display font-bold uppercase tracking-wider text-white group-hover:text-[#0F824B] transition-colors">
                WEAR THE UNUSUAL →
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
