
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export type Product = {
  _id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  cost?: number;
  originalPrice?: number;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  imageUrls: string[];
  category: string;
  sizes: string[];
  colors: string[];
  featured?: boolean;
  isHero?: boolean;
  createdAt: string;
};

type AddProduct = Omit<Product, 'id' | '_id' | 'createdAt'>

type ProductContextType = {
  products: Product[];
  addProduct: (product: AddProduct) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateProduct: (product: Product | (Omit<Product, '_id'> & { _id?: string })) => Promise<void>;
  setHeroProduct: (productId: string) => Promise<void>;
  loading: boolean;
  fetchProducts: () => Promise<void>;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      const productsWithId = data.map((p: any) => ({ ...p, id: p._id.toString(), cost: p.cost || 0 }));
      setProducts(productsWithId);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error fetching products',
        description: 'Could not load products from the database.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (product: AddProduct) => {
     try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!response.ok) {
        throw new Error('Failed to add product');
      }
      await fetchProducts(); // Refetch products to get the new list with ID
       toast({
        title: "Product Added",
        description: `${product.name} has been added successfully.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to add the product.',
        variant: 'destructive',
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast({
        title: "Product Deleted",
        description: "The product has been successfully deleted.",
      });
    } catch (error) {
       console.error(error);
       toast({
        title: 'Error',
        description: 'Failed to delete the product.',
        variant: 'destructive',
      });
    }
  };
  
  const updateProduct = async (updatedProduct: Product | (Omit<Product, '_id'> & { _id?: string })) => {
     try {
      const response = await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
       // Optimistically update the local state
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? { ...p, ...updatedProduct, _id: p._id } as Product : p));
      toast({
        title: "Product Updated",
        description: `${updatedProduct.name} has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update the product.',
        variant: 'destructive',
      });
    }
  };

  const setHeroProduct = async (productId: string) => {
    try {
        const response = await fetch(`/api/products/set-hero/${productId}`, {
            method: 'PUT'
        });
        if (!response.ok) {
            throw new Error('Failed to set hero product');
        }
        setProducts(prev => prev.map(p => ({
            ...p,
            isHero: p.id === productId
        })));
        toast({
            title: 'Hero Product Set',
            description: 'The new hero product has been set successfully.'
        });
    } catch (error) {
        console.error(error);
        toast({
            title: 'Error',
            description: 'Failed to set the hero product.',
            variant: 'destructive'
        });
    }
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, deleteProduct, updateProduct, setHeroProduct, loading, fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};
