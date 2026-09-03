'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error Boundary Caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md space-y-6 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
          <h2 className="text-2xl font-bold">Application Error</h2>
          <p className="text-sm text-zinc-400">
            A critical error occurred while loading the application.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-white text-black font-bold text-sm rounded-full hover:bg-zinc-200 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
