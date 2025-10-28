
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type Popup = {
  _id: string;
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  couponIds?: string[];
};

type AddPopup = Omit<Popup, 'id' | '_id'>;
type UpdatePopup = Partial<AddPopup> & { id: string };

type PopupContextType = {
  popups: Popup[];
  addPopup: (popup: AddPopup) => Promise<void>;
  deletePopup: (popupId: string) => Promise<void>;
  updatePopup: (popup: UpdatePopup) => Promise<void>;
  loading: boolean;
};

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const PopupProvider = ({ children }: { children: ReactNode }) => {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPopups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/popups');
      if (!response.ok) {
        throw new Error('Failed to fetch popups');
      }
      const data = await response.json();
      const popupsWithId = data.map((p: any) => ({ ...p, id: p._id.toString() }));
      setPopups(popupsWithId);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error fetching popups',
        description: 'Could not load popups from the database.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  const addPopup = async (popup: AddPopup) => {
     try {
      const response = await fetch('/api/popups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(popup),
      });
      if (!response.ok) {
        throw new Error('Failed to add popup');
      }
      await fetchPopups();
      toast({
        title: "Popup Added",
        description: `"${popup.title}" has been added successfully.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to add the popup.',
        variant: 'destructive',
      });
    }
  };

  const deletePopup = async (popupId: string) => {
    try {
      const response = await fetch(`/api/popups/${popupId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete popup');
      }
      setPopups(prev => prev.filter(p => p.id !== popupId));
      toast({
        title: "Popup Deleted",
        description: "The popup has been successfully deleted.",
      });
    } catch (error) {
       console.error(error);
       toast({
        title: 'Error',
        description: 'Failed to delete the popup.',
        variant: 'destructive',
      });
    }
  };
  
  const updatePopup = async (updatedPopup: UpdatePopup) => {
     try {
      const response = await fetch(`/api/popups/${updatedPopup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPopup),
      });
      if (!response.ok) {
        throw new Error('Failed to update popup');
      }
      await fetchPopups(); // Refetch to get the latest state after updates
      toast({
        title: "Popup Updated",
        description: `"${updatedPopup.title}" has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update the popup.',
        variant: 'destructive',
      });
    }
  };

  return (
    <PopupContext.Provider value={{ popups, addPopup, deletePopup, updatePopup, loading }}>
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};
