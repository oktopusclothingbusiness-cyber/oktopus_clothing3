
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

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
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  
  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from session storage", error);
    } finally {
        setLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    // Ensure the user object has the 'id' property which mirrors '_id'
    const userToStore = { ...userData, id: userData._id };
    setUser(userToStore);
    try {
      sessionStorage.setItem('user', JSON.stringify(userToStore));
    } catch (error) {
        console.error("Failed to save user to session storage", error);
    }
  };

  const logout = async () => {
    setUser(null);
    try {
        await signOut(auth);
        sessionStorage.removeItem('user');
    } catch (error) {
        console.error("Failed to sign out or remove user from session storage", error);
    }
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    });
    router.push('/login');
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
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

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, signInWithGoogle }}>
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
