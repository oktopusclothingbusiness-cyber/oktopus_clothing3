
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
  phone?: string;
  address?: string;
  profilePictureUrl?: string;
  oktocoins?: number;
  status?: 'active' | 'suspended';
  isBlocked?: boolean;
  suspendedReason?: string;
  suspendedAt?: string;
  lastLoginIp?: string;
  knownIps?: string[];
  lastLoginAt?: string;
  cart?: any[];
  cartCount?: number;
  lastOrder?: {
    _id: string;
    total: number;
    status: string;
    createdAt: string;
    shippingAddress?: any;
  } | null;
  totalOrders?: number;
  totalSpent?: number;
  authProvider?: string;
};

type UserContextType = {
  users: User[];
  loading: boolean;
  deleteUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: 'user' | 'admin') => Promise<void>;
  updateUserOktocoins: (userId: string, oktocoins: number) => Promise<void>;
  toggleUserSuspension: (userId: string, suspend: boolean, reason?: string) => Promise<boolean>;
  blockIpAddress: (ip: string, reason?: string) => Promise<boolean>;
  unblockIpAddress: (ip: string) => Promise<boolean>;
  refetchUsers: () => Promise<void>;
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
      const usersWithId = Array.isArray(data) 
        ? data.map((u: any) => ({ ...u, id: u._id ? u._id.toString() : (u.id || '') })) 
        : [];
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
        description: "The user balance has been successfully updated.",
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

  const toggleUserSuspension = async (userId: string, suspend: boolean, reason?: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: suspend ? 'suspended' : 'active',
          isBlocked: suspend,
          suspendedReason: reason || (suspend ? 'Suspended by administration' : ''),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user account status');
      }

      setUsers(prev =>
        prev.map(u =>
          u.id === userId
            ? {
                ...u,
                status: suspend ? 'suspended' : 'active',
                isBlocked: suspend,
                suspendedReason: reason || (suspend ? 'Suspended by administration' : undefined),
              }
            : u
        )
      );

      toast({
        title: suspend ? 'User Suspended' : 'User Reactivated',
        description: suspend
          ? 'User account has been suspended. Login and ordering are blocked.'
          : 'User account has been reactivated and granted full access.',
      });
      return true;
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Action Failed',
        description: error?.message || 'Failed to update account status.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const blockIpAddress = async (ip: string, reason?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/security/blocked-ips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'block',
          ip,
          reason: reason || 'Manually blocked from customer management',
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to block IP address');
      }

      toast({
        title: 'IP Address Blocked',
        description: `IP ${ip} has been added to the security blocklist.`,
      });
      return true;
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'IP Blocking Failed',
        description: error?.message || 'Could not block this IP address.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const unblockIpAddress = async (ip: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/security/blocked-ips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unblock',
          ip,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to unblock IP address');
      }

      toast({
        title: 'IP Address Unblocked',
        description: `IP ${ip} has been removed from the blocklist.`,
      });
      return true;
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Action Failed',
        description: error?.message || 'Could not unblock this IP address.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        users,
        loading,
        deleteUser,
        updateUserRole,
        updateUserOktocoins,
        toggleUserSuspension,
        blockIpAddress,
        unblockIpAddress,
        refetchUsers: fetchUsers,
      }}
    >
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

