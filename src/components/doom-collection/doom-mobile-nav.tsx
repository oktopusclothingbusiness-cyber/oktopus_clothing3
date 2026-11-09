'use client';

import * as React from 'react';
import Link from 'next/link';
import { Shield, Store, Palette, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { DoomRune } from './doom-runes';

export function DoomMobileNav() {
  const { cart } = useCart();
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const scrollToGrid = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById('collection-grid');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else if (typeof window !== 'undefined') {
      window.location.href = '/collections/dr-doom#collection-grid';
    }
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== '/collections/dr-doom') {
        window.location.href = '/collections/dr-doom';
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 select-none">
      <div className="bg-[#050705]/95 backdrop-blur-xl border border-[#394F3F] shadow-[0_10px_35px_rgba(0,0,0,0.95)] rounded-full flex justify-around items-center py-2 px-3">
        {/* Doom Top / Hero */}
        <button
          onClick={scrollToTop}
          className="flex flex-col items-center justify-center gap-1 w-14 h-11 rounded-full text-[#F2F1DD] transition-colors"
        >
          <Shield className="w-4 h-4 text-[#C1B188] drop-shadow-[0_0_6px_rgba(75,94,74,0.5)]" />
          <span className="text-[9px] font-mono tracking-wider uppercase font-bold text-[#C1B188]">Doom</span>
        </button>

        {/* Pieces Grid */}
        <button
          onClick={scrollToGrid}
          className="flex flex-col items-center justify-center gap-1 w-14 h-11 rounded-full text-[#A1AAA3] hover:text-[#F2F1DD] transition-colors group"
        >
          <DoomRune char="D" size={16} color="#8E815A" className="transition-transform group-hover:scale-110" />
          <span className="text-[9px] font-mono tracking-wider uppercase">Pieces</span>
        </button>

        {/* Store All Collections */}
        <Link
          href="/products"
          className="flex flex-col items-center justify-center gap-1 w-14 h-11 rounded-full text-[#A1AAA3] hover:text-[#F2F1DD] transition-colors"
        >
          <Store className="w-4 h-4" />
          <span className="text-[9px] font-mono tracking-wider uppercase">Store</span>
        </Link>

        {/* Custom Atelier */}
        <Link
          href="/custom-design"
          className="flex flex-col items-center justify-center gap-1 w-14 h-11 rounded-full text-[#A1AAA3] hover:text-[#F2F1DD] transition-colors"
        >
          <Palette className="w-4 h-4" />
          <span className="text-[9px] font-mono tracking-wider uppercase">Custom</span>
        </Link>

        {/* Cart Bag — Mobile Floating Nav Only */}
        <Link
          href="/cart"
          className="relative flex flex-col items-center justify-center gap-1 w-14 h-11 rounded-full text-[#A1AAA3] hover:text-[#C1B188] transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="text-[9px] font-mono tracking-wider uppercase">Bag</span>
          {totalCartCount > 0 && (
            <span className="absolute top-0.5 right-2 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#2D382D] border border-[#8E815A] text-[#F2F1DD] text-[8px] font-mono font-bold flex items-center justify-center shadow-[0_0_6px_rgba(45,56,45,0.8)]">
              {totalCartCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
