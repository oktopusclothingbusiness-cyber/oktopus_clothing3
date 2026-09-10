'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { MegaMenu } from './mega-menu';
import { MobileMenu } from './mobile-menu';
import { SearchOverlay } from './search-overlay';
import { CartDrawer } from './cart-drawer';

export function StorefrontHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');

  const { cart } = useCart();
  const totalItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.logoUrl) {
            setLogoUrl(data.logoUrl);
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings logo:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#292929] shadow-md py-3'
            : 'bg-[#0A0A0A] border-b border-[#1A1A1A] py-4'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Mobile Left: Menu Hamburger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="p-1 -ml-1 text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Desktop Left: Main Navigation Links */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center space-x-8 text-xs font-mono font-bold tracking-widest uppercase text-[#FAF9F6]">
            <div
              className="relative py-2"
              onMouseEnter={() => setMegaMenuOpen(true)}
            >
              <button
                className="hover:text-[#0F824B] transition-colors inline-flex items-center gap-1.5 focus:outline-none"
                onClick={() => setMegaMenuOpen((prev) => !prev)}
              >
                <span>SHOP</span>
                <span className="text-[9px] text-[#0F824B]">▾</span>
              </button>
            </div>

            <Link
              href="/products"
              className="hover:text-[#0F824B] transition-colors"
            >
              PRODUCTS
            </Link>
            <Link
              href="/collections"
              className="hover:text-[#0F824B] transition-colors"
            >
              COLLECTIONS
            </Link>

            <Link
              href="/custom-design"
              className="hover:text-[#0F824B] transition-colors text-[#0F824B]"
            >
              CUSTOM STUDIO
            </Link>

            <Link
              href="/about"
              className="hover:text-[#0F824B] transition-colors"
            >
              ABOUT
            </Link>
          </nav>

          {/* Center Brand Logo (Dynamic Image from /api/settings or Brand Logo text) */}
          <div className="flex items-center justify-center">
            <Link
              href="/store"
              className="flex items-center gap-2 select-none group"
            >
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Oktopus Clothing Logo"
                  width={160}
                  height={45}
                  className="object-contain h-10 w-auto"
                  priority
                  unoptimized
                />
              ) : (
                <span className="font-bebas font-black text-2xl md:text-3xl tracking-[0.25em] uppercase text-white group-hover:text-[#0F824B] transition-colors">
                  OKTOPUS<span className="text-[#0F824B]">.</span>
                </span>
              )}
            </Link>
          </div>

          {/* Right Utility Icons: Search, Account, Bag */}
          <div className="flex items-center space-x-5 text-xs font-mono font-bold tracking-wider uppercase text-[#FAF9F6]">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search storefront"
              className="p-1 hover:text-[#0F824B] transition-colors inline-flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline">SEARCH</span>
            </button>

            <Link
              href="/profile"
              aria-label="Account"
              className="p-1 hover:text-[#0F824B] transition-colors inline-flex items-center gap-1.5"
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">ACCOUNT</span>
            </Link>

            <button
              onClick={() => setCartDrawerOpen(true)}
              aria-label="Shopping bag"
              className="p-1 hover:text-[#0F824B] transition-colors inline-flex items-center gap-1.5 relative group"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {totalItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#0F824B] text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {totalItemCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline">BAG</span>
            </button>
          </div>
        </div>

        {/* Desktop Mega Menu Overlay */}
        <MegaMenu
          isOpen={megaMenuOpen}
          onClose={() => setMegaMenuOpen(false)}
        />
      </header>

      {/* Global Drawers & Overlays */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenSearch={() => {
          setMobileMenuOpen(false);
          setSearchOpen(true);
        }}
      />

      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />
    </>
  );
}
