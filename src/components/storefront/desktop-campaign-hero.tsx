'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus } from 'lucide-react';
import { getProductImage } from '@/lib/utils';
import type { Product } from '@/context/product-context';

interface DesktopCampaignHeroProps {
  heroProduct?: Product;
  secondaryProduct?: Product;
  thirdProduct?: Product;
  bannerImageUrl?: string;
  products?: Product[];
}

interface Hotspot {
  top: string;
  left: string;
  label: string;
  detail: string;
}

interface CampaignPanel {
  id: string;
  index: string;
  kicker: string;
  verticalTitle: string;
  title: string;
  tagline: string;
  price: number;
  image: string;
  href: string;
  hotspots: Hotspot[];
}

function HotspotMarker({ hotspot }: { hotspot: Hotspot }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div
      style={{ top: hotspot.top, left: hotspot.left }}
      className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Interactive Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label={hotspot.label}
        className="relative flex items-center justify-center w-7 h-7 bg-black/80 hover:bg-white text-white hover:text-black border border-white/40 transition-colors shadow-2xl focus:outline-none group"
      >
        <Plus className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-45" />
        <span className="absolute inset-0 border border-white/20 animate-ping opacity-75 pointer-events-none" />
      </button>

      {/* Popover Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 bg-black/95 border border-white/20 text-white shadow-2xl pointer-events-none z-40 backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-1.5 mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white">
                {hotspot.label}
              </span>
              <span className="text-[9px] font-mono text-zinc-500">SPEC</span>
            </div>
            <p className="text-[11px] text-zinc-300 font-sans leading-snug">
              {hotspot.detail}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DesktopCampaignHero({
  heroProduct,
  secondaryProduct,
  thirdProduct: propThirdProduct,
  bannerImageUrl,
  products = [],
}: DesktopCampaignHeroProps) {
  // Use propThirdProduct if provided, or find a third distinct product for look 3
  const thirdProduct =
    propThirdProduct ||
    products.find(
      (p) => p && p.id !== heroProduct?.id && p.id !== secondaryProduct?.id
    );

  const heroImage = heroProduct
    ? getProductImage(heroProduct.imageUrls, 'https://i.ibb.co/3yN11ZtH/mrvl-model-1.png', 1400)
    : 'https://i.ibb.co/3yN11ZtH/mrvl-model-1.png';

  const secondaryImage = secondaryProduct
    ? getProductImage(secondaryProduct.imageUrls, 'https://i.ibb.co/LdxSvMMd/mrvl-model-5.png', 1400)
    : 'https://i.ibb.co/LdxSvMMd/mrvl-model-5.png';

  const thirdImage = thirdProduct
    ? getProductImage(
        thirdProduct.imageUrls,
        bannerImageUrl || 'https://res.cloudinary.com/de1ypcjx9/image/upload/v1790432976/homepage_new_banner2.webp',
        1400
      )
    : bannerImageUrl || 'https://res.cloudinary.com/de1ypcjx9/image/upload/v1790432976/homepage_new_banner2.webp';

  const panels: CampaignPanel[] = React.useMemo(
    () => [
      {
        id: 'panel-01',
        index: '01',
        kicker: 'HEAVYWEIGHT GRAPHIC APPAREL',
        verticalTitle: 'OVERSIZED GRAPHIC TEE',
        title: heroProduct?.name || 'Hulk Graphic Oversized Streetwear Tee',
        tagline: '240 GSM Combed Cotton • Discharge Ink Printing • Pre-Shrunk Bio-Wash',
        price: heroProduct?.price || 1299,
        image: heroImage,
        href: heroProduct?.id ? `/products/${heroProduct.id}` : '/products',
        hotspots: [
          {
            top: '38%',
            left: '46%',
            label: '240 GSM COMPACT COTTON',
            detail: 'Dense long-staple combed cotton engineered with bio-washing for zero fabric shrinkage.',
          },
          {
            top: '64%',
            left: '38%',
            label: 'DISCHARGE PRINT ART',
            detail: 'Embedded directly into the textile weave for a soft-hand feel that never cracks.',
          },
        ],
      },
      {
        id: 'panel-02',
        index: '02',
        kicker: 'ARCHITECTURAL SILHOUETTE',
        verticalTitle: 'BOXY DROP SHOULDER',
        title: secondaryProduct?.name || 'Signature Boxy Minimal Drop Tee',
        tagline: 'Relaxed Drop Shoulder • Reinforced Collar Ribbing • Tailored Streetwear Drape',
        price: secondaryProduct?.price || 1499,
        image: secondaryImage,
        href: secondaryProduct?.id ? `/products/${secondaryProduct.id}` : '/products',
        hotspots: [
          {
            top: '26%',
            left: '52%',
            label: 'ZERO-SAG COLLAR',
            detail: 'Heavyweight 1x1 elasticized rib collar engineered to withstand hundreds of wash cycles.',
          },
          {
            top: '52%',
            left: '58%',
            label: 'DROP SHOULDER SLOPE',
            detail: 'Extended sleeve seam creates an authentic relaxed streetwear drape inspired by Tokyo styling.',
          },
        ],
      },
      {
        id: 'panel-03',
        index: '03',
        kicker: 'ARCHIVAL COLLECTION',
        verticalTitle: thirdProduct?.name ? thirdProduct.name.slice(0, 22).toUpperCase() : 'EXCLUSIVE DROP',
        title: thirdProduct?.name || 'Heavyweight Streetwear Essential',
        tagline: '240 GSM Combed Cotton • Bio-Washed Compact Yarn • Architectural Fit',
        price: thirdProduct?.price || 1599,
        image: thirdImage,
        href: thirdProduct?.id ? `/products/${thirdProduct.id}` : '/products',
        hotspots: [
          {
            top: '36%',
            left: '42%',
            label: '240 GSM FABRIC',
            detail: 'Dense long-staple combed cotton engineered for permanent structural drape.',
          },
          {
            top: '68%',
            left: '54%',
            label: 'HAND-FINISHED',
            detail: 'Precision screen print and reinforced stitching across all stress seams.',
          },
        ],
      },
    ],
    [heroImage, secondaryImage, thirdImage, heroProduct, secondaryProduct, thirdProduct]
  );

  const [activeIndex, setActiveIndex] = React.useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState<boolean>(true);

  // Gentle autoplay advances every 7 seconds when user is not actively interacting
  React.useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % panels.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, panels.length]);

  return (
    <section className="relative w-full bg-black text-white select-none overflow-hidden border-b border-white/10">
      {/* Top Editorial Utility Header */}
      <div className="w-full border-b border-white/10 px-6 lg:px-12 py-3 bg-zinc-950/80">
        <div className="container mx-auto flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-widest text-white">
              OKTOPUS • CAMPAIGN EXHIBITION
            </span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-zinc-400 hidden sm:inline text-[11px]">
              SS-26 ARCHITECTURAL STREETWEAR
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-[11px] text-zinc-500 uppercase tracking-widest hidden md:inline">
              SELECT LOOK TO EXPAND
            </span>
            <div className="flex items-center gap-1.5">
              {panels.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setActiveIndex(idx);
                  }}
                  className={`px-2 py-0.5 text-[10px] font-mono border transition-colors ${
                    activeIndex === idx
                      ? 'bg-white text-black border-white font-bold'
                      : 'bg-black text-zinc-400 border-white/15 hover:border-white/40 hover:text-white'
                  }`}
                >
                  [{p.index}]
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Kinetic Expanding Triptych Stage */}
      <div className="relative w-full h-[76vh] min-h-[580px] max-h-[820px] flex overflow-hidden bg-black">
        {/* Enormous Background Brutalist Typography Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <span className="text-[15vw] font-black font-bebas text-white/[0.03] tracking-tighter leading-none select-none">
            OKTOPUS
          </span>
        </div>

        {/* 3 Expanding Editorial Panels */}
        {panels.map((panel, idx) => {
          const isActive = activeIndex === idx;

          return (
            <motion.div
              key={panel.id}
              onClick={() => {
                setIsAutoPlaying(false);
                setActiveIndex(idx);
              }}
              onMouseEnter={() => {
                setActiveIndex(idx);
              }}
              animate={{
                flex: isActive ? 3.2 : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 180,
                damping: 24,
              }}
              className="relative h-full border-r last:border-r-0 border-white/10 overflow-hidden cursor-pointer group"
            >
              {/* Background High-Resolution Photography */}
              <div className="absolute inset-0">
                <Image
                  src={panel.image}
                  alt={panel.title}
                  fill
                  priority={idx === 0}
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className={`object-cover transition-all duration-700 ease-out ${
                    isActive
                      ? 'scale-100 filter-none'
                      : 'scale-105 brightness-50 contrast-125 grayscale-[30%] group-hover:brightness-75'
                  }`}
                />
              </div>

              {/* Scrim Gradients */}
              <div
                className={`absolute inset-0 transition-opacity duration-500 ${
                  isActive
                    ? 'bg-gradient-to-t from-black via-black/35 to-black/30'
                    : 'bg-black/60 group-hover:bg-black/45'
                }`}
              />

              {/* INACTIVE PANEL CONTENT: Vertical Rotated Typography */}
              {!isActive && (
                <div className="absolute inset-0 flex flex-col justify-between p-6 z-20 pointer-events-none">
                  <span className="text-xs font-mono font-bold text-zinc-400">
                    0{idx + 1}
                  </span>

                  <div className="rotate-[-90deg] origin-bottom-left translate-x-4 mb-6 whitespace-nowrap">
                    <span className="text-2xl font-black font-bebas tracking-widest uppercase text-zinc-300 group-hover:text-white transition-colors">
                      {panel.verticalTitle}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    EXPAND →
                  </span>
                </div>
              )}

              {/* ACTIVE PANEL CONTENT: Full Editorial Breakdown & Garment Hotspots */}
              {isActive && (
                <div className="absolute inset-0 flex flex-col justify-between p-8 lg:p-12 z-20">
                  {/* Top Header of Active Panel */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                    className="flex items-center justify-between pointer-events-auto"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">
                        LOOK 0{idx + 1}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-xs font-mono tracking-widest text-zinc-300 uppercase">
                        {panel.kicker}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono tracking-widest text-white px-2.5 py-1 bg-black/80 border border-white/20">
                      240 GSM COMBED COTTON
                    </div>
                  </motion.div>

                  {/* Garment Technical Hotspots */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="relative w-full h-full pointer-events-auto">
                      {panel.hotspots.map((hs, hIdx) => (
                        <HotspotMarker key={hIdx} hotspot={hs} />
                      ))}
                    </div>
                  </div>

                  {/* Bottom Information, Specs & Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="space-y-4 max-w-2xl pointer-events-auto"
                  >
                    <div className="space-y-1">
                      <h2 className="text-4xl lg:text-6xl font-black font-bebas text-white uppercase tracking-tight leading-none">
                        {panel.title}
                      </h2>
                      <p className="text-xs font-mono text-zinc-400 tracking-wider">
                        {panel.tagline}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 flex flex-wrap items-center gap-4">
                      <Button
                        asChild
                        size="lg"
                        className="rounded-none h-13 px-8 text-xs font-mono font-bold tracking-widest bg-white text-black hover:bg-zinc-200 transition-colors shadow-2xl group"
                      >
                        <Link href={panel.href} className="flex items-center gap-2">
                          SHOP THIS DROP
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>

                      <div className="h-13 px-5 flex items-center bg-black/85 border border-white/25 text-white font-mono font-black text-sm">
                        ₹{panel.price}
                      </div>

                      <Link
                        href="/products"
                        className="text-xs font-mono font-bold text-zinc-400 hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors pl-2"
                      >
                        <span>VIEW COMPLETE COLLECTION</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Lookbook Control Strip with Animated Progress Line */}
      <div className="w-full border-t border-white/10 bg-black px-6 lg:px-12 py-4">
        <div className="container mx-auto grid grid-cols-3 gap-6">
          {panels.map((p, idx) => {
            const isCurrent = activeIndex === idx;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setIsAutoPlaying(false);
                  setActiveIndex(idx);
                }}
                className="text-left group focus:outline-none"
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                  <span
                    className={
                      isCurrent
                        ? 'text-white font-bold'
                        : 'text-zinc-500 group-hover:text-zinc-300 transition-colors'
                    }
                  >
                    LOOK {p.index} &nbsp; {p.verticalTitle}
                  </span>
                  <span className="text-[10px] text-zinc-600 font-mono">
                    ₹{p.price}
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="h-[2px] w-full bg-white/10 overflow-hidden relative">
                  {isCurrent && (
                    <motion.div
                      key={`prog-${idx}-${isAutoPlaying}`}
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{
                        duration: isAutoPlaying ? 7.0 : 0.35,
                        ease: isAutoPlaying ? 'linear' : 'easeOut',
                      }}
                      className="h-full bg-white"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
