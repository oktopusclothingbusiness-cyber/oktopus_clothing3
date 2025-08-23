
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type Coupon = {
  _id: string;
  id: string;
  code: string;
  discountPercentage: number;
  isActive: boolean;
  createdAt: string;
};

type AddCoupon = Omit<Coupon, 'id' | '_id' | 'createdAt'>;
type UpdateCoupon = Partial<AddCoupon> & { id: string };

type CouponContextType = {
  coupons: Coupon[];
  addCoupon: (coupon: AddCoupon) => Promise<void>;
  deleteCoupon: (couponId: string) => Promise<void>;
  updateCoupon: (coupon: UpdateCoupon) => Promise<void>;
  loading: boolean;
};

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export const CouponProvider = ({ children }: { children: ReactNode }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/coupons');
      if (!response.ok) {
        throw new Error('Failed to fetch coupons');
      }
      const data = await response.json();
      const couponsWithId = data.map((c: any) => ({ ...c, id: c._id.toString() }));
      setCoupons(couponsWithId);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error fetching coupons',
        description: 'Could not load coupons from the database.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const addCoupon = async (coupon: AddCoupon) => {
     try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add coupon');
      }
      await fetchCoupons();
      toast({
        title: "Coupon Added",
        description: `"${coupon.code}" has been added successfully.`,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add the coupon.',
        variant: 'destructive',
      });
    }
  };

  const deleteCoupon = async (couponId: string) => {
    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete coupon');
      }
      setCoupons(prev => prev.filter(c => c.id !== couponId));
      toast({
        title: "Coupon Deleted",
        description: "The coupon has been successfully deleted.",
      });
    } catch (error) {
       console.error(error);
       toast({
        title: 'Error',
        description: 'Failed to delete the coupon.',
        variant: 'destructive',
      });
    }
  };
  
  const updateCoupon = async (updatedCoupon: UpdateCoupon) => {
     try {
      const response = await fetch(`/api/coupons/${updatedCoupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCoupon),
      });
      if (!response.ok) {
        throw new Error('Failed to update coupon');
      }
      setCoupons(prev => prev.map(c => c.id === updatedCoupon.id ? { ...c, ...updatedCoupon } as Coupon : c));
      toast({
        title: "Coupon Updated",
        description: `"${updatedCoupon.code}" has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update the coupon.',
        variant: 'destructive',
      });
    }
  };

  return (
    <CouponContext.Provider value={{ coupons, addCoupon, deleteCoupon, updateCoupon, loading }}>
      {children}
    </CouponContext.Provider>
  );
};

export const useCoupon = () => {
  const context = useContext(CouponContext);
  if (context === undefined) {
    throw new Error('useCoupon must be used within a CouponProvider');
  }
  return context;
};
