'use client';

import * as React from 'react';

export function DoomCursor() {
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isClicking, setIsClicking] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);

  // Position state with trailing spring physics for outer ring
  const [trailPos, setTrailPos] = React.useState<{ x: number; y: number } | null>(null);
  const posRef = React.useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const trailRef = React.useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const animFrameRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check desktop screen width (768px+)
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);

    const onMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      setPos({ x: e.clientX, y: e.clientY });

      // Check if hovering interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = Boolean(
          target.closest('a, button, input, textarea, select, [role="button"], .cursor-pointer')
        );
        setIsHovered(interactive);
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => {
      setPos(null);
      setTrailPos(null);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);

    // Smooth animation loop for the trailing reticle ring
    const updateTrail = () => {
      // Linear interpolation (lerp) for smooth trailing reticle
      const targetX = posRef.current.x;
      const targetY = posRef.current.y;
      trailRef.current.x += (targetX - trailRef.current.x) * 0.22;
      trailRef.current.y += (targetY - trailRef.current.y) * 0.22;

      setTrailPos({ x: trailRef.current.x, y: trailRef.current.y });
      animFrameRef.current = requestAnimationFrame(updateTrail);
    };

    animFrameRef.current = requestAnimationFrame(updateTrail);

    return () => {
      window.removeEventListener('resize', checkIsDesktop);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Only render on desktop when position is known
  if (!isDesktop || !pos) return null;

  const currentTrail = trailPos || pos;

  return (
    <div className="hidden md:block fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none">
      {/* 1. Trailing Latverian Crosshair Reticle Ring */}
      <div
        style={{
          transform: `translate3d(${currentTrail.x}px, ${currentTrail.y}px, 0) translate(-50%, -50%) scale(${
            isClicking ? 0.75 : isHovered ? 1.45 : 1
          }) rotate(${isHovered ? 45 : 0}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
        className="absolute top-0 left-0 flex items-center justify-center will-change-transform pointer-events-none"
      >
        <div
          className={`relative flex items-center justify-center rounded-full transition-all duration-200 ${
            isHovered
              ? 'w-10 h-10 border border-[#C1B188] bg-[#394F3F]/25 shadow-[0_0_16px_rgba(193,177,136,0.4)]'
              : 'w-7 h-7 border border-[#8E815A]/75 bg-transparent'
          }`}
        >
          {/* 4 Latverian Crosshair Corner Indicators */}
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-[#C1B188] pointer-events-none" />
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-[#C1B188] pointer-events-none" />
          <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-0.5 bg-[#C1B188] pointer-events-none" />
          <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-0.5 bg-[#C1B188] pointer-events-none" />

          {/* Micro Latverian Diamond Rune on Hover */}
          {isHovered && (
            <div className="w-2.5 h-2.5 rotate-45 border border-[#C1B188] bg-[#C1B188]/30" />
          )}
        </div>
      </div>

      {/* 2. Direct-Tracking Precision Center Dot (0 lag) */}
      <div
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`,
        }}
        className="absolute top-0 left-0 w-2 h-2 rounded-full bg-[#C1B188] shadow-[0_0_8px_#C1B188] will-change-transform pointer-events-none"
      />
    </div>
  );
}
