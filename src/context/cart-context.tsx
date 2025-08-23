
"use client";

import { useToast } from "@/hooks/use-toast";
import React, { createContext, useContext, useState, useMemo } from "react";
import { useCoupon, Coupon } from "./coupon-context";


type Product = {
  id: string;
  name: string;
  price: number;
  imageUrls: string[];
};

type CartItem = Product & {
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isAnimating: boolean;
  subtotal: number;
  discount: number;
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

  const subtotal = useMemo(() => {
      return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return subtotal * (appliedCoupon.discountPercentage / 100);
  }, [subtotal, appliedCoupon]);

  const total = useMemo(() => {
    return subtotal - discount;
  }, [subtotal, discount]);


  const applyCoupon = async (code: string) => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
    if(coupon) {
      setAppliedCoupon(coupon);
      toast({ title: "Coupon Applied", description: `You've got a ${coupon.discountPercentage}% discount!` });
      return true;
    } else {
      toast({ title: "Invalid Coupon", description: "The coupon code is invalid or has expired.", variant: 'destructive'});
      return false;
    }
  }


  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 700);
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
     toast({
      title: "Removed from cart",
      description: `Item has been removed from your cart.`,
      variant: "destructive",
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity > 0) {
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item))
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
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, isAnimating, subtotal, discount, total, applyCoupon }}>
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
