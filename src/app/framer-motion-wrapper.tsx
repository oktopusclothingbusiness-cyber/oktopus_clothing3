
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useThemeManager } from '@/context/theme-provider';

export const FramerMotionWrapper = ({ children }: { children: React.ReactNode }) => {
  const { accentColor } = useThemeManager();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={accentColor.name}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
