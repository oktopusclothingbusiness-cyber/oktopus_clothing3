
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, setPersistence, browserLocalPersistence } from "firebase/auth";

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
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  
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
    const userToStore = { ...userData, id: userData._id, wishlist: userData.wishlist || [] };
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
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
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
            description: "Welcome!",
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
    <AuthContext.Provider value={{ user, login, logout, loading, signInWithGoogle, addToWishlist, removeFromWishlist, isInWishlist }}>
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
