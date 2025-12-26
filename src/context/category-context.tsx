
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type Category = {
  _id: string;
  id: string;
  name: string;
  imageUrl: string;
  sizeChartId?: string;
};

type AddCategory = Omit<Category, 'id' | '_id'>;
type UpdateCategory = Partial<AddCategory> & { id: string };

type CategoryContextType = {
  categories: Category[];
  addCategory: (category: AddCategory) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  updateCategory: (category: UpdateCategory) => Promise<void>;
  loading: boolean;
};

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      const categoriesWithId = data.map((c: any) => ({ ...c, id: c._id.toString() }));
      setCategories(categoriesWithId);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error fetching categories',
        description: 'Could not load categories from the database.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (category: AddCategory) => {
     try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (!response.ok) {
        throw new Error('Failed to add category');
      }
      await fetchCategories();
      toast({
        title: "Category Added",
        description: `"${category.name}" has been added successfully.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to add the category.',
        variant: 'destructive',
      });
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      toast({
        title: "Category Deleted",
        description: "The category has been successfully deleted.",
      });
    } catch (error) {
       console.error(error);
       toast({
        title: 'Error',
        description: 'Failed to delete the category.',
        variant: 'destructive',
      });
    }
  };
  
  const updateCategory = async (updatedCategory: UpdateCategory) => {
     try {
      const response = await fetch(`/api/categories/${updatedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategory),
      });
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      setCategories(prev => prev.map(c => c.id === updatedCategory.id ? { ...c, ...updatedCategory } as Category : c));
      toast({
        title: "Category Updated",
        description: `"${updatedCategory.name}" has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update the category.',
        variant: 'destructive',
      });
    }
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, deleteCategory, updateCategory, loading }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};
