'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Ruler,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronDown,
  Heart,
  Sparkles,
} from 'lucide-react';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { StorefrontHeader } from '@/components/storefront/header';
import { StorefrontFooter } from '@/components/storefront/footer';
import { StorefrontProductGrid } from '@/components/storefront/product-grid';
import { SizeGuideModal } from '@/components/storefront/size-guide-modal';
import { useProduct } from '@/context/product-context';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import {
  SEED_STOREFRONT_PRODUCTS,
  toStorefrontProduct,
} from '@/data/storefront-data';
import { StorefrontProduct } from '@/types/storefront';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = String(params.id || '');

  const { products: dbProducts, loading } = useProduct();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useAuth();
  const { toast } = useToast();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [techSpecsOpen, setTechSpecsOpen] = useState(true);
  const [careOpen, setCareOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const mainCtaRef = useRef<HTMLDivElement>(null);

  // Find product from database or seed catalog
  const product: StorefrontProduct = useMemo(() => {
    if (dbProducts && dbProducts.length > 0) {
      const found = dbProducts.find((p) => (p.id || p._id) === productId);
      if (found) return toStorefrontProduct(found);
    }
    const seedFound = SEED_STOREFRONT_PRODUCTS.find((p) => p.id === productId);
    if (seedFound) return seedFound;
    return SEED_STOREFRONT_PRODUCTS[0];
  }, [dbProducts, productId]);

  // Related products
  const relatedProducts = useMemo(() => {
    const list =
      dbProducts && dbProducts.length > 0
        ? dbProducts.map(toStorefrontProduct)
        : SEED_STOREFRONT_PRODUCTS;
    return list.filter((p) => p.id !== product.id).slice(0, 4);
  }, [dbProducts, product.id]);

  useEffect(() => {
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0].name);
    }
    setActiveImageIndex(0);
  }, [product]);

  // Monitor scroll for mobile sticky buy bar
  useEffect(() => {
    const handleScroll = () => {
      if (!mainCtaRef.current) return;
      const rect = mainCtaRef.current.getBoundingClientRect();
      // Show sticky bar when the main button scrolls above the screen
      setShowStickyBar(rect.bottom < 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isFavorited = isInWishlist ? isInWishlist(product.id) : false;

  const handleWishlistToggle = () => {
    if (isFavorited) {
      removeFromWishlist(product.id);
      toast({ title: 'Removed from wishlist' });
    } else {
      addToWishlist(product.id);
      toast({ title: 'Saved to wishlist' });
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({ title: 'Please select a size.', variant: 'destructive' });
      return;
    }
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrls: product.images,
      },
      selectedSize,
      selectedColor || 'Default'
    );
    toast({
      title: 'Added to Bag',
      description: `${product.name} (Size: ${selectedSize})`,
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast({ title: 'Please select a size.', variant: 'destructive' });
      return;
    }
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrls: product.images,
      },
      selectedSize,
      selectedColor || 'Default'
    );
    router.push('/checkout');
  };

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100
        )
      : null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAF9F6] font-sans antialiased selection:bg-[#0F824B] selection:text-[#0A0A0A]">
      <AnnouncementBar />
      <StorefrontHeader />

      <main className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10 md:py-16">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs font-mono text-[#8B8B86] uppercase mb-8">
          <Link href="/" className="hover:text-[#FAF9F6] transition-colors">
            HOME
          </Link>
          <span>/</span>
          <Link
            href="/collections/all"
            className="hover:text-[#FAF9F6] transition-colors"
          >
            CATALOG
          </Link>
          <span>/</span>
          <span className="text-[#0F824B] truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* Product PDP Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left: High-Density Image Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Large Active Image */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm border border-[#222222] bg-[#121212]">
              <Image
                src={
                  product.images[activeImageIndex] ||
                  product.images[0] ||
                  'https://m.media-amazon.com/images/X/bxt1/M/Ebxt1BRRIJUjrNQ.jpg'
                }
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                {product.badge && (
                  <span className="text-[10px] font-mono font-bold tracking-widest px-3 py-1 bg-[#0A0A0A]/90 border border-[#292929] text-[#0F824B] rounded-xs uppercase">
                    {product.badge}
                  </span>
                )}
                {discountPercent && (
                  <span className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 bg-[#0F824B] text-white rounded-xs uppercase">
                    SAVE {discountPercent}%
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-[#0A0A0A]/70 backdrop-blur-md border border-[#292929] hover:border-[#0F824B] text-[#FAF9F6] transition-all"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorited ? 'fill-[#0F824B] text-[#0F824B]' : ''
                  }`}
                />
              </button>
            </div>

            {/* Thumbnail Strip Navigation */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-[4/5] overflow-hidden rounded-xs border transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#0F824B] opacity-100 ring-1 ring-[#0F824B]'
                        : 'border-[#222222] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Purchase Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            {/* Title & Subtitle */}
            <div className="space-y-2 pb-5 border-b border-[#222222]">
              <div className="flex items-center gap-2 text-xs font-mono text-[#8B8B86] uppercase">
                <span>{product.badge || 'DROP 04'}</span>
                <span>•</span>
                <span>{product.signal || 'STREETWEAR'}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight uppercase text-white leading-tight">
                {product.name}
              </h1>

              <p className="text-xs font-mono text-[#8B8B86] uppercase tracking-wider">
                {product.subtitle || '240 GSM HEAVYWEIGHT PURE COTTON'}
              </p>

              {/* Price Block */}
              <div className="flex items-baseline gap-3 pt-2 font-mono">
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.compareAtPrice &&
                  product.compareAtPrice > product.price && (
                    <span className="text-sm text-[#8B8B86] line-through">
                      ₹{product.compareAtPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                {discountPercent && (
                  <span className="text-xs font-bold text-[#0F824B]">
                    ({discountPercent}% OFF)
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-[#8B8B86]">
                MRP INCL. OF ALL TAXES // FREE SHIPPING ON ORDERS ABOVE ₹999
              </p>
            </div>

            {/* Color Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#8B8B86] uppercase">COLOR:</span>
                  <span className="text-white font-bold uppercase">
                    {selectedColor}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {product.colors.map((col) => (
                    <button
                      key={col.name}
                      onClick={() => setSelectedColor(col.name)}
                      className={`relative w-8 h-8 rounded-full border-2 transition-all p-0.5 ${
                        selectedColor === col.name
                          ? 'border-[#0F824B] scale-110'
                          : 'border-transparent hover:border-[#444444]'
                      }`}
                      title={col.name}
                    >
                      <div
                        className="w-full h-full rounded-full border border-black/30"
                        style={{ backgroundColor: col.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector with Size Guide */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8B8B86] uppercase">SELECT SIZE:</span>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1.5 text-[#0F824B] hover:underline uppercase font-bold text-[11px]"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>SIZE GUIDE</span>
                </button>
              </div>

              {/* Size Buttons */}
              <div className="grid grid-cols-5 gap-2 font-mono">
                {product.sizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-3 text-xs font-bold uppercase border rounded-xs transition-all ${
                        isSelected
                          ? 'bg-[#0F824B] text-white border-[#0F824B] shadow-md font-extrabold'
                          : 'bg-[#111111] border-[#292929] text-[#FAF9F6] hover:border-[#0F824B]'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Action CTAs */}
            <div ref={mainCtaRef} className="space-y-3 pt-4">
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-[#FFFFFF] hover:bg-[#0F824B] text-white font-display font-black text-sm uppercase tracking-widest rounded-sm transition-all duration-200 shadow-xl flex items-center justify-center gap-2 group"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO BAG</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 bg-[#141414] hover:bg-[#1A1A1A] border border-[#292929] hover:border-[#0F824B] text-[#FAF9F6] hover:text-[#0F824B] font-mono font-bold text-xs uppercase tracking-widest rounded-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>BUY NOW WITH 1-CLICK</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Guarantees Strip */}
            <div className="grid grid-cols-3 gap-2 py-4 border-y border-[#222222] text-center font-mono text-[10px] text-[#8B8B86]">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-[#0F824B]" />
                <span>FREE SHIPPING &gt; ₹999</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#0F824B]" />
                <span>240 GSM COMBED</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-[#0F824B]" />
                <span>EXCHANGE VERIFIED</span>
              </div>
            </div>

            {/* Accordion 1: Technical Specifications */}
            <div className="border-b border-[#222222] py-4">
              <button
                onClick={() => setTechSpecsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-[#FAF9F6] focus:outline-none"
              >
                <span>PRODUCT SPECIFICATIONS</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    techSpecsOpen ? 'rotate-180 text-[#0F824B]' : ''
                  }`}
                />
              </button>
              {techSpecsOpen && (
                <div className="mt-4 space-y-2 font-mono text-xs text-[#8B8B86] uppercase leading-relaxed">
                  <p>
                    <strong className="text-white">SILHOUETTE:</strong>{' '}
                    {product.fit || 'Oversized / Engineered Drop Shoulder'}
                  </p>
                  <p>
                    <strong className="text-white">FABRIC:</strong>{' '}
                    {product.fabric || '100% Combed Cotton'}
                  </p>
                  <p>
                    <strong className="text-white">DENSITY:</strong>{' '}
                    {product.gsm || 240} GSM Heavyweight
                  </p>
                  <p>
                    <strong className="text-white">PRINT METHOD:</strong>{' '}
                    {product.print || 'High Definition Screen & Puff Print'}
                  </p>
                  <p>
                    <strong className="text-white">FINISH:</strong>{' '}
                    {product.finish || 'Bio-Washed & Silicon Softened'}
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 2: Care Instructions */}
            <div className="border-b border-[#222222] py-4">
              <button
                onClick={() => setCareOpen((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-[#FAF9F6] focus:outline-none"
              >
                <span>GARMENT CARE</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    careOpen ? 'rotate-180 text-[#0F824B]' : ''
                  }`}
                />
              </button>
              {careOpen && (
                <div className="mt-4 space-y-1.5 font-mono text-xs text-[#8B8B86] uppercase leading-relaxed">
                  <p>• Machine wash cold (30°C or below) inside out.</p>
                  <p>• Do not tumble dry on high heat. Hang dry in shade.</p>
                  <p>• Do not iron directly on puff prints or screen graphics.</p>
                  <p>• Do not use chlorine bleach or industrial solvents.</p>
                </div>
              )}
            </div>

            {/* Accordion 3: Shipping & Exchanges */}
            <div className="border-b border-[#222222] py-4">
              <button
                onClick={() => setShippingOpen((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-[#FAF9F6] focus:outline-none"
              >
                <span>SHIPPING & EXCHANGES</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    shippingOpen ? 'rotate-180 text-[#0F824B]' : ''
                  }`}
                />
              </button>
              {shippingOpen && (
                <div className="mt-4 space-y-2 font-mono text-xs text-[#8B8B86] uppercase leading-relaxed">
                  <p>
                    • Dispatched within 24–48 hours from our central warehouse.
                  </p>
                  <p>
                    • Free standard shipping on all orders ₹999 and above.
                  </p>
                  <p>
                    • Replacements available for manufacturing defects or damaged in transit. An uncut unboxing video within 48h of delivery is mandatory.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-[#222222]">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1 text-left">
                <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#0F824B] uppercase">
                  // COMPLETE THE LINEUP
                </span>
                <h2 className="text-2xl sm:text-4xl font-display font-black uppercase text-white">
                  YOU MAY ALSO LIKE
                </h2>
              </div>
              <Link
                href="/collections/all"
                className="text-xs font-mono font-bold uppercase tracking-wider text-[#8B8B86] hover:text-[#0F824B] transition-colors hidden sm:block"
              >
                VIEW CATALOG →
              </Link>
            </div>
            <StorefrontProductGrid products={relatedProducts} />
          </div>
        )}
      </main>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />

      {/* Mobile Sticky Bottom Purchase Bar */}
      <div
        className={`fixed bottom-0 inset-x-0 bg-[#0E0E0E]/95 backdrop-blur-lg border-t border-[#292929] px-6 py-3.5 z-40 lg:hidden transition-transform duration-300 ${
          showStickyBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between gap-4 max-w-[500px] mx-auto">
          <div className="font-mono">
            <span className="text-xs text-[#8B8B86] block">PRICE</span>
            <span className="text-base font-bold text-white">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 bg-[#0F824B] text-white font-display font-black text-xs uppercase tracking-widest rounded-sm shadow-md"
          >
            ADD TO BAG • {selectedSize || 'SELECT SIZE'}
          </button>
        </div>
      </div>

      <StorefrontFooter />
    </div>
  );
}
