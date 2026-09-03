'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { RecaptchaVerifier, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Smartphone, ArrowRight, CheckCircle2 } from "lucide-react";

interface PhoneOtpFormProps {
  mode?: 'login' | 'signup';
  firstName?: string;
  lastName?: string;
}

export function PhoneOtpForm({ mode = 'login', firstName = '', lastName = '' }: PhoneOtpFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const { signInWithPhoneOtp, confirmPhoneOtp } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  const getOrCreateRecaptchaVerifier = () => {
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {
        // ignore
      }
      (window as any).recaptchaVerifier = null;
    }

    if (!auth) {
      throw new Error('Firebase Auth instance is not available.');
    }

    const containerEl = document.getElementById('recaptcha-container');
    if (!containerEl) {
      throw new Error('reCAPTCHA container element not found in DOM.');
    }

    const verifier = new RecaptchaVerifier(auth, containerEl, {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        toast({ title: "reCAPTCHA Expired", description: "Please try sending OTP again.", variant: "destructive" });
      },
    });

    (window as any).recaptchaVerifier = verifier;
    return verifier;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number with country code (e.g. +91 9999999999).",
        variant: "destructive",
      });
      return;
    }

    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+91${formattedPhone}`; // Default to India (+91) if prefix missing
    }

    setLoading(true);
    try {
      const verifier = getOrCreateRecaptchaVerifier();
      await verifier.render();
      const result = await signInWithPhoneOtp(formattedPhone, verifier);
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (err: any) {
      console.error("Send OTP error:", err);
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {}
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6 || !confirmationResult) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await confirmPhoneOtp(confirmationResult, otpCode.trim(), firstName, lastName);
    } catch (err: any) {
      console.error("Verify OTP error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Hidden container required by Firebase reCAPTCHA */}
      <div id="recaptcha-container"></div>

      {!otpSent ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Phone Number</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="+91 98765 43210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-9"
                disabled={loading}
              />
            </div>
            <p className="text-[0.75rem] text-muted-foreground">
              Enter phone number with country code (e.g., +91 for India).
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending Code..." : "Send OTP"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none">Enter 6-Digit OTP</label>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-xs text-primary underline"
              >
                Change Number
              </button>
            </div>
            <Input
              type="text"
              placeholder="123456"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="text-center tracking-widest text-lg font-mono"
              disabled={loading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-center">
              Sent to <span className="font-semibold">{phoneNumber}</span>
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP & Continue"}
            {!loading && <CheckCircle2 className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      )}
    </div>
  );
}
