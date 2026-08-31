
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

export type User = {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  mobile?: string;
  address?: string;
  profilePictureUrl?: string;
  oktocoins?: number;
};

type UserContextType = {
  users: User[];
  loading: boolean;
  deleteUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: 'user' | 'admin') => Promise<void>;
  updateUserOktocoins: (userId: string, oktocoins: number) => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (authLoading) return;
    if (user?.role !== 'admin') {
      setLoading(false);
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Admin session expired or unauthorized. Please re-login.');
        }
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      const usersWithId = data.map((u: any) => ({ ...u, id: u._id.toString() }));
      setUsers(usersWithId);
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Admin Authorization Needed',
        description: error?.message || 'Could not load users from the database. Please log out and log back in as Admin.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.role, authLoading, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({
        title: "User Deleted",
        description: "The user has been successfully deleted.",
      });
    } catch (error) {
       console.error(error);
       toast({
        title: 'Error',
        description: 'Failed to delete the user.',
        variant: 'destructive',
      });
    }
  };
  
  const updateUserRole = async (userId: string, role: 'user' | 'admin') => {
     try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) {
        throw new Error('Failed to update user role');
      }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      toast({
        title: "User Role Updated",
        description: `The user role has been updated to ${role}.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update the user role.',
        variant: 'destructive',
      });
    }
  };

  const updateUserOktocoins = async (userId: string, oktocoins: number) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oktocoins }),
      });
      if (!response.ok) {
        throw new Error('Failed to update Oktocoins');
      }
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, oktocoins } : u)));
      toast({
        title: "Oktocoins Updated",
        description: `The user's balance has been successfully updated.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update the Oktocoin balance.',
        variant: 'destructive',
      });
    }
  };


  return (
    <UserContext.Provider value={{ users, loading, deleteUser, updateUserRole, updateUserOktocoins }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
