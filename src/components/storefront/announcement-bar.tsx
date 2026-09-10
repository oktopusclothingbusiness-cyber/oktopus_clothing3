'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const MESSAGES = [
  { text: 'DROP 04 IS LIVE', cta: 'SHOP NOW', href: '/collections/drop-04' },
  { text: 'FREE SHIPPING ON ORDERS ABOVE ₹999', cta: 'EXPLORE', href: '/collections/all' },
  { text: 'EXTRA 10% OFF ON PREPAID ORDERS', cta: 'CLAIM', href: '/collections/all' },
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = MESSAGES[index];

  return (
    <aside aria-label="Store announcement" className="w-full bg-[#0A0A0A] border-b border-[#222222] text-[#E5E5E5] text-[11px] md:text-xs font-semibold tracking-wider uppercase py-2 px-4 select-none z-50 relative">
      <div className="max-w-[1440px] mx-auto flex items-center justify-center text-center">
        <Link
          href={current.href}
          className="inline-flex items-center gap-2 hover:text-[#0F824B] transition-colors duration-200 group"
        >
          <span>{current.text}</span>
          <span className="inline-flex items-center gap-1 font-bold text-[#0F824B] underline-offset-4 group-hover:underline">
            {current.cta}
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </aside>
  );
}
