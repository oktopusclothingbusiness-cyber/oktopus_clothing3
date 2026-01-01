
'use client';

import { usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode, useTransition, useCallback } from 'react';

type PageTransitionContextType = {
  isTransitioning: boolean;
  startTransition: (callback: () => void) => void;
};

const PageTransitionContext = createContext<PageTransitionContextType | undefined>(undefined);

export const PageTransitionProvider = ({ children }: { children: ReactNode }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pending, startReactTransition] = useTransition();

  const startTransition = useCallback((callback: () => void) => {
    setIsTransitioning(true);
    startReactTransition(() => {
        callback();
    });
    // The animation is now handled by Framer Motion's AnimatePresence on the layout wrapper
    setTimeout(() => {
        setIsTransitioning(false);
    }, 600); // Should match the exit animation duration
  }, []);

  return (
    <PageTransitionContext.Provider value={{ isTransitioning, startTransition }}>
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
