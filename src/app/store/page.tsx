

'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart, Heart, ChevronLeft, ChevronRight, Search, Settings2, Shirt, Radio, Watch, MessageCircle, User, Home, Star, Footprints, Shapes } from "lucide-react";
import { StreetifyHeader } from "@/components/streetify-header";
import { StreetifyFooter } from "@/components/streetify-footer";
import { Card, CardContent } from "@/components/ui/card";
import { useProduct, Product } from "@/context/product-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { MobileFooter } from "@/components/mobile-footer";
import { usePromotion } from "@/context/promotion-context";
import { useCategory } from "@/context/category-context";
import { format, addDays } from "date-fns";
import * as React from "react";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";
import { LockIcon } from "@/components/icons/lock-icon";
import { WrenchIcon } from "@/components/icons/wrench-icon";
import { CarIcon } from "@/components/icons/car-icon";
import { SparklesIcon } from "@/components/icons/sparkles-icon";
import { SlidersIcon } from "@/components/icons/sliders-icon";
import { TagIcon } from "@/components/icons/tag-icon";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";


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

const StreetifyProductCard = ({ product, large = false }: { product: Product, large?: boolean }) => {
    return (
        <div className={cn("bg-stone-900 rounded-2xl overflow-hidden group", large && "row-span-2")}>
            <Link href={`/products/${product.id}`}>
                <div className={cn("relative bg-white", large ? "aspect-[3/4]" : "aspect-square")}>
                    <Image
                        src={product.imageUrls[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint="fashion product"
                    />
                    {product.discountPercentage && <Badge className="absolute top-3 right-3 bg-red-600 text-white">HOT</Badge>}
                </div>
                <div className="p-4">
                    <h3 className="text-white font-semibold truncate">{product.name}</h3>
                    <p className="text-white font-bold text-lg">₹{product.price.toFixed(2)}</p>
                </div>
            </Link>
        </div>
    )
}

export default function StreetifyStorePage() {
  const { products, loading: productsLoading } = useProduct();
  const { promotions, loading: promotionsLoading } = usePromotion();
  const { categories, loading: categoriesLoading } = useCategory();
  const [deliveryDate] = React.useState(format(addDays(new Date(), 5), 'MMM dd'));

  const loading = productsLoading || promotionsLoading || categoriesLoading;
  const activePromotions = promotions.filter(p => p.isActive);

  const newArrivals = products.slice(0, 3);
  const featuredProducts = products.slice(3, 12);
  const largeProductIndex = 2;


  const featureIcons = [
      { icon: LockIcon, label: "Premium Materials" },
      { icon: WrenchIcon, label: "Custom Designs" },
      { icon: CarIcon, label: "Fast Shipping" },
      { icon: SparklesIcon, label: "Unique Styles" },
      { icon: SlidersIcon, label: "Perfect Fit" },
      { icon: TagIcon, label: "Exclusive Deals" },
  ];
  
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <>
    {/* Desktop View */}
    <div className="hidden md:block bg-black text-white font-serif">
      <StreetifyHeader />
      <main>
        {/* Hero Section */}
        <section className="relative h-[600px] bg-black flex items-center">
             <Carousel 
                className="w-full h-full"
                plugins={[autoplayPlugin.current]}
                onMouseEnter={autoplayPlugin.current.stop}
                onMouseLeave={autoplayPlugin.current.reset}
                opts={{ loop: true }}
            >
                <CarouselContent>
                    {loading ? (
                        <CarouselItem>
                             <div className="w-full h-[600px] bg-neutral-900 animate-pulse" />
                        </CarouselItem>
                    ) : activePromotions.length > 0 ? (
                        activePromotions.map((promo, index) => (
                        <CarouselItem key={index}>
                            <div className="relative w-full h-[600px]">
                                <Image src={promo.imageUrl} layout="fill" objectFit="cover" alt={promo.title} className="opacity-30" data-ai-hint="urban street background" />
                                <div className="absolute inset-0 bg-black/50" />
                                <div className="container mx-auto h-full flex items-center relative z-10">
                                    <div className="max-w-xl animate-fade-in">
                                        <h1 className="text-8xl font-black uppercase tracking-tighter animate-slide-in-from-left">
                                            {promo.title}
                                        </h1>
                                        <p className="text-neutral-300 mt-4 max-w-sm animate-slide-in-from-bottom" style={{ animationDelay: '0.2s' }}>
                                            {promo.description}
                                        </p>
                                        <div className="mt-8 flex items-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                                             <Button asChild className="bg-primary hover:bg-primary/90 text-black rounded-sm px-8">
                                                <Link href={promo.ctaLink}>{promo.ctaText}</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                        ))
                    ) : (
                         <CarouselItem>
                             <div className="relative w-full h-[600px]">
                                <Image src="https://i.ibb.co/YyV3c0x/okto-main-1.png" layout="fill" objectFit="cover" alt="Background" className="opacity-30" data-ai-hint="urban street background" />
                                 <div className="absolute inset-0 bg-black/50" />
                                 <div className="container mx-auto h-full flex items-center relative z-10">
                                     <div className="max-w-xl">
                                         <h1 className="text-8xl font-black uppercase tracking-tighter">Streetwear</h1>
                                         <p className="text-neutral-300 mt-4 max-w-sm">Explore our latest collection of streetwear that combines style and comfort. Be bold, be you.</p>
                                         <div className="mt-8 flex items-center gap-4">
                                             <Button asChild className="bg-primary hover:bg-primary/90 text-black rounded-sm px-8">
                                                <Link href="/products">Shop Now</Link>
                                            </Button>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </CarouselItem>
                    )}
                </CarouselContent>
            </Carousel>
        </section>

        {/* Features Section */}
        <section className="bg-black py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-6 gap-8">
                    {featureIcons.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center gap-4">
                            <feature.icon className="w-8 h-8 text-primary" />
                            <p className="text-neutral-300 text-sm">{feature.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* New Arrivals Section */}
        <section className="bg-black py-20">
            <div className="container mx-auto px-4 grid grid-cols-2 gap-16 items-center">
                <div className="space-y-4">
                    <h2 className="text-4xl font-extrabold uppercase">Fresh on the Scene</h2>
                    <h2 className="text-4xl font-extrabold uppercase">New Arrivals</h2>
                    <p className="text-neutral-400 max-w-md">Check out the latest additions to our collection. Don't miss out on these fresh styles.</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {productsLoading ? Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-lg" />) :
                     newArrivals.map((p, i) => (
                        <div key={p.id} className="relative aspect-[3/4] rounded-lg overflow-hidden group">
                             <Image src={p.imageUrls[0]} alt={p.name} layout="fill" objectFit="cover" data-ai-hint="fashion model" />
                             <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                             {p.discountPercentage && <Badge className="absolute top-2 right-2 bg-red-600 text-white">SALE</Badge>}
                        </div>
                     ))
                    }
                </div>
            </div>
        </section>

        {/* Featured Collection Section */}
        <section className="py-20">
             <div className="container mx-auto px-4">
                <h2 className="text-4xl font-extrabold text-center mb-12 uppercase">Featured Collection</h2>
                <div className="grid grid-cols-4 grid-rows-2 gap-6">
                    {productsLoading ? Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />) : 
                    featuredProducts.map((p, i) => (
                        <StreetifyProductCard key={p.id} product={p} large={i === largeProductIndex} />
                    ))}
                </div>
            </div>
        </section>

      </main>
      <StreetifyFooter />
    </div>

    {/* Mobile View */}
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
            
        </main>
        <MobileFooter/>
    </div>
    </>
  );
}
