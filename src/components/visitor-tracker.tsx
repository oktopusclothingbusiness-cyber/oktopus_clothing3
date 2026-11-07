'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { collectVisitorFingerprint, getOrCreatePersistentVisitorId, VisitorFingerprintData } from '@/lib/fingerprint';

declare global {
  interface Window {
    __oktoTrackProductView?: (product: {
      productId: string;
      title: string;
      slug?: string;
      price?: number;
      imageUrl?: string;
      category?: string;
    }) => Promise<void>;
    __oktoCaptureGpsLocation?: () => void;
  }
}

function useSafeAuth() {
  try {
    return useAuth();
  } catch {
    return { user: null };
  }
}

function VisitorTrackerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auth = useSafeAuth();
  const user = auth?.user || null;

  const lastLoggedPathRef = React.useRef<string | null>(null);
  const isLoggingRef = React.useRef<boolean>(false);
  const cachedFingerprintRef = React.useRef<VisitorFingerprintData | null>(null);
  const hasPromptedGeoRef = React.useRef<boolean>(false);

  // Prompt user for high-precision GPS geolocation and stream to server
  const requestPinpointGeo = React.useCallback(() => {
    if (hasPromptedGeoRef.current) return;
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return;

    hasPromptedGeoRef.current = true;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const vid = getOrCreatePersistentVisitorId();
          const fpid = cachedFingerprintRef.current?.fingerprintId;
          const hwid = cachedFingerprintRef.current?.hardwareFingerprint;

          await fetch('/api/fingerprint/geo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              visitorId: vid,
              fingerprintId: fpid,
              hardwareFingerprint: hwid,
              coords: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracyMeters: pos.coords.accuracy,
              },
            }),
          });
        } catch {
          // silently handle error
        }
      },
      () => {
        // User denied, closed prompt, or position unavailable
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  // Send page view & visitor fingerprint
  const logVisitorActivity = React.useCallback(async (fullPath: string) => {
    if (isLoggingRef.current) return;
    isLoggingRef.current = true;

    try {
      // Collect or reuse cached fingerprint
      let fp = cachedFingerprintRef.current;
      if (!fp) {
        fp = await collectVisitorFingerprint();
        cachedFingerprintRef.current = fp;
      }

      const payload = {
        fingerprint: fp,
        page: {
          path: fullPath,
          title: typeof document !== 'undefined' ? document.title : '',
          referrer: typeof document !== 'undefined' ? document.referrer : '',
        },
        user: user
          ? {
              id: user.id || (user as any)._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            }
          : null,
      };

      await fetch('/api/fingerprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      lastLoggedPathRef.current = fullPath;
    } catch (err) {
      // Silently fail without impacting visitor experience
    } finally {
      isLoggingRef.current = false;
    }
  }, [user]);

  // Track on route change
  React.useEffect(() => {
    // Avoid tracking internal admin paths as customer visitors
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/mobile-admin')) {
      return;
    }

    const searchStr = searchParams?.toString();
    const fullPath = searchStr ? `${pathname}?${searchStr}` : pathname;

    if (fullPath !== lastLoggedPathRef.current) {
      logVisitorActivity(fullPath);
    }
  }, [pathname, searchParams, logVisitorActivity]);

  // Expose global product view tracker and user-initiated GPS tracker
  React.useEffect(() => {
    window.__oktoTrackProductView = async (product) => {
      try {
        const vid = getOrCreatePersistentVisitorId();
        const fpid = cachedFingerprintRef.current?.fingerprintId;
        const hwid = cachedFingerprintRef.current?.hardwareFingerprint;

        await fetch('/api/fingerprint/track-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorId: vid,
            fingerprintId: fpid,
            hardwareFingerprint: hwid,
            product,
          }),
        });
      } catch {
        // fail silently
      }
    };

    window.__oktoCaptureGpsLocation = () => {
      requestPinpointGeo();
    };

    return () => {
      delete window.__oktoTrackProductView;
      delete window.__oktoCaptureGpsLocation;
    };
  }, [requestPinpointGeo]);

  return null;
}

export function VisitorTracker() {
  return (
    <React.Suspense fallback={null}>
      <VisitorTrackerContent />
    </React.Suspense>
  );
}

