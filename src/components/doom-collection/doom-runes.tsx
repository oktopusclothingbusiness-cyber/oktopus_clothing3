'use client';

import * as React from 'react';

interface RuneProps {
  className?: string;
  size?: number | string;
  color?: string;
}

/**
 * Individual Latverian Runes directly mapped from the Doomscript Cipher
 */
export const LATVERIAN_RUNES: Record<
  string,
  { label: string; name: string; render: (props: RuneProps) => React.JSX.Element }
> = {
  A: {
    label: 'A / soft O',
    name: 'A',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M7 4H14V11H10V18H17" stroke={color} strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
        <line x1="7" y1="4" x2="7" y2="7" stroke={color} strokeWidth="2.5" />
        <line x1="17" y1="15" x2="17" y2="18" stroke={color} strokeWidth="2.5" />
      </svg>
    ),
  },
  C: {
    label: 'C (soft)',
    name: 'C',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <polygon points="12,3 21,12 12,21 3,12" stroke={color} strokeWidth="2.5" strokeLinejoin="miter" />
      </svg>
    ),
  },
  K: {
    label: 'C hard · K · Q',
    name: 'K',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <line x1="5" y1="5" x2="19" y2="19" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="19" y1="5" x2="5" y2="19" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
      </svg>
    ),
  },
  Q: {
    label: 'Q',
    name: 'Q',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <line x1="5" y1="5" x2="19" y2="19" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="19" y1="5" x2="5" y2="19" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
      </svg>
    ),
  },
  D: {
    label: 'D',
    name: 'D',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        {/* Horizontal Hourglass / Bowtie */}
        <polygon points="3,4 12,12 3,20" stroke={color} strokeWidth="2.5" strokeLinejoin="miter" />
        <polygon points="21,4 12,12 21,20" stroke={color} strokeWidth="2.5" strokeLinejoin="miter" />
      </svg>
    ),
  },
  E: {
    label: 'E',
    name: 'E',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <line x1="8" y1="4" x2="8" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <path d="M8 4H16L12 11" stroke={color} strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    ),
  },
  I: {
    label: 'I / EE',
    name: 'I',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <line x1="9" y1="4" x2="9" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="9" y1="11" x2="17" y2="11" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="17" y1="11" x2="17" y2="15" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
      </svg>
    ),
  },
  F: {
    label: 'F',
    name: 'F',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.2" />
        <line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2.2" strokeLinecap="square" />
        <line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2.2" strokeLinecap="square" />
      </svg>
    ),
  },
  V: {
    label: 'V / FF',
    name: 'V',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <line x1="5" y1="4" x2="5" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="19" y1="4" x2="19" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <path d="M5 4L12 12L19 4" stroke={color} strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    ),
  },
  G: {
    label: 'G',
    name: 'G',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M16 6L7 11V18L16 21" stroke={color} strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
        <line x1="7" y1="14" x2="14" y2="14" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
      </svg>
    ),
  },
  H: {
    label: 'H',
    name: 'H',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <line x1="6" y1="4" x2="18" y2="11" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="18" y1="4" x2="6" y2="11" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="6" y1="13" x2="18" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="18" y1="13" x2="6" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
      </svg>
    ),
  },
  J: {
    label: 'J',
    name: 'J',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <line x1="12" y1="4" x2="12" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="5" y1="5" x2="12" y2="11" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="19" y1="5" x2="12" y2="11" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
      </svg>
    ),
  },
  L: {
    label: 'L',
    name: 'L',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 4L6 20M12 4L18 20" stroke={color} strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
        <line x1="9" y1="12" x2="15" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="12" y1="4" x2="12" y2="20" stroke={color} strokeWidth="2" strokeDasharray="2 2" />
      </svg>
    ),
  },
  M: {
    label: 'M',
    name: 'M',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M4 20L4 4L12 11L20 4L20 20" stroke={color} strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
        <line x1="12" y1="11" x2="12" y2="20" stroke={color} strokeWidth="2" />
      </svg>
    ),
  },
  N: {
    label: 'N',
    name: 'N',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <line x1="6" y1="4" x2="6" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="18" y1="4" x2="18" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="6" y1="8" x2="18" y2="16" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="18" y1="8" x2="6" y2="16" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
      </svg>
    ),
  },
  O: {
    label: 'O / OU',
    name: 'O',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 4L12 16L16 20" stroke={color} strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
        <line x1="10" y1="4" x2="14" y2="4" stroke={color} strokeWidth="2.5" />
      </svg>
    ),
  },
  P: {
    label: 'P',
    name: 'P',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <line x1="17" y1="4" x2="17" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="7" y1="5" x2="17" y2="5" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="9" y1="12" x2="17" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="7" y1="19" x2="17" y2="19" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
      </svg>
    ),
  },
  R: {
    label: 'R',
    name: 'R',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M8 4L8 12L16 12M16 4L16 20" stroke={color} strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
        <line x1="6" y1="4" x2="10" y2="4" stroke={color} strokeWidth="2.5" />
      </svg>
    ),
  },
  S: {
    label: 'S',
    name: 'S',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M17 5L7 9V15L17 19" stroke={color} strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
        <line x1="7" y1="5" x2="17" y2="5" stroke={color} strokeWidth="2.5" />
        <line x1="7" y1="19" x2="17" y2="19" stroke={color} strokeWidth="2.5" />
      </svg>
    ),
  },
  T: {
    label: 'T',
    name: 'T',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <line x1="6" y1="4" x2="18" y2="4" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <line x1="12" y1="4" x2="12" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
        <polygon points="12,12 16,16 12,20 8,16" stroke={color} strokeWidth="2" strokeLinejoin="miter" />
      </svg>
    ),
  },
  U: {
    label: 'U',
    name: 'U',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M7 6L16 12L7 18" stroke={color} strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    ),
  },
  MYSTERY_1: {
    label: 'MYSTERY RUNE 1',
    name: 'M1',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 4L18 10L12 16L6 10Z M12 16L6 21 M12 16L18 21" stroke={color} strokeWidth="2.2" strokeLinejoin="miter" />
      </svg>
    ),
  },
  MYSTERY_2: {
    label: 'MYSTERY RUNE 2',
    name: 'M2',
    render: ({ className = '', size = 24, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <polygon points="17,6 7,12 17,18" stroke={color} strokeWidth="2.5" strokeLinejoin="miter" />
      </svg>
    ),
  },
};

/**
 * Render a single Latverian rune by letter
 */
export function DoomRune({
  char,
  size = 24,
  className = '',
  color = '#4B5E4A',
}: {
  char: string;
  size?: number | string;
  className?: string;
  color?: string;
}) {
  const upper = (char || '').toUpperCase();
  const rune = LATVERIAN_RUNES[upper];
  if (!rune) {
    return <span className={`inline-block font-mono ${className}`}>{char}</span>;
  }
  return rune.render({ size, className, color });
}

/**
 * Render an English text string into official Latverian Doomscript Runes
 */
export function DoomRunicText({
  text,
  size = 20,
  className = '',
  runeColor = '#4B5E4A',
  showLatin = false,
}: {
  text: string;
  size?: number | string;
  className?: string;
  runeColor?: string;
  showLatin?: boolean;
}) {
  const letters = text.toUpperCase().split('');

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {letters.map((char, index) => {
        if (char === ' ') {
          return <span key={index} className="w-2.5 sm:w-3" />;
        }
        const hasRune = Boolean(LATVERIAN_RUNES[char]);
        return (
          <div key={index} className="flex flex-col items-center group/rune" title={`${char}`}>
            {hasRune ? (
              <DoomRune char={char} size={size} color={runeColor} className="transition-transform group-hover/rune:scale-110" />
            ) : (
              <span className="font-mono text-xs text-[#7B8F7C]">{char}</span>
            )}
            {showLatin && (
              <span className="text-[8px] font-mono text-[#7B8F7C] opacity-60 group-hover/rune:opacity-100 mt-0.5">
                {char}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Interactive Cipher Strip: Elegant horizontal Latverian Rune divider
 */
export function DoomRuneDivider({
  className = '',
  runeColor = '#8E815A',
}: {
  className?: string;
  runeColor?: string;
}) {
  const sampleRunes = ['D', 'O', 'O', 'M', 'MYSTERY_1', 'R', 'U', 'N', 'E', 'S'];

  return (
    <div className={`w-full py-4 flex items-center justify-center gap-3 sm:gap-6 opacity-70 overflow-hidden ${className}`}>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#8E815A]/40 to-transparent" />
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {sampleRunes.map((key, i) => {
          const rune = LATVERIAN_RUNES[key];
          if (!rune) return null;
          return <span key={i}>{rune.render({ size: 16, color: runeColor })}</span>;
        })}
      </div>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#8E815A]/40 to-transparent" />
    </div>
  );
}

/**
 * Technical Corner Reticles: '+' marks at 4 corners of a relative container
 */
export function DoomCornerReticles({
  color = '#8E815A',
  className = '',
}: {
  color?: string;
  className?: string;
}) {
  return (
    <>
      <span
        aria-hidden="true"
        className={`absolute top-2 left-2 text-xs font-mono select-none pointer-events-none opacity-60 leading-none ${className}`}
        style={{ color }}
      >
        +
      </span>
      <span
        aria-hidden="true"
        className={`absolute top-2 right-2 text-xs font-mono select-none pointer-events-none opacity-60 leading-none ${className}`}
        style={{ color }}
      >
        +
      </span>
      <span
        aria-hidden="true"
        className={`absolute bottom-2 left-2 text-xs font-mono select-none pointer-events-none opacity-60 leading-none ${className}`}
        style={{ color }}
      >
        +
      </span>
      <span
        aria-hidden="true"
        className={`absolute bottom-2 right-2 text-xs font-mono select-none pointer-events-none opacity-60 leading-none ${className}`}
        style={{ color }}
      >
        +
      </span>
    </>
  );
}

/**
 * Technical Corner Brackets: L-shaped corners for architectural framing
 */
export function DoomCornerBrackets({
  color = '#8E815A',
  size = 10,
  className = '',
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <>
      <div
        aria-hidden="true"
        className={`absolute top-0 left-0 pointer-events-none opacity-70 ${className}`}
        style={{
          width: size,
          height: size,
          borderTop: `1px solid ${color}`,
          borderLeft: `1px solid ${color}`,
        }}
      />
      <div
        aria-hidden="true"
        className={`absolute top-0 right-0 pointer-events-none opacity-70 ${className}`}
        style={{
          width: size,
          height: size,
          borderTop: `1px solid ${color}`,
          borderRight: `1px solid ${color}`,
        }}
      />
      <div
        aria-hidden="true"
        className={`absolute bottom-0 left-0 pointer-events-none opacity-70 ${className}`}
        style={{
          width: size,
          height: size,
          borderBottom: `1px solid ${color}`,
          borderLeft: `1px solid ${color}`,
        }}
      />
      <div
        aria-hidden="true"
        className={`absolute bottom-0 right-0 pointer-events-none opacity-70 ${className}`}
        style={{
          width: size,
          height: size,
          borderBottom: `1px solid ${color}`,
          borderRight: `1px solid ${color}`,
        }}
      />
    </>
  );
}

/**
 * Minimal Latverian Cipher Ribbon: Stream of runes decoded from the Latverian alphabet
 */
export function DoomCipherRibbon({
  className = '',
  runeColor = '#8E815A',
}: {
  className?: string;
  runeColor?: string;
}) {
  const cipherRunes = [
    { key: 'A', name: 'A' },
    { key: 'C', name: 'C' },
    { key: 'D', name: 'D' },
    { key: 'E', name: 'E' },
    { key: 'I', name: 'I' },
    { key: 'L', name: 'L' },
    { key: 'M', name: 'M' },
    { key: 'O', name: 'O' },
    { key: 'R', name: 'R' },
    { key: 'S', name: 'S' },
    { key: 'V', name: 'V' },
  ];

  return (
    <div className={`w-full py-2 overflow-x-auto scrollbar-none select-none flex items-center justify-center gap-4 sm:gap-6 opacity-65 ${className}`}>
      {cipherRunes.map((item, i) => {
        const rune = LATVERIAN_RUNES[item.key];
        if (!rune) return null;
        return (
          <div key={i} className="flex items-center gap-1.5 shrink-0 group">
            {rune.render({ size: 14, color: runeColor, className: 'transition-transform group-hover:scale-110' })}
            <span className="text-[9px] font-mono text-[#7B8F7C] tracking-wider group-hover:text-[#C1B188] transition-colors">
              {item.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

