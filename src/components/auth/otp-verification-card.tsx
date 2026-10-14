'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, AlertCircle, RotateCcw, Pencil, Sparkles, Coins, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OtpVerificationCardProps {
  email: string;
  purpose: 'signup' | 'login';
  onVerify: (otp: string) => Promise<{ success: boolean; message?: string }>;
  onResend: () => Promise<void>;
  onChangeEmail: () => void;
  cooldownSeconds: number;
}

// Generate celebratory confetti particle descriptors
const CONFETTI_PARTICLES = Array.from({ length: 28 }).map((_, i) => {
  const angle = (i / 28) * 360;
  const distance = 80 + Math.random() * 80;
  const rad = (angle * Math.PI) / 180;
  return {
    id: i,
    x: Math.cos(rad) * distance,
    y: Math.sin(rad) * distance - 20,
    size: 4 + Math.random() * 6,
    color: ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#10B981'][i % 6],
    rotation: Math.random() * 360,
    delay: Math.random() * 0.15,
  };
});

export function OtpVerificationCard({
  email,
  purpose,
  onVerify,
  onResend,
  onChangeEmail,
  cooldownSeconds,
}: OtpVerificationCardProps) {
  // 6 individual digit values
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Animation States: 'idle' | 'verifying' | 'error' | 'success'
  const [status, setStatus] = useState<'idle' | 'verifying' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isResending, setIsResending] = useState(false);

  // Focus the first input on initial mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle single digit typing & auto-advance
  const handleDigitChange = (index: number, val: string) => {
    // If multiple characters pasted (e.g. full 6 digits)
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length > 1) {
      handlePastedCode(cleaned);
      return;
    }

    const char = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMessage('');
    if (status === 'error') setStatus('idle');

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveIdx(index + 1);
    }

    // If 6th digit entered, auto-verify
    if (char && index === 5) {
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        triggerVerification(fullCode);
      }
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setActiveIdx(index - 1);
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
      setErrorMessage('');
      if (status === 'error') setStatus('idle');
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIdx(index - 1);
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveIdx(index + 1);
    }
  };

  // Handle code paste
  const handlePastedCode = (pasted: string) => {
    const chars = pasted.replace(/\D/g, '').slice(0, 6).split('');
    if (chars.length === 0) return;

    const newDigits = ['', '', '', '', '', ''];
    chars.forEach((c, i) => {
      newDigits[i] = c;
    });
    setDigits(newDigits);
    setErrorMessage('');
    if (status === 'error') setStatus('idle');

    const nextIndex = Math.min(chars.length, 5);
    inputRefs.current[nextIndex]?.focus();
    setActiveIdx(nextIndex);

    if (chars.length === 6) {
      triggerVerification(newDigits.join(''));
    }
  };

  // Trigger verification flow with animations
  const triggerVerification = async (codeToVerify?: string) => {
    const code = codeToVerify || digits.join('');
    if (code.length !== 6 || status === 'verifying') return;

    setStatus('verifying');
    setErrorMessage('');

    try {
      const result = await onVerify(code);
      if (result.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(result.message || 'Incorrect verification code. Please check and try again.');
        // Select all / reset focus to allow fast retry
        setTimeout(() => {
          inputRefs.current[0]?.focus();
          setActiveIdx(0);
        }, 400);
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message || 'Verification failed. Please check your connection.');
    }
  };

  const handleResendClick = async () => {
    if (cooldownSeconds > 0 || isResending) return;
    try {
      setIsResending(true);
      await onResend();
      setDigits(['', '', '', '', '', '']);
      setStatus('idle');
      setErrorMessage('');
      inputRefs.current[0]?.focus();
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative overflow-hidden w-full transition-all">
      <AnimatePresence mode="wait">
        {/* ========================================================= */}
        {/* SUCCESS STATE: Toss-Style Celebration & Coin Drop         */}
        {/* ========================================================= */}
        {status === 'success' ? (
          <motion.div
            key="success-view"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="py-6 px-2 flex flex-col items-center text-center relative"
          >
            {/* Ambient Background Flare */}
            <div className="absolute inset-0 -top-8 bg-gradient-to-b from-emerald-500/20 via-transparent to-transparent pointer-events-none rounded-2xl" />

            {/* CONFETTI BURST PARTICLES */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none">
              {CONFETTI_PARTICLES.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                  animate={{
                    x: p.x,
                    y: p.y,
                    scale: [0, 1.2, 0.8],
                    opacity: [1, 1, 0],
                    rotate: p.rotation,
                  }}
                  transition={{
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                    delay: p.delay,
                  }}
                  style={{
                    position: 'absolute',
                    width: p.size,
                    height: p.size,
                    borderRadius: p.size > 7 ? '50%' : '2px',
                    backgroundColor: p.color,
                  }}
                />
              ))}
            </div>

            {/* EXPANDING RADAR SUCCESS RINGS */}
            <div className="relative w-24 h-24 flex items-center justify-center mb-5">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.8, 1.8], opacity: [0.8, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border-2 border-emerald-500/60"
              />
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.8, 1.4], opacity: [0.6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                className="absolute inset-0 rounded-full bg-emerald-500/20"
              />

              {/* Central Bouncing Spring Checkmark */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: [0, 1.25, 0.95, 1], rotate: 0 }}
                transition={{ type: 'spring', damping: 14, stiffness: 300, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.5)] z-10"
              >
                <CheckCircle2 className="w-10 h-10 text-white stroke-[2.5]" />
              </motion.div>
            </div>

            {/* TITLE & DESCRIPTION */}
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-2xl font-bold tracking-tight text-foreground"
            >
              Verification Complete!
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed"
            >
              Your email <span className="font-semibold text-foreground">{email}</span> has been securely authenticated.
            </motion.p>

            {/* 100 OKTOCOINS WELCOME REWARD BANNER */}
            {purpose === 'signup' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 16, stiffness: 280, delay: 0.45 }}
                className="mt-5 p-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-primary/10 to-amber-500/15 border border-amber-500/30 flex items-center gap-3 shadow-lg"
              >
                <motion.div
                  animate={{ rotateY: [0, 180, 360] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)] shrink-0"
                >
                  <Coins className="w-5 h-5 text-black stroke-[2.5]" />
                </motion.div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black tracking-wider uppercase text-amber-400">
                      +100 OktoCoins Unlocked
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Credited to your exclusive streetwear reward wallet.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Seamless Redirect Progress Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="w-full mt-6 space-y-2"
            >
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Entering OKTOPUS Collection...</span>
                <span className="font-mono text-primary">Redirecting</span>
              </div>
              <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.6 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* ========================================================= */
          /* DEFAULT / INPUT / VERIFYING / ERROR CARD                 */
          /* ========================================================= */
          <motion.div
            key="input-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Header info */}
            <div className="text-center space-y-2">
              {/* Radar pulse during verifying */}
              <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                {status === 'verifying' && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-full border border-primary/50"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut', delay: 0.25 }}
                      className="absolute inset-0 rounded-full bg-primary/20"
                    />
                  </>
                )}
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300',
                    status === 'error'
                      ? 'bg-destructive/10 text-destructive border border-destructive/30 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                      : status === 'verifying'
                      ? 'bg-primary/20 text-primary border border-primary shadow-[0_0_20px_rgba(var(--primary),0.35)]'
                      : 'bg-primary/10 text-primary border border-primary/20'
                  )}
                >
                  {status === 'error' ? (
                    <AlertCircle className="w-6 h-6 animate-pulse" />
                  ) : status === 'verifying' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Lock className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <ShieldCheck className="w-6 h-6" />
                  )}
                </div>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Enter Verification Code
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                We sent a 6-digit code to{' '}
                <span className="font-semibold text-foreground break-all">{email}</span>
              </p>
              <button
                type="button"
                onClick={onChangeEmail}
                disabled={status === 'verifying'}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium transition-opacity disabled:opacity-50"
              >
                <Pencil className="w-3 h-3" /> Edit Email Address
              </button>
            </div>

            {/* 6-DIGIT SEGMENTED PIN TILES WITH TOSS SPRING SHAKE */}
            <motion.div
              animate={
                status === 'error'
                  ? {
                      x: [-16, 16, -12, 12, -8, 8, -4, 4, 0],
                      transition: { duration: 0.5, ease: 'easeInOut' },
                    }
                  : { x: 0 }
              }
              className="flex justify-center items-center gap-2 sm:gap-3"
            >
              {digits.map((digit, idx) => {
                const isActive = activeIdx === idx;
                const isFilled = Boolean(digit);
                const hasError = status === 'error';

                return (
                  <motion.div
                    key={idx}
                    animate={
                      isFilled
                        ? { scale: [1, 1.12, 1] }
                        : isActive
                        ? { scale: 1.05 }
                        : { scale: 1 }
                    }
                    transition={{ type: 'spring', damping: 15, stiffness: 350 }}
                    className={cn(
                      'relative w-11 h-14 sm:w-12 sm:h-16 rounded-xl border-2 flex items-center justify-center transition-all duration-200 bg-background/60 shadow-sm cursor-text overflow-hidden',
                      hasError
                        ? 'border-destructive bg-destructive/5 text-destructive shadow-[0_0_14px_rgba(239,68,68,0.3)]'
                        : isActive
                        ? 'border-primary ring-2 ring-primary/30 shadow-[0_0_16px_rgba(var(--primary),0.25)]'
                        : isFilled
                        ? 'border-border text-foreground bg-card'
                        : 'border-border/70 hover:border-border'
                    )}
                    onClick={() => {
                      inputRefs.current[idx]?.focus();
                      setActiveIdx(idx);
                    }}
                  >
                    {/* Active Blinking Cursor Bar when empty */}
                    {isActive && !digit && status !== 'verifying' && (
                      <motion.div
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-0.5 h-6 bg-primary rounded-full absolute"
                      />
                    )}

                    <span className="font-mono text-2xl sm:text-3xl font-extrabold select-none">
                      {digit}
                    </span>

                    {/* Hidden Actual Input */}
                    <input
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      disabled={status === 'verifying'}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onFocus={() => setActiveIdx(idx)}
                      className="absolute inset-0 opacity-0 cursor-text w-full h-full"
                    />
                  </motion.div>
                );
              })}
            </motion.div>

            {/* ERROR BANNER IF WRONG CODE */}
            <AnimatePresence>
              {status === 'error' && errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2.5 justify-center shadow-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-medium text-center">{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* VERIFY BUTTON */}
            <div className="space-y-3">
              <Button
                type="button"
                disabled={digits.join('').length !== 6 || status === 'verifying'}
                onClick={() => triggerVerification()}
                className={cn(
                  'w-full h-12 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2',
                  status === 'verifying' && 'opacity-90'
                )}
              >
                {status === 'verifying' ? (
                  <div className="flex items-center gap-2.5">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                    <span>Authenticating Security Token...</span>
                  </div>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              {/* RESEND COUNTDOWN */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  disabled={cooldownSeconds > 0 || isResending || status === 'verifying'}
                  onClick={handleResendClick}
                  className={cn(
                    'text-xs inline-flex items-center gap-1.5 font-medium transition-colors',
                    cooldownSeconds > 0 || status === 'verifying'
                      ? 'text-muted-foreground/60 cursor-not-allowed'
                      : 'text-primary hover:underline'
                  )}
                >
                  <RotateCcw className={cn('w-3.5 h-3.5', isResending && 'animate-spin')} />
                  {isResending
                    ? 'Sending fresh code...'
                    : cooldownSeconds > 0
                    ? `Resend code in 00:${cooldownSeconds < 10 ? `0${cooldownSeconds}` : cooldownSeconds}`
                    : 'Resend Verification Code'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
