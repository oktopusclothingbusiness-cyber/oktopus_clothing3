'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
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
import { Shapes, TrendingUp, X, TrainFront, ArrowRight, Sparkles, Truck, ShieldCheck, RefreshCw, Gift, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn, getProductImage } from "@/lib/utils";
import { usePopup } from "@/context/popup-context";
import { useCoupon } from "@/context/coupon-context";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

// Doodle SVG components
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
    boxShadow: "0px 20px 40px rgba(252, 195, 36, 0.35)", // gold streetwear glow
    transition: {
      duration: 0.25,
      ease: "easeOut"
    }
  }
});

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 14,
      staggerChildren: 0.1
    }
  }
};

const hoverCollectionVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    boxShadow: "0px 20px 40px rgba(252, 195, 36, 0.25)",
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

const listContainerVariants = {
  initial: {},
  hover: { transition: { staggerChildren: 0.05 } }
};

const listItemVariants = {
  initial: { x: -12, opacity: 0 },
  hover: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 120 } }
};

const categoryIconVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.08,
    boxShadow: "0px 0px 15px rgba(252, 195, 36, 0.4)",
    transition: { type: "spring", stiffness: 200, damping: 10 }
  }
};

const SpecialOfferCard = ({ promotion }: { promotion: any }) => (
  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg mr-4 flex-shrink-0 bg-red-500 text-white p-6 flex flex-col justify-between">
    <Image
      src={promotion.imageUrl}
      alt={promotion.title}
      layout="fill"
      objectFit="cover"
      className="z-0"
    />
    <div className="absolute inset-0 bg-black/40 z-10" />
    <div className="relative z-20">
      <h3 className="text-2xl font-bold">{promotion.title}</h3>
      <p className="text-4xl font-light leading-tight">{promotion.description}</p>
    </div>
    <div className="relative z-20">
      <Button asChild className="bg-white text-black rounded-lg h-8 px-4 mt-2 font-semibold">
        <Link href={promotion.ctaLink}>
          {promotion.ctaText}
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
              />
            </div>
          )}

          <div className={cn(
            "relative bg-background rounded-2xl p-6 text-center shadow-2xl z-0",
            activePopup.imageUrl ? "mt-16" : "mt-0"
          )}>
            <DialogTitle className={cn("text-2xl font-bold mb-1", activePopup.imageUrl ? "mt-4" : "mt-0")}>{activePopup.title}</DialogTitle>
            <DialogDescription className="text-muted-foreground mb-6">{activePopup.description}</DialogDescription>

            {displayedCoupons.length > 0 && (
              <div className="space-y-3 mb-6">
                {displayedCoupons.map((coupon) => (
                  <div key={coupon.id} className="bg-yellow-400/20 border-2 border-dashed border-yellow-500 rounded-lg p-3 flex items-center text-left">
                    <div className="bg-yellow-500 rounded-lg p-2 mr-4">
                      <TrainFront className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-yellow-600">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}
                      </p>
                      <p className="text-xs text-yellow-500">Use code: {coupon.code}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activePopup.ctaText && activePopup.ctaLink && (
              <Button onClick={handleCtaClick} size="lg" className="w-full rounded-full bg-blue-600 hover:bg-blue-700 h-12 text-lg">
                {activePopup.ctaText}
              </Button>
            )}
          </div>
        </div>

        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
          <button
            onClick={() => setIsOpen(false)}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-all duration-200 backdrop-blur-sm"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
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
  const activePromotions = promotions.filter(p => p.isActive);
  const activeTrends = trends.filter(t => t.isActive);

  const featuredProducts = React.useMemo(() =>
    products.filter(p => p.featured),
    [products]);

  const newArrivals = React.useMemo(() =>
    [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4),
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

  const heroProduct = products.find(p => p.isHero) || products[0];
  const collection1Product = products.length > 1 ? products[1] : heroProduct;
  const collection2Product = products.length > 2 ? products[2] : heroProduct;

  const bestSellers = products.slice(0, 8);

  return (
    <>
      {/* DESKTOP VIEW (REDESIGNED LUXURY STOREFRONT EXPERIENCE) */}
      <div className="hidden md:block bg-background text-foreground font-sans overflow-hidden min-h-screen">
        <Header />
        <PromoPopup />
        <main>
          {/* SECTION 1: HERO PARALLAX BILLBOARD */}
          <section className="bg-background relative overflow-hidden border-b border-white/5 py-16 lg:py-24" ref={heroRef} onMouseMove={handleMouseMove}>
            <div className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none">
              <div data-layer data-speed="0.3" className="absolute top-[10%] left-[5%] w-24 h-24 animate-float"><Doodle1 /></div>
              <div data-layer data-speed="-0.2" className="absolute top-[20%] right-[10%] w-32 h-32 animate-float-delay-1"><Doodle2 /></div>
              <div data-layer data-speed="0.4" className="absolute bottom-[15%] left-[15%] w-20 h-20 animate-float-delay-2"><Doodle3 /></div>
              <div data-layer data-speed="-0.3" className="absolute bottom-[20%] right-[25%] w-28 h-28 animate-float"><Doodle1 /></div>
              <div data-layer data-speed="0.2" className="absolute top-[50%] left-[20%] w-16 h-16 animate-float-delay-1"><Doodle2 /></div>
            </div>

            <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[75vh] relative z-10">
              {/* Left Column: Typographic Billboard */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
                className="lg:col-span-6 text-left space-y-6 flex flex-col justify-center"
              >
                <div data-layer data-speed="0.1" className="space-y-4">
                  <motion.h1
                    variants={fadeUpVariants}
                    className="text-6xl lg:text-8xl font-black uppercase tracking-tighter font-bebas leading-[0.95] bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent select-none"
                  >
                    OKTOPUS<br />CLOTHING
                  </motion.h1>
                  
                  <motion.p
                    variants={fadeUpVariants}
                    className="text-muted-foreground text-base lg:text-lg max-w-lg leading-relaxed pt-2"
                  >
                    Functional streetwear designed for expression and built for utility. Heavyweight tees, limited custom drops, and high-craft apparel.
                  </motion.p>
                </div>

                <motion.div variants={fadeUpVariants} data-layer data-speed="-0.1" className="pt-4 flex flex-wrap items-center gap-4">
                  <Button asChild variant="default" size="lg" className="rounded-full h-14 px-8 text-sm font-bold shadow-xl hover:scale-105 transition-transform bg-white text-black hover:bg-gray-200">
                    <Link href="/products" className="flex items-center gap-2">
                      EXPLORE CATALOG <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full h-14 px-8 text-sm font-bold hover:scale-105 transition-transform border-white/20">
                    <Link href="/custom-design">CUSTOM DESIGNS</Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Right Column: Fanned Showcase Collage */}
              <div className="lg:col-span-6 relative w-full h-[440px] flex items-center justify-center select-none" data-layer data-speed="0.15">
                {/* Fanned product card 1 */}
                <motion.div
                  variants={cardVariants(-15)}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  className="absolute left-[calc(50%-190px)] rounded-2xl w-[150px] h-[210px] lg:w-[190px] lg:h-[260px] overflow-hidden shadow-2xl origin-bottom cursor-pointer border border-white/10 bg-card"
                >
                  <Image src="https://i.ibb.co/3yN11ZtH/mrvl-model-1.png" alt="Featured card 1" layout="fill" objectFit="cover" unoptimized />
                </motion.div>

                {/* Fanned product card 2 (center focus) */}
                <motion.div
                  variants={cardVariants(0)}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  className="absolute z-20 rounded-2xl w-[170px] h-[230px] lg:w-[220px] lg:h-[300px] overflow-hidden shadow-2xl origin-bottom cursor-pointer border-2 border-white/20 bg-card"
                >
                  <Image src="https://i.ibb.co/23vrv2sM/Gemini-Generated-Image-4ytc2a4ytc2a4ytc.png" alt="Featured card 2" layout="fill" objectFit="cover" unoptimized />
                </motion.div>

                {/* Fanned product card 3 */}
                <motion.div
                  variants={cardVariants(15)}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  className="absolute right-[calc(50%-190px)] rounded-2xl w-[150px] h-[210px] lg:w-[190px] lg:h-[260px] overflow-hidden shadow-2xl origin-bottom cursor-pointer border border-white/10 bg-card"
                >
                  <Image src="https://i.ibb.co/LdxSvMMd/mrvl-model-5.png" alt="Featured card 3" layout="fill" objectFit="cover" unoptimized />
                </motion.div>
              </div>
            </div>
          </section>

          {/* SECTION 2: CATEGORIES CATALOG */}
          <section className="bg-background py-16 border-b border-white/5">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-4xl font-black font-bebas tracking-tight">CATEGORIES</h2>
                  <p className="text-xs text-muted-foreground mt-1">Browse active store apparel categories</p>
                </div>
                <Link href="/products" className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">
                  View All Apparel <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categoriesLoading ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-2xl" />
                )) : categories.slice(0, 4).map(category => (
                  <Link href={`/products?category=${category.id}`} key={category.id} className="block group">
                    <motion.div
                      whileHover={{ scale: 1.03, borderColor: "rgba(252, 195, 36, 0.4)" }}
                      className="relative h-32 rounded-2xl overflow-hidden border border-white/10 bg-card/60 backdrop-blur-md flex items-center p-6 gap-5 transition-all duration-300 shadow-sm"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary border border-white/10 flex-shrink-0">
                        <Image src={category.imageUrl} alt={category.name} width={64} height={64} className="object-cover w-full h-full" unoptimized />
                      </div>
                      <div>
                        <p className="text-xl font-bold uppercase font-bebas tracking-wider text-foreground group-hover:text-amber-400 transition-colors">{category.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Explore Drops →</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 3: CURATED COLLECTIONS */}
          <section className="bg-background py-16 border-b border-white/5">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-4xl font-black font-bebas tracking-tight">CURATED COLLECTIONS</h2>
                  <p className="text-xs text-muted-foreground mt-1">Exclusive streetwear drops and limited editions</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left block: Double width (col-span-2) */}
                <motion.div
                  initial="initial"
                  whileHover="hover"
                  variants={hoverCollectionVariants}
                  className="lg:col-span-2 relative h-[56vh] min-h-[380px] rounded-2xl overflow-hidden cursor-pointer group border border-white/10"
                >
                  {collection1Product && (
                    <Image src={getProductImage(collection1Product.imageUrls)} alt={collection1Product.name} layout="fill" objectFit="cover" className="transition-transform duration-500 group-hover:scale-105" unoptimized />
                  )}
                  <div className="absolute inset-0 flex flex-col justify-between p-8 text-white bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-colors duration-500 group-hover:bg-black/60">
                    <motion.ul
                      variants={listContainerVariants}
                      className="space-y-1"
                    >
                      {['HEAVYWEIGHT TEES', 'HOODIES', 'ZIP HOODIES', 'SWEATSHIRTS', 'BOMBERS'].map(item => (
                        <motion.li key={item} variants={listItemVariants} className="text-xs font-bold tracking-widest text-amber-400">{item}</motion.li>
                      ))}
                    </motion.ul>
                    <div>
                      <h2 className="text-5xl font-black font-bebas tracking-tighter">AUTUMN DROPS</h2>
                      <p className="mt-2 font-mono text-xs tracking-widest text-amber-400">LIMITED STOCKS • 2026</p>
                    </div>
                  </div>
                </motion.div>

                {/* Right block: Single width (col-span-1) */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  {/* Upper card */}
                  <motion.div
                    initial="initial"
                    whileHover="hover"
                    variants={hoverCollectionVariants}
                    className="relative h-[26vh] min-h-[180px] rounded-2xl overflow-hidden cursor-pointer group border border-white/10"
                  >
                    {collection2Product && (
                      <Image src={getProductImage(collection2Product.imageUrls)} alt={collection2Product.name} layout="fill" objectFit="cover" className="transition-transform duration-500 group-hover:scale-105" unoptimized />
                    )}
                    <div className="absolute inset-0 flex flex-col justify-between p-6 text-white bg-gradient-to-t from-black/90 via-black/30 to-transparent">
                      <div />
                      <div>
                        <h2 className="text-3xl font-black font-bebas tracking-tighter">ESSENTIALS</h2>
                        <p className="mt-1 font-mono text-[10px] tracking-widest text-amber-400">CORE BASICS</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Lower card */}
                  <motion.div
                    initial="initial"
                    whileHover="hover"
                    variants={hoverCollectionVariants}
                    className="relative h-[26vh] min-h-[180px] rounded-2xl overflow-hidden cursor-pointer group border border-white/10"
                  >
                    {heroProduct && (
                      <Image src={getProductImage(heroProduct.imageUrls)} alt={heroProduct.name} layout="fill" objectFit="cover" className="transition-transform duration-500 group-hover:scale-105" unoptimized />
                    )}
                    <div className="absolute inset-0 flex flex-col justify-between p-6 text-white bg-gradient-to-t from-black/90 via-black/30 to-transparent">
                      <div />
                      <div>
                        <h2 className="text-3xl font-black font-bebas tracking-tighter">LIMITED RUNS</h2>
                        <p className="mt-1 font-mono text-[10px] tracking-widest text-amber-400">EXCLUSIVE RELEASES</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: BESTSELLERS CAROUSEL */}
          <section className="py-20 bg-background">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
              className="container mx-auto px-6 lg:px-12"
            >
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h2 className="text-5xl font-black font-bebas tracking-tight">BESTSELLERS</h2>
                  <p className="text-xs text-muted-foreground mt-1">High demand customer favorites</p>
                </div>

                <Button asChild variant="outline" className="rounded-full h-12 px-8 font-bold border-white/20">
                  <Link href="/products">VIEW CATALOG</Link>
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
                        <Skeleton className="aspect-[3/4] rounded-xl" />
                      </CarouselItem>
                    ))
                    : bestSellers.map((product) => (
                      <CarouselItem key={product.id} className="md:basis-1/3 lg:basis-1/4">
                        <ProductCard product={product} />
                      </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6" />
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6" />
              </Carousel>
            </motion.div>
          </section>

          {/* SECTION 5: SHOPPING PERKS STRIP */}
          <section className="border-t border-white/10 bg-card/60 py-10">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10 text-primary shrink-0">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Free Express Delivery</h4>
                    <p className="text-[10px] text-muted-foreground">On all orders above ₹999</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600 shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Premium Quality Fabric</h4>
                    <p className="text-[10px] text-muted-foreground">100% Heavyweight Cotton</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-blue-500/10 text-blue-600 shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">100% Authentic Drop</h4>
                    <p className="text-[10px] text-muted-foreground">Guaranteed quality craft</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-amber-500/10 text-amber-500 shrink-0">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Oktocoin Loyalty Rewards</h4>
                    <p className="text-[10px] text-muted-foreground">Earn points on every buy</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>

      {/* MOBILE VIEW (UNTOUCHED & FULLY PRESERVED) */}
      <div className="md:hidden bg-background font-sans overflow-hidden">
        <MobileHeader />
        <PromoPopup />
        <main className="p-4 space-y-6 pb-24">
          {/* Promo Slider Section */}
          <section>
            <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 -ml-4 pl-4 gap-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-[90vw] snap-center">
                    <Skeleton className="w-full aspect-video rounded-2xl" />
                  </div>
                ))
              ) : activePromotions.length > 0 ? (
                activePromotions.map((promo) => (
                  <div key={promo.id} className="w-[90vw] snap-center">
                    <SpecialOfferCard promotion={promo} />
                  </div>
                ))
              ) : (
                <div className="w-[90vw] snap-center">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg mr-4 flex-shrink-0 bg-gray-200 text-gray-600 p-6 flex flex-col justify-center items-center">
                    <h3 className="text-lg font-bold">No Promotions Available</h3>
                    <p className="text-sm">Check back later for exciting offers!</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-center items-center gap-2 mt-4">
              {activePromotions.map((_, i) => (
                <span key={i} className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-red-500 w-4' : 'bg-gray-300'}`}></span>
              ))}
            </div>
          </section>

          {/* Categories Section */}
          <section>
            <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 -ml-4 pl-4 space-x-4">
              {categoriesLoading ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="snap-center flex-shrink-0 w-16 text-center">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="h-4 w-12 mt-2 mx-auto" />
                </div>
              )) : categories.length > 0 ? (
                categories.map(category => (
                  <Link href={`/products?category=${category.id}`} key={category.id} className="snap-center flex-shrink-0 w-16 text-center block">
                    <motion.div
                      initial="initial"
                      whileHover="hover"
                      variants={categoryIconVariants}
                      className="w-16 h-16 rounded-full overflow-hidden bg-secondary border border-white/5"
                    >
                      <Image src={category.imageUrl} alt={category.name} width={64} height={64} className="object-cover w-full h-full" unoptimized />
                    </motion.div>
                    <p className="text-xs font-semibold mt-2 truncate">{category.name}</p>
                  </Link>
                ))
              ) : (
                <div className="w-full text-center py-8">
                  <Shapes className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">No categories found.</p>
                </div>
              )}
            </div>
          </section>

          {/* New Arrivals Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-black text-2xl font-bebas tracking-tight">New Arrivals</h2>
              <Link href="/products" className="text-xs text-primary font-bold tracking-wide flex items-center gap-1 uppercase">
                See All
              </Link>
            </div>
            <div className="flex overflow-x-auto snap-x snap-mandatory -ml-4 pl-4 space-x-4">
              {productsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="snap-center flex-shrink-0 w-40">
                    <Card className="overflow-hidden group rounded-lg card-glass">
                      <div className="relative aspect-[3/4]">
                        <Skeleton className="w-full h-full" />
                      </div>
                      <div className="p-2 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </Card>
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-black text-2xl font-bebas tracking-tight">Featured Products</h2>
              <Link href="/products?featured=true" className="text-xs text-primary font-bold tracking-wide flex items-center gap-1 uppercase">
                See All
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {productsLoading ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Card className="overflow-hidden group rounded-lg card-glass">
                    <div className="relative aspect-[3/4]">
                      <Skeleton className="w-full h-full" />
                    </div>
                    <div className="p-2 space-y-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </Card>
                </div>
              )) : featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} isMobile={true} />
              ))}
            </div>
          </section>

          {/* Trending Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-black text-2xl font-bebas tracking-tight flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
                #Trending
              </h2>
            </div>
            <div className="flex overflow-x-auto snap-x snap-mandatory -ml-4 pl-4 space-x-4">
              {trendsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="snap-center flex-shrink-0 w-48">
                    <Skeleton className="w-full aspect-square rounded-lg" />
                  </div>
                ))
              ) : (
                activeTrends.map(trend => (
                  <Link href={trend.ctaLink} key={trend.id} className="snap-center flex-shrink-0 w-48 block">
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      className="relative aspect-square rounded-lg overflow-hidden group border border-white/5"
                    >
                      <Image src={trend.imageUrl} alt={trend.title} layout="fill" objectFit="cover" className="transition-transform duration-500 group-hover:scale-105" unoptimized />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-2 transition-colors group-hover:bg-black/50">
                        <h3 className="text-white font-bold text-md tracking-wide">{trend.title}</h3>
                      </div>
                    </motion.div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </main>
        <MobileFooter />
      </div>
    </>
  );
}
