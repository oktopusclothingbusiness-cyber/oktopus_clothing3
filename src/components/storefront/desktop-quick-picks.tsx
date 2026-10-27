'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { getProductImage } from '@/lib/utils';
import type { Product } from '@/context/product-context';

interface DesktopQuickPicksProps {
  products: Product[];
}

export function DesktopQuickPicks({ products }: DesktopQuickPicksProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Pick top 3 diverse products
  const quickProducts = React.useMemo(() => {
    return (products || []).slice(0, 3);
  }, [products]);

  // Track selected size for each of the 3 products
  const [selectedSizes, setSelectedSizes] = React.useState<Record<string, string>>({});
  const [addedState, setAddedState] = React.useState<Record<string, boolean>>({});

  const handleSelectSize = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleQuickAdd = (product: Product) => {
    const availableSizes =
      product.sizes && product.sizes.length > 0 ? product.sizes : ['M', 'L', 'XL'];
    const chosenSize = selectedSizes[product.id] || availableSizes[0];
    const chosenColor = (product.colors && product.colors[0]) || 'Standard';

    addToCart(product, chosenSize, chosenColor);

    // Provide visual feedback
    setAddedState((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedState((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);

    toast({
      title: 'Added to Cart',
      description: `${product.name} (Size: ${chosenSize}) added to your cart.`,
    });
  };

  if (quickProducts.length === 0) return null;

  return (
    <section className="bg-zinc-950/80 py-16 lg:py-20 border-b border-white/10 select-none">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-zinc-500">
              CURATED ESSENTIALS • DIRECT PURCHASE
            </span>
            <h2 className="text-4xl lg:text-5xl font-black font-bebas tracking-tight text-white mt-1">
              INSTANT STREETWEAR PICKS
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-md">
              Select your size and add directly to your cart without leaving the page.
            </p>
          </div>

          <Link
            href="/products"
            className="text-xs font-mono font-bold text-zinc-300 hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors"
          >
            <span>EXPLORE ALL {products.length} PRODUCTS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3-Product Quick Add Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {quickProducts.map((product) => {
            const productImg = getProductImage(
              product.imageUrls,
              'https://placehold.co/600x800.png',
              600
            );
            const sizes =
              product.sizes && product.sizes.length > 0 ? product.sizes : ['M', 'L', 'XL'];
            const activeSize = selectedSizes[product.id] || sizes[0];
            const isJustAdded = addedState[product.id];

            return (
              <div
                key={product.id}
                className="bg-zinc-950 border border-white/10 overflow-hidden shadow-lg p-5 flex flex-col justify-between hover:border-white/30 transition-all duration-300 group"
              >
                <div>
                  {/* Image Frame */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-black mb-4 border border-white/5">
                    <Image
                      src={productImg}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/80 border border-white/20 text-[11px] font-mono font-bold text-white">
                      ₹{product.price}
                    </div>
                  </div>

                  {/* Title & Tag */}
                  <Link href={`/products/${product.id}`} className="block">
                    <h3 className="font-bebas text-2xl tracking-wide text-white uppercase truncate hover:text-amber-400 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-4">
                    100% HEAVY COTTON • 240 GSM
                  </p>

                  {/* Size Selector */}
                  <div className="space-y-1.5 mb-5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      Select Size:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {sizes.slice(0, 4).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleSelectSize(product.id, sz)}
                          className={`px-3 py-1 text-xs font-mono font-bold border transition-all ${
                            activeSize === sz
                              ? 'bg-white text-black border-white shadow-md'
                              : 'bg-zinc-900 text-zinc-400 border-white/15 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Add Button */}
                <Button
                  onClick={() => handleQuickAdd(product)}
                  className={`w-full rounded-none h-11 text-xs font-bold font-mono tracking-wider transition-all ${
                    isJustAdded
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {isJustAdded ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" /> ADDED TO CART
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5" /> QUICK ADD • ₹{product.price}
                    </span>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
