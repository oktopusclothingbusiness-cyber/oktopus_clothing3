'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Plus, Check } from 'lucide-react';
import { StorefrontProduct } from '@/types/storefront';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: StorefrontProduct;
  onOpenCart?: () => void;
}

export function StorefrontProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useAuth();
  const { toast } = useToast();

  const isFavorited = isInWishlist ? isInWishlist(product.id) : false;

  const image1 = product.images[0] || 'https://m.media-amazon.com/images/X/bxt1/M/Ebxt1BRRIJUjrNQ.jpg';
  const image2 = product.images[1] || image1;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorited) {
      removeFromWishlist(product.id);
      toast({ title: 'Removed from wishlist' });
    } else {
      addToWishlist(product.id);
      toast({ title: 'Saved to wishlist' });
    }
  };

  const handleQuickAdd = (size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    setSelectedSize(size);

    const defaultColor = product.colors[0]?.name || 'Black';
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrls: product.images,
      },
      size,
      defaultColor
    );

    toast({
      title: 'Added to Bag',
      description: `${product.name} (Size: ${size})`,
    });

    setTimeout(() => {
      setIsAdding(false);
      setShowQuickAdd(false);
    }, 600);
  };

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <div
      className="group relative flex flex-col w-full text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowQuickAdd(false);
      }}
    >
      {/* 4:5 Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#121212] rounded-sm border border-[#1A1A1A] group-hover:border-[#2D2D2D] transition-colors">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          {/* Primary image */}
          <Image
            src={image1}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-all duration-500 ease-out ${
              isHovered && image2 !== image1
                ? 'opacity-0 scale-100'
                : 'opacity-100 scale-100 group-hover:scale-[1.03]'
            }`}
          />
          {/* Secondary flip image */}
          {image2 !== image1 && (
            <Image
              src={image2}
              alt={`${product.name} alternate`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-all duration-500 ease-out absolute inset-0 ${
                isHovered ? 'opacity-100 scale-[1.03]' : 'opacity-0 scale-100'
              }`}
            />
          )}
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none z-10">
          {product.badge && (
            <span className="text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 bg-[#0A0A0A] text-[#FAF9F6] border border-[#292929] rounded-xs uppercase">
              {product.badge}
            </span>
          )}
          {discountPercent && (
            <span className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 bg-[#0F824B] text-white rounded-xs uppercase">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-[#0A0A0A]/60 backdrop-blur-sm border border-[#222222] text-[#FAF9F6] hover:text-[#0F824B] hover:border-[#0F824B] transition-all z-10"
        >
          <Heart
            className={`w-3.5 h-3.5 ${isFavorited ? 'fill-[#0F824B] text-[#0F824B]' : ''}`}
          />
        </button>

        {/* Quick Add Overlay on Hover (Desktop) / Button (Mobile) */}
        <div className="absolute inset-x-2 bottom-2 z-20 transition-all duration-300">
          {!showQuickAdd ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowQuickAdd(true);
              }}
              className="w-full py-2.5 px-3 bg-[#0A0A0A]/90 backdrop-blur-md border border-[#292929] text-xs font-mono font-bold uppercase tracking-wider text-[#FAF9F6] hover:bg-[#0F824B] hover:text-[#0A0A0A] hover:border-[#0F824B] opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg rounded-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>QUICK ADD</span>
            </button>
          ) : (
            <div className="w-full bg-[#0A0A0A]/95 backdrop-blur-md p-2.5 border border-[#0F824B] rounded-sm animate-in fade-in zoom-in-95 duration-150">
              <p className="text-[10px] font-mono uppercase text-[#8B8B86] text-center mb-2 font-semibold">
                SELECT SIZE
              </p>
              <div className="flex items-center justify-center gap-1.5">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    disabled={isAdding}
                    onClick={(e) => handleQuickAdd(sz, e)}
                    className={`px-2 py-1 text-[11px] font-mono font-bold uppercase border rounded-xs transition-all ${
                      selectedSize === sz && isAdding
                        ? 'bg-[#0F824B] text-white border-[#0F824B]'
                        : 'border-[#292929] text-[#FAF9F6] hover:border-[#0F824B] hover:text-[#0F824B]'
                    }`}
                  >
                    {selectedSize === sz && isAdding ? <Check className="w-3 h-3 inline" /> : sz}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Info Details */}
      <div className="pt-3 pb-1 flex flex-col space-y-1">
        <Link href={`/products/${product.id}`} className="group-hover:text-[#0F824B] transition-colors">
          <h3 className="text-xs md:text-sm font-display font-bold uppercase tracking-wider text-[#FAF9F6] line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-[11px] font-mono text-[#8B8B86] line-clamp-1 uppercase">
          {product.subtitle || '240 GSM COMBED COTTON'}
        </p>
        <div className="flex items-center gap-2 pt-0.5 font-mono text-xs md:text-sm">
          <span className="font-bold text-[#FAF9F6]">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-[#8B8B86] line-through text-xs">
              ₹{product.compareAtPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
