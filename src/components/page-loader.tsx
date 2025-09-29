
'use client';

import { usePageTransition } from '@/context/page-transition-context';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export const PageLoader = () => {
  const { isTransitioning } = usePageTransition();

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300',
        isTransitioning ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="animate-pulse-slow">
        <Image
          src="https://i.ibb.co/bFv3cvY/okto-loader-logo.png"
          alt="Loading..."
          width={80}
          height={80}
          className="h-20 w-20"
        />
      </div>
    </div>
  );
};
