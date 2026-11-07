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

  // Expose global product view tracker for components
  React.useEffect(() => {
    window.__oktoTrackProductView = async (product) => {
      try {
        const vid = getOrCreatePersistentVisitorId();
        const fpid = cachedFingerprintRef.current?.fingerprintId;

        await fetch('/api/fingerprint/track-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorId: vid,
            fingerprintId: fpid,
            product,
          }),
        });
      } catch {
        // fail silently
      }
    };

    return () => {
      delete window.__oktoTrackProductView;
    };
  }, []);

  return null;
}

export function VisitorTracker() {
  return (
    <React.Suspense fallback={null}>
      <VisitorTrackerContent />
    </React.Suspense>
  );
}

