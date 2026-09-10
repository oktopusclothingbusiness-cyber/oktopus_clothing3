'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check } from 'lucide-react';
import { StorefrontProduct } from '@/types/storefront';

interface FeaturedProductSectionProps {
  product: StorefrontProduct;
}

export function FeaturedProductSection({ product }: FeaturedProductSectionProps) {
  return (
    <section className="w-full bg-[#0A0A0A] border-b border-[#222222] py-16 md:py-24 text-[#FAF9F6]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left: Large Editorial Image */}
          <div className="lg:col-span-7">
            <Link
              href={`/products/${product.id}`}
              className="relative block aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/3] w-full overflow-hidden rounded-sm border border-[#222222] group"
            >
              <Image
                src={product.images[0] || 'https://m.media-amazon.com/images/X/bxt1/M/Ebxt1BRRIJUjrNQ.jpg'}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                <span className="text-[10px] font-mono font-bold tracking-widest px-3 py-1 bg-[#0A0A0A]/90 backdrop-blur-md text-[#0F824B] border border-[#292929] rounded-xs uppercase">
                  FEATURED SILHOUETTE
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Editorial Product Details */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#8B8B86] uppercase">
                {product.badge || 'DROP 04'} // LEAD ITEM
              </span>
              <h3 className="text-2xl sm:text-4xl font-display font-black tracking-tight uppercase text-white leading-tight">
                {product.name}
              </h3>
              <p className="text-xs font-mono text-[#8B8B86] uppercase tracking-wider">
                {product.subtitle || '240 GSM COMBED COTTON // DROP SHOULDER FIT'}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 font-mono">
              <span className="text-2xl sm:text-3xl font-bold text-[#FAF9F6]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-[#8B8B86] line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <p className="text-xs font-mono text-[#8B8B86] leading-relaxed uppercase">
              {product.description}
            </p>

            {/* Specifications Summary */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#222222] font-mono text-xs">
              <div>
                <span className="text-[#8B8B86] block text-[10px]">FABRIC</span>
                <span className="font-bold text-[#FAF9F6]">{product.fabric || '100% Cotton'}</span>
              </div>
              <div>
                <span className="text-[#8B8B86] block text-[10px]">WEIGHT</span>
                <span className="font-bold text-[#FAF9F6]">{product.gsm || 240} GSM</span>
              </div>
              <div>
                <span className="text-[#8B8B86] block text-[10px]">SILHOUETTE</span>
                <span className="font-bold text-[#FAF9F6]">Engineered Oversized</span>
              </div>
              <div>
                <span className="text-[#8B8B86] block text-[10px]">FINISH</span>
                <span className="font-bold text-[#FAF9F6]">{product.finish || 'Bio Washed'}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <Link
                href={`/products/${product.id}`}
                className="inline-flex items-center justify-center gap-3 bg-[#0F824B] hover:bg-white text-[#0A0A0A] font-mono font-extrabold text-xs uppercase tracking-widest py-3.5 px-8 rounded-sm transition-all duration-200 shadow-xl group"
              >
                <span>VIEW PRODUCT</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
