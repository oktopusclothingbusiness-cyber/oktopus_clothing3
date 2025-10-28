
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
import { useCategory } from "@/context/category-context";
import { Star } from "lucide-react";
import { format, addDays } from "date-fns";
import { ProductCard } from "@/components/product-card";


function ProductListComponent() {
  const { products, loading: productsLoading } = useProduct();
  const { categories, loading: categoriesLoading } = useCategory();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  const categoryId = searchParams.get('category');

  const loading = productsLoading || categoriesLoading;

  const categoryName = React.useMemo(() => {
    if (!categoryId || categoriesLoading) return '';
    return categories.find(c => c.id === categoryId)?.name || '';
  }, [categoryId, categories, categoriesLoading]);
  
  const filteredProducts = React.useMemo(() => {
    // Sort products by creation date, newest first
    let tempProducts = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (searchQuery) {
        tempProducts = tempProducts.filter(product => 
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    if (categoryId) {
        tempProducts = tempProducts.filter(product => product.category === categoryId);
    }
    return tempProducts;
  }, [products, searchQuery, categoryId]);

  const getPageTitle = () => {
    if (searchQuery) return `Search results for "${searchQuery}"`;
    if (categoryId) return categoryName || 'Category Products';
    return 'All Products';
  }

  return (
     <>
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">
             {getPageTitle()}
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
                <ProductCard key={product.id} product={product} />
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
        <MobileHeader showCart={false} title={getPageTitle()} />
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
                <ProductCard key={product.id} product={product} isMobile={true} />
              ))
            ) : (
                 <p className="col-span-2 text-center">No products found.</p>
            )}
          </div>
        </main>
        <MobileFooter />
      </div>
    </>
  )
}

export default function ProductsPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <ProductListComponent />
    </React.Suspense>
  );
}
