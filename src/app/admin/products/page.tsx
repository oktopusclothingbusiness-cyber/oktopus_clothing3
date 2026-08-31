'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import {
  Trash2,
  Edit,
  Loader2,
  PlusCircle,
  Star,
  Upload,
  FileDown,
  Search,
  ChevronsUpDown,
  Check,
  Shirt,
  Sparkles,
  AlertTriangle,
  Layers,
  ArrowUpDown,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useProduct, Product } from '@/context/product-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useCategory } from '@/context/category-context';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ProductFormData = {
  id: string;
  name: string;
  description: string;
  price: string;
  cost: string;
  originalPrice: string;
  discountPercentage: number;
  rating: number;
  stock: number;
  imageUrls: string;
  sizes: string;
  colors: string;
  category: string[];
  featured: boolean;
  isHero: boolean;
};

const emptyProduct: ProductFormData = {
  id: '',
  name: '',
  description: '',
  price: '',
  cost: '',
  originalPrice: '',
  discountPercentage: 0,
  rating: 4.5,
  stock: 100,
  imageUrls: '',
  sizes: '',
  colors: '',
  category: [],
  featured: false,
  isHero: false,
};

export default function AdminProductsPage() {
  const { products, addProduct, deleteProduct, updateProduct, setHeroProduct, loading, fetchProducts } = useProduct();
  const { categories, loading: categoriesLoading } = useCategory();
  const [formData, setFormData] = React.useState<ProductFormData>(emptyProduct);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [bulkFile, setBulkFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterTab, setFilterTab] = React.useState<'all' | 'featured' | 'hero' | 'low_stock'>('all');
  const [viewMode, setViewMode] = React.useState<'table' | 'grid'>('table');
  const { toast } = useToast();
  const [openCategorySelector, setOpenCategorySelector] = React.useState(false);

  type SortField = 'name' | 'price' | 'stock' | 'createdAt';
  type SortOrder = 'asc' | 'desc';
  const [sortField, setSortField] = React.useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc');

  const formRef = React.useRef<HTMLDivElement>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // CATALOG STATS
  const stats = React.useMemo(() => {
    const total = products.length;
    const hero = products.find((p) => p.isHero);
    const featuredCount = products.filter((p) => p.featured).length;
    const lowStockCount = products.filter((p) => typeof p.stock === 'number' && p.stock < 10).length;

    return { total, hero, featuredCount, lowStockCount };
  }, [products]);

  // FILTERED AND SORTED PRODUCTS
  const filteredAndSortedProducts = React.useMemo(() => {
    let result = products;

    // Filter tab
    if (filterTab === 'featured') {
      result = result.filter((p) => p.featured);
    } else if (filterTab === 'hero') {
      result = result.filter((p) => p.isHero);
    } else if (filterTab === 'low_stock') {
      result = result.filter((p) => typeof p.stock === 'number' && p.stock < 10);
    }

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.id.toLowerCase().includes(q) ||
          (product.description && product.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    return [...result].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'name') {
        valA = (valA || '').toLowerCase();
        valB = (valB || '').toLowerCase();
      } else if (sortField === 'createdAt') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      } else {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, searchTerm, filterTab, sortField, sortOrder]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numValue =
      name === 'price' || name === 'cost' || name === 'originalPrice' || name === 'discountPercentage' || name === 'rating' || name === 'stock'
        ? parseFloat(value)
        : value;
    setFormData((prev) => ({ ...prev, [name]: numValue }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setFormData((prev) => {
      const currentCategories = Array.isArray(prev.category) ? prev.category : [];
      const newCategories = currentCategories.includes(categoryId)
        ? currentCategories.filter((id) => id !== categoryId)
        : [...currentCategories, categoryId];
      return { ...prev, category: newCategories };
    });
  };

  const handleEditClick = (product: Product) => {
    setIsEditing(true);
    setShowForm(true);
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      cost: product.cost?.toString() || '',
      originalPrice: product.originalPrice?.toString() || '',
      discountPercentage: product.discountPercentage || 0,
      rating: product.rating || 4.5,
      stock: product.stock || 100,
      imageUrls: product.imageUrls.join(', '),
      sizes: product.sizes.join(', '),
      colors: product.colors.join(', '),
      category: product.category || [],
      featured: product.featured || false,
      isHero: product.isHero || false,
    });

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.price && formData.imageUrls && formData.category.length > 0) {
      setIsSubmitting(true);

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        discountPercentage: formData.discountPercentage,
        rating: formData.rating,
        stock: formData.stock,
        imageUrls: formData.imageUrls.split(',').map((url: string) => url.trim()).filter((url: string) => url),
        category: formData.category,
        sizes: formData.sizes.split(',').map((s: string) => s.trim()).filter((s: string) => s),
        colors: formData.colors.split(',').map((c: string) => c.trim()).filter((c: string) => c),
        featured: formData.featured,
        isHero: formData.isHero,
      };

      if (isEditing) {
        const originalProduct = products.find((p) => p.id === formData.id);
        await updateProduct({
          ...productData,
          id: formData.id,
          _id: formData.id,
          createdAt: originalProduct?.createdAt || new Date().toISOString(),
        });
      } else {
        await addProduct(productData);
      }

      resetForm();
      setIsSubmitting(false);
      setShowForm(false);
    } else {
      toast({
        title: 'Missing Fields',
        description: 'Please fill out all required fields, including at least one category.',
        variant: 'destructive',
      });
    }
  };

  const handleFeatureToggle = async (product: Product) => {
    const updatedProduct = { ...product, featured: !product.featured };
    await updateProduct(updatedProduct);
  };

  const resetForm = () => {
    setFormData(emptyProduct);
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBulkFile(e.target.files[0]);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast({ title: 'No file selected', description: 'Please select an Excel or CSV file to upload.', variant: 'destructive' });
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

        toast({ title: 'Success', description: 'Products uploaded successfully.' });
        await fetchProducts();
        setBulkFile(null);
      };
      reader.readAsBinaryString(bulkFile);
    } catch (error: any) {
      toast({ title: 'Upload Error', description: error.message, variant: 'destructive', duration: 10000 });
    } finally {
      setIsUploading(false);
    }
  };

  const selectedCategories = categories.filter((cat) => formData.category.includes(cat.id));

  return (
    <div className="space-y-8 pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products Management</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Organize catalog items, update stock levels, toggle hero products, and upload bulk inventories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              if (showForm && !isEditing) {
                setShowForm(false);
              } else {
                resetForm();
                setShowForm(true);
                if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="h-9 text-xs font-semibold gap-1.5"
          >
            <PlusCircle className="h-4 w-4" />
            {showForm && !isEditing ? 'Close Form' : 'Add New Product'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const bulkElement = document.getElementById('bulk-upload-section');
              if (bulkElement) bulkElement.scrollIntoView({ behavior: 'smooth' });
            }}
            className="h-9 text-xs font-semibold gap-1.5 hidden sm:flex"
          >
            <Upload className="h-4 w-4" />
            Bulk Import
          </Button>
        </div>
      </div>

      {/* SECTION 1: EXECUTIVE CATALOG SUMMARY CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* CARD 1: TOTAL PRODUCTS */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Catalog Items</CardTitle>
            <Shirt className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-7 w-16" /> : stats.total}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Across {categories.length} store categories</p>
          </CardContent>
        </Card>

        {/* CARD 2: HERO PRODUCT */}
        <Card className="shadow-xs border-primary/30 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-primary">Hero Banner Item</CardTitle>
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          </CardHeader>
          <CardContent className="truncate">
            {loading ? (
              <Skeleton className="h-7 w-28" />
            ) : stats.hero ? (
              <div className="flex items-center gap-2 truncate">
                <div className="text-sm font-bold truncate">{stats.hero.name}</div>
                <Badge className="text-[9px] px-1.5 py-0 bg-primary shrink-0">Active Hero</Badge>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground font-medium">No Hero item set</span>
            )}
            <p className="text-[10px] text-muted-foreground mt-1">Featured on store home banner</p>
          </CardContent>
        </Card>

        {/* CARD 3: FEATURED PRODUCTS */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Featured Products</CardTitle>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-7 w-16" /> : stats.featuredCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1">High-visibility store picks</p>
          </CardContent>
        </Card>

        {/* CARD 4: LOW & OUT OF STOCK */}
        <Card className={cn('shadow-xs', stats.lowStockCount > 0 && 'border-amber-500/40 bg-amber-500/5')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-amber-600 dark:text-amber-400">Inventory Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {loading ? <Skeleton className="h-7 w-16" /> : `${stats.lowStockCount} items`}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Stock quantity &lt; 10 items</p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 2: ADD / EDIT PRODUCT FORM (COLLAPSIBLE STUDIO) */}
      {(showForm || isEditing) && (
        <div ref={formRef} className="animate-in fade-in slide-in-from-top-4 duration-300">
          <Card className="border-primary/40 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shirt className="h-5 w-5 text-primary" />
                  {isEditing ? `Edit Product: ${formData.name}` : 'Create New Catalog Product'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isEditing ? 'Modify pricing, stock levels, images, or categories.' : 'Fill in the details to publish a new store product.'}
                </CardDescription>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* LEFT COLUMN: BASIC & PRICING */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-bold">
                        Product Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Oversized Heavyweight Hoodie"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-xs font-bold">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Detailed product specification and fabric features..."
                        rows={3}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-xs font-bold">
                          Final Price (₹) *
                        </Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="e.g., 599.00"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="originalPrice" className="text-xs font-bold">
                          Original Price (₹)
                        </Label>
                        <Input
                          id="originalPrice"
                          name="originalPrice"
                          type="number"
                          step="0.01"
                          value={formData.originalPrice}
                          onChange={handleInputChange}
                          placeholder="e.g., 999.00"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cost" className="text-xs font-bold">
                          Manufacturing Cost (₹)
                        </Label>
                        <Input
                          id="cost"
                          name="cost"
                          type="number"
                          step="0.01"
                          value={formData.cost}
                          onChange={handleInputChange}
                          placeholder="e.g., 250.00"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock" className="text-xs font-bold">
                          Stock Quantity *
                        </Label>
                        <Input
                          id="stock"
                          name="stock"
                          type="number"
                          value={formData.stock}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: CATEGORIES & MEDIA */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="imageUrls" className="text-xs font-bold">
                        Image URLs (Comma-separated) *
                      </Label>
                      <Textarea
                        id="imageUrls"
                        name="imageUrls"
                        value={formData.imageUrls}
                        onChange={handleInputChange}
                        placeholder="https://images.unsplash.com/photo-..., https://..."
                        rows={3}
                        required
                        disabled={isSubmitting}
                      />
                      <p className="text-[10px] text-muted-foreground">Add multiple direct image URLs separated by commas.</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold">Product Categories *</Label>
                      <Popover open={openCategorySelector} onOpenChange={setOpenCategorySelector}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between h-10 text-xs"
                            disabled={categoriesLoading || isSubmitting}
                          >
                            <span className="truncate">
                              {selectedCategories.length > 0
                                ? selectedCategories.map((c) => c.name).join(', ')
                                : 'Select product categories...'}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] p-0 z-50">
                          <Command>
                            <CommandInput placeholder="Search categories..." />
                            <CommandList>
                              <CommandEmpty>No categories found.</CommandEmpty>
                              <CommandGroup>
                                {categories.map((category) => (
                                  <CommandItem key={category.id} value={category.name} onSelect={() => handleCategorySelect(category.id)}>
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        formData.category.includes(category.id) ? 'opacity-100' : 'opacity-0'
                                      )}
                                    />
                                    {category.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedCategories.map((c) => (
                          <Badge key={c.id} variant="secondary" className="text-[10px]">
                            {c.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sizes" className="text-xs font-bold">
                          Sizes
                        </Label>
                        <Input
                          id="sizes"
                          name="sizes"
                          value={formData.sizes}
                          onChange={handleInputChange}
                          placeholder="XS, S, M, L, XL"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="colors" className="text-xs font-bold">
                          Colors
                        </Label>
                        <Input
                          id="colors"
                          name="colors"
                          value={formData.colors}
                          onChange={handleInputChange}
                          placeholder="Black, White, Beige"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="featured"
                          name="featured"
                          checked={formData.featured}
                          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked }))}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor="featured" className="text-xs font-semibold cursor-pointer">
                          Featured Product
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FORM ACTIONS */}
                <div className="flex items-center justify-end gap-3 border-t pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditing ? 'Updating...' : 'Saving...'}
                      </>
                    ) : isEditing ? (
                      'Update Product'
                    ) : (
                      'Publish Product'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SECTION 3: CATALOG EXPLORER & MANAGEMENT TABLE / GRID */}
      <Card className="shadow-sm">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Product Catalog</CardTitle>
              <CardDescription className="text-xs">
                Showing {filteredAndSortedProducts.length} of {products.length} products
              </CardDescription>
            </div>

            {/* CONTROLS: SEARCH, SORT & VIEW MODE */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search products by name, ID..."
                  className="pl-9 h-9 text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center border rounded-md p-0.5 bg-muted/40">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('table')}
                  title="Table View (Desktop Optimized)"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('grid')}
                  title="Grid View (Mobile Friendly Cards)"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* TAB FILTER STRIP */}
          <div className="flex items-center gap-1 border-b pb-2 overflow-x-auto text-xs">
            <button
              onClick={() => setFilterTab('all')}
              className={cn(
                'px-3 py-1.5 rounded-full font-medium transition-all shrink-0',
                filterTab === 'all' ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-secondary text-muted-foreground'
              )}
            >
              All Products ({products.length})
            </button>
            <button
              onClick={() => setFilterTab('featured')}
              className={cn(
                'px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1 shrink-0',
                filterTab === 'featured' ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-secondary text-muted-foreground'
              )}
            >
              <Sparkles className="h-3 w-3" />
              Featured ({stats.featuredCount})
            </button>
            <button
              onClick={() => setFilterTab('hero')}
              className={cn(
                'px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1 shrink-0',
                filterTab === 'hero' ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-secondary text-muted-foreground'
              )}
            >
              <Star className="h-3 w-3" />
              Hero Banner Item ({stats.hero ? 1 : 0})
            </button>
            <button
              onClick={() => setFilterTab('low_stock')}
              className={cn(
                'px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1 shrink-0',
                filterTab === 'low_stock' ? 'bg-amber-500 text-white font-bold' : 'hover:bg-secondary text-muted-foreground'
              )}
            >
              <AlertTriangle className="h-3 w-3" />
              Low Stock ({stats.lowStockCount})
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {/* VIEW MODE 1: DESKTOP TABLE VIEW */}
          {viewMode === 'table' ? (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Image</TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:text-primary transition-colors min-w-[180px]"
                      onClick={() => handleSort('name')}
                    >
                      Name {sortField === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                    </TableHead>
                    <TableHead className="w-[100px]">Product ID</TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:text-primary transition-colors w-[110px]"
                      onClick={() => handleSort('price')}
                    >
                      Price {sortField === 'price' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:text-primary transition-colors w-[100px]"
                      onClick={() => handleSort('stock')}
                    >
                      Stock {sortField === 'stock' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                    </TableHead>
                    <TableHead className="w-[110px]">Hero Item</TableHead>
                    <TableHead className="w-[90px]">Featured</TableHead>
                    <TableHead className="text-right w-[110px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-10 w-10 rounded-md" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-12" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-7 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-10" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-16 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredAndSortedProducts.length > 0 ? (
                    filteredAndSortedProducts.map((product) => {
                      const firstImg =
                        product.imageUrls && product.imageUrls.length > 0
                          ? product.imageUrls[0].startsWith('http') || product.imageUrls[0].startsWith('/')
                            ? product.imageUrls[0]
                            : `https://${product.imageUrls[0]}`
                          : 'https://placehold.co/40x40.png';

                      return (
                        <TableRow key={product.id} className="hover:bg-muted/40">
                          <TableCell>
                            <Image
                              src={firstImg}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="rounded-md object-cover border bg-background shrink-0"
                              unoptimized
                            />
                          </TableCell>
                          <TableCell className="font-medium text-xs">
                            <div className="truncate max-w-[200px]" title={product.name}>
                              {product.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-[10px]">
                              #{product.id.slice(-6)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-bold text-xs">₹{product.price.toFixed(2)}</span>
                              {product.originalPrice && (
                                <span className="text-[10px] text-muted-foreground line-through">₹{product.originalPrice.toFixed(2)}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                typeof product.stock === 'number' && product.stock === 0
                                  ? 'destructive'
                                  : typeof product.stock === 'number' && product.stock < 10
                                  ? 'outline'
                                  : 'secondary'
                              }
                              className={cn('text-[10px]', typeof product.stock === 'number' && product.stock < 10 && 'border-amber-500 text-amber-600')}
                            >
                              {product.stock ?? 0} left
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant={product.isHero ? 'default' : 'outline'}
                              size="sm"
                              className="h-7 text-[10px] px-2"
                              onClick={() => setHeroProduct(product.id)}
                              disabled={product.isHero}
                            >
                              <Star className={cn('mr-1 h-3 w-3', product.isHero && 'fill-white')} />
                              {product.isHero ? 'Hero' : 'Set Hero'}
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
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(product)}>
                              <Edit className="h-3.5 w-3.5 text-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteProduct(product.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Shirt className="h-8 w-8 opacity-40" />
                          <p className="text-xs font-semibold">No products found matching query.</p>
                          {searchTerm && (
                            <Button variant="outline" size="sm" onClick={() => setSearchTerm('')} className="h-7 text-xs">
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
          ) : (
            /* VIEW MODE 2: MOBILE & RESPONSIVE GRID CARDS */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <Card key={idx} className="p-4 space-y-3">
                    <Skeleton className="h-36 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </Card>
                ))
              ) : filteredAndSortedProducts.length > 0 ? (
                filteredAndSortedProducts.map((product) => {
                  const firstImg =
                    product.imageUrls && product.imageUrls.length > 0
                      ? product.imageUrls[0].startsWith('http') || product.imageUrls[0].startsWith('/')
                        ? product.imageUrls[0]
                        : `https://${product.imageUrls[0]}`
                      : 'https://placehold.co/200x200.png';

                  return (
                    <Card key={product.id} className="overflow-hidden border group hover:shadow-md transition-all">
                      <div className="relative h-44 w-full bg-muted">
                        <Image src={firstImg} alt={product.name} fill className="object-cover group-hover:scale-105 transition-all duration-300" unoptimized />

                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {product.isHero && <Badge className="bg-primary text-[10px]">Active Hero</Badge>}
                          {product.featured && <Badge variant="secondary" className="text-[10px]">Featured</Badge>}
                        </div>

                        <div className="absolute top-2 right-2">
                          <Badge
                            variant={
                              typeof product.stock === 'number' && product.stock === 0
                                ? 'destructive'
                                : typeof product.stock === 'number' && product.stock < 10
                                ? 'outline'
                                : 'secondary'
                            }
                            className="bg-background/90 backdrop-blur-md text-[10px]"
                          >
                            {product.stock ?? 0} in stock
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm truncate" title={product.name}>
                            {product.name}
                          </h3>
                          <Badge variant="outline" className="font-mono text-[9px] shrink-0">
                            #{product.id.slice(-6)}
                          </Badge>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-sm">₹{product.price.toFixed(2)}</span>
                          {product.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice.toFixed(2)}</span>
                          )}
                        </div>

                        {/* CARD ACTIONS */}
                        <div className="flex items-center justify-between pt-3 border-t">
                          <Button
                            variant={product.isHero ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-[10px] px-2"
                            onClick={() => setHeroProduct(product.id)}
                            disabled={product.isHero}
                          >
                            <Star className={cn('mr-1 h-3 w-3', product.isHero && 'fill-white')} />
                            {product.isHero ? 'Hero' : 'Set Hero'}
                          </Button>

                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(product)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteProduct(product.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground space-y-2">
                  <Shirt className="h-10 w-10 opacity-40 mx-auto" />
                  <p className="text-xs font-semibold">No products found matching query.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION 4: BULK EXCEL / CSV PRODUCT IMPORTER */}
      <Card id="bulk-upload-section" className="shadow-xs border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base font-bold">Bulk Product Upload Studio</CardTitle>
              <CardDescription className="text-xs">
                Batch import dozens or hundreds of catalog items simultaneously using an Excel or CSV file.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 items-end">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="bulk-upload" className="text-xs font-semibold">
                Upload File (.xlsx, .csv)
              </Label>
              <Input id="bulk-upload" type="file" accept=".xlsx,.csv" onChange={handleFileChange} className="h-10 text-xs" />
            </div>

            <Button onClick={handleBulkUpload} disabled={isUploading || !bulkFile} className="h-10 text-xs font-semibold">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Upload Products
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <a href="/sample-products.csv" download className="text-xs text-primary hover:underline flex items-center gap-1.5 font-medium">
              <FileDown className="h-4 w-4" />
              Download Standard CSV Template
            </a>
            <span className="text-[10px] text-muted-foreground">Supported format: .xlsx, .csv</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
