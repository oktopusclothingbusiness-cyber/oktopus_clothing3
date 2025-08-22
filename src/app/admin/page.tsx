
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import Image from 'next/image';
import { Trash2, Edit, Loader2 } from 'lucide-react';
import { useProduct } from '@/context/product-context';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
    const { products, addProduct, deleteProduct, loading } = useProduct();
    const [newProduct, setNewProduct] = React.useState({ name: '', description: '', price: '', imageUrl: '' });
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newProduct.name && newProduct.price && newProduct.imageUrl) {
            setIsSubmitting(true);
            await addProduct({
                ...newProduct,
                price: parseFloat(newProduct.price),
                category: 'New', // You can add a category field to the form
                sizes: ['S', 'M', 'L', 'XL'], // You can add a sizes field to the form
                colors: ['Default'], // You can add a colors field to the form
            });
            setNewProduct({ name: '', description: '', price: '', imageUrl: '' });
            setIsSubmitting(false);
        }
    };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Add New Product</CardTitle>
                <CardDescription>Fill out the form to add a new product to your store.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" name="name" value={newProduct.name} onChange={handleInputChange} placeholder="e.g., Classic White Shirt" required disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" value={newProduct.description} onChange={handleInputChange} placeholder="Product description" disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" name="price" type="number" value={newProduct.price} onChange={handleInputChange} placeholder="e.g., 40.00" required disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input id="imageUrl" name="imageUrl" value={newProduct.imageUrl} onChange={handleInputChange} placeholder="https://example.com/image.png" required disabled={isSubmitting} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : 'Add Product'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Manage Products</CardTitle>
                <CardDescription>View, edit, or delete your existing products.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                           <TableRow key={index}>
                              <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                              <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                           </TableRow>
                        ))
                      ) : products.length > 0 ? (
                        products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>₹{product.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="mr-2" disabled>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center h-24">No products found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
