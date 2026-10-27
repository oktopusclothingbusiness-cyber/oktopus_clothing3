'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import { getOptimizedImageUrl } from '@/lib/utils';
import type { Product } from '@/context/product-context';

interface DesktopSecondaryCampaignProps {
  products: Product[];
  bannerUrl?: string;
}

export function DesktopSecondaryCampaign({
  products,
  bannerUrl,
}: DesktopSecondaryCampaignProps) {
  const campaignBanner =
    bannerUrl ||
    'https://res.cloudinary.com/de1ypcjx9/image/upload/v1790432973/homepage_new_banner1.webp';

  const curatedDropProducts = React.useMemo(() => {
    // Show up to 4 products from reverse or sale items for variety
    const sale = (products || []).filter((p) => p && p.originalPrice && p.originalPrice > p.price);
    if (sale.length >= 4) return sale.slice(0, 4);
    return (products || []).slice(4, 8);
  }, [products]);

  return (
    <section className="bg-background py-16 lg:py-24 border-b border-white/10 select-none">
      <div className="container mx-auto px-6 lg:px-12 space-y-12">
        {/* 1400x700 Campaign Billboard */}
        <div className="relative w-full aspect-[2/1] max-h-[500px] overflow-hidden border border-white/10 shadow-2xl bg-black group">
          <Image
            src={getOptimizedImageUrl(campaignBanner, 1920)}
            alt="OKTOPUS Secondary Campaign"
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-103"
          />

          {/* Scrim Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/50 to-transparent flex items-center p-8 lg:p-16">
            <div className="max-w-xl space-y-4 text-white">
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-zinc-400 font-bold">
                LIMITED PRODUCTION • ARCHIVE RUN
              </p>

              <h2 className="text-4xl lg:text-7xl font-black font-bebas tracking-tight uppercase leading-none">
                EXCLUSIVE LIMITED EDITIONS
              </h2>

              <p className="text-xs lg:text-sm text-zinc-300 leading-relaxed font-normal max-w-md">
                Strict batch limits. Once a colorway sells out, it will not be restocked in the same graphic configuration.
              </p>

              <div className="pt-2">
                <Button
                  asChild
                  size="lg"
                  className="rounded-none h-12 px-8 text-xs font-bold font-mono tracking-wider bg-white text-black hover:bg-zinc-200 transition-all shadow-xl"
                >
                  <Link href="/products" className="flex items-center gap-2">
                    SHOP ARCHIVE DROPS <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Item Product Row for this Campaign */}
        {curatedDropProducts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl lg:text-3xl font-black font-bebas tracking-wide uppercase text-foreground">
                  SEASON HIGHLIGHTS
                </h3>
                <p className="text-xs text-muted-foreground">Limited inventory on featured colorways</p>
              </div>

              <Link
                href="/products"
                className="text-xs font-mono font-bold text-foreground hover:text-amber-400 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
              >
                <span>BROWSE RELEASES</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {curatedDropProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} isMobile={false} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
