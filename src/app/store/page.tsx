'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StorefrontHeader } from "@/components/storefront/header";
import { StorefrontFooter } from "@/components/storefront/footer";
import { useProduct } from "@/context/product-context";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileHeader } from "@/components/mobile-header";
import { MobileFooter } from "@/components/mobile-footer";
import { usePromotion } from "@/context/promotion-context";
import { useCategory } from "@/context/category-context";
import { useTrend } from "@/context/trend-context";
import * as React from "react";
import { ProductCard } from "@/components/product-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Shapes, TrendingUp, X, TrainFront, ArrowRight, Sparkles, Truck, ShieldCheck, Gift, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn, getProductImage } from "@/lib/utils";
import { usePopup } from "@/context/popup-context";
import { useCoupon } from "@/context/coupon-context";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageBanner } from "@/components/storefront/page-banner";
import { HeroSection } from "@/components/storefront/home/hero-section";

// Doodle SVG components for streetwear background effects
const Doodle1 = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 30 L50 20 L80 30 V70 L50 80 L20 70 Z" />
    <path d="M20 30 L50 40 L80 30" />
    <path d="M50 20 L50 40" />
  </svg>
);

const Doodle2 = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M25 25 L75 25 L85 45 L75 80 L25 80 L15 45 Z" />
    <path d="M40 25 C40 35, 60 35, 60 25" />
  </svg>
);

const Doodle3 = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 20h60v60H20z" transform="rotate(10 50 50)" />
    <path d="M40 40h20" transform="rotate(10 50 50)" />
    <path d="M40 55h20" transform="rotate(10 50 50)" />
  </svg>
);

const fadeUpVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15
    }
  }
};

const cardVariants = (targetRotate: number) => ({
  hidden: {
    opacity: 0,
    scale: 0.7,
    y: 120,
    rotate: 0
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotate: targetRotate,
    transition: {
      type: "spring",
      stiffness: 60,
      damping: 14
    }
  },
  hover: {
    scale: 1.15,
    rotate: 0,
    zIndex: 50,
    boxShadow: "0px 20px 40px rgba(252, 195, 36, 0.35)",
    transition: {
      duration: 0.25,
      ease: "easeOut"
    }
  }
});

const SpecialOfferCard = ({ promotion }: { promotion: any }) => (
  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg mr-4 flex-shrink-0 bg-[#141414] border border-white/10 text-white p-6 flex flex-col justify-between">
    {promotion.imageUrl && (
      <Image
        src={promotion.imageUrl}
        alt={promotion.title}
        layout="fill"
        objectFit="cover"
        className="z-0 opacity-40"
        unoptimized
      />
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
    <div className="relative z-20">
      <span className="text-[10px] font-mono uppercase tracking-widest text-[#0F824B]">Special Offer</span>
      <h3 className="text-2xl font-bold font-bebas tracking-wide uppercase">{promotion.title}</h3>
      {promotion.description && (
        <p className="text-xs text-zinc-300 line-clamp-2 mt-1">{promotion.description}</p>
      )}
    </div>
    <div className="relative z-20 pt-2">
      <Button asChild className="bg-[#0F824B] hover:bg-[#0b663a] text-white font-bold text-xs rounded-full h-8 px-4">
        <Link href={promotion?.ctaLink || '/products'}>
          {promotion?.ctaText || 'Shop Now'}
        </Link>
      </Button>
    </div>
  </div>
);

const PromoPopup = () => {
  const { popups, loading: popupsLoading } = usePopup();
  const { coupons, loading: couponsLoading } = useCoupon();
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('promoPopupSeen');
    const activePopup = popups.find(p => p.isActive);
    if (!popupsLoading && activePopup && !hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('promoPopupSeen', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [popupsLoading, popups]);

  const activePopup = popups.find(p => p.isActive);

  const displayedCoupons = React.useMemo(() => {
    if (!activePopup || !activePopup.couponIds || couponsLoading) return [];
    return coupons.filter(coupon => activePopup.couponIds!.includes(coupon.id));
  }, [activePopup, coupons, couponsLoading]);

  if (!activePopup) return null;

  const handleCtaClick = () => {
    if (activePopup.ctaLink) {
      router.push(activePopup.ctaLink);
    }
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-sm w-full">
        <div className="relative">
          {activePopup.imageUrl && (
            <div className="absolute -top-20 inset-x-0 flex justify-center items-center">
              <Image
                src={activePopup.imageUrl}
                alt="Promotion"
                width={180}
                height={180}
                className="object-contain"
                unoptimized
              />
            </div>
          )}

          <div className={cn(
            "relative bg-[#121212] border border-white/10 text-white rounded-2xl p-6 text-center shadow-2xl z-0",
            activePopup.imageUrl ? "mt-16" : "mt-0"
          )}>
            <DialogTitle className={cn("text-2xl font-bold font-bebas tracking-wide uppercase mb-1", activePopup.imageUrl ? "mt-4" : "mt-0")}>
              {activePopup.title}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs mb-6">{activePopup.description}</DialogDescription>

            {displayedCoupons.length > 0 && (
              <div className="space-y-3 mb-6">
                {displayedCoupons.map((coupon) => (
                  <div key={coupon.id} className="bg-[#0F824B]/10 border-2 border-dashed border-[#0F824B] rounded-lg p-3 flex items-center text-left">
                    <div className="bg-[#0F824B] rounded-lg p-2 mr-4 text-white">
                      <TrainFront className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#0F824B]">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono">Use code: {coupon.code}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activePopup.ctaText && activePopup.ctaLink && (
              <Button onClick={handleCtaClick} size="lg" className="w-full rounded-full bg-[#0F824B] text-white font-bold hover:bg-[#0b663a] h-11 text-sm">
                {activePopup.ctaText}
              </Button>
            )}
          </div>
        </div>

        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
          <button
            onClick={() => setIsOpen(false)}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-all duration-200 backdrop-blur-sm border border-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function StreetifyStorePage() {
  const { products, loading: productsLoading } = useProduct();
  const { promotions, loading: promotionsLoading } = usePromotion();
  const { categories, loading: categoriesLoading } = useCategory();
  const { trends, loading: trendsLoading } = useTrend();
  const heroRef = React.useRef<HTMLDivElement>(null);

  const loading = productsLoading || promotionsLoading || categoriesLoading || trendsLoading;
  const activePromotions = (promotions || []).filter(p => p && p.isActive);
  const activeTrends = (trends || []).filter(t => t && t.isActive);

  // DB-driven Store Hero Banner
  const heroBanner = React.useMemo(() => {
    return activePromotions.find(p => p.placement === 'store_hero' || p.placement === 'home_hero') || activePromotions[0];
  }, [activePromotions]);

  const featuredProducts = React.useMemo(() =>
    (products || []).filter(p => p && (p.featured || p.isHero)),
    [products]);

  const newArrivals = React.useMemo(() =>
    [...(products || [])].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 8),
    [products]);

  const bestSellers = React.useMemo(() =>
    (products || []).slice(0, 10),
    [products]);

  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { offsetWidth, offsetHeight } = currentTarget;
    const xPos = (clientX / offsetWidth - 0.5) * 40;
    const yPos = (clientY / offsetHeight - 0.5) * 40;

    const layers = heroRef.current?.querySelectorAll('[data-layer]');
    layers?.forEach(layer => {
      const speed = parseFloat(layer.getAttribute('data-speed') || "0");
      const htmlLayer = layer as HTMLElement;
      htmlLayer.style.transform = `translateX(${xPos * speed}px) translateY(${yPos * speed}px)`;
    });
  };

  // Select 3 showcase images dynamically from DB products
  const showcaseProducts = React.useMemo(() => {
    const validProducts = (products || []).filter(p => p && p.imageUrls && p.imageUrls.length > 0);
    return [
      validProducts[0] || null,
      validProducts[1] || validProducts[0] || null,
      validProducts[2] || validProducts[0] || null,
    ];
  }, [products]);

  return (
    <div className="bg-[#0A0A0A] text-[#FAF9F6] font-sans min-h-screen selection:bg-[#0F824B] selection:text-white">
      {/* DESKTOP HEADER & VIEW */}
      <div className="hidden md:block">
        <StorefrontHeader />
        <PromoPopup />
        <main>
          {/* SECTION 1: RECREATED YAWI HERO CAROUSEL */}
          <HeroSection />

          {/* DYNAMIC PAGE BANNER FROM DATABASE */}
          <div className="container mx-auto px-6 lg:px-12 pt-8">
            <PageBanner placement="store_page" compact={true} />
          </div>

          {/* SECTION 2: DYNAMIC DATABASE CATEGORIES CATALOG */}
          <section className="py-16 border-b border-white/10">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-4xl font-black font-bebas tracking-tight uppercase">STORE CATEGORIES</h2>
                  <p className="text-xs text-zinc-400 mt-1 font-mono">Browse active streetwear catalog categories</p>
                </div>
                <Link href="/products" className="text-xs font-bold text-[#0F824B] hover:underline flex items-center gap-1 font-mono uppercase">
                  View All Apparel <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categoriesLoading ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-2xl bg-zinc-900" />
                )) : categories.slice(0, 4).map(category => (
                  <Link href={category?.id ? `/products?category=${category.id}` : '/products'} key={category?.id || category?._id} className="block group">
                    <motion.div
                      whileHover={{ scale: 1.03, borderColor: "rgba(15, 130, 75, 0.5)" }}
                      className="relative h-32 rounded-2xl overflow-hidden border border-white/10 bg-[#121212] backdrop-blur-md flex items-center p-6 gap-5 transition-all duration-300 shadow-sm"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-800 border border-white/10 flex-shrink-0 relative">
                        <Image src={category.imageUrl} alt={category.name} width={64} height={64} className="object-cover w-full h-full" unoptimized />
                      </div>
                      <div>
                        <p className="text-xl font-bold uppercase font-bebas tracking-wider text-white group-hover:text-[#0F824B] transition-colors">{category.name}</p>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Explore Drops →</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 3: BESTSELLERS CAROUSEL (DYNAMIC DB PRODUCTS) */}
          <section className="py-20 border-b border-white/10">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h2 className="text-5xl font-black font-bebas tracking-tight uppercase">BESTSELLERS & FEATURED</h2>
                  <p className="text-xs text-zinc-400 mt-1 font-mono">High demand customer favorites from database</p>
                </div>

                <Button asChild variant="outline" className="rounded-full h-12 px-8 font-bold border-white/20 text-xs font-mono">
                  <Link href="/products">VIEW ENTIRE CATALOG</Link>
                </Button>
              </div>

              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[autoplayPlugin.current]}
                className="w-full"
              >
                <CarouselContent>
                  {loading ?
                    Array.from({ length: 4 }).map((_, i) => (
                      <CarouselItem key={i} className="md:basis-1/3 lg:basis-1/4">
                        <Skeleton className="aspect-[3/4] rounded-xl bg-zinc-900" />
                      </CarouselItem>
                    ))
                    : bestSellers.map((product) => (
                      <CarouselItem key={product.id} className="md:basis-1/3 lg:basis-1/4">
                        <ProductCard product={product} />
                      </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-[#121212] border-white/20 text-white hover:bg-[#0F824B] hover:text-white" />
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-[#121212] border-white/20 text-white hover:bg-[#0F824B] hover:text-white" />
              </Carousel>
            </div>
          </section>

          {/* SECTION 4: SHOPPING PERKS STRIP */}
          <section className="bg-[#0e0e0e] py-12 border-t border-white/10">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="p-3 rounded-full bg-[#0F824B]/10 text-[#0F824B] shrink-0">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Free Express Shipping</h4>
                    <p className="text-[10px] text-zinc-400 font-mono">On all orders above ₹999</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Heavyweight Cotton</h4>
                    <p className="text-[10px] text-zinc-400 font-mono">240+ GSM Premium Craft</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Authentic Drop Guarantee</h4>
                    <p className="text-[10px] text-zinc-400 font-mono">100% Quality Inspected</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="p-3 rounded-full bg-purple-500/10 text-purple-400 shrink-0">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Oktocoin Loyalty Rewards</h4>
                    <p className="text-[10px] text-zinc-400 font-mono">Earn coins on every buy</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <StorefrontFooter />
      </div>

      {/* MOBILE VIEW (FULLY INTEGRATED & STYLED) */}
      <div className="md:hidden">
        <MobileHeader />
        <PromoPopup />
        <HeroSection />
        <main className="p-4 space-y-6 pb-24">

          {/* Mobile Categories Section */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-black text-xl font-bebas tracking-wider uppercase text-white">Categories</h2>
            </div>
            <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 -ml-4 pl-4 space-x-4 scrollbar-none">
              {categoriesLoading ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="snap-center flex-shrink-0 w-16 text-center">
                  <Skeleton className="w-16 h-16 rounded-full bg-zinc-900" />
                  <Skeleton className="h-3 w-12 mt-2 mx-auto bg-zinc-900" />
                </div>
              )) : categories.map(category => (
                <Link href={category?.id ? `/products?category=${category.id}` : '/products'} key={category?.id || category?._id} className="snap-center flex-shrink-0 w-16 text-center block">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-900 border border-white/10 relative">
                    <Image src={category.imageUrl} alt={category.name} width={64} height={64} className="object-cover w-full h-full" unoptimized />
                  </div>
                  <p className="text-[11px] font-bold mt-2 truncate font-mono text-zinc-300">{category.name}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* New Arrivals Section */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-black text-2xl font-bebas tracking-wide uppercase text-white">New Arrivals</h2>
              <Link href="/products" className="text-[11px] text-[#0F824B] font-bold font-mono tracking-wide flex items-center gap-1 uppercase">
                See All →
              </Link>
            </div>
            <div className="flex overflow-x-auto snap-x snap-mandatory -ml-4 pl-4 space-x-4 scrollbar-none">
              {productsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="snap-center flex-shrink-0 w-40">
                    <Skeleton className="w-40 aspect-[3/4] rounded-xl bg-zinc-900" />
                  </div>
                ))
              ) : (
                newArrivals.map(product => (
                  <div key={product.id} className="snap-center flex-shrink-0 w-40">
                    <ProductCard product={product} isMobile={true} />
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Featured Section */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-black text-2xl font-bebas tracking-wide uppercase text-white">Featured Drops</h2>
              <Link href="/products" className="text-[11px] text-[#0F824B] font-bold font-mono tracking-wide flex items-center gap-1 uppercase">
                See All →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {productsLoading ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-xl bg-zinc-900" />
              )) : (featuredProducts.length > 0 ? featuredProducts : newArrivals.slice(0, 4)).map(product => (
                <ProductCard key={product.id} product={product} isMobile={true} />
              ))}
            </div>
          </section>
        </main>
        <MobileFooter />
      </div>
    </div>
  );
}
