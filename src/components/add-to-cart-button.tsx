
'use client'

import { useCart } from "@/context/cart-context";
import { Button } from "./ui/button";
import { ShoppingCart, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Product } from '@/context/product-context';


type AddToCartButtonProps = {
  product: Product;
} & ComponentProps<typeof Button>

export function AddToCartButton({ product, className, ...props }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const isOutOfStock = (product.stock || 0) <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
        toast({
            title: "Out of Stock",
            description: "This product is currently unavailable.",
            variant: "destructive",
        });
        return;
    }
    // For list view, we add with default size and color.
    // A more complex implementation might open a dialog to select options.
    const defaultSize = product.sizes.length > 0 ? product.sizes[0] : 'N/A';
    const defaultColor = product.colors.length > 0 ? product.colors[0] : 'N/A';
    addToCart(product, defaultSize, defaultColor);
  };
  
  if (isOutOfStock) {
    return (
        <Button disabled variant="outline" className={cn("w-full", className)} {...props}>
          <XCircle className="mr-2 h-4 w-4" /> Out of Stock
        </Button>
    )
  }

  return (
    <Button onClick={handleAddToCart} className={cn("w-full", className)} {...props}>
      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
    </Button>
  );
}
