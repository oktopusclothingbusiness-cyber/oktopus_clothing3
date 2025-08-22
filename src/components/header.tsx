
'use client'

import Link from "next/link";
import { Button } from "./ui/button";
import { ShoppingCart, User, Shield, LogOut } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";

export function Header() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  
  return (
    <header className="bg-background border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/store" className="text-2xl font-bold font-serif">
          VogueVerse
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/store" className="text-sm font-medium hover:text-primary">
            Home
          </Link>
          <Link href="/products" className="text-sm font-medium hover:text-primary">
            Products
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary">
            About
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
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
            <Button onClick={logout} variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
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
