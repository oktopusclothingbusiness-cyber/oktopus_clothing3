
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import Image from 'next/image';
import { Trash2, Edit } from 'lucide-react';
import { useProduct } from '@/context/product-context';

export default function AdminPage() {
    const { products, addProduct, deleteProduct } = useProduct();
    const [newProduct, setNewProduct] = React.useState({ name: '', description: '', price: '', imageUrl: '' });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleAddProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (newProduct.name && newProduct.price && newProduct.imageUrl) {
            addProduct({
                ...newProduct,
                price: parseFloat(newProduct.price),
                category: 'New',
                sizes: ['S', 'M', 'L', 'XL'],
                colors: ['Default'],
            });
            setNewProduct({ name: '', description: '', price: '', imageUrl: '' });
        }
    };

  return (
    <div className="container mx-auto p-4 md:p-8">
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
                  <Input id="name" name="name" value={newProduct.name} onChange={handleInputChange} placeholder="e.g., Classic White Shirt" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={newProduct.description} onChange={handleInputChange} placeholder="Product description" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" name="price" type="number" value={newProduct.price} onChange={handleInputChange} placeholder="e.g., 40.00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input id="imageUrl" name="imageUrl" value={newProduct.imageUrl} onChange={handleInputChange} placeholder="https://example.com/image.png" required />
                </div>
                <Button type="submit" className="w-full">Add Product</Button>
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
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="mr-2">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
