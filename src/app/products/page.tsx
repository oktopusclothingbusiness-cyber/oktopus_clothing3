
'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useThemeManager } from "@/context/theme-provider";
import { usePageTransition } from "@/context/page-transition-context";


function ProductListComponent() {
  const { products, loading: productsLoading } = useProduct();
  const { categories, loading: categoriesLoading } = useCategory();
  const searchParams = useSearchParams();
  const { setAccentColor, accentColor } = useThemeManager();
  const { startTransition } = usePageTransition();
  const [activeGender, setActiveGender] = React.useState<'men' | 'women'>(accentColor.name === 'pink' ? 'women' : 'men');

  const searchQuery = searchParams.get('q');
  const categoryId = searchParams.get('category');
  
  const loading = productsLoading || categoriesLoading;

  const categoryName = React.useMemo(() => {
    if (!categoryId || categoriesLoading) return '';
    return categories.find(c => c.id === categoryId)?.name || '';
  }, [categoryId, categories, categoriesLoading]);

  const womenCategoryId = React.useMemo(() => {
    return categories.find(c => c.name.toLowerCase() === 'women')?.id;
  }, [categories]);

  const filteredProducts = React.useMemo(() => {
    // Start with only in-stock products
    let tempProducts = products.filter(p => p.stock && p.stock > 0);

    // Sort by creation date
    tempProducts = tempProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (searchQuery) {
        tempProducts = tempProducts.filter(product => 
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    } else if (categoryId) {
        tempProducts = tempProducts.filter(product => product.category.includes(categoryId));
    } else if (activeGender === 'women' && womenCategoryId) {
        tempProducts = tempProducts.filter(product => product.category.includes(womenCategoryId));
    } else if (activeGender === 'men' && womenCategoryId) {
        tempProducts = tempProducts.filter(product => !product.category.includes(womenCategoryId));
    }

    return tempProducts;
  }, [products, searchQuery, categoryId, activeGender, womenCategoryId]);

  const handleToggle = (isWomen: boolean) => {
    const newGender = isWomen ? 'women' : 'men';
    const newThemeName = isWomen ? 'pink' : 'slateBlue';
    const newHsl = isWomen ? '348 100% 85.3%' : '240 10% 3.9%';

    if (newGender !== activeGender) {
        startTransition(() => {
            setActiveGender(newGender);
            setAccentColor({ name: newThemeName, hsl: newHsl });
        });
    }
  };

  const getPageTitle = () => {
    if (searchQuery) return `Search results for "${searchQuery}"`;
    if (categoryId) return categoryName || 'Category Products';
    return 'All Products';
  }

  const MobileProductHeader = () => (
    <div className="md:hidden sticky top-0 z-50 p-4 bg-background/80 backdrop-blur-lg border-b">
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2">
            <Label htmlFor="gender-toggle" className={activeGender === 'men' ? 'text-foreground font-bold' : 'text-muted-foreground'}>Men</Label>
            <Switch
                id="gender-toggle"
                checked={activeGender === 'women'}
                onCheckedChange={handleToggle}
            />
            <Label htmlFor="gender-toggle" className={activeGender === 'women' ? 'text-primary font-bold' : 'text-muted-foreground'}>Women</Label>
        </div>
      </div>
    </div>
  );

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
        <MobileProductHeader />
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
