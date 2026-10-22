'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, ExternalLink } from 'lucide-react';
import { Poster } from '@/context/poster-context';

export function StorefrontPosterPopup() {
  const pathname = usePathname();
  const router = useRouter();

  const [activeQueue, setActiveQueue] = useState<Poster[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Skip rendering popup in admin interfaces
  const isAdminRoute = useMemo(() => {
    return pathname.startsWith('/admin') || pathname.startsWith('/mobile-admin');
  }, [pathname]);

  // Load active posters for the current page
  useEffect(() => {
    if (isAdminRoute) {
      setIsOpen(false);
      setActiveQueue([]);
      return;
    }

    let isMounted = true;

    const loadPosters = async () => {
      try {
        const res = await fetch(`/api/posters?activeOnly=true&page=${encodeURIComponent(pathname)}`);
        if (!res.ok) return;
        const data: Poster[] = await res.json();

        if (isMounted && Array.isArray(data) && data.length > 0) {
          setActiveQueue(data);
          setCurrentIndex(0);
          setIsOpen(true);
        } else if (isMounted) {
          setIsOpen(false);
          setActiveQueue([]);
        }
      } catch (err) {
        console.error('Failed to load storefront posters:', err);
      }
    };

    loadPosters();

    return () => {
      isMounted = false;
    };
  }, [pathname, isAdminRoute]);

  const currentPoster = activeQueue[currentIndex];

  // Auto-advance or close timer when displayDurationSeconds is set
  useEffect(() => {
    if (!isOpen || !currentPoster) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const durationSec = currentPoster.displayDurationSeconds;
    if (!durationSec || durationSec <= 0) {
      setSecondsRemaining(null);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setSecondsRemaining(durationSec);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (isPaused) return;

      setSecondsRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          // Timer finished: advance to next poster or close
          advanceQueue();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, currentIndex, currentPoster, isPaused]);

  // Advance to next poster in queue, or close if queue is finished
  const advanceQueue = useCallback(() => {
    if (currentIndex + 1 < activeQueue.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsOpen(false);
      setActiveQueue([]);
    }
  }, [currentIndex, activeQueue.length]);

  // User clicked top-right X button
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    advanceQueue();
  };

  // User clicked poster body -> redirect
  const handlePosterClick = () => {
    if (!currentPoster) return;

    if (currentPoster.redirectPath && currentPoster.redirectPath.trim() !== '') {
      const target = currentPoster.redirectPath.trim();
      setIsOpen(false);
      setActiveQueue([]);

      if (target.startsWith('http://') || target.startsWith('https://')) {
        window.open(target, '_blank');
      } else {
        router.push(target);
      }
    } else {
      advanceQueue();
    }
  };

  if (isAdminRoute || !isOpen || !currentPoster) {
    return null;
  }

  const totalPosters = activeQueue.length;
  const currentStep = currentIndex + 1;
  const progressPercent =
    currentPoster.displayDurationSeconds && secondsRemaining !== null
      ? ((currentPoster.displayDurationSeconds - secondsRemaining) /
          currentPoster.displayDurationSeconds) *
        100
      : 0;

  const desktopImage = currentPoster.desktopImageUrl || currentPoster.mobileImageUrl;
  const mobileImage = currentPoster.mobileImageUrl || currentPoster.desktopImageUrl;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 transition-all duration-300 animate-in fade-in"
      onClick={handleClose}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="relative max-h-[90vh] flex flex-col items-center justify-center select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* POSTER CARD CONTAINER */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 bg-zinc-950 group">
          
          {/* TOP RIGHT CLOSE BUTTON ON THE POSTER */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[100] p-2 sm:p-2.5 rounded-full bg-black/75 hover:bg-black text-white hover:text-white backdrop-blur-md border border-white/30 shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none cursor-pointer"
            aria-label="Close poster"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* QUEUE INDICATOR BADGE (WHEN 2+ POSTERS ARE ACTIVE) */}
          {totalPosters > 1 && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-[90] flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Poster {currentStep} of {totalPosters}</span>
            </div>
          )}

          {/* SECONDS COUNTDOWN BADGE */}
          {secondsRemaining !== null && secondsRemaining > 0 && (
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-[90] px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono shadow">
              {secondsRemaining}s
            </div>
          )}

          {/* CLICKABLE POSTER WRAPPER */}
          <div
            onClick={handlePosterClick}
            className={`relative flex items-center justify-center ${
              currentPoster.redirectPath ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            {/* MOBILE VIEW IMAGE (< 768px) */}
            <div className="block md:hidden relative w-[88vw] max-w-[420px] h-[68vh] max-h-[600px] bg-black">
              <Image
                src={mobileImage}
                alt={currentPoster.title}
                fill
                priority
                unoptimized
                sizes="(max-width: 768px) 90vw, 420px"
                className="object-contain transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </div>

            {/* DESKTOP VIEW IMAGE (>= 768px) */}
            <div className="hidden md:block relative w-[70vw] max-w-[580px] lg:max-w-[700px] h-[72vh] max-h-[700px] bg-black">
              <Image
                src={desktopImage}
                alt={currentPoster.title}
                fill
                priority
                unoptimized
                sizes="(min-width: 768px) 700px, 90vw"
                className="object-contain transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </div>

            {/* DEDICATED REDIRECT HOVER / CALL TO ACTION OVERLAY */}
            {currentPoster.redirectPath && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 sm:p-5 flex items-center justify-between text-white pointer-events-none">
                <div className="min-w-0 pr-3">
                  <h4 className="font-bold text-sm sm:text-base drop-shadow truncate">
                    {currentPoster.title}
                  </h4>
                  {currentPoster.description && (
                    <p className="text-xs text-white/80 truncate mt-0.5">
                      {currentPoster.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs sm:text-sm shrink-0 shadow-lg">
                  <span>Explore Now</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            )}
          </div>

          {/* PROGRESS TIMER BAR (DURING AUTO-ADVANCE) */}
          {currentPoster.displayDurationSeconds > 0 && secondsRemaining !== null && (
            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-[90] overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* BOTTOM QUEUE DOTS (IF MULTIPLE POSTERS) */}
        {totalPosters > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3 z-[100]">
            {activeQueue.map((p, idx) => (
              <button
                key={p.id || idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-7 bg-amber-400 shadow-md'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to poster ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
