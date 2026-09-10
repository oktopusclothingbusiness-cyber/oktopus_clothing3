'use client';

import React from 'react';
import Link from 'next/link';
import { X, ArrowRight, Instagram, Youtube, Twitter } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

export function MobileMenu({ isOpen, onClose, onOpenSearch }: MobileMenuProps) {
  if (!isOpen) return null;

  const NAV_LINKS = [
    { label: 'SHOP ALL', href: '/collections/all', badge: 'CATALOG' },
    { label: 'DROPS', href: '/collections/drop-04', badge: 'DROP 04 LIVE' },
    { label: 'COLLECTIONS', href: '/collections' },
    { label: 'BESTSELLERS', href: '/collections/bestsellers' },
    { label: 'NEW ARRIVALS', href: '/collections/new-arrivals' },
    { label: 'ARCHIVE', href: '/archive' },
    { label: 'ABOUT', href: '/about' },
    { label: 'CONTACT', href: '/contact' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] text-[#FAF9F6] flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200">
      {/* Top Header inside overlay */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#222222]">
        <Link
          href="/"
          onClick={onClose}
          className="text-lg font-display font-extrabold tracking-[0.25em] uppercase text-white"
        >
          OKTOPUS
        </Link>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="p-2 -mr-2 text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="px-6 py-8 flex-1">
        <ul className="space-y-4">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                onClick={onClose}
                className="group flex items-center justify-between text-2xl font-display font-bold uppercase tracking-wider text-[#FAF9F6] hover:text-[#0F824B] transition-colors py-1"
              >
                <span>{link.label}</span>
                {link.badge ? (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-[#0F824B] text-white rounded-sm">
                    {link.badge}
                  </span>
                ) : (
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Signals quick-row */}
        <div className="mt-8 pt-8 border-t border-[#222222]">
          <p className="text-[10px] font-mono tracking-[0.2em] text-[#8B8B86] uppercase mb-3">
            // FIND YOUR SIGNAL
          </p>
          <div className="grid grid-cols-3 gap-2">
            {['RAW', 'DARK', 'LOUD', 'MINIMAL', 'CHAOTIC', 'UNKNOWN'].map((s) => (
              <Link
                key={s}
                href={`/collections/all?signal=${s}`}
                onClick={onClose}
                className="py-2 text-center text-xs font-mono font-bold uppercase border border-[#222222] rounded-sm hover:border-[#0F824B] hover:text-[#0F824B] transition-all"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer Information & Socials */}
      <div className="px-6 py-6 border-t border-[#222222] bg-[#111111]/80 space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-[#8B8B86]">
          <span>WEAR THE UNUSUAL.</span>
          <span>© OKTOPUS 2026</span>
        </div>
        <div className="flex items-center gap-4 text-[#FAF9F6]">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-[#222222] rounded-sm hover:border-[#0F824B] hover:text-[#0F824B] transition-all"
            aria-label="Instagram"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-[#222222] rounded-sm hover:border-[#0F824B] hover:text-[#0F824B] transition-all"
            aria-label="YouTube"
          >
            <Youtube className="w-4 h-4" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-[#222222] rounded-sm hover:border-[#0F824B] hover:text-[#0F824B] transition-all"
            aria-label="Twitter"
          >
            <Twitter className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
