
"use client";

import { useToast } from "@/hooks/use-toast";
import React, { createContext, useContext, useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useCoupon, Coupon } from "./coupon-context";
import { useAuth } from "./auth-context";

export type Product = {
  id: string;
  _id?: string;
  productId?: string;
  name: string;
  price: number;
  cost?: number;
  imageUrls: string[];
  imageUrl?: string;
};

export type CartItem = Product & {
  quantity: number;
  size: string;
  color: string;
  fabricQuality?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: any, size?: string, color?: string, fabricQuality?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string, fabricQuality?: string) => void;
  updateQuantity: (productId: string, size?: string, color?: string, quantity?: number, fabricQuality?: string) => void;
  clearCart: () => void;
  isAnimating: boolean;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  applyCoupon: (code: string) => Promise<boolean>;
};

const LOCAL_STORAGE_KEY = "oktopus_cart_items_v2";

function normalizeCartItem(item: any): CartItem {
  const id = item.id || item.productId || (typeof item.product === 'string' ? item.product : item.product?._id) || item._id || '';
  const price = Number(item.price !== undefined ? item.price : 0) || 0;
  const cost = Number(item.cost !== undefined ? item.cost : 0) || 0;
  
  let imageUrls: string[] = [];
  if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
    imageUrls = item.imageUrls.filter(Boolean);
  } else if (item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.trim()) {
    imageUrls = [item.imageUrl.trim()];
  }

  return {
    id: String(id),
    _id: String(id),
    productId: String(id),
    name: item.name || 'Product',
    price,
    cost,
    imageUrls,
    imageUrl: imageUrls[0] || '',
    quantity: Math.max(1, Number(item.quantity) || 1),
    size: item.size || 'Free Size',
    color: item.color || 'Standard',
    fabricQuality: item.fabricQuality || '',
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed.map(normalizeCartItem);
          }
        }
      } catch (e) {
        console.warn("Failed to parse cart from localStorage:", e);
      }
    }
    return [];
  });

  const { toast } = useToast();
  const [isAnimating, setIsAnimating] = useState(false);
  const { coupons } = useCoupon();
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [shipping, setShipping] = useState(0);
  const { user, loading: authLoading } = useAuth();
  const initialSyncDone = useRef(false);

  // Sync state to localStorage whenever cart changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
      } catch (e) {
        console.warn("Failed to persist cart to localStorage:", e);
      }
    }
  }, [cart]);

  const saveCartToDb = useCallback(async (updatedCart: CartItem[]) => {
    if (user?._id) {
      try {
        await fetch(`/api/users/${user._id}/cart`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart: updatedCart }),
        });
      } catch (error) {
        console.error("Failed to save cart to DB", error);
      }
    }
  }, [user]);

  const fetchCartAndSettings = useCallback(async () => {
    // 1. Fetch shipping settings
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setShipping(Number(data.deliveryCharge) || 0);
      }
    } catch (error) {
      console.error("Failed to fetch settings for shipping:", error);
      setShipping(0);
    }

    // 2. Fetch user's cart if authenticated
    if (user?._id) {
      try {
        const res = await fetch(`/api/users/${user._id}/cart`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.cart)) {
            if (data.cart.length > 0) {
              const normalized = data.cart.map(normalizeCartItem);
              setCart(normalized);
            } else if (cart.length > 0 && !initialSyncDone.current) {
              // Guest had items and just logged in: sync local cart to DB
              saveCartToDb(cart);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch cart from DB", error);
      }
    }
    initialSyncDone.current = true;
  }, [user, cart, saveCartToDb]);

  useEffect(() => {
    if (!authLoading) {
      fetchCartAndSettings();
    }
  }, [authLoading, user?._id]);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const p = Number(item.price) || 0;
      const q = Number(item.quantity) || 1;
      return acc + (p * q);
    }, 0);
  }, [cart]);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const val = Number(appliedCoupon.discountValue) || 0;
    if (appliedCoupon.discountType === 'percentage') {
      return (subtotal * val) / 100;
    } else if (appliedCoupon.discountType === 'flat') {
      return val;
    }
    return 0;
  }, [subtotal, appliedCoupon]);

  const total = useMemo(() => {
    const s = Number(subtotal) || 0;
    const d = Number(discount) || 0;
    const ship = Number(shipping) || 0;
    return Math.max(0, s - d + ship);
  }, [subtotal, discount, shipping]);

  const applyCoupon = async (code: string) => {
    const coupon = (coupons || []).find(c => c && c.code && c.code.toUpperCase() === code.toUpperCase() && c.isActive);
    if (coupon) {
      const minAmount = Number(coupon.minimumAmount) || 0;
      if (subtotal < minAmount) {
        toast({ title: "Cannot Apply Coupon", description: `You need to spend at least ₹${minAmount} to use this coupon.`, variant: 'destructive'});
        return false;
      }
      setAppliedCoupon(coupon);
      toast({ title: "Coupon Applied", description: `The coupon ${coupon.code} has been applied!` });
      return true;
    } else {
      toast({ title: "Invalid Coupon", description: "The coupon code is invalid or has expired.", variant: 'destructive'});
      return false;
    }
  };

  const addToCart = (product: any, size: string = 'Free Size', color: string = 'Standard', fabricQuality?: string) => {
    const productId = product?.id || product?._id || product?.productId || String(Date.now());
    const safeSize = size || 'Free Size';
    const safeColor = color || 'Standard';
    const safeFabric = fabricQuality || '';
    const safePrice = Number(product?.price !== undefined ? product.price : 0) || 0;
    const safeCost = Number(product?.cost !== undefined ? product.cost : 0) || 0;

    let imageUrls: string[] = [];
    if (Array.isArray(product?.imageUrls) && product.imageUrls.length > 0) {
      imageUrls = product.imageUrls.filter(Boolean);
    } else if (product?.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.trim()) {
      imageUrls = [product.imageUrl.trim()];
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => {
        const itemPid = item.id || item._id || item.productId;
        return (
          itemPid === productId &&
          (item.size || 'Free Size') === safeSize &&
          (item.color || 'Standard') === safeColor &&
          (item.fabricQuality || '') === safeFabric
        );
      });

      let updatedCart: CartItem[];
      if (existingIndex > -1) {
        updatedCart = [...prevCart];
        const currentItem = updatedCart[existingIndex];
        updatedCart[existingIndex] = {
          ...currentItem,
          quantity: (Number(currentItem.quantity) || 1) + 1,
          price: safePrice > 0 ? safePrice : currentItem.price,
        };
      } else {
        const newItem: CartItem = {
          id: productId,
          _id: productId,
          productId: productId,
          name: product?.name || 'Apparel Item',
          price: safePrice,
          cost: safeCost,
          imageUrls,
          imageUrl: imageUrls[0] || '',
          quantity: 1,
          size: safeSize,
          color: safeColor,
          fabricQuality: safeFabric,
        };
        updatedCart = [...prevCart, newItem];
      }

      saveCartToDb(updatedCart);
      return updatedCart;
    });

    toast({
      title: "Added to cart",
      description: `${product?.name || 'Product'} ${fabricQuality ? `(${fabricQuality})` : ''} has been added to your cart.`,
    });
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 700);
  };

  const removeFromCart = (productId: string, size?: string, color?: string, fabricQuality?: string) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => {
        const itemPid = item.id || item._id || item.productId;
        const matchesId = itemPid === productId;
        const matchesSize = size === undefined || (item.size || 'Free Size') === (size || 'Free Size');
        const matchesColor = color === undefined || (item.color || 'Standard') === (color || 'Standard');
        const matchesFabric = fabricQuality === undefined || (item.fabricQuality || '') === (fabricQuality || '');
        return !(matchesId && matchesSize && matchesColor && matchesFabric);
      });
      saveCartToDb(updatedCart);
      return updatedCart;
    });

    toast({
      title: "Removed from cart",
      description: `Item has been removed from your cart.`,
      variant: "destructive",
    });
  };

  const updateQuantity = (productId: string, size?: string, color?: string, quantity: number = 1, fabricQuality?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color, fabricQuality);
      return;
    }

    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => {
        const itemPid = item.id || item._id || item.productId;
        const matchesId = itemPid === productId;
        const matchesSize = size === undefined || (item.size || 'Free Size') === (size || 'Free Size');
        const matchesColor = color === undefined || (item.color || 'Standard') === (color || 'Standard');
        const matchesFabric = fabricQuality === undefined || (item.fabricQuality || '') === (fabricQuality || '');

        if (matchesId && matchesSize && matchesColor && matchesFabric) {
          return { ...item, quantity };
        }
        return item;
      });

      saveCartToDb(updatedCart);
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (e) {
        console.warn("Failed to clear cart in localStorage:", e);
      }
    }
    saveCartToDb([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
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
