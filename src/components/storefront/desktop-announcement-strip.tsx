'use client';

import * as React from 'react';
import Link from 'next/link';

export function DesktopAnnouncementStrip() {
  const announcements = [
    {
      tag: 'COMPLIMENTARY SHIPPING',
      text: 'Free Express Delivery on orders above ₹999 across India',
    },
    {
      tag: 'WELCOME OFFER',
      text: 'Use code FIRST10 for 10% off on your first drop',
    },
    {
      tag: 'FABRIC SPECIFICATION',
      text: 'Heavyweight 240 GSM combed cotton • Pre-shrunk architectural cut',
    },
  ];

  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  return (
    <div className="w-full bg-black text-zinc-300 border-b border-white/10 text-xs py-2.5 px-6 select-none relative z-40 overflow-hidden">
      <div className="container mx-auto flex items-center justify-between">
        {/* Center rotating promo message */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-[11px] font-mono tracking-wide">
            <span className="text-[10px] uppercase text-zinc-500 font-bold border-r border-white/15 pr-3">
              {announcements[currentIndex].tag}
            </span>
            <span className="text-zinc-200">{announcements[currentIndex].text}</span>
          </div>
        </div>

        {/* Right utility links */}
        <div className="hidden lg:flex items-center gap-4 text-[11px] font-mono text-zinc-400">
          <Link href="/track-order" className="hover:text-white transition-colors">
            TRACK ORDER
          </Link>
          <span className="text-zinc-700">•</span>
          <Link href="/about" className="hover:text-white transition-colors">
            OUR CRAFT
          </Link>
        </div>
      </div>
    </div>
  );
}

