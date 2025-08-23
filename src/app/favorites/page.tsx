
'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, Heart } from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';
import { MobileFooter } from '@/components/mobile-footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FavoritesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Placeholder for wishlist items
  const wishlistItems: any[] = [];

  return (
    <div className="md:hidden">
      <MobileHeader title="My Wishlist" />
      <main className="bg-secondary min-h-screen pb-24 p-4">
         {wishlistItems.length > 0 ? (
          <div className="space-y-4">
            {/* Map through wishlist items here */}
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
  );
}
