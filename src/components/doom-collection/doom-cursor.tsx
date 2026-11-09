'use client';

import * as React from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function DoomCursor() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isClicking, setIsClicking] = React.useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Buttery-smooth spring physics for the trailing reticle
  const springConfig = { damping: 28, stiffness: 350, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  React.useEffect(() => {
    // Only activate for desktop fine-pointer devices
    if (typeof window === 'undefined') return;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      if (!isVisible) setIsVisible(true);

      // Check if hovering an interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = Boolean(
          target.closest('a, button, input, textarea, select, [role="button"], .cursor-pointer')
        );
        setIsHovered(interactive);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="hidden md:block fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none">
      {/* 1. Trailing Latverian Crosshair Reticle Ring */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicking ? 0.8 : isHovered ? 1.4 : 1,
          rotate: isHovered ? 45 : 0,
        }}
        transition={{
          scale: { duration: 0.18, ease: 'easeOut' },
          rotate: { duration: 0.25, ease: 'easeOut' },
        }}
        className="absolute top-0 left-0 flex items-center justify-center will-change-transform"
      >
        <div
          className={`relative flex items-center justify-center rounded-full transition-all duration-200 ${
            isHovered
              ? 'w-10 h-10 border border-[#C1B188] bg-[#394F3F]/15 shadow-[0_0_15px_rgba(193,177,136,0.35)]'
              : 'w-7 h-7 border border-[#8E815A]/60 bg-transparent'
          }`}
        >
          {/* 4 Latverian Crosshair Corner Reticles */}
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-[#C1B188]/80 pointer-events-none" />
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-[#C1B188]/80 pointer-events-none" />
          <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-0.5 bg-[#C1B188]/80 pointer-events-none" />
          <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-0.5 bg-[#C1B188]/80 pointer-events-none" />

          {/* Micro Latverian Diamond Rune on Hover */}
          {isHovered && (
            <div className="w-2 h-2 rotate-45 border border-[#C1B188] opacity-75" />
          )}
        </div>
      </motion.div>

      {/* 2. Direct-Tracking Precision Center Dot (0 lag) */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        className="absolute top-0 left-0 w-2 h-2 rounded-full bg-[#C1B188] shadow-[0_0_8px_#C1B188] will-change-transform"
      />
    </div>
  );
}

