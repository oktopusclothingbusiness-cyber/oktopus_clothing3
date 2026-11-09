'use client';

import * as React from 'react';
import { Truck, ShieldCheck, RefreshCw, Check } from 'lucide-react';
import { DOOM_CAMPAIGN_CONFIG } from '@/lib/doom-campaign-config';
import { DoomRunicText, DoomCornerReticles, DoomCornerBrackets } from './doom-runes';

export function DoomOutro() {
  const [email, setEmail] = React.useState('');
  const [isSubscribed, setIsSubscribed] = React.useState(false);

  const scrollToGrid = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById('collection-grid');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
    }
  };

  return (
    <section className="relative py-16 sm:py-24 bg-transparent px-4 overflow-hidden">
      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-7">
        <div className="space-y-3">
          <div className="flex justify-center opacity-80">
            <DoomRunicText text="DOOM" size={18} runeColor="#8E815A" />
          </div>

          {/* Heading: THE CROWN IS FORGED. */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bebas tracking-wide text-[#F2F1DD] uppercase">
            {DOOM_CAMPAIGN_CONFIG.headlines.outro}
          </h2>

          <p className="text-sm sm:text-base font-serif italic text-[#C1B188] max-w-md mx-auto">
            &ldquo;{DOOM_CAMPAIGN_CONFIG.philosophy.legacy}&rdquo;
          </p>

          <p className="text-xs sm:text-sm text-[#A1AAA3] font-sans">
            {DOOM_CAMPAIGN_CONFIG.punchlines.noThrone} {DOOM_CAMPAIGN_CONFIG.punchlines.makeEmpire}
          </p>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={scrollToGrid}
            className="group relative px-8 py-3 rounded-lg bg-[#1B231C] hover:bg-[#2D382D] active:bg-[#141A15] text-[#F2F1DD] text-xs sm:text-sm font-semibold tracking-widest uppercase border border-[#8E815A] hover:border-[#C1B188] shadow-lg transition-all duration-300"
          >
            <DoomCornerBrackets color="#8E815A" size={6} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            <span>View Collection</span>
          </button>
        </div>

        {/* Early Notification Form */}
        <div className="pt-2 max-w-md mx-auto">
          {isSubscribed ? (
            <div className="p-3 rounded-lg bg-[#161E17] border border-[#8E815A] text-xs font-mono text-[#C1B188] flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-[#8E815A]" />
              <span>You will receive release updates.</span>
            </div>
          ) : (
            <form onSubmit={handleNotifySubmit} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Enter email for drop notifications"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-10 px-3.5 rounded-lg bg-[#0E130F] border border-[#494333] text-xs text-[#F2F1DD] placeholder-[#7B8F7C] focus:outline-none focus:border-[#C1B188]"
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-lg bg-[#1B231C] hover:bg-[#2D382D] text-[#C1B188] hover:text-[#F2F1DD] text-xs font-mono font-semibold uppercase tracking-wider border border-[#8E815A] hover:border-[#C1B188] transition-colors whitespace-nowrap"
              >
                Notify Me
              </button>
            </form>
          )}
        </div>

        {/* Trust Points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-[#2D382D]/80">
          <div className="relative flex items-center justify-center gap-2 p-2.5 rounded-lg bg-[#0E130F]/40 border border-[#494333]/40">
            <DoomCornerReticles color="#8E815A" className="text-[8px] opacity-35" />
            <Truck className="w-4 h-4 text-[#8E815A] shrink-0" />
            <span className="text-[11px] font-mono tracking-wider text-[#A1AAA3] uppercase">
              Express Shipping
            </span>
          </div>

          <div className="relative flex items-center justify-center gap-2 p-2.5 rounded-lg bg-[#0E130F]/40 border border-[#494333]/40">
            <DoomCornerReticles color="#8E815A" className="text-[8px] opacity-35" />
            <ShieldCheck className="w-4 h-4 text-[#8E815A] shrink-0" />
            <span className="text-[11px] font-mono tracking-wider text-[#A1AAA3] uppercase">
              Authentic OKTOPUS
            </span>
          </div>

          <div className="relative flex items-center justify-center gap-2 p-2.5 rounded-lg bg-[#0E130F]/40 border border-[#494333]/40">
            <DoomCornerReticles color="#8E815A" className="text-[8px] opacity-35" />
            <RefreshCw className="w-4 h-4 text-[#8E815A] shrink-0" />
            <span className="text-[11px] font-mono tracking-wider text-[#A1AAA3] uppercase">
              7-Day Size Exchange
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
