'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePromotion } from '@/context/promotion-context';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface PageBannerProps {
  placement: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackCtaText?: string;
  fallbackCtaLink?: string;
  fallbackImageUrl?: string;
  className?: string;
  compact?: boolean;
}

export function PageBanner({
  placement,
  fallbackTitle = 'OKTOPUS CLOTHING DROPS',
  fallbackDescription = 'Heavyweight streetwear designed for expression and built for utility.',
  fallbackCtaText = 'EXPLORE COLLECTION',
  fallbackCtaLink = '/products',
  fallbackImageUrl,
  className = '',
  compact = false,
}: PageBannerProps) {
  const { promotions, loading } = usePromotion();

  // Find dynamic promotion from DB matching placement or fallback
  const banner = React.useMemo(() => {
    if (!promotions || promotions.length === 0) return null;

    const normalizedPlacement = placement.toLowerCase().trim();
    return (
      promotions.find(
        (p) =>
          p.isActive &&
          p.placement &&
          p.placement.toLowerCase().trim() === normalizedPlacement
      ) ||
      promotions.find(
        (p) =>
          p.isActive &&
          (normalizedPlacement.includes(p.placement?.toLowerCase() || '') ||
            p.placement?.toLowerCase().includes(normalizedPlacement))
      )
    );
  }, [promotions, placement]);

  const title = banner?.title || fallbackTitle;
  const description = banner?.description || fallbackDescription;
  const ctaText = banner?.ctaText || fallbackCtaText;
  const ctaLink = banner?.ctaLink || fallbackCtaLink;
  const imageUrl = banner?.imageUrl || fallbackImageUrl;

  if (compact) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-[#121212] border border-white/10 p-6 ${className}`}>
        {imageUrl && (
          <>
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover opacity-30 select-none"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
          </>
        )}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#0F824B] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> OFFICIAL DROP BANNER
            </span>
            <h3 className="text-2xl md:text-3xl font-black font-bebas uppercase tracking-wider text-white">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-zinc-400 max-w-xl line-clamp-2">{description}</p>
            )}
          </div>
          {ctaLink && (
            <Button
              asChild
              className="bg-[#0F824B] text-white hover:bg-[#0b663a] font-bold text-xs rounded-full px-6 h-10 shrink-0 self-start md:self-auto shadow-lg hover:scale-105 transition-all"
            >
              <Link href={ctaLink} className="flex items-center gap-2">
                {ctaText} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className={`relative overflow-hidden border-b border-white/10 bg-[#0A0A0A] py-12 md:py-16 ${className}`}>
      {imageUrl ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover opacity-25"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(252,195,36,0.08),transparent_70%)] pointer-events-none" />
      )}

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[11px] font-mono font-bold tracking-widest text-[#0F824B] uppercase">
            <Sparkles className="w-3.5 h-3.5" /> OKTOPUS FEATURED RELEASE
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-bebas tracking-tight uppercase leading-[0.95] text-white">
            {title}
          </h1>

          {description && (
            <p className="text-sm md:text-base text-zinc-300 leading-relaxed font-sans max-w-xl">
              {description}
            </p>
          )}

          {ctaLink && (
            <div className="pt-2">
              <Button
                asChild
                size="lg"
                className="bg-white text-black hover:bg-zinc-200 font-bold text-xs rounded-full px-8 h-12 shadow-xl hover:scale-105 transition-all"
              >
                <Link href={ctaLink} className="flex items-center gap-2">
                  {ctaText} <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
