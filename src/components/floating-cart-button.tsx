
'use client';

import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function FloatingCartButton() {
  const { cart } = useCart();
  const pathname = usePathname();

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const hiddenPaths = [
    '/cart',
    '/login',
    '/signup',
    '/admin', // also covers /admin/*
    '/profile', // also covers /profile/*
  ];

  const shouldHide = hiddenPaths.some(path => pathname.startsWith(path));

  if (shouldHide || cartItemCount === 0) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-20 right-4 z-50">
      <Button asChild size="icon" className="relative h-14 w-14 rounded-full shadow-lg">
        <Link href="/cart">
          <ShoppingCart className="h-6 w-6" />
          {cartItemCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
              {cartItemCount}
            </span>
          )}
          <span className="sr-only">Shopping Cart</span>
        </Link>
      </Button>
    </div>
  );
}
