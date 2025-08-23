
'use client'

import * as React from "react";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { useProduct, Product } from "@/context/product-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MobileHeader } from "@/components/mobile-header";
import { MobileFooter } from "@/components/mobile-footer";
import { useCart } from "@/context/cart-context";


export default function ProductDetailPage() {
  const params = useParams();
  const { products, loading } = useProduct();
  const [product, setProduct] = React.useState<Product | null | undefined>(undefined);
  const { addToCart } = useCart();

  React.useEffect(() => {
    if (!loading) {
      const foundProduct = products.find((p) => p.id === params.id);
      setProduct(foundProduct);
    }
  }, [params.id, products, loading]);

  if (loading || product === undefined) {
    return (
        <>
            <div className="hidden md:block">
                <ProductDetailSkeleton />
            </div>
            <div className="md:hidden">
                <MobileHeader title="Product Details" />
                <ProductDetailSkeleton />
                <MobileFooter />
            </div>
        </>
    )
  }

  if (!product) {
    notFound();
  }

  return (
      <>
        {/* Desktop View */}
        <div className="hidden md:flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <Carousel className="w-full">
                  <CarouselContent>
                    {product.imageUrls.map((url, index) => (
                      <CarouselItem key={index}>
                        <div className="relative aspect-square">
                          <Image
                            src={url}
                            alt={`${product.name} image ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                            data-ai-hint="product image"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
              <div className="space-y-6">
                <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>
                <p className="text-muted-foreground">{product.description}</p>
                <p className="text-3xl font-bold">₹{product.price.toFixed(2)}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Size</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.sizes.map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Color</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.colors.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <AddToCartButton product={product} className="w-full" size="lg" />
              </div>
            </div>
          </main>
          <Footer />
        </div>
        {/* Mobile View */}
        <div className="md:hidden">
            <MobileHeader title={product.name} />
            <main className="pb-24">
                <Carousel className="w-full">
                  <CarouselContent>
                    {product.imageUrls.map((url, index) => (
                      <CarouselItem key={index}>
                        <div className="relative aspect-square">
                          <Image
                            src={url}
                            alt={`${product.name} image ${index + 1}`}
                            fill
                            className="object-cover"
                            data-ai-hint="product image"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
                <div className="p-4 space-y-4">
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    <p className="text-2xl font-bold">₹{product.price.toFixed(2)}</p>
                    <p className="text-muted-foreground text-sm">{product.description}</p>
                     <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium">Size</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {product.sizes.map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium">Color</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent>
                            {product.colors.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {/* The AddToCartButton was here and is now removed for mobile view to rely on the floating cart button. */}
                </div>
            </main>
            <MobileFooter/>
        </div>
    </>
  );
}

function ProductDetailSkeleton() {
  return (
      <>
        {/* Desktop Skeleton */}
        <div className="hidden md:flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <Skeleton className="relative aspect-square rounded-lg" />
              <div className="space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-1/4" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </main>
          <Footer />
        </div>
        {/* Mobile Skeleton */}
        <div className="md:hidden">
            <main className="pb-24">
                <Skeleton className="w-full aspect-square" />
                <div className="p-4 space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-16 w-full" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                </div>
            </main>
        </div>
    </>
  )
}
