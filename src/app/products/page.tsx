
'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { useProduct } from "@/context/product-context";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileHeader } from "@/components/mobile-header";
import { MobileFooter } from "@/components/mobile-footer";
import * as React from 'react';
import { useSearchParams } from "next/navigation";

export default function ProductsPage() {
  const { products, loading } = useProduct();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  
  const filteredProducts = React.useMemo(() => {
    if (!searchQuery) {
        return products;
    }
    return products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);


  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">
             {searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {loading ? (
               Array.from({ length: 8 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden group">
                    <Skeleton className="relative aspect-[3/4]" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-5 w-1/4" />
                    </CardContent>
                    <CardFooter>
                       <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden group">
                  <Link href={`/products/${product.id}`}>
                    <div className="relative aspect-[3/4]">
                      <Image
                        src={product.imageUrls[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint="clothing item"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="truncate">{product.name}</CardTitle>
                    </CardHeader>
                  </Link>
                  <CardContent>
                    <p className="text-lg font-semibold">₹{product.price.toFixed(2)}</p>
                  </CardContent>
                  <CardFooter>
                    <AddToCartButton product={product} />
                  </CardFooter>
                </Card>
              ))
            ) : (
                <p>No products found for your search.</p>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader showCart={false} title={searchQuery ? `Searching for "${searchQuery}"` : "All Products"} />
        <main className="pb-24">
          <div className="grid grid-cols-2 gap-4 p-4">
            {loading ? (
               Array.from({ length: 8 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden group rounded-lg">
                    <Skeleton className="relative aspect-[3/4]" />
                    <div className="p-2">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </Card>
                ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden group rounded-lg">
                  <Link href={`/products/${product.id}`}>
                    <div className="relative aspect-[3/4]">
                      <Image
                        src={product.imageUrls[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        data-ai-hint="clothing item"
                      />
                    </div>
                    <div className="p-2">
                      <h3 className="truncate text-sm font-semibold">{product.name}</h3>
                      <p className="text-sm">₹{product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                </Card>
              ))
            ) : (
                 <p className="col-span-2 text-center">No products found.</p>
            )}
          </div>
        </main>
        <MobileFooter />
      </div>
    </>
  );
}
