'use client'

import { useCart } from "@/context/cart-context";
import { Button } from "./ui/button";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};

type AddToCartButtonProps = {
  product: Product;
} & ComponentProps<typeof Button>

export function AddToCartButton({ product, className, ...props }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  return (
    <Button onClick={() => addToCart(product)} className={cn("w-full", className)} {...props}>
      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
    </Button>
  );
}
