'use client';

import { useEffect, useState } from 'react';

export default function AuthCallbackPage() {
  const [redirecting, setRedirecting] = useState(true);
  const [deepLinkUrl, setDeepLinkUrl] = useState('');

  useEffect(() => {
    // 1. Capture hash (#access_token=...) and search query (?code=...)
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const searchParams = new URLSearchParams(search);

    // If a custom return URL was passed via state or return_url (e.g., from Expo Go)
    const customReturnUrl = searchParams.get('state') || searchParams.get('return_url');
    let target = 'oktopusclothing://auth/callback';

    if (customReturnUrl && (customReturnUrl.startsWith('oktopusclothing://') || customReturnUrl.startsWith('exp://'))) {
      target = customReturnUrl;
    }

    const fullDeepLink = `${target}${target.includes('?') ? '&' : '?'}${hash.replace(/^#/, '')}${search.replace(/^\?/, '')}`;
    const cleanDeepLink = target.includes('?') || target.includes('#')
      ? `${target}${hash}${search}`
      : `${target}${hash}${search}`;

    const finalTarget = cleanDeepLink.startsWith('oktopusclothing://') || cleanDeepLink.startsWith('exp://')
      ? cleanDeepLink
      : `oktopusclothing://auth/callback${hash}${search}`;

    setDeepLinkUrl(finalTarget);

    // 2. Trigger redirect
    try {
      window.location.replace(finalTarget);
    } catch {
      window.location.href = finalTarget;
    }

    // 3. Fallback timer if browser does not close automatically
    const timer = setTimeout(() => {
      setRedirecting(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleManualOpen = () => {
    if (deepLinkUrl) {
      window.location.href = deepLinkUrl;
    }
  };

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
      <div style={{ maxWidth: '420px', width: '100%' }}>
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

        {deepLinkUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <a
              href={deepLinkUrl}
              onClick={handleManualOpen}
              style={{
                display: 'inline-block',
                backgroundColor: '#FFFFFF',
                color: '#000000',
                fontWeight: '700',
                fontSize: '13px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                padding: '14px 28px',
                borderRadius: '9999px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
              }}
            >
              Open Oktopus App
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
