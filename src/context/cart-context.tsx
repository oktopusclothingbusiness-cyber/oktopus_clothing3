
"use client";

import { useToast } from "@/hooks/use-toast";
import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useCoupon, Coupon } from "./coupon-context";


type Product = {
  id: string;
  name: string;
  price: number;
  imageUrls: string[];
};

type CartItem = Product & {
  quantity: number;
  size: string;
  color: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  isAnimating: boolean;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  applyCoupon: (code: string) => Promise<boolean>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const [isAnimating, setIsAnimating] = useState(false);
  const { coupons } = useCoupon();
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [shipping, setShipping] = useState(0);

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                setShipping(data.deliveryCharge || 0);
            }
        } catch (error) {
            console.error("Failed to fetch settings for shipping:", error);
            setShipping(0); // Default to free shipping on error
        }
    };
    fetchSettings();
  }, []);

  const subtotal = useMemo(() => {
      return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.discountType === 'percentage') {
        return subtotal * (appliedCoupon.discountValue / 100);
    } else if (appliedCoupon.discountType === 'flat') {
        return appliedCoupon.discountValue;
    }
    return 0;
  }, [subtotal, appliedCoupon]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount + shipping);
  }, [subtotal, discount, shipping]);


  const applyCoupon = async (code: string) => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
    if(coupon) {
      if (subtotal < coupon.minimumAmount) {
        toast({ title: "Cannot Apply Coupon", description: `You need to spend at least ₹${coupon.minimumAmount} to use this coupon.`, variant: 'destructive'});
        return false;
      }
      setAppliedCoupon(coupon);
      toast({ title: "Coupon Applied", description: `The coupon ${coupon.code} has been applied!` });
      return true;
    } else {
      toast({ title: "Invalid Coupon", description: "The coupon code is invalid or has expired.", variant: 'destructive'});
      return false;
    }
  }


  const addToCart = (product: Product, size: string, color: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id && item.size === size && item.color === color);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id && item.size === size && item.color === color ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1, size, color }];
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 700);
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === productId && item.size === size && item.color === color)));
     toast({
      title: "Removed from cart",
      description: `Item has been removed from your cart.`,
      variant: "destructive",
    });
  };

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity > 0) {
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === productId && item.size === size && item.color === color ? { ...item, quantity } : item))
      );
    }
  };
  
  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    toast({
      title: "Cart cleared",
      description: "Your cart has been emptied.",
      variant: "destructive",
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, isAnimating, subtotal, discount, shipping, total, applyCoupon }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
