

'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Plus, Check } from 'lucide-react';
import type { Product } from '@/context/product-context';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, isWithinInterval, subDays } from 'date-fns';

export function ProductCard({ product, isMobile = false }: { product: Product; isMobile?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useAuth();
  const { toast } = useToast();

  if (!product) return null;

  const productId = product?.id || (product as any)?._id?.toString() || '';
  const productHref = productId ? `/products/${productId}` : '/products';
  const isFavorited = isInWishlist ? isInWishlist(productId) : false;

  // Filter valid image URLs
  const validImages = useMemo(() => {
    const urls = (product.imageUrls || []).filter(
      (url) =>
        typeof url === 'string' &&
        (url.trim().startsWith('http://') || url.trim().startsWith('https://') || url.trim().startsWith('/'))
    );
    return urls.length > 0
      ? urls
      : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'];
  }, [product.imageUrls]);

  const image1 = validImages[0];
  const image2 = validImages[1] || image1;

  const priceFormatted = (product.price || 0).toLocaleString('en-IN');
  const originalPriceFormatted = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice.toLocaleString('en-IN')
    : null;

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : product.discountPercentage || null;

  const isNew = product.createdAt && isWithinInterval(new Date(product.createdAt), {
    start: subDays(new Date(), 14),
    end: new Date(),
  });

  const availableSizes = product.sizes && product.sizes.length > 0
    ? product.sizes
    : ['S', 'M', 'L', 'XL'];

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorited) {
      removeFromWishlist(productId);
      toast({ title: 'Removed from wishlist' });
    } else {
      addToWishlist(productId);
      toast({ title: 'Saved to wishlist' });
    }
  };

  const handleQuickAdd = (size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    setSelectedSize(size);

    const defaultColor = product.colors && product.colors.length > 0
      ? (typeof product.colors[0] === 'string' ? product.colors[0] : (product.colors[0] as any)?.name || 'Black')
      : 'Black';

    addToCart(
      {
        id: productId,
        name: product.name || 'Unnamed Item',
        price: product.price,
        imageUrls: validImages,
      },
      size,
      defaultColor
    );

    toast({
      title: 'Added to Bag',
      description: `${product.name || 'Item'} (Size: ${size})`,
    });

    setTimeout(() => {
      setIsAdding(false);
      setShowQuickAdd(false);
    }, 600);
  };

  return (
    <div
      className="group relative flex flex-col w-full text-left font-sans"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowQuickAdd(false);
      }}
    >
      {/* 4:5 Streetwear Aspect Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#121212] rounded-xl border border-white/10 group-hover:border-[#0F824B]/60 transition-all duration-300">
        <Link href={productHref} className="block w-full h-full">
          {/* Primary image */}
          <Image
            src={image1}
            alt={product.name || 'Streetwear Product'}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-all duration-500 ease-out ${
              isHovered && image2 !== image1
                ? 'opacity-0 scale-100'
                : 'opacity-100 scale-100 group-hover:scale-105'
            }`}
            unoptimized
          />
          {/* Secondary flip image */}
          {image2 !== image1 && (
            <Image
              src={image2}
              alt={`${product.name} alternate`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-all duration-500 ease-out absolute inset-0 ${
                isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
              unoptimized
            />
          )}
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          {isNew && (
            <span className="text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 bg-[#0A0A0A] text-white border border-white/20 rounded uppercase">
              FRESH DROP
            </span>
          )}
          {discountPercent ? (
            <span className="text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 bg-[#0F824B] text-white font-bold rounded uppercase">
              -{discountPercent}% OFF
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:text-[#0F824B] hover:border-[#0F824B] transition-all z-10"
        >
          <Heart
            className={`w-4 h-4 ${isFavorited ? 'fill-[#0F824B] text-[#0F824B]' : ''}`}
          />
        </button>

        {/* Quick Add Overlay on Hover */}
        <div className="absolute inset-x-2 bottom-2 z-20 transition-all duration-300">
          {!showQuickAdd ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowQuickAdd(true);
              }}
              className="w-full py-2.5 px-3 bg-[#0A0A0A]/95 backdrop-blur-md border border-white/20 text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-[#0F824B] hover:text-white hover:border-[#0F824B] opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>QUICK ADD</span>
            </button>
          ) : (
            <div className="w-full bg-[#0A0A0A]/95 backdrop-blur-md p-2.5 border border-[#0F824B] rounded-lg animate-in fade-in zoom-in-95 duration-150">
              <p className="text-[10px] font-mono uppercase text-zinc-400 text-center mb-2 font-semibold">
                SELECT SIZE
              </p>
              <div className="flex items-center justify-center gap-1.5">
                {availableSizes.map((sz) => (
                  <button
                    key={sz}
                    disabled={isAdding}
                    onClick={(e) => handleQuickAdd(sz, e)}
                    className={`px-2 py-1 text-[11px] font-mono font-bold uppercase border rounded transition-all ${
                      selectedSize === sz && isAdding
                        ? 'bg-[#0F824B] text-white border-[#0F824B]'
                        : 'border-white/20 text-white hover:border-[#0F824B] hover:text-[#0F824B]'
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
        <Link href={productHref} className="group-hover:text-[#0F824B] transition-colors">
          <h3 className="text-sm font-bebas font-bold uppercase tracking-wide text-white line-clamp-1 text-base">
            {product.name || 'Unnamed Product'}
          </h3>
        </Link>
        <p className="text-[11px] font-mono text-zinc-400 line-clamp-1 uppercase">
          {product.category?.[0] || '240 GSM COMBED COTTON'}
        </p>
        <div className="flex items-center gap-2 pt-0.5 font-mono text-sm">
          <span className="font-bold text-white">
            ₹{priceFormatted}
          </span>
          {originalPriceFormatted && (
            <span className="text-zinc-500 line-through text-xs">
              ₹{originalPriceFormatted}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

