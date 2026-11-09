'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, Shield, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DeliveryLocationPill } from '@/components/delivery-location-dialog';
import { DOOM_CAMPAIGN_CONFIG } from '@/lib/doom-campaign-config';
import { DoomRunicText } from './doom-runes';
import { isStaffRole } from '@/lib/rbac';

export function DoomHeader() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(`/collections/dr-doom#${id}`);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase() || 'U';
  };

  return (
    <header className="sticky top-0 z-50 w-full select-none transition-all">
      {/* Top Ambient Hairline Border */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#494333] to-transparent" />

      {/* Main Dr. Doom Header Bar */}
      <div className="w-full bg-[#050705]/95 backdrop-blur-md border-b border-[#2D382D] shadow-[0_10px_30px_rgba(0,0,0,0.85)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between h-16 sm:h-18 lg:h-20 gap-4">
          {/* LEFT: OKTOPUS Logo + Dr. Doom Label (No pulsing dot) */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link href="/store" className="flex items-center group" aria-label="OKTOPUS Store">
              <div className="relative h-7 sm:h-8 w-28 sm:w-36 shrink-0 transition-opacity group-hover:opacity-85">
                <Image
                  src="/logo2w.png"
                  alt="OKTOPUS"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            <span className="text-[#494333] font-mono text-xs select-none">|</span>

            {/* Dr. Doom Collection Brand Pill (clean, no pulsing dot) */}
            <Link
              href="/collections/dr-doom"
              className="px-3 py-1 rounded-md bg-[#101611] border border-[#2D382D] hover:border-[#8E815A] transition-colors"
            >
              <span className="text-xs font-mono tracking-[0.2em] text-[#F2F1DD] uppercase font-semibold">
                DR. DOOM
              </span>
            </Link>

            <DeliveryLocationPill className="hidden xl:inline-flex ml-2" />
          </div>

          {/* CENTER: Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3">
            <button
              onClick={scrollToSection('collection-grid')}
              className="text-xs font-mono tracking-[0.2em] uppercase text-[#F2F1DD] hover:text-[#C1B188] hover:bg-[#101611] transition-all px-3 py-1.5 rounded-md border border-transparent hover:border-[#2D382D]"
            >
              COLLECTION
            </button>

            <button
              onClick={scrollToSection('creed')}
              className="text-xs font-mono tracking-[0.2em] uppercase text-[#A1AAA3] hover:text-[#F2F1DD] hover:bg-[#101611] transition-all px-3 py-1.5 rounded-md border border-transparent hover:border-[#2D382D]"
            >
              PHILOSOPHY
            </button>

            <Link
              href="/products"
              className="text-xs font-mono tracking-[0.2em] uppercase text-[#A1AAA3] hover:text-[#F2F1DD] hover:bg-[#101611] transition-all px-3 py-1.5 rounded-md border border-transparent hover:border-[#2D382D]"
            >
              ALL PRODUCTS
            </Link>

            <Link
              href="/custom-design"
              className="text-xs font-mono tracking-[0.2em] uppercase text-[#A1AAA3] hover:text-[#F2F1DD] hover:bg-[#101611] transition-all px-3 py-1.5 rounded-md border border-transparent hover:border-[#2D382D]"
            >
              CUSTOM ATELIER
            </Link>
          </nav>

          {/* RIGHT: User Profile & Authentication */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* Bag / Cart Button — Desktop View Only */}
            <Link
              href="/cart"
              className="hidden md:inline-flex relative p-2 sm:p-2.5 rounded-md bg-[#101611] border border-[#2D382D] hover:border-[#8E815A] text-[#F2F1DD] hover:text-[#C1B188] transition-all group"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-105" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#2D382D] border border-[#8E815A] text-[#F2F1DD] text-[10px] font-mono font-bold flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-[#8E815A] ring-1 ring-[#2D382D]">
                    <AvatarImage src={user.profilePictureUrl} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback className="bg-[#162017] text-[#F2F1DD] text-xs font-mono font-bold">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#0E140F] border border-[#494333] text-[#F2F1DD]">
                  <DropdownMenuLabel className="font-mono text-xs text-[#C1B188]">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#2D382D]" />
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className="font-mono text-xs hover:bg-[#1E281F] cursor-pointer"
                  >
                    <User className="mr-2 h-3.5 w-3.5 text-[#7B8F7C]" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  {isStaffRole(user.role) && (
                    <DropdownMenuItem
                      onClick={() => router.push('/admin/dashboard')}
                      className="font-mono text-xs hover:bg-[#1E281F] cursor-pointer"
                    >
                      <Shield className="mr-2 h-3.5 w-3.5 text-[#8E815A]" />
                      <span>Admin Portal</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-[#2D382D]" />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="font-mono text-xs text-red-400 hover:bg-[#1E281F] cursor-pointer"
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#101611] border border-[#2D382D] hover:border-[#8E815A] text-xs font-mono tracking-wider text-[#F2F1DD] uppercase transition-all"
              >
                <User className="w-3.5 h-3.5 text-[#8E815A]" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Latverian Announcement Sub-Bar */}
      <div className="w-full bg-[#070A07]/90 backdrop-blur-sm border-b border-[#2D382D] px-4 py-1.5 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#C1B188]">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-[#7B8F7C] hover:text-[#F2F1DD] transition-colors"
          >
            <ArrowLeft className="w-3 h-3 text-[#8E815A]" />
            <span className="hidden sm:inline">Store Products</span>
            <span className="sm:hidden">Store</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#F2F1DD]">{DOOM_CAMPAIGN_CONFIG.title}</span>
            <span className="text-[#494333]">•</span>
            <span className="text-[#C1B188] hidden sm:inline">{DOOM_CAMPAIGN_CONFIG.headlines.insignia}</span>
            <span className="text-[#494333] hidden sm:inline">•</span>
            <DoomRunicText text="DR DOOM" size={10} runeColor="#8E815A" className="hidden sm:inline-flex" />
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[#7B8F7C]">
            <span>LIMITED EDITION RELEASE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
