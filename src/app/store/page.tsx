

'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart, Heart, MapPin, Bell, Search, Settings2, Shirt, Radio, Watch, MessageCircle, User, Home, Star, Footprints, Shapes } from "lucide-react";
import { Header } from "@/components/header";
import { OktopusFooter } from "@/components/oktopus-footer";
import { Card, CardContent } from "@/components/ui/card";
import { FlowerIcon } from "@/components/icons/flower-icon";
import { useProduct, Product } from "@/context/product-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { MobileFooter } from "@/components/mobile-footer";
import { usePromotion } from "@/context/promotion-context";
import { useCategory } from "@/context/category-context";
import { format, addDays } from "date-fns";
import * as React from "react";

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

export default function OktopusStorePage() {
  const { products, loading: productsLoading } = useProduct();
  const { promotions, loading: promotionsLoading } = usePromotion();
  const { categories, loading: categoriesLoading } = useCategory();
  const [deliveryDate] = React.useState(format(addDays(new Date(), 5), 'MMM dd'));

  const featuredProducts = products.filter(p => p.featured).slice(0, 5);
  const flashSaleProducts = products.slice(0, 4);
  const heroProduct = products.find(p => p.isHero);

  const activePromotions = promotions.filter(p => p.isActive);
  const loading = productsLoading || promotionsLoading || categoriesLoading;

  return (
    <>
    {/* Desktop View */}
    <div className="hidden md:block bg-white text-stone-900 font-serif">
      <Header />
      <main>
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight flex items-center justify-center flex-wrap">
              DIVE INTO A W
              <span className="inline-flex items-center justify-center mx-2">
                <FlowerIcon className="h-12 w-12 text-accent" />
              </span>
              RLD OF ENDLESS
            </h1>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">FASHION POSSIBILITIES</h1>
            <p className="text-sm text-muted-foreground mt-4 max-w-2xl mx-auto">
              Discover premium clothing collections tailored for a modern and stylish lifestyle. From formal wear to casual attire, find your perfect look for any occasion.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
               <Image src="https://i.ibb.co/7tL6Sq6/e4622d48a767cf92bc65d7ffad4f2009.jpg" alt="Fashion model 1" fill objectFit="cover" data-ai-hint="male model" />
            </div>
            <div className="grid grid-rows-2 gap-6">
              <div className="relative rounded-2xl overflow-hidden aspect-video">
                 <Image src="https://i.ibb.co/DPBrq8Cb/9cbfc8f8f4a9d7cd120e2e8324e1986d.jpg" alt="Fashion model 2" fill objectFit="cover" data-ai-hint="male model" />
              </div>
              <div className="relative rounded-2xl overflow-hidden">
                 <Image src="https://i.ibb.co/4RscTdbf/test17-4.png" alt="Fashion model 3" fill objectFit="cover" data-ai-hint="male model" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                 <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-sm">Awesome Collection</p>
                    <p className="font-bold">View All</p>
                 </div>
              </div>
            </div>
          </div>
           <div className="flex justify-center gap-4 mt-8">
              <Button size="lg" className="bg-stone-900 text-white hover:bg-stone-800 rounded-full px-8 py-6" asChild>
                <Link href="/products">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full border-stone-900 text-stone-900 hover:bg-stone-100 px-8 py-6" asChild>
                 <Link href="/products">
                  Explore More Products
                </Link>
              </Button>
            </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 font-serif">Featured Collection</h2>
            <div className="relative flex justify-center items-center h-[400px]">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="absolute transition-all duration-300 ease-in-out"
                    style={{
                      transform: `translateX(${(index - 2) * 60}px) scale(${1 - Math.abs(index - 2) * 0.1})`,
                      zIndex: 5 - Math.abs(index - 2),
                      filter: `brightness(${100 - Math.abs(index - 2) * 15}%)`
                    }}
                  >
                    <Card className="overflow-hidden group border-2 rounded-2xl w-[200px] shadow-lg">
                      <Skeleton className="relative aspect-[3/4] bg-gray-200" />
                      <CardContent className="p-4 text-center absolute bottom-4 w-full">
                          <Skeleton className="h-5 w-3/4 mx-auto mb-2" />
                          <Skeleton className="h-4 w-1/2 mx-auto" />
                      </CardContent>
                    </Card>
                  </div>
                ))
              ) : (
                featuredProducts.map((product, index) => (
                  <div 
                    key={product.id}
                    className="absolute transition-all duration-300 ease-in-out"
                    style={{
                      transform: `translateX(${(index - Math.floor(featuredProducts.length / 2)) * 60}px) scale(${1 - Math.abs(index - Math.floor(featuredProducts.length / 2)) * 0.1})`,
                      zIndex: featuredProducts.length - Math.abs(index - Math.floor(featuredProducts.length / 2)),
                      filter: `brightness(${100 - Math.abs(index - Math.floor(featuredProducts.length / 2)) * 15}%)`
                    }}
                  >
                      <Card className="overflow-hidden group border-2 rounded-2xl w-[200px] shadow-lg">
                        <Link href={`/products/${product.id}`}>
                          <div className="relative aspect-[3/4] bg-gray-100">
                            <Image
                              src={product.imageUrls[0]}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              data-ai-hint="product model"
                            />
                          </div>
                          <CardContent className="p-4 text-center absolute bottom-4 w-full text-white bg-gradient-to-t from-black/50 to-transparent">
                              <p className="font-bold text-sm">{product.name}</p>
                              <p className="text-xs">₹{product.price.toFixed(2)}</p>
                          </CardContent>
                        </Link>
                      </Card>
                  </div>
                ))
              )}
            </div>
             <div className="text-center mt-8">
                <Button variant="outline" size="icon" className="rounded-full bg-stone-900 text-white" asChild>
                  <Link href="/cart">
                    <ShoppingCart className="h-5 w-5" />
                  </Link>
                </Button>
             </div>
          </div>
        </section>
        
        <section className="container mx-auto px-4 my-20">
          <div className="bg-[#F0F5F4] rounded-2xl p-8 md:p-16 grid md:grid-cols-2 items-center gap-8 overflow-hidden">
            <div className="relative z-10 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold font-serif">Elevate Your Wardrobe with Our Fashion Finds</h2>
              <p className="text-sm text-muted-foreground">Our new collection introduces a range of styles and materials, ensuring that you'll find the perfect addition to your wardrobe.</p>
              <Button asChild className="bg-transparent text-accent p-0 h-auto hover:bg-transparent">
                <Link href="/products">Our New Collection Introduction <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
            </div>
            <div className="relative h-80 md:h-96">
               <Image src="https://i.ibb.co/1GZq5Mk/promo-guy.png" alt="Model in a suit" fill objectFit="cover" className="rounded-2xl" data-ai-hint="model suit" />
            </div>
          </div>
        </section>


        <section className="container mx-auto px-4 my-20">
          <h2 className="text-4xl font-bold text-center mb-12 font-serif">Fashion at Your Fingertips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="relative h-80 rounded-2xl overflow-hidden border-none bg-[#F0F5F4] flex flex-col justify-end p-8">
               <h3 className="text-3xl font-bold font-serif">1200+ Happy Customers</h3>
               <p className="text-sm text-muted-foreground mt-2">See our customer reviews and testimonials.</p>
               <Button asChild variant="link" className="text-accent p-0 mt-4 justify-start">
                  <Link href="#">See Reviews <ArrowRight className="h-4 w-4 ml-2" /></Link>
               </Button>
            </Card>
            <div className="grid grid-cols-2 gap-8">
                <Card className="relative rounded-2xl overflow-hidden border-none">
                    <Image src="https://i.ibb.co/3s8sCsy/fingertips-1.png" alt="New Arrivals" layout="fill" objectFit="cover" data-ai-hint="customer showcase" />
                </Card>
                <Card className="relative rounded-2xl overflow-hidden border-none">
                    <Image src="https://i.ibb.co/rpxC5w2/fingertips-2.png" alt="New Arrivals" layout="fill" objectFit="cover" data-ai-hint="customer showcase" />
                </Card>
            </div>
          </div>
        </section>
      </main>
      <OktopusFooter />
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
                    {loading ? Array.from({length: 4}).map((_, i) => (
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
                    <h2 className="font-bold text-lg">Flash Sale</h2>
                    <Link href="/products" className="text-sm text-red-500 font-semibold flex items-center gap-1">
                        See All
                    </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {loading ? Array.from({length: 4}).map((_, i) => (
                        <Card key={i} className="rounded-2xl overflow-hidden border-none shadow-sm bg-white">
                           <Skeleton className="w-full aspect-square" />
                           <CardContent className="p-3 space-y-1">
                               <Skeleton className="h-4 w-3/4"/>
                               <Skeleton className="h-4 w-1/2"/>
                               <div className="flex justify-between items-center pt-1">
                                   <Skeleton className="h-5 w-1/3"/>
                                   <Skeleton className="h-5 w-1/4"/>
                               </div>
                           </CardContent>
                        </Card>
                    )) : flashSaleProducts.map(product => (
                        <Link href={`/products/${product.id}`} key={product.id}>
                        <Card className="rounded-2xl overflow-hidden border-none shadow-sm bg-white card-glass">
                            <div className="relative aspect-square">
                                <Image src={product.imageUrls[0]} alt={product.name} layout="fill" objectFit="cover" data-ai-hint="product image" />
                                <Button size="icon" variant="secondary" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm">
                                    <Heart className="h-4 w-4 text-gray-500" />
                                </Button>
                            </div>
                            <CardContent className="p-3 space-y-1">
                                <h3 className="text-sm font-semibold truncate">{product.name}</h3>
                                <div className="flex items-center gap-1 text-xs mt-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400"/>
                                    <span className="font-bold">{product.rating?.toFixed(1)}</span>
                                    <span className="text-gray-400">|</span>
                                    <span className="text-gray-400">{product.stock} sold</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-md font-bold text-primary mt-1">₹{product.price.toFixed(2)}</p>
                                    {product.originalPrice && (
                                        <p className="text-xs text-muted-foreground line-through">₹{product.originalPrice.toFixed(2)}</p>
                                    )}
                                </div>
                                <p className="text-xs text-green-600">Get it by {deliveryDate}</p>
                            </CardContent>
                        </Card>
                        </Link>
                    ))}
                </div>
            </section>
            
            <section>
                 <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg">Hero Product</h2>
                </div>
                {loading ? (
                    <Card className="rounded-2xl overflow-hidden border-none shadow-sm">
                        <Skeleton className="w-full aspect-[4/3]" />
                        <CardContent className="p-4 space-y-2">
                            <Skeleton className="h-5 w-3/4"/>
                            <Skeleton className="h-5 w-1/2"/>
                        </CardContent>
                    </Card>
                ) : heroProduct ? (
                     <Card className="rounded-2xl overflow-hidden border-none shadow-sm card-glass">
                        <Link href={`/products/${heroProduct.id}`}>
                            <div className="relative aspect-[4/3]">
                                <Image src={heroProduct.imageUrls[0]} alt={heroProduct.name} layout="fill" objectFit="cover" data-ai-hint="hero product" />
                            </div>
                            <CardContent className="p-4">
                                <h3 className="text-lg font-bold">{heroProduct.name}</h3>
                                <p className="text-xl font-bold text-primary">₹{heroProduct.price.toFixed(2)}</p>
                                <Button className="w-full mt-4">Shop Now</Button>
                            </CardContent>
                        </Link>
                    </Card>
                ): null}
            </section>
        </main>
        <MobileFooter/>
    </div>
    </>
  );
}
