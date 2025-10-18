

'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart, Heart, ChevronLeft, ChevronRight, Search, Settings2, Shirt, Radio, Watch, MessageCircle, User, Home, Star, Footprints, Shapes, TrendingUp } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { useProduct, Product } from "@/context/product-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { MobileFooter } from "@/components/mobile-footer";
import { usePromotion } from "@/context/promotion-context";
import { useCategory } from "@/context/category-context";
import { useTrend } from "@/context/trend-context";
import { format, addDays } from "date-fns";
import * as React from "react";
import { ProductCard } from "@/components/product-card";
import { DolengaProductCard } from "@/components/dolenga-product-card";
import { cn } from "@/lib/utils";
import { LockIcon } from "@/components/icons/lock-icon";
import { WrenchIcon } from "@/components/icons/wrench-icon";
import { CarIcon } from "@/components/icons/car-icon";
import { SparklesIcon } from "@/components/icons/sparkles-icon";
import { SlidersIcon } from "@/components/icons/sliders-icon";
import { TagIcon } from "@/components/icons/tag-icon";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import placeholderImages from '@/app/lib/placeholder-images.json';

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

export default function StreetifyStorePage() {
  const { products, loading: productsLoading } = useProduct();
  const { promotions, loading: promotionsLoading } = usePromotion();
  const { categories, loading: categoriesLoading } = useCategory();
  const { trends, loading: trendsLoading } = useTrend();
  
  const loading = productsLoading || promotionsLoading || categoriesLoading || trendsLoading;
  const activePromotions = promotions.filter(p => p.isActive);
  const activeTrends = trends.filter(t => t.isActive);
  
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const heroProduct = products.find(p => p.isHero) || products[0];
  const collection1Product = products.length > 1 ? products[1] : heroProduct;
  const collection2Product = products.length > 2 ? products[2] : heroProduct;

  const bestSellers = products.slice(0, 8);

  return (
    <>
    {/* Desktop View */}
    <div className="hidden md:block bg-background text-foreground font-sans">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-background">
            <div className="container mx-auto px-4 py-20 flex items-center justify-between">
                <div className="max-w-md">
                    <h1 className="text-8xl font-black uppercase tracking-tighter font-bebas">OKTOPUS</h1>
                    <h1 className="text-8xl font-black uppercase tracking-tighter font-bebas">WEAR</h1>
                    <p className="text-muted-foreground mt-4">Functional clothing for an active lifestyle.</p>
                </div>
                <div className="relative w-1/2 h-[600px]">
                    {heroProduct && 
                        <Image src={heroProduct.imageUrls[0]} alt={heroProduct.name} layout="fill" objectFit="contain" />
                    }
                </div>
                 <div className="absolute right-48 bottom-48">
                    <Button asChild variant="secondary" size="lg" className="rounded-full h-16 px-10 text-lg">
                        <Link href="/products">TO CATALOG</Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Summer Collection Section */}
        <section className="bg-background py-10">
            <div className="container mx-auto px-4 grid grid-cols-2 gap-8">
                <div className="relative h-[70vh]">
                    {collection1Product && 
                        <Image src={collection1Product.imageUrls[0]} alt={collection1Product.name} layout="fill" objectFit="cover" />
                    }
                     <div className="absolute inset-0 flex flex-col justify-between p-8 text-white bg-black/20">
                        <ul className="space-y-1">
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
                <div className="relative h-[70vh]">
                    {collection2Product &&
                        <Image src={collection2Product.imageUrls[0]} alt={collection2Product.name} layout="fill" objectFit="cover" />
                    }
                    <div className="absolute inset-0 flex flex-col justify-between p-8 text-white bg-black/20">
                        <ul className="space-y-1 text-right">
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
                    <h2 className="text-5xl font-black font-bebas">BESTSELLERS</h2>
                    <Button asChild variant="outline" className="rounded-full h-12 px-8">
                        <Link href="/products">TO CATALOG</Link>
                    </Button>
                </div>
                
                 <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
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
                                <DolengaProductCard product={product} />
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
