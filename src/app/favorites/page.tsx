
'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, Heart } from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';
import { MobileFooter } from '@/components/mobile-footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useProduct, Product } from '@/context/product-context';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ProductCard } from '@/components/product-card';

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const { products, loading: productsLoading } = useProduct();
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  const wishlistItems = React.useMemo(() => {
    if (!user?.wishlist || productsLoading) return [];
    return products.filter(p => user.wishlist!.includes(p.id));
  }, [user, products, productsLoading]);

  const loading = authLoading || productsLoading;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
    {/* Desktop View */}
    <div className="hidden md:flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
             {wishlistItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {wishlistItems.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border rounded-lg">
                    <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-semibold">Your wishlist is empty</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Tap the heart on any product to save it here.</p>
                    <Button asChild className="mt-6">
                        <Link href="/store">Discover Products</Link>
                    </Button>
                </div>
            )}
        </main>
        <Footer />
    </div>

    {/* Mobile View */}
    <div className="md:hidden">
      <MobileHeader title="My Wishlist" />
      <main className="bg-secondary min-h-screen pb-24 p-4">
         {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
             {wishlistItems.map((product) => (
                <ProductCard key={product.id} product={product} isMobile={true} />
            ))}
          </div>
        ) : (
          <div className="text-center mt-20">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Your wishlist is empty</h2>
            <p className="mt-2 text-sm text-muted-foreground">Tap the heart on any product to save it here.</p>
             <Button asChild className="mt-6">
                <Link href="/store">Discover Products</Link>
            </Button>
          </div>
        )}
      </main>
      <MobileFooter />
    </div>
    </>
  );
}
