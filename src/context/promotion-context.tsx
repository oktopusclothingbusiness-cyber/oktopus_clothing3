
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type Promotion = {
  _id: string;
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
};

type AddPromotion = Omit<Promotion, 'id' | '_id'>;
type UpdatePromotion = Partial<AddPromotion> & { id: string };

type PromotionContextType = {
  promotions: Promotion[];
  addPromotion: (promotion: AddPromotion) => Promise<void>;
  deletePromotion: (promotionId: string) => Promise<void>;
  updatePromotion: (promotion: UpdatePromotion) => Promise<void>;
  loading: boolean;
};

const PromotionContext = createContext<PromotionContextType | undefined>(undefined);

export const PromotionProvider = ({ children }: { children: ReactNode }) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/promotions');
      if (!response.ok) {
        throw new Error('Failed to fetch promotions');
      }
      const data = await response.json();
      const promotionsWithId = data.map((p: any) => ({ ...p, id: p._id.toString() }));
      setPromotions(promotionsWithId);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error fetching promotions',
        description: 'Could not load promotions from the database.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const addPromotion = async (promotion: AddPromotion) => {
     try {
      const response = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promotion),
      });
      if (!response.ok) {
        throw new Error('Failed to add promotion');
      }
      await fetchPromotions();
      toast({
        title: "Promotion Added",
        description: `"${promotion.title}" has been added successfully.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to add the promotion.',
        variant: 'destructive',
      });
    }
  };

  const deletePromotion = async (promotionId: string) => {
    try {
      const response = await fetch(`/api/promotions/${promotionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete promotion');
      }
      setPromotions(prev => prev.filter(p => p.id !== promotionId));
      toast({
        title: "Promotion Deleted",
        description: "The promotion has been successfully deleted.",
      });
    } catch (error) {
       console.error(error);
       toast({
        title: 'Error',
        description: 'Failed to delete the promotion.',
        variant: 'destructive',
      });
    }
  };
  
  const updatePromotion = async (updatedPromotion: UpdatePromotion) => {
     try {
      const response = await fetch(`/api/promotions/${updatedPromotion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPromotion),
      });
      if (!response.ok) {
        throw new Error('Failed to update promotion');
      }
      setPromotions(prev => prev.map(p => p.id === updatedPromotion.id ? { ...p, ...updatedPromotion } as Promotion : p));
      toast({
        title: "Promotion Updated",
        description: `"${updatedPromotion.title}" has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update the promotion.',
        variant: 'destructive',
      });
    }
  };

  return (
    <PromotionContext.Provider value={{ promotions, addPromotion, deletePromotion, updatePromotion, loading }}>
      {children}
    </PromotionContext.Provider>
  );
};

export const usePromotion = () => {
  const context = useContext(PromotionContext);
  if (context === undefined) {
    throw new Error('usePromotion must be used within a PromotionProvider');
  }
  return context;
};
