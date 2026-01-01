'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useThemeManager } from '@/context/theme-provider';
import { useState, useEffect } from 'react';

export const FramerMotionWrapper = ({ children }: { children: React.ReactNode }) => {
  const { accentColor } = useThemeManager();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isMounted ? accentColor.name : 'initial'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
