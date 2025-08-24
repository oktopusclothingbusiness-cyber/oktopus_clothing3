
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import Image from 'next/image';
import { Trash2, Edit, Loader2, PlusCircle, Star, Upload, FileDown, Search } from 'lucide-react';
import { useProduct, Product } from '@/context/product-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useCategory, Category } from '@/context/category-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { Badge } from '@/components/ui/badge';

const emptyProduct = {
    id: '',
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    discountPercentage: 0,
    rating: 4.5,
    stock: 100,
    imageUrls: '',
    sizes: '',
    colors: '',
    category: '',
    featured: false,
    isHero: false
};

export default function AdminProductsPage() {
    const { products, addProduct, deleteProduct, updateProduct, setHeroProduct, loading, fetchProducts } = useProduct();
    const { categories, loading: categoriesLoading } = useCategory();
    const [formData, setFormData] = React.useState(emptyProduct);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    const [bulkFile, setBulkFile] = React.useState<File | null>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const { toast } = useToast();
    
    const filteredProducts = React.useMemo(() => {
        if (!searchTerm) return products;
        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const numValue = (name === 'price' || name === 'originalPrice' || name === 'discountPercentage' || name === 'rating' || name === 'stock') ? parseFloat(value) : value;
        setFormData(prev => ({ ...prev, [name]: numValue }));
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
            originalPrice: product.originalPrice?.toString() || '',
            discountPercentage: product.discountPercentage || 0,
            rating: product.rating || 4.5,
            stock: product.stock || 100,
            imageUrls: product.imageUrls.join(', '),
            sizes: product.sizes.join(', '),
            colors: product.colors.join(', '),
            category: product.category,
            featured: product.featured || false,
            isHero: product.isHero || false,
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
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
                discountPercentage: formData.discountPercentage,
                rating: formData.rating,
                stock: formData.stock,
                imageUrls: formData.imageUrls.split(',').map(url => url.trim()).filter(url => url),
                category: formData.category,
                sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
                colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
                featured: formData.featured,
                isHero: formData.isHero,
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
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setBulkFile(e.target.files[0]);
        }
    };

    const handleBulkUpload = async () => {
        if (!bulkFile) {
            toast({ title: 'No file selected', description: 'Please select an Excel file to upload.', variant: 'destructive' });
            return;
        }

        setIsUploading(true);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                const response = await fetch('/api/products/bulk-upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(json),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message + (errorData.details ? ` Details: ${errorData.details}` : ''));
                }
                
                toast({ title: 'Success', description: 'Products have been uploaded successfully.' });
                await fetchProducts(); // Refresh products list
                setBulkFile(null); 
            };
            reader.readAsBinaryString(bulkFile);

        } catch (error: any) {
            toast({ title: 'Upload Error', description: error.message, variant: 'destructive', duration: 10000 });
        } finally {
            setIsUploading(false);
        }
    };

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Product Management</h1>
      <div className="grid md:grid-cols-3 gap-8 mb-8">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (Final)</Label>
                    <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="e.g., 40.00" required disabled={isSubmitting} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price</Label>
                    <Input id="originalPrice" name="originalPrice" type="number" value={formData.originalPrice} onChange={handleInputChange} placeholder="e.g., 50.00" disabled={isSubmitting} />
                  </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating</Label>
                    <Input id="rating" name="rating" type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={handleInputChange} disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} disabled={isSubmitting} />
                  </div>
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
                    <CardTitle>Bulk Product Upload</CardTitle>
                    <CardDescription>Upload multiple products at once using an Excel or CSV file.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="bulk-upload">Excel/CSV File (.xlsx, .csv)</Label>
                        <Input id="bulk-upload" type="file" accept=".xlsx,.csv" onChange={handleFileChange} />
                    </div>
                     <a href="/sample-products.csv" download className="text-sm text-primary hover:underline flex items-center gap-2">
                        <FileDown className="h-4 w-4" />
                        Download CSV Template
                    </a>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleBulkUpload} disabled={isUploading || !bulkFile}>
                        {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="mr-2 h-4 w-4"/>Upload Products</>}
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
        
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Manage Products</CardTitle>
                <CardDescription>View, edit, or delete your existing products.</CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search products..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Hero</TableHead>
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
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                      </TableRow>
                  ))
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Image src={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : 'https://placehold.co/40x40.png'} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">{product.id.slice(-6)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                            <span className="font-bold">₹{product.price.toFixed(2)}</span>
                            {product.originalPrice && (
                                <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice.toFixed(2)}</span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                            <Button 
                                variant={product.isHero ? "default" : "outline"} 
                                size="sm" 
                                onClick={() => setHeroProduct(product.id)}
                                disabled={product.isHero}
                            >
                                <Star className="mr-2 h-4 w-4" />
                                {product.isHero ? "Hero" : "Set Hero"}
                            </Button>
                       </TableCell>
                       <TableCell>
                            <Switch
                                checked={!!product.featured}
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
                    <TableCell colSpan={7} className="text-center h-24">
                      <div className="flex flex-col items-center gap-2">
                          <p>No products found.</p>
                          {searchTerm && (
                             <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                                Clear Search
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
