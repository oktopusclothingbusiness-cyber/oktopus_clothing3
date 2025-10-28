

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
import { Shapes, TrendingUp, X, TrainFront } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { usePopup } from "@/context/popup-context";
import { useCoupon } from "@/context/coupon-context";

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
)

const PromoPopup = () => {
    const { popups, loading: popupsLoading } = usePopup();
    const { coupons, loading: couponsLoading } = useCoupon();
    const [isOpen, setIsOpen] = React.useState(false);

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

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-sm w-full">
                <div className="relative">
                    {activePopup.imageUrl && (
                        <div className="absolute inset-x-0 -top-20 flex justify-center items-center opacity-80">
                            <Image
                                src={activePopup.imageUrl}
                                alt="Promotion"
                                width={300}
                                height={200}
                                className="object-contain"
                            />
                        </div>
                    )}
                    <div className="absolute -top-10 inset-x-0 flex justify-center z-10">
                        <Image
                            src="https://i.ibb.co/hK0gqjC/tickets-image.png"
                            alt="Tickets"
                            width={100}
                            height={100}
                        />
                    </div>
                    
                    <div className="relative mt-16 bg-background rounded-2xl p-6 text-center shadow-2xl z-0">
                        <DialogTitle className="text-2xl font-bold mb-1 mt-4">{activePopup.title}</DialogTitle>
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
                            <Button asChild size="lg" className="w-full rounded-full bg-blue-600 hover:bg-blue-700 h-12 text-lg">
                                <Link href={activePopup.ctaLink}>{activePopup.ctaText}</Link>
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
  
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { offsetWidth, offsetHeight } = currentTarget;
    const xPos = (clientX / offsetWidth - 0.5) * 40; // Multiplier for parallax effect
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
    {/* Desktop View */}
    <div className="hidden md:block bg-background text-foreground font-sans">
      <Header />
      <PromoPopup />
      <main>
         {/* Hero Section */}
        <section className="bg-background relative overflow-hidden" ref={heroRef} onMouseMove={handleMouseMove}>
            <div className="absolute inset-0 opacity-10 dark:opacity-5">
                 <div data-layer data-speed="0.3" className="absolute top-[10%] left-[5%] w-24 h-24 animate-float"><Doodle1 /></div>
                 <div data-layer data-speed="-0.2" className="absolute top-[20%] right-[10%] w-32 h-32 animate-float-delay-1"><Doodle2 /></div>
                 <div data-layer data-speed="0.4" className="absolute bottom-[15%] left-[15%] w-20 h-20 animate-float-delay-2"><Doodle3 /></div>
                 <div data-layer data-speed="-0.3" className="absolute bottom-[20%] right-[25%] w-28 h-28 animate-float"><Doodle1 /></div>
                 <div data-layer data-speed="0.2" className="absolute top-[50%] left-[20%] w-16 h-16 animate-float-delay-1"><Doodle2 /></div>
            </div>

            <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center relative z-10 min-h-[70vh]">
                <div data-layer data-speed="0.1">
                    <h1 className="text-8xl md:text-9xl font-black uppercase tracking-tighter font-bebas">WEAR</h1>
                    <p className="text-muted-foreground mt-4 max-w-md mx-auto">Functional clothing for an active lifestyle, designed to make you stand out.</p>
                </div>
                 <div data-layer data-speed="-0.1" className="mt-12">
                    <Button asChild variant="default" size="lg" className="rounded-full h-16 px-10 text-lg shadow-lg hover:scale-105 transition-transform">
                        <Link href="/products">EXPLORE CATALOG</Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Summer Collection Section */}
        <section className="bg-background py-10">
            <div className="container mx-auto px-4 grid grid-cols-2 gap-8">
                <div className="relative h-[70vh] group">
                    {collection1Product && 
                        <Image src={collection1Product.imageUrls[0]} alt={collection1Product.name} layout="fill" objectFit="cover" className="transition-transform duration-500 group-hover:scale-105"/>
                    }
                     <div className="absolute inset-0 flex flex-col justify-between p-8 text-white bg-black/30 transition-colors duration-500 group-hover:bg-black/40">
                        <ul className="space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <li>T-SHIRTS</li>
                            <li>HOODIES</li>
                            <li>ZIP HOODIES</li>
                            <li>SWEATSHIRTS</li>
                            <li>BOMBERS</li>
                            <li>WINDBREAKERS</li>
                        </ul>
                        <div>
                            <h2 className="text-6xl font-black font-bebas">SUMMER</h2>
                            <h2 className="text-6xl font-black font-bebas">COLLECTION</h2>
                            <p className="mt-2">2024</p>
                        </div>
                    </div>
                </div>
                <div className="relative h-[70vh] group">
                    {collection2Product &&
                        <Image src={collection2Product.imageUrls[0]} alt={collection2Product.name} layout="fill" objectFit="cover" className="transition-transform duration-500 group-hover:scale-105"/>
                    }
                    <div className="absolute inset-0 flex flex-col justify-between p-8 text-white bg-black/30 transition-colors duration-500 group-hover:bg-black/40">
                        <ul className="space-y-1 text-right opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                           <li>JOGGERS</li>
                            <li>SHORTS</li>
                            <li>UNDERWEAR</li>
                            <li>SOCKS</li>
                            <li>CAPS</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>


        {/* Bestsellers Section */}
        <section className="py-20">
             <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-5xl font-black font-bebas">Bestsellers</h2>
                    <Button asChild variant="outline" className="rounded-full h-12 px-8">
                        <Link href="/products">TO CATALOG</Link>
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
                                <CarouselItem key={i} className="md:basis-1/4">
                                    <Skeleton className="aspect-[3/4]" />
                                </CarouselItem>
                            ))
                        : bestSellers.map((product) => (
                            <CarouselItem key={product.id} className="md:basis-1/4">
                                <ProductCard product={product} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12" />
                    <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12" />
                </Carousel>
            </div>
        </section>

      </main>
      <Footer />
    </div>

    {/* Mobile View (unchanged) */}
    <div className="md:hidden bg-background font-sans">
        <MobileHeader/>
        <PromoPopup />
        <main className="p-4 space-y-6 pb-24">
            <section>
                <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 -ml-4 pl-4">
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
            
            <section>
                <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 -ml-4 pl-4 space-x-4">
                    {categoriesLoading ? Array.from({length: 4}).map((_, i) => (
                        <div key={i} className="snap-center flex-shrink-0 w-16 text-center">
                            <Skeleton className="w-16 h-16 rounded-full" />
                            <Skeleton className="h-4 w-12 mt-2 mx-auto" />
                        </div>
                    )) : categories.length > 0 ? (
                        categories.map(category => (
                            <Link href={`/products?category=${category.id}`} key={category.id} className="snap-center flex-shrink-0 w-16 text-center">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary">
                                    <Image src={category.imageUrl} alt={category.name} width={64} height={64} className="object-cover w-full h-full" />
                                </div>
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

             <section>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg">New Arrivals</h2>
                    <Link href="/products" className="text-sm text-primary font-semibold flex items-center gap-1">
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
                        products.slice(4, 8).map(product => (
                            <div key={product.id} className="snap-center flex-shrink-0 w-40">
                               <ProductCard product={product} isMobile={true} />
                            </div>
                        ))
                    )}
                </div>
            </section>
            
            <section>
                 <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg">Featured Products</h2>
                    <Link href="/products" className="text-sm text-primary font-semibold flex items-center gap-1">
                        See All
                    </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {productsLoading ? Array.from({length: 4}).map((_, i) => (
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
                    )) : products.slice(0, 4).map(product => (
                       <ProductCard key={product.id} product={product} isMobile={true} />
                    ))}
                </div>
            </section>

             <section>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5" /> #Trending</h2>
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
                           <Link href={trend.ctaLink} key={trend.id} className="snap-center flex-shrink-0 w-48">
                                <div className="relative aspect-square rounded-lg overflow-hidden group">
                                    <Image src={trend.imageUrl} alt={trend.title} layout="fill" objectFit="cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                                        <h3 className="text-white font-bold text-md">{trend.title}</h3>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </section>
            
        </main>
        <MobileFooter/>
    </div>
    </>
  );
}
