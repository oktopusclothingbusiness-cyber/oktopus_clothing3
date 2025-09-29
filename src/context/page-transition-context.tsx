
'use client';

import { usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode, useTransition } from 'react';

type PageTransitionContextType = {
  isTransitioning: boolean;
};

const PageTransitionContext = createContext<PageTransitionContextType | undefined>(undefined);

export const PageTransitionProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // When the pathname changes, we start the transition.
    // We add a small delay to allow the new page to start rendering
    // and avoid flickering on very fast page loads.
    const timer = setTimeout(() => setIsTransitioning(false), 500);
    
    // On the initial load or when returning, there's no transition
    setIsTransitioning(false);

    return () => clearTimeout(timer);
  }, [pathname]);
  
  // This effect is to catch the *start* of the transition, which is harder.
  // We can listen to link clicks, but that won't cover all navigation.
  // A simpler approach for this app is to just have a short "out" animation
  // when the component unmounts. For a full solution, we might need to wrap next/link.
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.href && anchor.target !== '_blank' && anchor.href.startsWith(window.location.origin) && anchor.href !== window.location.href) {
         setIsTransitioning(true);
      }
    };
    
    document.addEventListener('click', handleAnchorClick);
    
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);
  
  return (
    <PageTransitionContext.Provider value={{ isTransitioning }}>
      {children}
    </PageTransitionContext.Provider>
  );
};

export const usePageTransition = () => {
  const context = useContext(PageTransitionContext);
  if (context === undefined) {
    throw new Error('usePageTransition must be used within a PageTransitionProvider');
  }
  return context;
};
