
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type Reward = {
  _id: string;
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  sizes: string[];
};

type AddReward = Omit<Reward, 'id' | '_id'>;
type UpdateReward = Partial<AddReward> & { id: string };

type RewardContextType = {
  rewards: Reward[];
  addReward: (reward: AddReward) => Promise<void>;
  deleteReward: (rewardId: string) => Promise<void>;
  updateReward: (reward: UpdateReward) => Promise<void>;
  loading: boolean;
};

const RewardContext = createContext<RewardContextType | undefined>(undefined);

export const RewardProvider = ({ children }: { children: ReactNode }) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rewards');
      if (!response.ok) {
        throw new Error('Failed to fetch rewards');
      }
      const data = await response.json();
      const rewardsWithId = data.map((r: any) => ({ ...r, id: r._id.toString() }));
      setRewards(rewardsWithId);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error fetching rewards',
        description: 'Could not load rewards from the database.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const addReward = async (reward: AddReward) => {
     try {
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reward),
      });
      if (!response.ok) {
        throw new Error('Failed to add reward');
      }
      await fetchRewards();
      toast({
        title: "Reward Added",
        description: `"${reward.name}" has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add the reward.',
        variant: 'destructive',
      });
    }
  };

  const deleteReward = async (rewardId: string) => {
    try {
      const response = await fetch(`/api/rewards/${rewardId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete reward');
      }
      setRewards(prev => prev.filter(r => r.id !== rewardId));
      toast({
        title: "Reward Deleted",
        description: "The reward has been successfully deleted.",
      });
    } catch (error) {
       toast({
        title: 'Error',
        description: 'Failed to delete the reward.',
        variant: 'destructive',
      });
    }
  };
  
  const updateReward = async (updatedReward: UpdateReward) => {
     try {
      const response = await fetch(`/api/rewards/${updatedReward.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReward),
      });
      if (!response.ok) {
        throw new Error('Failed to update reward');
      }
      setRewards(prev => prev.map(r => r.id === updatedReward.id ? { ...r, ...updatedReward } as Reward : r));
      toast({
        title: "Reward Updated",
        description: `"${updatedReward.name}" has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update the reward.',
        variant: 'destructive',
      });
    }
  };

  return (
    <RewardContext.Provider value={{ rewards, addReward, deleteReward, updateReward, loading }}>
      {children}
    </RewardContext.Provider>
  );
};

export const useReward = () => {
  const context = useContext(RewardContext);
  if (context === undefined) {
    throw new Error('useReward must be used within a RewardProvider');
  }
  return context;
};
