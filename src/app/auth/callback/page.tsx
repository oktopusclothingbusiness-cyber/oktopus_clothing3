'use client';

import { useEffect, useState } from 'react';

export default function AuthCallbackPage() {
  const [redirecting, setRedirecting] = useState(true);
  const [fallbackUrl, setFallbackUrl] = useState('');

  useEffect(() => {
    // 1. Capture hash (#access_token=...) and search query (?code=...) from Google
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const targetDeepLink = `oktopusclothing://auth/callback${hash}${search}`;
    setFallbackUrl(targetDeepLink);

    // 2. Immediately forward back into the mobile app
    try {
      window.location.replace(targetDeepLink);
    } catch {
      window.location.href = targetDeepLink;
    }

    // 3. Fallback timer if browser does not auto-close
    const timer = setTimeout(() => {
      setRedirecting(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: '800',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}
        >
          OKTOPUS CLOTHING
        </h2>
        <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '24px' }}>
          {redirecting ? 'Connecting to Oktopus App...' : 'If the app did not open automatically, tap below:'}
        </p>
        {!redirecting && fallbackUrl && (
          <a
            href={fallbackUrl}
            style={{
              display: 'inline-block',
              backgroundColor: '#FFFFFF',
              color: '#000000',
              fontWeight: '700',
              fontSize: '13px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              padding: '12px 24px',
              borderRadius: '9999px',
              textDecoration: 'none',
            }}
          >
            Open Oktopus App
          </a>
        )}
      </div>
    </div>
  );
}
