
'use client';

import { usePageTransition } from '@/context/page-transition-context';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export const PageLoader = ({ faviconUrl }: { faviconUrl: string }) => {
  const { isTransitioning } = usePageTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300',
        isTransitioning ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="animate-pulse">
        <Image
          src={faviconUrl}
          alt="Loading..."
          width={80}
          height={80}
          className="h-20 w-20"
          priority
        />
      </div>
    </div>
  );
};
