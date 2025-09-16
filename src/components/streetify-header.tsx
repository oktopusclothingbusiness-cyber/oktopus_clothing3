
'use client';

import Link from "next/link";
import { Button } from "./ui/button";
import { Search, Heart, User } from "lucide-react";
import { Input } from "./ui/input";

export function StreetifyHeader() {
  const navLinks = ["Home", "Products", "About", "Contact"];

  return (
    <header className="bg-black text-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center text-xs text-neutral-400 py-2 border-b border-neutral-800">
          <div className="flex gap-4">
            <span>Free Shipping on Orders Over ₹500</span>
            <span>|</span>
            <span>Easy Returns & Exchanges</span>
          </div>
          <div className="flex gap-4 items-center">
            <span>Stay Connected</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> Wishlist</span>
            <span>Help</span>
          </div>
        </div>
        
        {/* Main Header */}
        <div className="flex justify-between items-center py-4">
          <Link href="/store" className="text-3xl font-black uppercase tracking-tight">
            OKTOPUS
          </Link>
          <nav className="hidden md:flex gap-6">
            {navLinks.map(link => {
              const href = link === 'Home' ? '/store' : `/${link.toLowerCase()}`;
              return (
                <Link key={link} href={href} className="text-sm font-medium hover:text-primary transition-colors">
                  {link}
                </Link>
              )
            })}
          </nav>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input type="search" placeholder="Search..." className="bg-neutral-900 border-neutral-700 rounded-full h-9 pl-10 text-sm" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            </div>
             <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
             </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
