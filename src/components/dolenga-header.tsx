
'use client';

import Link from "next/link";
import { Button } from "./ui/button";
import { ShoppingCart, User, Search, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";

export function DolengaHeader() {
  const { cart } = useCart();
  const { user } = useAuth();
  
  return (
    <header className="bg-background sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/store" className="text-xl font-bold uppercase font-bebas">
          DOLENGA
        </Link>
        <nav className="hidden md:flex gap-8">
          <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            КАТАЛОГ
          </Link>
          <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            О БРЕНДЕ
          </Link>
          <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            КЛИЕНТУ
          </Link>
          <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            КОНТАКТЫ
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
          <Button asChild variant="ghost" size="icon">
            <Link href="/cart" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-primary rounded-full">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
