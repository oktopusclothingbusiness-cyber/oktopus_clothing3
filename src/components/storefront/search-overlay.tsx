'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, ArrowRight } from 'lucide-react';
import { useProduct } from '@/context/product-context';
import { SEED_STOREFRONT_PRODUCTS, toStorefrontProduct } from '@/data/storefront-data';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRENDING_KEYWORDS = ['Oversized', 'Graphic', 'Black', 'Drop 04', 'Minimal', 'Hoodie', '240 GSM'];

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const { products: dbProducts } = useProduct();

  const allProducts = useMemo(() => {
    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map(toStorefrontProduct);
    }
    return SEED_STOREFRONT_PRODUCTS;
  }, [dbProducts]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allProducts.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const subMatch = (p.subtitle || '').toLowerCase().includes(q);
      const tagMatch = p.tags.some((t) => t.toLowerCase().includes(q));
      const signalMatch = (p.signal || '').toLowerCase().includes(q);
      return nameMatch || subMatch || tagMatch || signalMatch;
    }).slice(0, 6);
  }, [query, allProducts]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-200">
      <div className="max-w-[1000px] w-full mx-auto px-6 py-8 flex flex-col h-full">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-6 border-b border-[#292929]">
          <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-[#8B8B86]">
            // SEARCH CATALOG
          </span>
          <button
            onClick={onClose}
            aria-label="Close search"
            className="p-2 text-[#FAF9F6] hover:text-[#0F824B] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="py-8">
          <div className="relative flex items-center">
            <Search className="absolute left-0 w-6 h-6 text-[#8B8B86]" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH PRODUCTS, DROPS, SIGNALS..."
              className="w-full bg-transparent pl-10 pr-4 py-3 text-2xl md:text-3xl font-display font-bold uppercase tracking-wider text-[#FAF9F6] placeholder:text-[#444444] border-b border-[#292929] focus:border-[#0F824B] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Trending Searches */}
        {!query && (
          <div className="space-y-4">
            <p className="text-[11px] font-mono tracking-widest text-[#8B8B86] uppercase">
              TRENDING SIGNALS
            </p>
            <div className="flex flex-wrap gap-2">
              {TRENDING_KEYWORDS.map((k) => (
                <button
                  key={k}
                  onClick={() => setQuery(k)}
                  className="px-3.5 py-1.5 text-xs font-mono font-bold uppercase border border-[#292929] hover:border-[#0F824B] hover:text-[#0F824B] text-[#FAF9F6] rounded-sm transition-all"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {query && (
          <div className="flex-1 overflow-y-auto pt-4">
            <p className="text-[11px] font-mono tracking-widest text-[#8B8B86] uppercase mb-4">
              RESULTS ({searchResults.length})
            </p>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 border border-[#1A1A1A] hover:border-[#0F824B] bg-[#111111]/40 rounded-sm group transition-all"
                  >
                    <div className="relative w-16 h-20 bg-[#161616] overflow-hidden rounded-sm flex-shrink-0">
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {p.badge && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-[#0F824B] text-white rounded-xs">
                            {p.badge}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-[#8B8B86]">
                          {p.signal || 'STREETWEAR'}
                        </span>
                      </div>
                      <h4 className="text-sm font-display font-bold uppercase text-[#FAF9F6] group-hover:text-[#0F824B] truncate transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-xs font-mono text-[#FAF9F6] font-semibold mt-1">
                        ₹{p.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8B8B86] group-hover:text-[#0F824B] group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-[#8B8B86] font-mono space-y-2">
                <p className="text-base text-[#FAF9F6] font-display uppercase tracking-wider font-bold">
                  NOTHING FOUND.
                </p>
                <p className="text-xs">TRY ANOTHER KEYWORD, DROP, OR SIGNAL.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
