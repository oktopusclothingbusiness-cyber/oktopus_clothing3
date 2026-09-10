'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePromotion } from '@/context/promotion-context';

export type HeroSlide = {
  id: string;
  desktopImage: string;
  mobileImage: string;
  href: string;
  alt: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
};

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-01',
    desktopImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2000&auto=format&fit=crop',
    mobileImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
    href: '/products',
    alt: 'OKTOPUS Drop 04 - Heavyweight Streetwear Foundation',
    title: 'DROP 04 // UNUSUAL FOUNDATION',
    subtitle: '240 GSM HEAVYWEIGHT SILHOUETTES',
    ctaText: 'SHOP THE DROP',
  },
  {
    id: 'slide-02',
    desktopImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop',
    mobileImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    href: '/custom-design',
    alt: 'OKTOPUS Custom Design Studio',
    title: 'CUSTOM GRAPHIC STUDIO',
    subtitle: 'EXPRESS YOUR SIGNAL // LIMITED PRINTS',
    ctaText: 'ENTER STUDIO',
  },
  {
    id: 'slide-03',
    desktopImage: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=2000&auto=format&fit=crop',
    mobileImage: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000&auto=format&fit=crop',
    href: '/collections',
    alt: 'OKTOPUS Heavyweight Uniform 2026 Collection',
    title: 'HEAVYWEIGHT UNIFORM \'26',
    subtitle: 'CRAFTED FOR IDENTITY // BUILT DIFFERENT',
    ctaText: 'EXPLORE ALL',
  },
];

export function HeroSection() {
  const { promotions } = usePromotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Merge database hero promotions if available, otherwise use exact default campaign slides
  const slides = React.useMemo<HeroSlide[]>(() => {
    if (!promotions || promotions.length === 0) return DEFAULT_HERO_SLIDES;
    const heroPromos = promotions.filter(
      (p) => p.isActive && (p.placement === 'home_hero' || p.placement === 'store_hero' || p.placement === 'home_page')
    );
    if (heroPromos.length === 0) return DEFAULT_HERO_SLIDES;

    return heroPromos.slice(0, 3).map((promo, idx) => ({
      id: promo.id || `db-slide-${idx}`,
      desktopImage: promo.imageUrl || DEFAULT_HERO_SLIDES[idx % 3].desktopImage,
      mobileImage: promo.imageUrl || DEFAULT_HERO_SLIDES[idx % 3].mobileImage,
      href: promo.ctaLink || '/products',
      alt: promo.title || 'OKTOPUS Streetwear Campaign',
      title: promo.title || DEFAULT_HERO_SLIDES[idx % 3].title,
      subtitle: promo.description || DEFAULT_HERO_SLIDES[idx % 3].subtitle,
      ctaText: promo.ctaText || 'SHOP NOW',
    }));
  }, [promotions]);

  const slideCount = slides.length;

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  // Autoplay 5000ms with pause on hover
  useEffect(() => {
    if (isPaused || slideCount <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, slideCount, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;

    // Horizontal swipe threshold
    if (Math.abs(deltaX) > 40 && Math.abs(deltaY) < 40) {
      if (deltaX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <section
      ref={containerRef}
      className="hero-carousel relative w-full bg-[#0A0A0A] overflow-hidden select-none border-b border-[#1A1A1A]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Campaign Hero Banner Carousel"
    >
      {/* Aspect Ratio Viewport - Shallow Panoramic Banner (16:7 desktop / 4:5 mobile) */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[16/9] md:aspect-[16/7] lg:aspect-[2.4/1] max-h-[740px]">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={slide.id}
              className={`hero-slide absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
              aria-hidden={!isActive}
            >
              <Link href={slide.href} className="block w-full h-full relative group cursor-pointer" tabIndex={isActive ? 0 : -1}>
                {/* Responsive <picture> rendering */}
                <picture className="w-full h-full block">
                  <source media="(min-width: 768px)" srcSet={slide.desktopImage} />
                  <img
                    src={slide.mobileImage || slide.desktopImage}
                    alt={slide.alt}
                    // Priority load for 1st image above fold
                    {...(index === 0 ? ({ fetchPriority: 'high', loading: 'eager' } as any) : { loading: 'lazy' })}
                    className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.015]"
                  />
                </picture>

                {/* 45% Left / 55% Right Asymmetrical Visual Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/85 via-[#0A0A0A]/40 to-transparent flex items-center">
                  <div className="max-w-[1440px] w-full mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-12">
                    <div className="col-span-12 sm:col-span-10 md:col-span-7 lg:col-span-6 space-y-2 md:space-y-4 text-left">
                      {/* LEVEL 1: Small supporting campaign text */}
                      {slide.subtitle && (
                        <span className="inline-block text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#0F824B] uppercase">
                          // {slide.subtitle}
                        </span>
                      )}

                      {/* LEVEL 2: Large expressive display message */}
                      {slide.title && (
                        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bebas font-black uppercase tracking-tight text-white leading-[0.93] drop-shadow-md">
                          {slide.title}
                        </h1>
                      )}

                      {/* LEVEL 3: Compact CTA */}
                      {slide.ctaText && (
                        <div className="pt-2 md:pt-4">
                          <span className="inline-flex items-center gap-2 px-5 py-2.5 md:px-7 md:py-3 bg-[#0F824B] text-white hover:bg-white hover:text-black transition-all duration-200 text-xs font-mono font-bold uppercase tracking-wider rounded-xs shadow-md border border-[#0F824B]">
                            <span>{slide.ctaText}</span>
                            <span className="text-xs">→</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Underrated Carousel Controls: Slide Counter (01 / 03) & Outer Arrows */}
      <div className="hero-controls absolute bottom-4 right-6 md:bottom-6 md:right-12 z-20 flex items-center gap-4 text-white font-mono text-xs">
        {/* Page Counter */}
        <div className="bg-[#0A0A0A]/80 backdrop-blur-md px-3 py-1.5 border border-[#292929] rounded-xs font-mono text-[11px] font-bold text-zinc-300">
          <span className="text-[#0F824B]">0{activeIndex + 1}</span> / 0{slideCount}
        </div>

        {/* Outer Navigation Arrows */}
        <div className="flex items-center gap-1">
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="p-2 bg-[#0A0A0A]/80 hover:bg-[#0F824B] hover:text-white text-white backdrop-blur-md border border-[#292929] rounded-xs transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="p-2 bg-[#0A0A0A]/80 hover:bg-[#0F824B] hover:text-white text-white backdrop-blur-md border border-[#292929] rounded-xs transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

