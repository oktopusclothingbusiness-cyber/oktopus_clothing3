
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type Product = {
  _id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  category: string;
  sizes: string[];
  colors: string[];
};

type AddProduct = Omit<Product, 'id' | '_id'>

type ProductContextType = {
  products: Product[];
  addProduct: (product: AddProduct) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  loading: boolean;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      const productsWithId = data.map((p: any) => ({ ...p, id: p._id.toString() }));
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
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
  
  const updateProduct = async (updatedProduct: Product) => {
     try {
      const response = await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
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


  return (
    <ProductContext.Provider value={{ products, addProduct, deleteProduct, updateProduct, loading }}>
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
