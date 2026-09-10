'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { StorefrontHeader } from "@/components/storefront/header";
import { StorefrontFooter } from "@/components/storefront/footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { MobileHeader } from "@/components/mobile-header";
import { MobileFooter } from "@/components/mobile-footer";
import { useAuth } from "@/context/auth-context";
import { AnimatedUserIcon, AnimatedMailIcon, AnimatedLockIcon, AnimatedEyeIcon, AnimatedGoogleIcon, AnimatedArrowIcon } from "@/components/icons/animated-icons";
import { motion } from "framer-motion";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Account Created",
          description: "Your account has been created successfully. Please log in.",
        });
        router.push('/login');
      } else {
        toast({
          title: "Error",
          description: data.message || "An error occurred during signup.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-[#0A0A0A] text-[#FAF9F6] font-sans min-h-screen">
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <StorefrontHeader />
        <main className="flex-grow flex items-center justify-center py-16 px-4 bg-[radial-gradient(circle_at_50%_30%,rgba(252,195,36,0.06),transparent_70%)]">
          <Card className="w-full max-w-md border border-white/10 bg-[#121212] text-white shadow-2xl rounded-2xl p-2">
            <CardHeader className="space-y-1 text-center pt-8 pb-4">
              <CardTitle className="text-3xl font-black font-bebas tracking-wide uppercase text-white">CREATE OKTOPUS ACCOUNT</CardTitle>
              <CardDescription className="text-xs font-mono text-zinc-400">
                Join the streetwear collective to access early drops and earn Oktocoins.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="grid gap-5 px-8 font-mono">
              <Button 
                variant="outline" 
                onClick={signInWithGoogle} 
                className="w-full h-11 rounded-full font-bold text-xs border-white/20 text-white bg-[#1A1A1A] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2.5 shadow-sm group uppercase"
              >
                <AnimatedGoogleIcon className="h-4 w-4" />
                Sign up with Google
              </Button>

              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#121212] px-3 text-zinc-400 font-bold">
                    Or register with email
                  </span>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-xs font-bold text-zinc-300 uppercase">First Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-3 top-3.5 pointer-events-none">
                                <AnimatedUserIcon className="h-4 w-4 text-[#0F824B]" isFocused={focusedField === 'firstName'} />
                              </div>
                              <Input 
                                placeholder="First Name" 
                                {...field} 
                                onFocus={() => setFocusedField('firstName')}
                                onBlur={() => setFocusedField(null)}
                                className="pl-9 h-11 rounded-xl border-white/10 bg-[#0A0A0A] text-white text-xs"
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
                          <FormLabel className="text-xs font-bold text-zinc-300 uppercase">Last Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-3 top-3.5 pointer-events-none">
                                <AnimatedUserIcon className="h-4 w-4 text-[#0F824B]" isFocused={focusedField === 'lastName'} />
                              </div>
                              <Input 
                                placeholder="Last Name" 
                                {...field} 
                                onFocus={() => setFocusedField('lastName')}
                                onBlur={() => setFocusedField(null)}
                                className="pl-9 h-11 rounded-xl border-white/10 bg-[#0A0A0A] text-white text-xs"
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
                        <FormLabel className="text-xs font-bold text-zinc-300 uppercase">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3.5 top-3.5 pointer-events-none">
                              <AnimatedMailIcon className="h-4 w-4 text-[#0F824B]" isFocused={focusedField === 'email'} />
                            </div>
                            <Input 
                              placeholder="name@domain.com" 
                              {...field} 
                              onFocus={() => setFocusedField('email')}
                              onBlur={() => setFocusedField(null)}
                              className="pl-10 h-11 rounded-xl border-white/10 bg-[#0A0A0A] text-white text-xs"
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
                        <FormLabel className="text-xs font-bold text-zinc-300 uppercase">Password (Min 8 chars)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3.5 top-3.5 pointer-events-none">
                              <AnimatedLockIcon className="h-4 w-4 text-[#0F824B]" isFocused={focusedField === 'password'} />
                            </div>
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              {...field} 
                              onFocus={() => setFocusedField('password')}
                              onBlur={() => setFocusedField(null)}
                              className="pl-10 pr-10 h-11 rounded-xl border-white/10 bg-[#0A0A0A] text-white text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-white transition-colors"
                            >
                              <AnimatedEyeIcon isVisible={showPassword} className="h-4 w-4" />
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    className="w-full h-12 rounded-full font-bold text-xs bg-[#0F824B] text-white hover:bg-[#0b663a] shadow-lg transition-all mt-2 flex items-center justify-center gap-2 uppercase tracking-wider" 
                    type="submit" 
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      'Creating Account...'
                    ) : (
                      <>
                        <span>Create Member Account</span>
                        <AnimatedArrowIcon className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>

            <CardFooter className="pb-8 pt-2">
              <div className="text-center text-xs font-mono w-full text-zinc-400">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-[#0F824B] hover:underline uppercase">
                  Login Here
                </Link>
              </div>
            </CardFooter>
          </Card>
        </main>
        <StorefrontFooter />
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex flex-col min-h-screen bg-[#0A0A0A]">
        <MobileHeader title="Sign Up" showCart={false} />
        <main className="flex-grow flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full max-w-sm"
          >
            <Card className="w-full shadow-2xl border border-white/10 rounded-2xl bg-[#121212] text-white">
              <CardHeader className="text-center pt-6 pb-2">
                <CardTitle className="text-2xl font-bold font-bebas uppercase tracking-wide">Create Account</CardTitle>
                <CardDescription className="text-xs font-mono text-zinc-400">
                  Enter your details to get started.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="grid gap-4 pt-2 font-mono text-xs">
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="outline" 
                    onClick={signInWithGoogle} 
                    className="w-full h-11 rounded-full font-bold border-white/20 text-white bg-[#1A1A1A] flex items-center justify-center gap-2 text-xs uppercase"
                  >
                    <AnimatedGoogleIcon className="h-4 w-4" />
                    Sign up with Google
                  </Button>
                </motion.div>

                <div className="relative my-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-[#121212] px-2 text-zinc-400 font-bold">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs font-bold text-zinc-300 uppercase">First Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-2.5 top-3.5 pointer-events-none">
                                  <AnimatedUserIcon className="h-3.5 w-3.5 text-[#0F824B]" isFocused={focusedField === 'm-firstName'} />
                                </div>
                                <Input 
                                  placeholder="First" 
                                  {...field} 
                                  onFocus={() => setFocusedField('m-firstName')}
                                  onBlur={() => setFocusedField(null)}
                                  className="pl-8 h-11 rounded-xl bg-[#0A0A0A] border-white/10 text-white text-xs"
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
                            <FormLabel className="text-xs font-bold text-zinc-300 uppercase">Last Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-2.5 top-3.5 pointer-events-none">
                                  <AnimatedUserIcon className="h-3.5 w-3.5 text-[#0F824B]" isFocused={focusedField === 'm-lastName'} />
                                </div>
                                <Input 
                                  placeholder="Last" 
                                  {...field} 
                                  onFocus={() => setFocusedField('m-lastName')}
                                  onBlur={() => setFocusedField(null)}
                                  className="pl-8 h-11 rounded-xl bg-[#0A0A0A] border-white/10 text-white text-xs"
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
                          <FormLabel className="text-xs font-bold text-zinc-300 uppercase">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-3 top-3.5 pointer-events-none">
                                <AnimatedMailIcon className="h-4 w-4 text-[#0F824B]" isFocused={focusedField === 'm-email'} />
                              </div>
                              <Input 
                                placeholder="name@domain.com" 
                                {...field} 
                                onFocus={() => setFocusedField('m-email')}
                                onBlur={() => setFocusedField(null)}
                                className="pl-9 h-11 rounded-xl bg-[#0A0A0A] border-white/10 text-white text-xs"
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
                          <FormLabel className="text-xs font-bold text-zinc-300 uppercase">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-3 top-3.5 pointer-events-none">
                                <AnimatedLockIcon className="h-4 w-4 text-[#0F824B]" isFocused={focusedField === 'm-password'} />
                              </div>
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                {...field} 
                                onFocus={() => setFocusedField('m-password')}
                                onBlur={() => setFocusedField(null)}
                                className="pl-9 pr-10 h-11 rounded-xl bg-[#0A0A0A] border-white/10 text-white text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-zinc-400"
                              >
                                <AnimatedEyeIcon isVisible={showPassword} className="h-4 w-4" />
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button 
                        className="w-full h-11 rounded-full font-bold text-xs bg-[#0F824B] text-white hover:bg-[#0b663a] shadow-md mt-1 flex items-center justify-center gap-2 uppercase tracking-wider" 
                        type="submit" 
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? (
                          'Creating Account...'
                        ) : (
                          <>
                            <span>Create account</span>
                            <AnimatedArrowIcon className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </CardContent>

              <CardFooter className="pb-6 pt-2">
                <div className="text-center text-xs font-mono w-full text-zinc-400">
                  Already have an account?{" "}
                  <Link href="/login" className="text-[#0F824B] font-bold hover:underline uppercase">
                    Login
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </main>
        <MobileFooter />
      </div>
    </div>
  );
}
