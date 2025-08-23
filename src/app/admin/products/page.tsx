
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import Image from 'next/image';
import { Trash2, Edit, Loader2, PlusCircle } from 'lucide-react';
import { useProduct, Product } from '@/context/product-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useCategory, Category } from '@/context/category-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const emptyProduct = {
    id: '',
    name: '',
    description: '',
    price: '',
    imageUrls: '',
    sizes: '',
    colors: '',
    category: '',
    featured: false,
};

export default function AdminProductsPage() {
    const { products, addProduct, deleteProduct, updateProduct, loading } = useProduct();
    const { categories, loading: categoriesLoading } = useCategory();
    const [formData, setFormData] = React.useState(emptyProduct);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (value: string) => {
        setFormData(prev => ({ ...prev, category: value }));
    };
    
    const handleEditClick = (product: Product) => {
        setIsEditing(true);
        setFormData({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            imageUrls: product.imageUrls.join(', '),
            sizes: product.sizes.join(', '),
            colors: product.colors.join(', '),
            category: product.category,
            featured: product.featured || false
        });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.price && formData.imageUrls && formData.category) {
            setIsSubmitting(true);
            
            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                imageUrls: formData.imageUrls.split(',').map(url => url.trim()).filter(url => url),
                category: formData.category,
                sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
                colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
                featured: formData.featured
            };

            if (isEditing) {
                await updateProduct({ ...productData, id: formData.id, _id: formData.id });
            } else {
                await addProduct(productData);
            }
            
            resetForm();
            setIsSubmitting(false);
        }
    };

    const handleFeatureToggle = async (product: Product) => {
        const updatedProduct = { ...product, featured: !product.featured };
        await updateProduct(updatedProduct);
    };
    
    const resetForm = () => {
        setFormData(emptyProduct);
        setIsEditing(false);
    }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Product Management</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</CardTitle>
              <CardDescription>{isEditing ? 'Update the details of the existing product.' : 'Fill out the form to add a new product.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Classic White Shirt" required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Product description" disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="e.g., 40.00" required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrls">Image URLs</Label>
                  <Textarea id="imageUrls" name="imageUrls" value={formData.imageUrls} onChange={handleInputChange} placeholder="Comma-separated URLs" required disabled={isSubmitting} />
                  <p className="text-xs text-muted-foreground">Enter multiple image URLs separated by commas.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={handleCategoryChange} value={formData.category} disabled={isSubmitting || categoriesLoading}>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                  <div className="space-y-2">
                  <Label htmlFor="sizes">Sizes</Label>
                  <Input id="sizes" name="sizes" value={formData.sizes} onChange={handleInputChange} placeholder="e.g., S, M, L, XL" disabled={isSubmitting} />
                    <p className="text-xs text-muted-foreground">Comma-separated sizes.</p>
                </div>
                  <div className="space-y-2">
                  <Label htmlFor="colors">Colors</Label>
                  <Input id="colors" name="colors" value={formData.colors} onChange={handleInputChange} placeholder="e.g., Red, Blue, Black" disabled={isSubmitting} />
                    <p className="text-xs text-muted-foreground">Comma-separated colors.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="featured" name="featured" checked={formData.featured} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))} disabled={isSubmitting} />
                    <Label htmlFor="featured">Featured Product</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditing ? 'Updating...' : 'Adding...'}</> : (isEditing ? 'Update Product' : 'Add Product')}
                  </Button>
                  {isEditing && (
                      <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>Cancel</Button>
                  )}
                </div>
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
                      <TableHead>Featured</TableHead>
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
                            <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                          </TableRow>
                      ))
                    ) : products.length > 0 ? (
                      products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Image src={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : 'https://placehold.co/40x40.png'} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>₹{product.price.toFixed(2)}</TableCell>
                           <TableCell>
                                <Switch
                                    checked={product.featured}
                                    onCheckedChange={() => handleFeatureToggle(product)}
                                    aria-label="Toggle featured status"
                                />
                           </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEditClick(product)}>
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
                        <TableCell colSpan={5} className="text-center h-24">
                          <div className="flex flex-col items-center gap-2">
                              <p>No products found.</p>
                              <Button variant="outline" size="sm" onClick={() => document.getElementById('name')?.focus()}>
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Add New Product
                              </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
