'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export type Poster = {
  _id?: string;
  id: string;
  title: string;
  description?: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  redirectPath: string;
  targetPages: string[];
  displayDurationSeconds: number;
  durationDays: number;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  priority?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type PosterContextType = {
  posters: Poster[];
  loading: boolean;
  fetchPosters: () => Promise<void>;
  addPoster: (poster: Omit<Poster, 'id' | '_id'>) => Promise<boolean>;
  updatePoster: (id: string, poster: Partial<Poster>) => Promise<boolean>;
  deletePoster: (id: string) => Promise<boolean>;
  togglePosterStatus: (id: string, currentStatus: boolean) => Promise<boolean>;
};

const PosterContext = createContext<PosterContextType | undefined>(undefined);

export const PosterProvider = ({ children }: { children: ReactNode }) => {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPosters = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posters');
      if (!res.ok) throw new Error('Failed to fetch posters');
      const data = await res.json();
      setPosters(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching posters:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosters();
  }, [fetchPosters]);

  const addPoster = async (posterData: Omit<Poster, 'id' | '_id'>): Promise<boolean> => {
    try {
      const res = await fetch('/api/posters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(posterData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add poster');
      }

      toast({
        title: 'Poster Created',
        description: `"${posterData.title}" has been successfully created.`,
      });
      await fetchPosters();
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create poster.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updatePoster = async (id: string, posterData: Partial<Poster>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/posters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(posterData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update poster');
      }

      toast({
        title: 'Poster Updated',
        description: 'Exclusive poster settings saved successfully.',
      });
      await fetchPosters();
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update poster.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deletePoster = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/posters/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete poster');

      setPosters(prev => prev.filter(p => p.id !== id));
      toast({
        title: 'Poster Deleted',
        description: 'The exclusive poster has been removed.',
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete poster.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const togglePosterStatus = async (id: string, currentStatus: boolean): Promise<boolean> => {
    const nextStatus = !currentStatus;
    // Optimistic update
    setPosters(prev => prev.map(p => p.id === id ? { ...p, isActive: nextStatus } : p));
    
    try {
      const res = await fetch(`/api/posters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      if (!res.ok) throw new Error('Failed to toggle status');

      toast({
        title: nextStatus ? 'Poster Activated' : 'Poster Deactivated',
        description: `Poster is now ${nextStatus ? 'live for storefront customers' : 'hidden'}.`,
      });
      return true;
    } catch (error) {
      // Revert optimistic update
      setPosters(prev => prev.map(p => p.id === id ? { ...p, isActive: currentStatus } : p));
      toast({
        title: 'Error',
        description: 'Could not change poster status.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return (
    <PosterContext.Provider
      value={{
        posters,
        loading,
        fetchPosters,
        addPoster,
        updatePoster,
        deletePoster,
        togglePosterStatus,
      }}
    >
      {children}
    </PosterContext.Provider>
  );
};

export const usePoster = () => {
  const context = useContext(PosterContext);
  if (!context) {
    throw new Error('usePoster must be used within a PosterProvider');
  }
  return context;
};
