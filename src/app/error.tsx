'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Client Exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6 bg-zinc-900/80 border border-zinc-800 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center mx-auto text-2xl font-bold font-mono">
          !
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight font-sans">Something Went Wrong</h2>
          <p className="text-sm text-zinc-400">
            We encountered a temporary client-side error loading this page. Please try refreshing or returning home.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 bg-white text-black font-bold text-sm rounded-full hover:bg-zinc-200 transition-colors shadow-lg"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-zinc-800 text-white font-semibold text-sm rounded-full hover:bg-zinc-700 transition-colors border border-zinc-700 inline-block"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
