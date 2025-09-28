
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type Trend = {
  _id: string;
  id: string;
  title: string;
  imageUrl: string;
  ctaLink: string;
  isActive: boolean;
};

type AddTrend = Omit<Trend, 'id' | '_id'>;
type UpdateTrend = Partial<AddTrend> & { id: string };

type TrendContextType = {
  trends: Trend[];
  addTrend: (trend: AddTrend) => Promise<void>;
  deleteTrend: (trendId: string) => Promise<void>;
  updateTrend: (trend: UpdateTrend) => Promise<void>;
  loading: boolean;
};

const TrendContext = createContext<TrendContextType | undefined>(undefined);

export const TrendProvider = ({ children }: { children: ReactNode }) => {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/trends');
      if (!response.ok) {
        throw new Error('Failed to fetch trends');
      }
      const data = await response.json();
      const trendsWithId = data.map((t: any) => ({ ...t, id: t._id.toString() }));
      setTrends(trendsWithId);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error fetching trends',
        description: 'Could not load trends from the database.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const addTrend = async (trend: AddTrend) => {
     try {
      const response = await fetch('/api/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trend),
      });
      if (!response.ok) {
        throw new Error('Failed to add trend');
      }
      await fetchTrends();
      toast({
        title: "Trend Added",
        description: `"${trend.title}" has been added successfully.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to add the trend.',
        variant: 'destructive',
      });
    }
  };

  const deleteTrend = async (trendId: string) => {
    try {
      const response = await fetch(`/api/trends/${trendId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete trend');
      }
      setTrends(prev => prev.filter(p => p.id !== trendId));
      toast({
        title: "Trend Deleted",
        description: "The trend has been successfully deleted.",
      });
    } catch (error) {
       console.error(error);
       toast({
        title: 'Error',
        description: 'Failed to delete the trend.',
        variant: 'destructive',
      });
    }
  };
  
  const updateTrend = async (updatedTrend: UpdateTrend) => {
     try {
      const response = await fetch(`/api/trends/${updatedTrend.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTrend),
      });
      if (!response.ok) {
        throw new Error('Failed to update trend');
      }
      setTrends(prev => prev.map(t => t.id === updatedTrend.id ? { ...t, ...updatedTrend } as Trend : t));
      toast({
        title: "Trend Updated",
        description: `"${updatedTrend.title}" has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update the trend.',
        variant: 'destructive',
      });
    }
  };

  return (
    <TrendContext.Provider value={{ trends, addTrend, deleteTrend, updateTrend, loading }}>
      {children}
    </TrendContext.Provider>
  );
};

export const useTrend = () => {
  const context = useContext(TrendContext);
  if (context === undefined) {
    throw new Error('useTrend must be used within a TrendProvider');
  }
  return context;
};
