'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Check } from 'lucide-react';
import type { Product } from '@/context/product-context';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { getOptimizedImageUrl } from '@/lib/utils';
import { DoomRune, DoomCornerBrackets } from './doom-runes';

interface DoomProductCardProps {
  product: Product;
}

export function DoomProductCard({ product }: DoomProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'];
  const [selectedSize, setSelectedSize] = React.useState<string>(availableSizes[0] || 'L');
  const [isAdding, setIsAdding] = React.useState(false);

  const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : 'Black';

  const rawImage =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls[0]
      : 'https://placehold.co/600x800.png';
  const imageUrl = getOptimizedImageUrl(rawImage, 600);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);
    addToCart(product, selectedSize, defaultColor);

    toast({
      title: 'Added to Bag',
      description: `${product.name} (Size: ${selectedSize}) has been added to your cart.`,
    });

    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  const formattedPrice = (product.price || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });

  const formattedOriginalPrice = product.originalPrice
    ? (product.originalPrice || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })
    : null;

  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden bg-[#0E130F] border border-[#494333] hover:border-[#8E815A] transition-all duration-300 shadow-md">
      {/* Technical Corner Brackets */}
      <DoomCornerBrackets color="#8E815A" size={7} className="opacity-40 group-hover:opacity-90 transition-opacity" />
      {/* Product Image */}
      <Link
        href={`/products/${product._id || product.id}`}
        className="relative block aspect-[3/4] w-full overflow-hidden bg-[#050705]"
      >
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E130F] via-transparent to-transparent opacity-60" />

        {/* Limited Edition Pill with Latverian Runic Accent */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#050705]/85 backdrop-blur-sm border border-[#8E815A]/60 text-[9px] font-mono tracking-wider text-[#C1B188] uppercase">
            <DoomRune char="D" size={10} color="#C1B188" />
            <span>Limited Edition</span>
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between space-y-3 bg-[#0E130F]">
        <div className="space-y-1">
          <Link
            href={`/products/${product._id || product.id}`}
            className="block text-xs sm:text-sm font-sans font-semibold text-[#F2F1DD] hover:text-[#C1B188] transition-colors line-clamp-1"
          >
            {product.name}
          </Link>

          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-mono font-bold text-[#C1B188]">
              ₹{formattedPrice}
            </span>
            {formattedOriginalPrice && (
              <span className="text-[10px] sm:text-xs font-mono text-[#7B8F7C] line-through">
                ₹{formattedOriginalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Size Selection */}
        <div className="space-y-1">
          <span className="block text-[9px] font-mono text-[#7B8F7C] uppercase tracking-wider">
            Size:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all ${
                  selectedSize === size
                    ? 'bg-[#394F3F] text-[#F2F1DD] border border-[#C1B188]'
                    : 'bg-[#161E17] text-[#A1AAA3] border border-[#2D382D] hover:border-[#8E815A]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Add to Bag */}
        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={isAdding}
          className="w-full h-9 px-3 rounded-lg bg-[#1B231C] hover:bg-[#2D382D] active:bg-[#141A15] text-[#F2F1DD] text-xs font-mono font-semibold tracking-wider uppercase border border-[#8E815A] hover:border-[#C1B188] transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          {isAdding ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#C1B188]" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5 text-[#C1B188]" />
              <span>Add to Bag</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
