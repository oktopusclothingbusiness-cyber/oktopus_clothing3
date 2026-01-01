
'use client';

import { usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode, useTransition, useCallback } from 'react';

type PageTransitionContextType = {
  isTransitioning: boolean;
  startTransition: (callback: () => void) => void;
  transitionColor: string;
};

const PageTransitionContext = createContext<PageTransitionContextType | undefined>(undefined);

export const PageTransitionProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionColor, setTransitionColor] = useState('hsl(var(--background))');

  useEffect(() => {
    // This effect runs after a navigation completes.
    // We can end our transition here.
    const timer = setTimeout(() => setIsTransitioning(false), 200); // Small delay to let content render

    return () => clearTimeout(timer);
  }, [pathname]);
  
  const startTransition = useCallback((callback: () => void) => {
      setIsTransitioning(true);

      const root = document.documentElement;
      const newTheme = root.getAttribute('data-theme') === 'pink' ? 'slateBlue' : 'pink';
      
      let newBgHsl;

      if(newTheme === 'pink') {
          // Temporarily get the HSL from CSS variables for pink theme
          newBgHsl = getComputedStyle(root).getPropertyValue('--primary').trim();
      } else {
          // Use a fixed color for the default theme transition
          newBgHsl = 'hsl(240 10% 3.9%)';
      }

      setTransitionColor(newBgHsl);

      setTimeout(() => {
          callback(); // This will trigger the state update in the products page (gender, theme)
      }, 300); // Wait for the "fill" animation to start

      setTimeout(() => {
          setIsTransitioning(false);
      }, 800); // Duration of the animation
  }, []);

  return (
    <PageTransitionContext.Provider value={{ isTransitioning, startTransition, transitionColor }}>
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
