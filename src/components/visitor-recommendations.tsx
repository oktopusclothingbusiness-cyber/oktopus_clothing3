'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ArrowRight, ShoppingBag } from 'lucide-react';
import { getOrCreatePersistentVisitorId } from '@/lib/fingerprint';

interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  category: string | string[];
  images: string[];
}

interface RecentlyViewedItem {
  productId: string;
  title: string;
  slug?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  viewCount: number;
}

export function VisitorRecommendations({ title = 'Recently Viewed', className = '' }: { title?: string; className?: string }) {
  const [loading, setLoading] = React.useState(true);
  const [recentlyViewed, setRecentlyViewed] = React.useState<RecentlyViewedItem[]>([]);
  const [recommended, setRecommended] = React.useState<RecommendedProduct[]>([]);
  const [hasHistory, setHasHistory] = React.useState(false);

  React.useEffect(() => {
    async function loadPersonalizedRecommendations() {
      try {
        const vid = getOrCreatePersistentVisitorId();
        const res = await fetch(`/api/recommendations/visitor?visitorId=${encodeURIComponent(vid)}`);
        if (res.ok) {
          const data = await res.json();
          setHasHistory(Boolean(data.hasHistory));
          setRecentlyViewed(data.recentlyViewed || []);
          setRecommended(data.recommended || []);
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }

    loadPersonalizedRecommendations();
  }, []);

  // If user has not viewed any products yet, we don't disrupt their layout
  if (loading || !hasHistory || (recentlyViewed.length === 0 && recommended.length === 0)) {
    return null;
  }

  return (
    <section className={`w-full py-8 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground">{title}</h3>
        </div>

        <Link href="/products" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
          Explore all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid of Recommended Products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {recentlyViewed.slice(0, 5).map((item) => (
          <Link
            key={item.productId}
            href={`/products/${item.slug || item.productId}`}
            className="group block rounded-xl border bg-card/60 p-2.5 hover:border-primary/40 transition-all"
          >
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted mb-2">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ShoppingBag className="w-8 h-8" />
                </div>
              )}
              <Badge className="absolute top-1.5 right-1.5 bg-background/90 text-foreground text-[10px] py-0 px-1.5 font-normal">
                Recently Viewed
              </Badge>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-medium">
                {item.category || 'Apparel'}
              </span>
              <h4 className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              <div className="text-xs font-mono font-bold text-foreground">
                ₹{item.price.toLocaleString('en-IN')}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

