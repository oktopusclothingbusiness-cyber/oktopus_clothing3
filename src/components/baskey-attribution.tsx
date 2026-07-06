import React from 'react';
import { cn } from '@/lib/utils';

interface BaskeyAttributionProps {
  className?: string;
  text?: string;
}

export default function BaskeyAttribution({ className, text = "A Unit of BASKEY Studio" }: BaskeyAttributionProps) {
  return (
    <a
      href="https://github.com/iam-rbaskey"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="BASKEY Studio Parent Company"
      className={cn(
        "font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60 hover:text-muted-foreground transition-all duration-300 cursor-pointer select-none",
        className
      )}
    >
      {text}
    </a>
  );
}
