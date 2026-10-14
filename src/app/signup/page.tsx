'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { MobileHeader } from "@/components/mobile-header";
import { MobileFooter } from "@/components/mobile-footer";
import { useAuth } from "@/context/auth-context";
import {
  AnimatedUserIcon,
  AnimatedMailIcon,
  AnimatedLockIcon,
  AnimatedEyeIcon,
  AnimatedGoogleIcon,
  AnimatedArrowIcon,
} from "@/components/icons/animated-icons";
import { Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OtpVerificationCard } from "@/components/auth/otp-verification-card";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .refine((val) => /[a-zA-Z]/.test(val) && /[0-9]/.test(val), {
      message: "Password must be alphanumeric (contain both letters and numbers).",
    })
    .refine((val) => /[^a-zA-Z0-9]/.test(val), {
      message: "Password must contain at least 1 special character (e.g. !@#$%^&*).",
    }),
});

export default function SignupPage() {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [pendingValues, setPendingValues] = useState<z.infer<typeof formSchema> | null>(null);

  // Cooldown countdown
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const { login, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const currentPassword = form.watch("password") || "";
  const hasMinLength = currentPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(currentPassword);
  const hasNumber = /[0-9]/.test(currentPassword);
  const isAlphanumeric = hasLetter && hasNumber;
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(currentPassword);
  const isPasswordValid = hasMinLength && isAlphanumeric && hasSpecialChar;

  // Step 1: Send OTP to email
  const onFormSubmit = async (values: z.infer<typeof formSchema>) => {
    // Frontend-only password complexity guard
    if (
      values.password.length < 8 ||
      !/[a-zA-Z]/.test(values.password) ||
      !/[0-9]/.test(values.password) ||
      !/[^a-zA-Z0-9]/.test(values.password)
    ) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long, alphanumeric, and contain at least 1 special character.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSendingOtp(true);
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          purpose: 'signup',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPendingValues(values);
        setCooldownSeconds(60);
        setStep('otp');
        toast({
          title: "Verification Code Sent",
          description: `We've sent a 6-digit code to ${values.email}.`,
        });
      } else {
        toast({
          title: "Signup Notice",
          description: data.message || "Could not send verification code.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('Send OTP error:', err);
      toast({
        title: "Error",
        description: "Failed to dispatch verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Handle OTP verification callback
  const handleVerifyOtp = async (code: string) => {
    if (!pendingValues) return { success: false, message: 'Missing user details' };

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingValues.email,
          otp: code,
          purpose: 'signup',
          userData: pendingValues,
        }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        login(data.user);
        // Wait 2.2 seconds for celebratory Toss success animation to play
        setTimeout(() => {
          router.push('/store');
        }, 2200);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Incorrect verification code.' };
      }
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldownSeconds > 0 || !pendingValues) return;
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingValues.email,
          purpose: 'signup',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCooldownSeconds(60);
        toast({
          title: "New Code Sent",
          description: `A fresh 6-digit code was sent to ${pendingValues.email}.`,
        });
      } else {
        toast({
          title: "Notice",
          description: data.message || "Please wait before requesting again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to resend code. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen bg-secondary/30">
        <Header />
        <main className="flex-grow flex items-center justify-center py-16 px-4">
          <Card className="w-full max-w-md shadow-xl border border-border/60 backdrop-blur-sm bg-card/95 rounded-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              {step === 'form' ? (
                <motion.div
                  key="form-step-desktop"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.25 }}
                >
                  <CardHeader className="space-y-1 text-center pt-8 pb-4">
                    <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Enter your details below to verify and create your account
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="grid gap-5 px-8">
                    <Button
                      variant="outline"
                      onClick={signInWithGoogle}
                      className="w-full h-11 rounded-xl font-medium border-border/80 hover:bg-accent/60 transition-all flex items-center justify-center gap-2.5 shadow-sm group"
                    >
                      <AnimatedGoogleIcon className="h-4 w-4" />
                      Sign up with Google
                    </Button>

                    <div className="relative my-1">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/60" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-3 text-muted-foreground font-medium">
                          Or continue with email
                        </span>
                      </div>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-xs font-semibold text-foreground/80">First name</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <div className="absolute left-3 top-3.5 pointer-events-none">
                                      <AnimatedUserIcon className="h-4 w-4" isFocused={focusedField === 'firstName'} />
                                    </div>
                                    <Input
                                      placeholder="Max"
                                      {...field}
                                      onFocus={() => setFocusedField('firstName')}
                                      onBlur={() => setFocusedField(null)}
                                      className="pl-9 h-11 rounded-xl border-border/80 focus-visible:ring-1 focus-visible:ring-primary text-sm"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-xs font-semibold text-foreground/80">Last name</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <div className="absolute left-3 top-3.5 pointer-events-none">
                                      <AnimatedUserIcon className="h-4 w-4" isFocused={focusedField === 'lastName'} />
                                    </div>
                                    <Input
                                      placeholder="Robinson"
                                      {...field}
                                      onFocus={() => setFocusedField('lastName')}
                                      onBlur={() => setFocusedField(null)}
                                      className="pl-9 h-11 rounded-xl border-border/80 focus-visible:ring-1 focus-visible:ring-primary text-sm"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-xs font-semibold text-foreground/80">Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <div className="absolute left-3.5 top-3.5 pointer-events-none">
                                    <AnimatedMailIcon className="h-4 w-4" isFocused={focusedField === 'email'} />
                                  </div>
                                  <Input
                                    placeholder="m@example.com"
                                    {...field}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    className="pl-10 h-11 rounded-xl border-border/80 focus-visible:ring-1 focus-visible:ring-primary"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-xs font-semibold text-foreground/80">Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <div className="absolute left-3.5 top-3.5 pointer-events-none">
                                    <AnimatedLockIcon className="h-4 w-4" isFocused={focusedField === 'password'} />
                                  </div>
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    {...field}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    className="pl-10 pr-10 h-11 rounded-xl border-border/80 focus-visible:ring-1 focus-visible:ring-primary"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <AnimatedEyeIcon isVisible={showPassword} className="h-4 w-4" />
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />

                              {/* Desktop Password Requirements Checklist */}
                              {(focusedField === 'password' || currentPassword.length > 0) && (
                                <motion.div
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="p-3 bg-secondary/50 rounded-xl border border-border/60 space-y-1.5 text-xs mt-2"
                                >
                                  <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    <span>Password Requirements</span>
                                    {isPasswordValid && (
                                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 normal-case text-xs">
                                        <Check className="h-3.5 w-3.5" /> All requirements met
                                      </span>
                                    )}
                                  </div>
                                  <div className="space-y-1 pt-0.5">
                                    <div className={`flex items-center gap-2 transition-colors duration-150 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                                      {hasMinLength ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 mx-1 shrink-0" />}
                                      <span>At least 8 characters long</span>
                                    </div>
                                    <div className={`flex items-center gap-2 transition-colors duration-150 ${isAlphanumeric ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                                      {isAlphanumeric ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 mx-1 shrink-0" />}
                                      <span>Alphanumeric (letters and numbers)</span>
                                    </div>
                                    <div className={`flex items-center gap-2 transition-colors duration-150 ${hasSpecialChar ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                                      {hasSpecialChar ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 mx-1 shrink-0" />}
                                      <span>At least 1 special character (!@#$%^&*...)</span>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </FormItem>
                          )}
                        />

                        <Button
                          className="w-full h-11 rounded-xl font-semibold text-sm shadow-md transition-all mt-2 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                          type="submit"
                          disabled={isSendingOtp || !isPasswordValid}
                        >
                          {isSendingOtp ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Sending Verification Code...</span>
                            </>
                          ) : (
                            <>
                              <span>Verify & Create Account</span>
                              <AnimatedArrowIcon className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>

                  <CardFooter className="pb-8 pt-2">
                    <div className="text-center text-sm w-full text-muted-foreground">
                      Already have an account?{" "}
                      <Link href="/login" className="font-semibold text-primary hover:underline">
                        Login
                      </Link>
                    </div>
                  </CardFooter>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-step-desktop"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                  className="p-8"
                >
                  <OtpVerificationCard
                    email={pendingValues?.email || ''}
                    purpose="signup"
                    onVerify={handleVerifyOtp}
                    onResend={handleResendOtp}
                    onChangeEmail={() => setStep('form')}
                    cooldownSeconds={cooldownSeconds}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </main>
        <Footer />
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex flex-col min-h-screen bg-background">
        <MobileHeader title={step === 'otp' ? "Verify Email" : "Sign Up"} showCart={false} />
        <main className="flex-grow flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full max-w-sm"
          >
            <Card className="w-full shadow-sm border border-border/60 rounded-2xl bg-card overflow-hidden">
              <AnimatePresence mode="wait">
                {step === 'form' ? (
                  <motion.div
                    key="form-step-mobile"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardHeader className="text-center pt-6 pb-2">
                      <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Enter your details to get started.
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-4 pt-2">
                      <motion.div whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          onClick={signInWithGoogle}
                          className="w-full h-11 rounded-xl font-medium border-border/80 flex items-center justify-center gap-2 text-sm"
                        >
                          <AnimatedGoogleIcon className="h-4 w-4" />
                          Sign up with Google
                        </Button>
                      </motion.div>

                      <div className="relative my-1">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border/60" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase">
                          <span className="bg-card px-2 text-muted-foreground font-medium">
                            Or continue with email
                          </span>
                        </div>
                      </div>

                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-3.5">
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormLabel className="text-xs font-medium">First name</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <div className="absolute left-2.5 top-3.5 pointer-events-none">
                                        <AnimatedUserIcon className="h-3.5 w-3.5" isFocused={focusedField === 'm-firstName'} />
                                      </div>
                                      <Input
                                        placeholder="Max"
                                        {...field}
                                        onFocus={() => setFocusedField('m-firstName')}
                                        onBlur={() => setFocusedField(null)}
                                        className="pl-8 h-11 rounded-xl text-sm"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormLabel className="text-xs font-medium">Last name</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <div className="absolute left-2.5 top-3.5 pointer-events-none">
                                        <AnimatedUserIcon className="h-3.5 w-3.5" isFocused={focusedField === 'm-lastName'} />
                                      </div>
                                      <Input
                                        placeholder="Robinson"
                                        {...field}
                                        onFocus={() => setFocusedField('m-lastName')}
                                        onBlur={() => setFocusedField(null)}
                                        className="pl-8 h-11 rounded-xl text-sm"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="text-xs font-medium">Email</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <div className="absolute left-3 top-3.5 pointer-events-none">
                                      <AnimatedMailIcon className="h-4 w-4" isFocused={focusedField === 'm-email'} />
                                    </div>
                                    <Input
                                      placeholder="m@example.com"
                                      {...field}
                                      onFocus={() => setFocusedField('m-email')}
                                      onBlur={() => setFocusedField(null)}
                                      className="pl-9 h-11 rounded-xl text-sm"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="text-xs font-medium">Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <div className="absolute left-3 top-3.5 pointer-events-none">
                                      <AnimatedLockIcon className="h-4 w-4" isFocused={focusedField === 'm-password'} />
                                    </div>
                                    <Input
                                      type={showPassword ? "text" : "password"}
                                      {...field}
                                      onFocus={() => setFocusedField('m-password')}
                                      onBlur={() => setFocusedField(null)}
                                      className="pl-9 pr-10 h-11 rounded-xl text-sm"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowPassword(!showPassword)}
                                      className="absolute right-3 top-3.5 text-muted-foreground"
                                    >
                                      <AnimatedEyeIcon isVisible={showPassword} className="h-4 w-4" />
                                    </button>
                                  </div>
                                </FormControl>
                                <FormMessage />

                                {/* Mobile Password Requirements Checklist */}
                                {(focusedField === 'm-password' || currentPassword.length > 0) && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-2.5 bg-secondary/50 rounded-xl border border-border/60 space-y-1 text-xs mt-1"
                                  >
                                    <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                      <span>Requirements</span>
                                      {isPasswordValid && (
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 normal-case text-[11px]">
                                          <Check className="h-3 w-3" /> All met
                                        </span>
                                      )}
                                    </div>
                                    <div className="space-y-1 pt-0.5 text-[11px]">
                                      <div className={`flex items-center gap-1.5 transition-colors duration-150 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                                        {hasMinLength ? <Check className="h-3 w-3 shrink-0" /> : <span className="h-1 w-1 rounded-full bg-muted-foreground/40 mx-1 shrink-0" />}
                                        <span>At least 8 characters long</span>
                                      </div>
                                      <div className={`flex items-center gap-1.5 transition-colors duration-150 ${isAlphanumeric ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                                        {isAlphanumeric ? <Check className="h-3 w-3 shrink-0" /> : <span className="h-1 w-1 rounded-full bg-muted-foreground/40 mx-1 shrink-0" />}
                                        <span>Alphanumeric (letters & numbers)</span>
                                      </div>
                                      <div className={`flex items-center gap-1.5 transition-colors duration-150 ${hasSpecialChar ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                                        {hasSpecialChar ? <Check className="h-3 w-3 shrink-0" /> : <span className="h-1 w-1 rounded-full bg-muted-foreground/40 mx-1 shrink-0" />}
                                        <span>At least 1 special character (!@#$%...)</span>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </FormItem>
                            )}
                          />

                          <motion.div whileTap={{ scale: 0.98 }}>
                            <Button
                              className="w-full h-11 rounded-xl font-semibold text-sm shadow-sm mt-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              type="submit"
                              disabled={isSendingOtp || !isPasswordValid}
                            >
                              {isSendingOtp ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Sending Code...</span>
                                </>
                              ) : (
                                <>
                                  <span>Verify & Create Account</span>
                                  <AnimatedArrowIcon className="h-4 w-4" />
                                </>
                              )}
                            </Button>
                          </motion.div>
                        </form>
                      </Form>
                    </CardContent>

                    <CardFooter className="pb-6 pt-2">
                      <div className="text-center text-xs w-full text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary font-semibold hover:underline">
                          Login
                        </Link>
                      </div>
                    </CardFooter>
                  </motion.div>
                ) : (
                  <motion.div
                    key="otp-step-mobile"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="p-5"
                  >
                    <OtpVerificationCard
                      email={pendingValues?.email || ''}
                      purpose="signup"
                      onVerify={handleVerifyOtp}
                      onResend={handleResendOtp}
                      onChangeEmail={() => setStep('form')}
                      cooldownSeconds={cooldownSeconds}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </main>
        <MobileFooter />
      </div>
    </>
  );
}
