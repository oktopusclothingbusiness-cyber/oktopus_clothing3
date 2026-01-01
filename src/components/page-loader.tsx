
'use client';

import { usePageTransition } from '@/context/page-transition-context';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export const PageLoader = ({ faviconUrl }: { faviconUrl: string }) => {
  const { isTransitioning } = usePageTransition();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    // Only show the loader if the transition is taking a noticeable amount of time
    if (isTransitioning) {
        setShowLoader(true);
    } else {
        // Use a timeout to prevent the loader from flickering away on fast transitions
        const timer = setTimeout(() => {
            setShowLoader(false);
        }, 300);
        return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300',
        showLoader ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="animate-pulse">
        {faviconUrl && (
            <Image
            src={faviconUrl}
            alt="Loading..."
            width={80}
            height={80}
            className="h-20 w-20"
            priority
            />
        )}
      </div>
    </div>
  );
};
