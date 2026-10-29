'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingCart,
  User,
  Shield,
  LogOut,
  Palette,
  Search,
  X,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from './theme-toggle';
import BaskeyAttribution from './baskey-attribution';
import { isStaffRole } from '@/lib/rbac';

export function Header() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchActive, setIsSearchActive] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Focus search input when activated
  React.useEffect(() => {
    if (isSearchActive) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchActive]);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase() || 'U';
  };

  // Sync search input if already on /products page with a query
  React.useEffect(() => {
    if (typeof window !== 'undefined' && pathname === '/products') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || params.get('search');
      if (q) {
        setSearchQuery(q);
        setIsSearchActive(true);
      }
    }
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'COLLECTIONS', href: '/products' },
    { label: 'FEATURED DROPS', href: '/products?featured=true' },
    { label: 'CUSTOM ATELIER', href: '/custom-design' },
    { label: 'OUR CRAFT', href: '/about' },
    { label: 'SUPPORT', href: '/contact' },
  ];

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border select-none text-foreground transition-all">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between h-16 sm:h-18 lg:h-20 gap-4">
        {/* ======================================================== */}
        {/* LEFT: Brand Logo & Attribution separated by '|' */}
        {/* ======================================================== */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link href="/store" className="flex items-center group" aria-label="OKTOPUS Home">
            <div className="relative h-7 sm:h-8 w-32 sm:w-40 shrink-0 transition-opacity group-hover:opacity-85">
              {/* Dark Theme: logo2w.png */}
              <Image
                src="/logo2w.png"
                alt="OKTOPUS"
                fill
                className="object-contain object-left hidden dark:block"
                priority
              />
              {/* Light Theme: logo2b.png */}
              <Image
                src="/logo2b.png"
                alt="OKTOPUS"
                fill
                className="object-contain object-left block dark:hidden"
                priority
              />
            </div>
          </Link>

          {/* Separator and brand attribution directly beside the logo */}
          <span className="text-muted-foreground/40 font-mono text-xs select-none">|</span>
          <BaskeyAttribution className="text-[8.5px] sm:text-[9px] text-muted-foreground/80 hover:text-foreground font-mono tracking-widest shrink-0" />
        </div>

        {/* ======================================================== */}
        {/* CENTER: Clean Editorial Navigation Links (Desktop) */}
        {/* ======================================================== */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-8 xl:gap-10">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/products'
                ? pathname === '/products' && !window?.location?.search?.includes('featured')
                : pathname === link.href;

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-xs font-mono tracking-[0.2em] uppercase transition-colors px-3 py-1.5 rounded-full ${
                  isActive
                    ? 'text-foreground font-bold bg-muted/80'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ======================================================== */}
        {/* RIGHT: Search, Theme, Cart & User Actions (Rounded Edges) */}
        {/* ======================================================== */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search Trigger / Input */}
          {isSearchActive ? (
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <button
                type="submit"
                className="absolute left-2.5 text-muted-foreground hover:text-foreground p-0.5 rounded-full z-10"
                aria-label="Submit search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="SEARCH APPAREL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsSearchActive(false);
                  }
                }}
                enterKeyHint="search"
                className="h-9 w-40 sm:w-60 bg-muted/70 border border-input pl-8 pr-8 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring rounded-full transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  setIsSearchActive(false);
                  setSearchQuery('');
                  if (pathname === '/products') {
                    router.push('/products');
                  }
                }}
                className="absolute right-2.5 text-muted-foreground hover:text-foreground p-0.5 rounded-full z-10"
                aria-label="Close search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchActive(true)}
              className="rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Search Catalog"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          {/* Theme Toggle */}
          <ThemeToggle className="rounded-full" />

          {/* Shopping Cart Button with Rounded Badge */}
          <Button asChild variant="ghost" size="icon" className="rounded-full relative">
            <Link href="/cart" aria-label="Shopping Cart">
              <ShoppingCart className="h-5 w-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
                  {totalCartCount}
                </span>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>

          {/* User Account / Sign In */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full p-0">
                  <Avatar className="h-8 w-8 rounded-full">
                    <AvatarImage
                      src={user.profilePictureUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="rounded-full object-cover"
                    />
                    <AvatarFallback className="rounded-full bg-muted font-mono text-xs font-bold">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-background border border-border text-foreground rounded-xl p-1.5 shadow-xl font-mono"
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground font-bold px-3 py-2 border-b">
                  {user.firstName ? `${user.firstName} ${user.lastName || ''}`.toUpperCase() : 'MY ACCOUNT'}
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push('/profile')}
                  className="text-xs hover:bg-muted cursor-pointer px-3 py-2 rounded-lg transition-colors"
                >
                  <User className="mr-2 h-3.5 w-3.5" />
                  <span>Profile & Addresses</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push('/orders')}
                  className="text-xs hover:bg-muted cursor-pointer px-3 py-2 rounded-lg transition-colors"
                >
                  <Package className="mr-2 h-3.5 w-3.5" />
                  <span>My Orders</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push('/my-designs')}
                  className="text-xs hover:bg-muted cursor-pointer px-3 py-2 rounded-lg transition-colors"
                >
                  <Palette className="mr-2 h-3.5 w-3.5" />
                  <span>Bespoke Studio Prints</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-xs hover:bg-destructive/10 text-destructive cursor-pointer px-3 py-2 rounded-lg transition-colors"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="sm" className="rounded-full px-3 text-xs font-mono">
              <Link href="/login" className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">SIGN IN</span>
              </Link>
            </Button>
          )}

          {/* Admin Portal Badge for Staff */}
          {isStaffRole(user?.role) && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full border-amber-500/30 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 text-[10px] font-mono font-bold tracking-widest px-3 h-8"
            >
              <Link href="/admin" className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">ADMIN</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}