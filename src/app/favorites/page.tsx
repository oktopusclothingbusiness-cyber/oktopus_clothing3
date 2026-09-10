'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, Heart, ShoppingBag } from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';
import { MobileFooter } from '@/components/mobile-footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useProduct } from '@/context/product-context';
import { StorefrontHeader } from '@/components/storefront/header';
import { StorefrontFooter } from '@/components/storefront/footer';
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
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A] text-white font-mono">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F824B]" />
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] text-[#FAF9F6] font-sans min-h-screen">
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <StorefrontHeader />
        <main className="flex-grow container mx-auto px-6 lg:px-12 py-12">
          <h1 className="text-4xl font-black font-bebas uppercase tracking-wider text-white mb-8 flex items-center gap-3">
            <Heart className="h-8 w-8 text-[#0F824B] fill-[#0F824B]" />
            SAVED WISHLIST ({wishlistItems.length})
          </h1>
          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#121212] border border-white/10 rounded-2xl p-8 space-y-4">
              <Heart className="mx-auto h-16 w-16 text-zinc-600" />
              <h2 className="text-3xl font-black font-bebas uppercase text-white">YOUR WISHLIST IS EMPTY</h2>
              <p className="text-xs font-mono text-zinc-400 max-w-sm mx-auto">
                Tap the heart on any streetwear drop to save it to your personal vault.
              </p>
              <Button asChild className="bg-[#0F824B] text-white font-bold font-mono text-xs rounded-full px-8 h-12">
                <Link href="/products">Discover Products →</Link>
              </Button>
            </div>
          )}
        </main>
        <StorefrontFooter />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader title="My Wishlist" />
        <main className="bg-[#0A0A0A] min-h-screen pb-24 p-4">
          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {wishlistItems.map((product) => (
                <ProductCard key={product.id} product={product} isMobile={true} />
              ))}
            </div>
          ) : (
            <div className="text-center pt-20 p-6 space-y-4 font-mono">
              <Heart className="mx-auto h-12 w-12 text-zinc-600" />
              <h2 className="text-xl font-bold font-bebas uppercase text-white">No Saved Items</h2>
              <p className="text-xs text-zinc-400">Tap the heart icon on any product to save it here.</p>
              <Button asChild className="bg-[#0F824B] text-white font-bold text-xs rounded-full px-6">
                <Link href="/products">Discover Products</Link>
              </Button>
            </div>
          )}
        </main>
        <MobileFooter />
      </div>
    </div>
  );
}
