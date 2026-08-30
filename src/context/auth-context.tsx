
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";

type User = {
    _id: string;
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'user' | 'admin';
    mobile?: string;
    address?: string;
    profilePictureUrl?: string;
    wishlist?: string[];
    oktocoins?: number;
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPhoneOtp: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  confirmPhoneOtp: (confirmationResult: ConfirmationResult, otpCode: string, firstName?: string, lastName?: string) => Promise<void>;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  
  const refreshUser = useCallback(async () => {
    if (!user?._id) return;
    try {
      const response = await fetch(`/api/users/by-id/${user._id}`);
      if (response.ok) {
        const updatedUser = await response.json();
        login(updatedUser);
      }
    } catch (error) {
      console.error("Failed to refresh user data", error);
    }
  }, [user?._id]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to set auth persistence or parse user from local storage", error);
      } finally {
          setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = (userData: User) => {
    const userToStore = { ...userData, id: userData._id, wishlist: userData.wishlist || [], oktocoins: userData.oktocoins || 0 };
    setUser(userToStore);
    try {
      localStorage.setItem('user', JSON.stringify(userToStore));
    } catch (error) {
        console.error("Failed to save user to local storage", error);
    }
  };

  const logout = async () => {
    setUser(null);
    try {
        await signOut(auth);
        await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        localStorage.removeItem('user');
    } catch (error) {
        console.error("Failed to sign out or remove user from local storage", error);
    }
    setTimeout(() => {
      toast({
          title: "Logged Out",
          description: "You have been successfully logged out."
      });
    }, 0);
    router.push('/login');
  };


  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      if (googleUser) {
        const idToken = await googleUser.getIdToken();
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken,
            email: googleUser.email,
            firstName: googleUser.displayName?.split(' ')[0] || '',
            lastName: googleUser.displayName?.split(' ').slice(1).join(' ') || '',
            profilePictureUrl: googleUser.photoURL,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          login(data.user);
          toast({
            title: "Sign-In Successful",
            description: "Welcome back!",
          });
          if (data.user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/store');
          }
        } else {
          throw new Error(data.message || 'Failed to authenticate with Google');
        }
      }
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast({
        title: "Google Sign-In Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const signInWithPhoneOtp = async (phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phoneNumber}`,
      });
      return confirmationResult;
    } catch (error: any) {
      console.error("Phone OTP Error:", error);
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please check your phone number and try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const confirmPhoneOtp = async (
    confirmationResult: ConfirmationResult,
    otpCode: string,
    firstName?: string,
    lastName?: string
  ) => {
    try {
      const userCredential = await confirmationResult.confirm(otpCode);
      const idToken = await userCredential.user.getIdToken();

      const response = await fetch('/api/v1/mobile/auth/firebase-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-platform': 'android',
          'x-app-signature': 'web_client_signature',
        },
        body: JSON.stringify({
          idToken,
          firstName: firstName || '',
          lastName: lastName || '',
        }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        login(data.user);
        toast({
          title: data.isNewUser ? "Welcome to Oktopus!" : "Login Successful",
          description: data.isNewUser ? "You earned 100 Oktocoins welcome bonus!" : "Welcome back!",
        });
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/store');
        }
      } else {
        throw new Error(data.message || 'Failed to authenticate phone OTP with server.');
      }
    } catch (error: any) {
      console.error("OTP Verification Error:", error);
      toast({
        title: "Invalid Verification Code",
        description: error.message || "Please double-check the OTP code entered.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateWishlistOnServer = useCallback(async (wishlist: string[]) => {
    if (user) {
      try {
        await fetch(`/api/users/${user._id}/wishlist`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wishlist }),
        });
      } catch (error) {
        console.error("Failed to update wishlist on server:", error);
        toast({ title: "Error", description: "Could not sync wishlist.", variant: "destructive" });
      }
    }
  }, [user, toast]);

  const addToWishlist = (productId: string) => {
    if (!user) {
      toast({ title: "Please log in", description: "You need to be logged in to add items to your wishlist.", variant: "destructive"});
      router.push('/login');
      return;
    }
    setUser(currentUser => {
      if (!currentUser) return null;
      const newWishlist = [...(currentUser.wishlist || []), productId];
      const updatedUser = { ...currentUser, wishlist: newWishlist };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      updateWishlistOnServer(newWishlist);
      toast({ title: "Added to Wishlist", description: "Item has been added to your wishlist." });
      return updatedUser;
    });
  };

  const removeFromWishlist = (productId: string) => {
    if (!user) return;
    setUser(currentUser => {
      if (!currentUser) return null;
      const newWishlist = (currentUser.wishlist || []).filter(id => id !== productId);
      const updatedUser = { ...currentUser, wishlist: newWishlist };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      updateWishlistOnServer(newWishlist);
      toast({ title: "Removed from Wishlist", description: "Item has been removed from your wishlist." });
      return updatedUser;
    });
  };

  const isInWishlist = (productId: string) => {
    return user?.wishlist?.includes(productId) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        signInWithGoogle,
        signInWithPhoneOtp,
        confirmPhoneOtp,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
