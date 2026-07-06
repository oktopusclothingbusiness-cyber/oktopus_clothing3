
'use client'

import Link from "next/link";
import * as React from 'react';
import { Button } from "./ui/button";
import { ShoppingCart, User, Shield, LogOut, Palette } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BaskeyAttribution from "./baskey-attribution";

export function Header() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const [logoUrl, setLogoUrl] = React.useState('');
  const router = useRouter();
  
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
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/store" className="flex items-center gap-2 text-2xl font-bold font-serif">
            {logoUrl ? (
              <Image src={logoUrl} alt="Site Logo" width={140} height={40} className="object-contain" priority />
            ) : (
              <div className="h-10 w-36" />
            )}
          </Link>
          <BaskeyAttribution className="hidden lg:inline-block border-l pl-4 border-muted-foreground/30 text-[8.5px] opacity-80" />
        </div>
        <nav className="hidden md:flex gap-6">
          <Link href="/store" className="text-sm font-medium hover:text-primary">
            Home
          </Link>
          <Link href="/products" className="text-sm font-medium hover:text-primary">
            Products
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
           <Button asChild variant="ghost" size="icon">
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>
          {user ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar>
                     <AvatarImage src={user.profilePictureUrl} alt={`${user.firstName} ${user.lastName}`} />
                     <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/orders')}>My Orders</DropdownMenuItem>
                 <DropdownMenuItem onClick={() => router.push('/my-designs')}>
                    <Palette className="mr-2 h-4 w-4" />
                    <span>My Designs</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="icon">
              <Link href="/login">
                <User className="h-5 w-5" />
                <span className="sr-only">Login</span>
              </Link>
            </Button>
          )}
          {user?.role === 'admin' && (
            <Button asChild variant="ghost" size="icon">
              <Link href="/admin">
                <Shield className="h-5 w-5" />
                <span className="sr-only">Admin</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

    