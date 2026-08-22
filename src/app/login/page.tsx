
'use client';

import { useState } from 'react';
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
import { useAuth } from "@/context/auth-context";
import { MobileHeader } from "@/components/mobile-header";
import { MobileFooter } from "@/components/mobile-footer";
import { AnimatedMailIcon, AnimatedLockIcon, AnimatedEyeIcon, AnimatedGoogleIcon, AnimatedArrowIcon } from "@/components/icons/animated-icons";
import { motion } from "framer-motion";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { login, signInWithGoogle } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user);
        toast({
          title: "Login Successful",
          description: "You have been successfully logged in.",
        });
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/store');
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "An error occurred during login.",
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
    <>
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen bg-secondary/30">
        <Header />
        <main className="flex-grow flex items-center justify-center py-16 px-4">
          <Card className="w-full max-w-md shadow-xl border border-border/60 backdrop-blur-sm bg-card/95 rounded-2xl">
            <CardHeader className="space-y-1 text-center pt-8 pb-4">
              <CardTitle className="text-2xl font-bold tracking-tight">Login to Oktopus</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            
            <CardContent className="grid gap-5 px-8">
              <Button 
                variant="outline" 
                onClick={signInWithGoogle} 
                className="w-full h-11 rounded-xl font-medium border-border/80 hover:bg-accent/60 transition-all flex items-center justify-center gap-2.5 shadow-sm group"
              >
                <AnimatedGoogleIcon className="h-4 w-4" />
                Sign in with Google
              </Button>

              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      </FormItem>
                    )}
                  />

                  <Button 
                    className="w-full h-11 rounded-xl font-semibold text-sm shadow-md transition-all mt-2 flex items-center justify-center gap-2 group" 
                    type="submit" 
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      'Signing In...'
                    ) : (
                      <>
                        <span>Sign in</span>
                        <AnimatedArrowIcon className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>

            <CardFooter className="pb-8 pt-2">
              <div className="text-center text-sm w-full text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex flex-col min-h-screen bg-background">
        <MobileHeader title="Login" showCart={false} />
        <main className="flex-grow flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full max-w-sm"
          >
            <Card className="w-full shadow-sm border border-border/60 rounded-2xl bg-card">
              <CardHeader className="text-center pt-6 pb-2">
                <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Login to your account to continue.
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
                    Sign in with Google
                  </Button>
                </motion.div>

                <div className="relative my-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-card px-2 text-muted-foreground font-medium">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
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
                        </FormItem>
                      )}
                    />

                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button 
                        className="w-full h-11 rounded-xl font-semibold text-sm shadow-sm mt-1 flex items-center justify-center gap-2" 
                        type="submit" 
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? (
                          'Signing In...'
                        ) : (
                          <>
                            <span>Sign in</span>
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
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-primary font-semibold hover:underline">
                    Sign up
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </main>
        <MobileFooter />
      </div>
    </>
  );
}
