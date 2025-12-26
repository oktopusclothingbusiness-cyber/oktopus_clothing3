
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export type SizeEntry = {
  size: string;
  chest: number;
  length: number;
  sleeve: number;
};

export type SizeChart = {
  _id: string;
  name: string;
  sizes: SizeEntry[];
  unit: 'inch' | 'cm';
  createdAt: string;
};

type AddSizeChart = Omit<SizeChart, '_id' | 'createdAt'>;
type UpdateSizeChart = Partial<AddSizeChart>;

type SizeChartContextType = {
  sizeCharts: SizeChart[];
  addSizeChart: (chart: AddSizeChart) => Promise<void>;
  deleteSizeChart: (chartId: string) => Promise<void>;
  updateSizeChart: (chartId: string, chart: UpdateSizeChart) => Promise<void>;
  loading: boolean;
};

const SizeChartContext = createContext<SizeChartContextType | undefined>(undefined);

export const SizeChartProvider = ({ children }: { children: ReactNode }) => {
  const [sizeCharts, setSizeCharts] = useState<SizeChart[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSizeCharts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/size-charts');
      if (!response.ok) throw new Error('Failed to fetch size charts');
      const data = await response.json();
      setSizeCharts(data);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Could not load size charts.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSizeCharts();
  }, [fetchSizeCharts]);

  const addSizeChart = async (chart: AddSizeChart) => {
    try {
      const response = await fetch('/api/size-charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chart),
      });
      if (!response.ok) throw new Error('Failed to add size chart');
      await fetchSizeCharts(); // Refresh
      toast({ title: 'Success', description: `Size chart "${chart.name}" added.` });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to add size chart.', variant: 'destructive' });
    }
  };

  const deleteSizeChart = async (chartId: string) => {
    try {
      const response = await fetch(`/api/size-charts/${chartId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete size chart');
      await fetchSizeCharts(); // Refresh
      toast({ title: 'Success', description: 'Size chart deleted.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to delete size chart.', variant: 'destructive' });
    }
  };

  const updateSizeChart = async (chartId: string, chart: UpdateSizeChart) => {
    try {
      const response = await fetch(`/api/size-charts/${chartId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chart),
      });
      if (!response.ok) throw new Error('Failed to update size chart');
      await fetchSizeCharts(); // Refresh
      toast({ title: 'Success', description: `Size chart "${chart.name}" updated.` });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to update size chart.', variant: 'destructive' });
    }
  };

  return (
    <SizeChartContext.Provider value={{ sizeCharts, loading, addSizeChart, deleteSizeChart, updateSizeChart }}>
      {children}
    </SizeChartContext.Provider>
  );
};

export const useSizeChart = () => {
  const context = useContext(SizeChartContext);
  if (context === undefined) {
    throw new Error('useSizeChart must be used within a SizeChartProvider');
  }
  return context;
};
