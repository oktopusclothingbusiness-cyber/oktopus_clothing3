'use client';

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }
    setSubmitted(true);
    toast({
      title: 'Joined the Species',
      description: 'You are now registered for early drop access and secret restocks.',
    });
  };

  return (
    <section className="w-full bg-[#0E0E0E] py-20 md:py-28 text-center text-[#FAF9F6] relative overflow-hidden">
      <div className="max-w-[800px] mx-auto px-6 space-y-6">
        <span className="text-xs font-mono font-bold tracking-[0.3em] text-[#0F824B] uppercase block">
          // EARLY ACCESS SIGNALS
        </span>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight uppercase text-white leading-none">
          JOIN THE SPECIES.
        </h2>

        <p className="text-xs sm:text-sm font-mono text-[#8B8B86] max-w-md mx-auto uppercase tracking-wider leading-relaxed">
          GET FIRST ACCESS TO NUMBERED DROPS, VAULT RESTOCKS, AND EXPERIMENTAL SILHOUETTES BEFORE PUBLIC RELEASE.
        </p>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-4"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ENTER YOUR EMAIL ADDRESS"
              className="w-full px-5 py-3.5 bg-[#141414] border border-[#292929] focus:border-[#0F824B] text-xs font-mono tracking-wider uppercase text-[#FAF9F6] placeholder:text-[#555555] rounded-sm outline-none transition-colors"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#0F824B] hover:bg-[#FFFFFF] text-[#0A0A0A] font-mono font-extrabold text-xs uppercase tracking-widest rounded-sm transition-all duration-200 flex items-center justify-center gap-2 group shadow-xl flex-shrink-0"
            >
              <span>JOIN</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        ) : (
          <div className="inline-flex items-center gap-3 py-3 px-6 bg-[#141414] border border-[#0F824B] rounded-sm text-xs font-mono text-[#0F824B]">
            <CheckCircle2 className="w-4 h-4" />
            <span>YOU ARE REGISTERED. WATCH YOUR INBOX BEFORE DROP 05.</span>
          </div>
        )}
      </div>
    </section>
  );
}
