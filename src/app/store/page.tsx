
'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { Header } from "@/components/header";
import { OktopusFooter } from "@/components/oktopus-footer";
import { Card, CardContent } from "@/components/ui/card";
import { FlowerIcon } from "@/components/icons/flower-icon";
import { useProduct } from "@/context/product-context";

export default function OktopusStorePage() {
  const { products } = useProduct();
  const featuredProducts = products.slice(0, 5);

  return (
    <div className="bg-white text-stone-900 font-serif">
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
               <Image src="https://i.ibb.co/7tL6SqQ6/e4622d48a767cf92bc65d7ffad4f2009.jpg" alt="Fashion model 1" fill objectFit="cover" data-ai-hint="male model" />
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
            <div className="relative flex justify-center items-center h-[500px]">
              {featuredProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className="absolute transition-all duration-300 ease-in-out"
                  style={{
                     transform: `translateX(${(index - Math.floor(featuredProducts.length / 2)) * 50}px) scale(${1 - Math.abs(index - Math.floor(featuredProducts.length / 2)) * 0.1})`,
                     zIndex: featuredProducts.length - Math.abs(index - Math.floor(featuredProducts.length / 2)),
                     filter: `brightness(${100 - Math.abs(index - Math.floor(featuredProducts.length / 2)) * 15}%)`
                  }}
                >
                    <Card className="overflow-hidden group border-2 rounded-2xl w-[300px] shadow-lg">
                      <div className="relative aspect-[3/4] bg-gray-100">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          data-ai-hint="product model"
                        />
                      </div>
                      <CardContent className="p-4 text-center absolute bottom-4 w-full text-white bg-gradient-to-t from-black/50 to-transparent">
                          <p className="font-bold">{product.name}</p>
                          <p className="text-sm">${product.price.toFixed(2)} USD</p>
                      </CardContent>
                    </Card>
                </div>
              ))}
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
  );
}
