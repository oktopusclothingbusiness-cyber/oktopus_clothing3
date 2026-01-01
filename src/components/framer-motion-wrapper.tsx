
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePageTransition } from '@/context/page-transition-context';

export const FramerMotionWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isTransitioning, transitionColor } = usePageTransition();

  return (
    <>
      <AnimatePresence mode="wait">
        {isTransitioning && (
          <motion.div
            style={{ backgroundColor: transitionColor }}
            className="fixed top-0 left-0 right-0 h-screen z-[101]"
            initial={{ scaleY: 0, originY: 0 }}
            animate={{ scaleY: 1, originY: 0 }}
            exit={{ scaleY: 0, originY: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>
      {children}
    </>
  );
};
