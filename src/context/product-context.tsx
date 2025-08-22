
'use client';

import { products as initialProducts } from '@/data/products';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  sizes: string[];
  colors: string[];
};

type ProductContextType = {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (productId: string) => void;
  updateProduct: (product: Product) => void;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts(prev => [...prev, { ...product, id: (prev.length + 1).toString() }]);
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };
  
  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };


  return (
    <ProductContext.Provider value={{ products, addProduct, deleteProduct, updateProduct }}>
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
