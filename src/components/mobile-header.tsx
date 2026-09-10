
'use client';

import Link from "next/link";
import Image from "next/image";
import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, ShoppingBag, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import BaskeyAttribution from "./baskey-attribution";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCategory } from "@/context/category-context";

type MobileHeaderProps = {
    showCart?: boolean;
    title?: string;
}

export const MobileHeader = ({ showCart = true, title }: MobileHeaderProps) => {
    const { user } = useAuth();
    const { cart } = useCart();
    const router = useRouter();
    const { categories, loading: categoriesLoading } = useCategory();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [logoUrl, setLogoUrl] = React.useState('');

    const totalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    React.useEffect(() => {
      const fetchSettings = async () => {
        try {
          const res = await fetch('/api/settings');
          if (res.ok) {
            const data = await res.json();
            if (data.logoUrl) setLogoUrl(data.logoUrl);
          }
        } catch (e) {
          console.error("Failed to load settings logo in MobileHeader:", e);
        }
      };
      fetchSettings();
    }, []);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim() !== '') {
            router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
        }
    }
    
    const headerClasses = "md:hidden sticky top-0 z-50 p-4 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10 text-white";

    if (title) {
        return (
            <header className={cn(headerClasses)}>
                <div className="flex justify-between items-center">
                     <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:text-[#0F824B]">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="text-center flex flex-col items-center max-w-[60%]">
                        <h1 className="font-bebas font-bold text-xl uppercase tracking-wider text-white truncate leading-none">{title}</h1>
                        <BaskeyAttribution className="text-[6.5px] tracking-[0.25em] opacity-75 mt-1 block text-zinc-400" />
                    </div>
                    <div className="w-10 flex justify-end">
                        {showCart && (
                             <Button variant="ghost" size="icon" asChild className="relative text-white hover:text-[#0F824B]">
                                <Link href="/cart">
                                    <ShoppingBag className="h-5 w-5" />
                                    {totalItemCount > 0 && (
                                      <span className="absolute top-0 right-0 bg-[#0F824B] text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {totalItemCount}
                                      </span>
                                    )}
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </header>
        )
    }

    const getInitials = (firstName?: string, lastName?: string) => {
        if (!firstName && !lastName) return 'G';
        return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase() || 'G';
    }

    return (
        <header className={cn(headerClasses, "space-y-3.5")}>
            <div className="flex justify-between items-center">
                {/* Brand Logo */}
                <Link href="/store" className="flex items-center gap-2">
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt="Oktopus Clothing Logo"
                      width={120}
                      height={32}
                      className="object-contain h-8 w-auto"
                      priority
                      unoptimized
                    />
                  ) : (
                    <span className="font-bebas font-black text-xl tracking-[0.2em] uppercase text-white">
                      OKTOPUS<span className="text-[#0F824B]">.</span>
                    </span>
                  )}
                </Link>

                <div className="flex items-center gap-3">
                  <BaskeyAttribution className="text-[7.5px] tracking-[0.2em] text-zinc-500" />
                  
                  <Link href={user ? '/profile' : '/login'}>
                      <Avatar className="h-8 w-8 border border-white/20">
                          <AvatarImage src={user?.profilePictureUrl} alt="User" />
                          <AvatarFallback className="bg-zinc-800 text-white font-mono text-xs">{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                      </Avatar>
                  </Link>

                  <Link href="/cart" className="relative p-1.5 text-white hover:text-[#0F824B]">
                      <ShoppingBag className="w-5 h-5" />
                      {totalItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#0F824B] text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {totalItemCount}
                        </span>
                      )}
                  </Link>
                </div>
            </div>

            {/* Mobile Search & Filters */}
            <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input 
                        placeholder="Search drops, hoodies, tees..." 
                        className="w-full rounded-full pl-10 h-9 text-xs bg-[#141414] border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-[#0F824B]" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                         <Button variant="outline" size="icon" className="h-9 w-9 bg-[#141414] border-white/10 text-white hover:bg-[#222]">
                            <SlidersHorizontal className="h-4 w-4 text-[#0F824B]" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="bg-[#121212] border-white/10 text-white">
                        <SheetHeader>
                            <SheetTitle className="font-bebas text-xl uppercase tracking-wider text-white">Filter Apparel Catalog</SheetTitle>
                            <SheetDescription className="text-zinc-400 text-xs font-mono">Select category drop filter</SheetDescription>
                        </SheetHeader>
                        <div className="py-4">
                            <h3 className="mb-3 font-mono font-bold text-xs uppercase text-[#0F824B]">Categories</h3>
                            <div className="flex flex-wrap gap-2">
                                {categoriesLoading ? (
                                    <p className="text-xs text-zinc-500 font-mono">Loading categories...</p>
                                ) : (
                                    categories.map(category => {
                                        const catId = category?.id || (category as any)?._id?.toString() || '';
                                        const href = catId ? `/products?category=${catId}` : '/products';
                                        return (
                                            <Button asChild key={category.id || catId} variant="outline" className="rounded-full text-xs font-mono border-white/20 bg-zinc-900 text-white hover:bg-[#0F824B] hover:text-white">
                                                <Link href={href}>{category.name}</Link>
                                            </Button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}

