"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { ShoppingCart, User, Search } from "lucide-react";
import { useCart } from "@/context/cart-context";

export function UixshuvoHeader() {
  const { cart } = useCart();
  
  return (
    <header className="bg-white sticky top-0 z-20 border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/store" className="text-2xl font-bold font-serif text-stone-900">
            UIXSHUVO
          </Link>
          <nav className="hidden md:flex gap-8">
            <Link href="/store" className="text-sm font-medium text-stone-900 hover:text-accent">
              Live Preview
            </Link>
            <Link href="/products" className="text-sm font-medium text-stone-900 hover:text-accent">
              Shop
            </Link>
            <Link href="#" className="text-sm font-medium text-stone-900 hover:text-accent">
              Categories
            </Link>
            <Link href="#" className="text-sm font-medium text-stone-900 hover:text-accent">
              Blog
            </Link>
            <Link href="#" className="text-sm font-medium text-stone-900 hover:text-accent">
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5 text-stone-900" />
            <span className="sr-only">Search</span>
          </Button>
           <Button asChild variant="ghost" size="icon">
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5 text-stone-900" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-accent rounded-full">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
