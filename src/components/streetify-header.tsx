
'use client';

import Link from "next/link";
import { Button } from "./ui/button";
import { Search, Heart, User } from "lucide-react";
import { Input } from "./ui/input";
import * as React from 'react';
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";

export function StreetifyHeader() {
  const navLinks = ["Home", "Products", "About", "Contact"];
  const [logoUrl, setLogoUrl] = React.useState('');

  React.useEffect(() => {
    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                setLogoUrl(data.logoUrl || '');
            }
        } catch (error) {
            console.error("Failed to fetch settings for header logo:", error);
        }
    };
    fetchSettings();
  }, []);

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
          <Link href="/store" className="flex items-center gap-2">
            {logoUrl ? (
              <Image src={logoUrl} alt="Site Logo" width={140} height={40} className="object-contain" priority />
            ) : (
              <div className="h-10 w-36" />
            )}
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
             <ThemeToggle />
             <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
             </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
