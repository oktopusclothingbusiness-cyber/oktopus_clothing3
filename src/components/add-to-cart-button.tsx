'use client';

import { useCart } from '@/context/cart-context';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/types';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  return (
    <Button
      onClick={() => {
        addToCart(product);
      }}
    >
      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
    </Button>
  );
}
