
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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

  const logout = () => {
    setUser(null);
    try {
        sessionStorage.removeItem('user');
    } catch (error) {
        console.error("Failed to remove user from session storage", error);
    }
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    });
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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
