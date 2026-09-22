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
  Copy,
  Plus,
  Tag,
  Package,
  Palette,
  RefreshCw,
  Info,
  ExternalLink,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

export type AdminFabricVariant = {
  id: string;
  name: string;
  enabled: boolean;
  price: string;
  originalPrice: string;
  stock: string;
  sizes: string;
  gsm?: string;
};

export type AdminColorVariant = {
  id: string;
  color: string;
  colorHex?: string;
  images: string;
  categories: AdminFabricVariant[];
};

export const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

export const QUICK_COLOR_PRESETS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#F8F9FA' },
];

export const createDefaultFabricCategories = (
  baseSizes = 'S, M, L, XL, 2XL'
): AdminFabricVariant[] => [
  {
    id: 'regular',
    name: 'Regular',
    enabled: true,
    price: '499',
    originalPrice: '799',
    stock: '10',
    sizes: baseSizes || 'S, M, L, XL, 2XL',
    gsm: '180 GSM Bio-Washed',
  },
  {
    id: 'oversized',
    name: 'Oversized',
    enabled: true,
    price: '599',
    originalPrice: '999',
    stock: '10',
    sizes: baseSizes || 'S, M, L, XL, 2XL',
    gsm: '240 GSM Boxy Cotton',
  },
  {
    id: 'french-terry',
    name: 'French Terry',
    enabled: true,
    price: '749',
    originalPrice: '1199',
    stock: '10',
    sizes: baseSizes || 'S, M, L, XL, 2XL',
    gsm: '320 GSM French Terry',
  },
  {
    id: 'sweatshirt',
    name: 'Sweatshirt',
    enabled: false,
    price: '799',
    originalPrice: '1299',
    stock: '10',
    sizes: 'M, L, XL, 2XL',
    gsm: '320 GSM Fleece',
  },
];

type ProductFormData = {
  id: string;
  name: string;
  description: string;
  category: string[];
  cost: string;
  featured: boolean;
  isHero: boolean;
  colorVariants: AdminColorVariant[];
  // Legacy / derived compatibility fields
  price?: string;
  originalPrice?: string;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  imageUrls?: string;
  sizes?: string;
  colors?: string;
  colorImages?: Record<string, string>;
};

const emptyProduct: ProductFormData = {
  id: '',
  name: '',
  description: '',
  category: [],
  cost: '',
  featured: false,
  isHero: false,
  colorVariants: [
    {
      id: 'color-black',
      color: 'Black',
      colorHex: '#111111',
      images: '',
      categories: createDefaultFabricCategories('S, M, L, XL, 2XL'),
    },
  ],
  price: '499',
  originalPrice: '799',
  discountPercentage: 0,
  rating: 4.5,
  stock: 10,
  imageUrls: '',
  sizes: 'S, M, L, XL, 2XL',
  colors: 'Black',
  colorImages: {},
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

  const [newImageUrlByColor, setNewImageUrlByColor] = React.useState<Record<number, string>>({});

  // LIVE AUTO-COMPUTED STATS FROM COLOR & FABRIC MATRIX
  const variantStats = React.useMemo(() => {
    const prices: number[] = [];
    const originalPrices: number[] = [];
    let totalStock = 0;
    const activeFabrics = new Set<string>();
    const allSizes = new Set<string>();
    let totalImages = 0;

    formData.colorVariants.forEach((cv) => {
      const imgCount = cv.images.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean).length;
      totalImages += imgCount;

      cv.categories.forEach((cat) => {
        if (cat.enabled) {
          activeFabrics.add(cat.name);
          const p = parseFloat(cat.price);
          if (p > 0) prices.push(p);
          const op = parseFloat(cat.originalPrice);
          if (op > 0) originalPrices.push(op);
          const s = parseInt(cat.stock, 10);
          if (!isNaN(s)) totalStock += s;
          cat.sizes.split(',').forEach((sz) => sz.trim() && allSizes.add(sz.trim()));
        }
      });
    });

    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    return {
      minPrice,
      maxPrice,
      priceLabel: prices.length > 0 ? (minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} – ₹${maxPrice}`) : '₹0',
      totalStock,
      totalColors: formData.colorVariants.length,
      activeFabricsCount: activeFabrics.size,
      activeFabricsList: Array.from(activeFabrics),
      totalImages,
      allSizesList: Array.from(allSizes),
    };
  }, [formData.colorVariants]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleAddColorVariant = (preset?: { name: string; hex: string }) => {
    const colorName = preset?.name || `Color ${formData.colorVariants.length + 1}`;
    const colorHex = preset?.hex || '#111111';
    setFormData((prev) => ({
      ...prev,
      colorVariants: [
        ...prev.colorVariants,
        {
          id: `color-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          color: colorName,
          colorHex,
          images: '',
          categories: createDefaultFabricCategories('S, M, L, XL, 2XL'),
        },
      ],
    }));
  };

  const handleDuplicateColorVariant = (sourceIndex: number) => {
    const source = formData.colorVariants[sourceIndex];
    if (!source) return;
    const duplicated: AdminColorVariant = {
      id: `color-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      color: `${source.color} (Copy)`,
      colorHex: source.colorHex || '#111111',
      images: source.images,
      categories: source.categories.map((c) => ({ ...c })),
    };
    setFormData((prev) => ({
      ...prev,
      colorVariants: [...prev.colorVariants, duplicated],
    }));
    toast({
      title: 'Color Variant Cloned',
      description: `Duplicated "${source.color}" with all fabric pricing & stock settings.`,
    });
  };

  const handleRemoveColorVariant = (index: number) => {
    if (formData.colorVariants.length <= 1) {
      toast({ title: 'At least one color variant is required.', variant: 'destructive' });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants.filter((_, i) => i !== index),
    }));
  };

  const handleColorVariantChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.colorVariants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, colorVariants: updated };
    });
  };

  const handleFabricCategoryChange = (
    colorIndex: number,
    catId: string,
    field: string,
    value: any
  ) => {
    setFormData((prev) => {
      const updatedVariants = [...prev.colorVariants];
      const variant = { ...updatedVariants[colorIndex] };
      variant.categories = variant.categories.map((c) =>
        c.id === catId ? { ...c, [field]: value } : c
      );
      updatedVariants[colorIndex] = variant;
      return { ...prev, colorVariants: updatedVariants };
    });
  };

  const handleToggleFabricSize = (colorIdx: number, catId: string, size: string) => {
    setFormData((prev) => {
      const updatedVariants = [...prev.colorVariants];
      const variant = { ...updatedVariants[colorIdx] };
      variant.categories = variant.categories.map((c) => {
        if (c.id !== catId) return c;
        const currentSizes = c.sizes.split(',').map((s) => s.trim()).filter(Boolean);
        const nextSizes = currentSizes.includes(size)
          ? currentSizes.filter((s) => s !== size)
          : [...currentSizes, size];
        return { ...c, sizes: nextSizes.join(', ') };
      });
      updatedVariants[colorIdx] = variant;
      return { ...prev, colorVariants: updatedVariants };
    });
  };

  const handleCopyFabricToAllColors = (sourceIndex: number) => {
    const sourceColor = formData.colorVariants[sourceIndex];
    if (!sourceColor) return;

    setFormData((prev) => {
      const sourceCategories = prev.colorVariants[sourceIndex]?.categories;
      if (!sourceCategories) return prev;

      const updatedVariants = prev.colorVariants.map((v, i) => {
        if (i === sourceIndex) return v;
        return {
          ...v,
          categories: sourceCategories.map((c) => ({ ...c })),
        };
      });

      return { ...prev, colorVariants: updatedVariants };
    });
    toast({
      title: 'Fabric Settings Copied',
      description: `Fabric qualities and prices from "${sourceColor.color}" applied to all colors.`,
    });
  };

  const handleApplyPresetMatrixToAll = () => {
    setFormData((prev) => {
      const updatedVariants = prev.colorVariants.map((v) => ({
        ...v,
        categories: [
          { id: 'regular', name: 'Regular', enabled: true, price: '499', originalPrice: '799', stock: '10', sizes: 'S, M, L, XL, 2XL', gsm: '180 GSM Bio-Washed' },
          { id: 'oversized', name: 'Oversized', enabled: true, price: '599', originalPrice: '999', stock: '10', sizes: 'S, M, L, XL, 2XL', gsm: '240 GSM Boxy Cotton' },
          { id: 'french-terry', name: 'French Terry', enabled: true, price: '749', originalPrice: '1199', stock: '10', sizes: 'S, M, L, XL, 2XL', gsm: '320 GSM French Terry' },
          { id: 'sweatshirt', name: 'Sweatshirt', enabled: false, price: '799', originalPrice: '1299', stock: '10', sizes: 'M, L, XL, 2XL', gsm: '320 GSM Fleece' },
        ],
      }));
      return { ...prev, colorVariants: updatedVariants };
    });
    toast({
      title: 'Standard Matrix Applied',
      description: 'Applied standard pricing (Regular ₹499, Oversized ₹599, French Terry 320 GSM ₹749, Sweatshirt ₹799) to all colors.',
    });
  };

  const handleRemoveColorImage = (colorIdx: number, imageIdxToRemove: number) => {
    setFormData((prev) => {
      const updatedVariants = [...prev.colorVariants];
      const variant = { ...updatedVariants[colorIdx] };
      const imagesArr = variant.images.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean);
      const nextImages = imagesArr.filter((_, i) => i !== imageIdxToRemove).join(', ');
      variant.images = nextImages;
      updatedVariants[colorIdx] = variant;
      return { ...prev, colorVariants: updatedVariants };
    });
  };

  const handleAddSingleImage = (colorIdx: number) => {
    const url = (newImageUrlByColor[colorIdx] || '').trim();
    if (!url) return;
    setFormData((prev) => {
      const updatedVariants = [...prev.colorVariants];
      const variant = { ...updatedVariants[colorIdx] };
      const imagesArr = variant.images.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean);
      imagesArr.push(url);
      variant.images = imagesArr.join(', ');
      updatedVariants[colorIdx] = variant;
      return { ...prev, colorVariants: updatedVariants };
    });
    setNewImageUrlByColor((prev) => ({ ...prev, [colorIdx]: '' }));
  };

  const handleEditClick = (product: Product) => {
    setIsEditing(true);
    setShowForm(true);

    const initialColorImages: Record<string, string> = {};
    if (product.colorImages) {
      Object.entries(product.colorImages).forEach(([colorName, urlsArr]) => {
        if (Array.isArray(urlsArr)) {
          initialColorImages[colorName] = urlsArr.join(', ');
        }
      });
    }

    let initialColorVariants: AdminColorVariant[] = [];
    if (product.colorVariants && product.colorVariants.length > 0) {
      initialColorVariants = product.colorVariants.map((cv) => {
        const standardPresets = createDefaultFabricCategories(
          product.sizes && product.sizes.length > 0 ? product.sizes.join(', ') : 'S, M, L, XL, 2XL'
        );
        const categories: AdminFabricVariant[] = standardPresets.map((preset) => {
          const match = cv.categories.find(
            (c) => c.name.toLowerCase() === preset.name.toLowerCase() || c.id === preset.id
          );
          if (match) {
            return {
              id: match.id || preset.id,
              name: match.name || preset.name,
              enabled: true,
              price: match.price.toString(),
              originalPrice: match.originalPrice?.toString() || '',
              stock: match.stock !== undefined ? match.stock.toString() : '10',
              sizes: match.sizes?.join(', ') || preset.sizes,
              gsm: match.gsm || preset.gsm,
            };
          }
          return {
            ...preset,
            enabled: false,
          };
        });

        // Preserve any custom fabric categories
        cv.categories.forEach((customCat) => {
          if (!categories.some((c) => c.name.toLowerCase() === customCat.name.toLowerCase())) {
            categories.push({
              id: customCat.id || customCat.name.toLowerCase().replace(/\s+/g, '-'),
              name: customCat.name,
              enabled: true,
              price: customCat.price.toString(),
              originalPrice: customCat.originalPrice?.toString() || '',
              stock: customCat.stock !== undefined ? customCat.stock.toString() : '10',
              sizes: customCat.sizes?.join(', ') || '',
              gsm: customCat.gsm,
            });
          }
        });

        return {
          id: cv.id || cv.color.toLowerCase(),
          color: cv.color,
          colorHex: cv.colorHex || '#111111',
          images: Array.isArray(cv.images) ? cv.images.join(', ') : '',
          categories,
        };
      });
    } else {
      // Legacy product scaffolding
      const colorsList = product.colors && product.colors.length > 0 ? product.colors : ['Black'];
      initialColorVariants = colorsList.map((col, idx) => ({
        id: col.toLowerCase().replace(/\s+/g, '-'),
        color: col,
        colorHex: '#111111',
        images: (product.colorImages?.[col] || (idx === 0 ? product.imageUrls : []) || []).join(', '),
        categories: createDefaultFabricCategories(
          product.sizes && product.sizes.length > 0 ? product.sizes.join(', ') : 'S, M, L, XL, 2XL'
        ),
      }));
    }

    setFormData({
      id: product.id,
      name: product.name,
      description: product.description || '',
      cost: product.cost?.toString() || '',
      category: product.category || [],
      featured: product.featured || false,
      isHero: product.isHero || false,
      colorVariants: initialColorVariants,
      // Legacy compatibility
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      discountPercentage: product.discountPercentage || 0,
      rating: product.rating || 4.5,
      stock: product.stock || 100,
      imageUrls: product.imageUrls.join(', '),
      sizes: product.sizes.join(', '),
      colors: product.colors.join(', '),
      colorImages: initialColorImages,
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Product Name Required',
        description: 'Please enter a name for this product / design.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.category.length === 0) {
      toast({
        title: 'Category Required',
        description: 'Please select at least one category tag for this product.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.colorVariants || formData.colorVariants.length === 0) {
      toast({
        title: 'Color Variant Required',
        description: 'Please add at least one color variant for this product.',
        variant: 'destructive',
      });
      return;
    }

    const hasEnabledFabric = formData.colorVariants.some((cv) =>
      cv.categories.some((c) => c.enabled && parseFloat(c.price) > 0)
    );
    if (!hasEnabledFabric) {
      toast({
        title: 'Fabric Quality Required',
        description: 'Please enable at least one fabric quality (e.g., Regular or Oversized) with a valid price.',
        variant: 'destructive',
      });
      return;
    }

    const hasAnyImage = formData.colorVariants.some((cv) => cv.images.trim().length > 0);
    if (!hasAnyImage) {
      toast({
        title: 'Images Required',
        description: 'Please provide at least one image URL for your color variant(s).',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format structured colorVariants
      const validColorVariants = (formData.colorVariants || []).filter((cv) => cv.color.trim());
      const finalColorVariants = validColorVariants.map((cv) => ({
        id: cv.id || cv.color.toLowerCase().replace(/\s+/g, '-'),
        color: cv.color.trim(),
        colorHex: cv.colorHex || '#111111',
        images: cv.images.split(/[\n,]+/).map((u: string) => u.trim()).filter(Boolean),
        categories: cv.categories
          .filter((c) => c.enabled)
          .map((c) => ({
            id: c.id,
            name: c.name,
            price: parseFloat(c.price) || 0,
            originalPrice: c.originalPrice ? parseFloat(c.originalPrice) : undefined,
            stock: c.stock ? parseInt(c.stock, 10) : 50,
            sizes: c.sizes.split(',').map((s: string) => s.trim()).filter(Boolean),
            gsm: c.gsm,
          })),
      }));

      // Build colorImages mapping
      const colorImagesObj: Record<string, string[]> = {};
      finalColorVariants.forEach((cv) => {
        if (cv.images.length > 0) {
          colorImagesObj[cv.color] = cv.images;
        }
      });

      // Auto-compute root catalog values
      const allVariantPrices: number[] = [];
      const allOriginalPrices: number[] = [];
      let totalStock = 0;
      const allSizesSet = new Set<string>();

      finalColorVariants.forEach((cv) => {
        cv.categories.forEach((cat) => {
          if (cat.price > 0) allVariantPrices.push(cat.price);
          if (cat.originalPrice && cat.originalPrice > 0) allOriginalPrices.push(cat.originalPrice);
          if (typeof cat.stock === 'number') totalStock += cat.stock;
          cat.sizes.forEach((s) => allSizesSet.add(s));
        });
      });

      const resolvedPrice = allVariantPrices.length > 0 ? Math.min(...allVariantPrices) : 499;
      const resolvedOriginalPrice = allOriginalPrices.length > 0 ? Math.max(...allOriginalPrices) : undefined;
      const resolvedSizes = allSizesSet.size > 0 ? Array.from(allSizesSet) : ['S', 'M', 'L', 'XL', '2XL'];
      const resolvedColors = finalColorVariants.map((cv) => cv.color);
      const allImagesList = Array.from(new Set(finalColorVariants.flatMap((cv) => cv.images)));

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: resolvedPrice,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        originalPrice: resolvedOriginalPrice,
        discountPercentage:
          resolvedOriginalPrice && resolvedOriginalPrice > resolvedPrice
            ? Math.round(((resolvedOriginalPrice - resolvedPrice) / resolvedOriginalPrice) * 100)
            : 0,
        rating: formData.rating || 4.5,
        stock: totalStock > 0 ? totalStock : 10,
        imageUrls: allImagesList.length > 0 ? allImagesList : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500'],
        colorImages: Object.keys(colorImagesObj).length > 0 ? colorImagesObj : undefined,
        colorVariants: finalColorVariants.length > 0 ? finalColorVariants : undefined,
        category: formData.category,
        sizes: resolvedSizes,
        colors: resolvedColors.length > 0 ? resolvedColors : ['Black'],
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
        toast({ title: 'Product Updated', description: `Successfully updated "${productData.name}".` });
      } else {
        await addProduct(productData);
        toast({ title: 'Product Created', description: `Successfully published "${productData.name}".` });
      }

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error('Save product error:', err);
      toast({ title: 'Save Failed', description: 'An error occurred while saving the product.', variant: 'destructive' });
    } finally {
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
    setNewImageUrlByColor({});
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
        try {
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
        } catch (err: any) {
          toast({ title: 'Upload Error', description: err.message || 'Failed to upload bulk products.', variant: 'destructive', duration: 10000 });
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsBinaryString(bulkFile);
    } catch (error: any) {
      toast({ title: 'Upload Error', description: error.message, variant: 'destructive', duration: 10000 });
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
              resetForm();
              setShowForm(true);
            }}
            className="h-9 text-xs font-semibold gap-1.5"
          >
            <PlusCircle className="h-4 w-4" />
            Add New Product
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
            <Star className="h-4 w-4 text-primary fill-primary" />
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
            <Sparkles className="h-4 w-4 text-primary" />
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

      {/* SECTION 2: ADD / EDIT PRODUCT MODAL (CLEAN LUXURY STUDIO) */}
      <Dialog
        open={showForm || isEditing}
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
            setShowForm(false);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[92vh] sm:max-w-4xl lg:max-w-5xl flex flex-col p-0 overflow-hidden sm:rounded-2xl border-border shadow-2xl">
          {/* MODAL HEADER */}
          <DialogHeader className="px-6 py-4 border-b bg-card shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pr-8">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Shirt className="h-5 w-5 text-primary" />
                  {isEditing ? `Edit Product: ${formData.name}` : 'New Product'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Manage product details, colorways, fabric options, and inventory.
                </DialogDescription>
              </div>

              {/* LIVE VARIANT STATS BADGES */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs font-semibold border-primary/50 bg-primary/10 text-primary">
                  {variantStats.priceLabel}
                </Badge>
                <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
                  {variantStats.totalStock} in stock
                </Badge>
                <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
                  {variantStats.totalColors} {variantStats.totalColors === 1 ? 'colorway' : 'colorways'}
                </Badge>
                <Badge variant="secondary" className="text-xs font-medium">
                  {variantStats.activeFabricsCount} {variantStats.activeFabricsCount === 1 ? 'active fit' : 'active fits'}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          {/* MODAL FORM CONTAINER */}
          <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* STEP 1: GENERAL INFORMATION */}
              <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      1
                    </span>
                    <h3 className="text-sm font-bold text-foreground">General Information</h3>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Step 1 of 2
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* DESIGN NAME */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-bold text-foreground">
                      Product Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Heavyweight Boxy Tee"
                      className="h-9 text-xs"
                      required
                      disabled={isSubmitting}
                    />
                    <p className="text-[10px] text-muted-foreground">The title displayed on storefront cards, product details, and search.</p>
                  </div>

                  {/* CATEGORIES */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Categories *</Label>
                    <Popover open={openCategorySelector} onOpenChange={setOpenCategorySelector}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between h-9 text-xs font-normal"
                          disabled={categoriesLoading || isSubmitting}
                        >
                          <span className="truncate">
                            {selectedCategories.length > 0
                              ? selectedCategories.map((c) => c.name).join(', ')
                              : 'Select categories...'}
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
                                <CommandItem
                                  key={category.id}
                                  value={category.name}
                                  onSelect={() => handleCategorySelect(category.id)}
                                >
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
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCategories.map((c) => (
                        <Badge key={c.id} variant="secondary" className="text-[10px] px-2 py-0.5">
                          {c.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="md:col-span-2 space-y-1.5">
                    <Label htmlFor="description" className="text-xs font-bold text-foreground">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter product details, fit notes, fabric specifications, and care instructions..."
                      rows={2}
                      className="text-xs"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* OPTIONAL BENCHMARK & FLAGS */}
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/50 items-center">
                    <div className="space-y-1">
                      <Label htmlFor="cost" className="text-[11px] font-semibold text-muted-foreground">
                        Cost Per Item (₹)
                      </Label>
                      <Input
                        id="cost"
                        name="cost"
                        type="number"
                        step="0.01"
                        value={formData.cost}
                        onChange={handleInputChange}
                        placeholder="e.g., 250 (private)"
                        className="h-8 text-xs"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-4 sm:pt-0">
                      <Switch
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked }))}
                        disabled={isSubmitting}
                      />
                      <Label htmlFor="featured" className="text-xs font-semibold cursor-pointer">
                        Featured Product
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 sm:pt-0">
                      <Switch
                        id="isHero"
                        checked={formData.isHero}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isHero: checked }))}
                        disabled={isSubmitting}
                      />
                      <Label htmlFor="isHero" className="text-xs font-semibold cursor-pointer">
                        Hero Banner Item
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 2: GLOBAL FABRIC PRICING PRESETS */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-muted/40 border border-border/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">Default Pricing Presets</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Regular: ₹499 · Oversized: ₹599 · French Terry (320 GSM): ₹749 · Sweatshirt: ₹799
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleApplyPresetMatrixToAll}
                  className="h-8 text-xs font-medium gap-1.5 bg-background shadow-xs shrink-0"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-primary" />
                  Apply Defaults to All Colors
                </Button>
              </div>

              {/* STEP 3: COLOR & FABRIC STUDIO */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      2
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Colorways & Fabric Options
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Add images per color, and configure pricing, stock, and sizes for each fabric type.
                      </p>
                    </div>
                  </div>

                  {/* QUICK ADD COLOR CHIPS */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground mr-1 hidden lg:inline">Quick Add:</span>
                    {QUICK_COLOR_PRESETS.map((preset) => {
                      const alreadyExists = formData.colorVariants.some(
                        (cv) => cv.color.toLowerCase() === preset.name.toLowerCase()
                      );
                      return (
                        <Button
                          key={preset.name}
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={alreadyExists || isSubmitting}
                          onClick={() => handleAddColorVariant(preset)}
                          className="h-7 px-2 text-[10px] gap-1 font-semibold bg-background"
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full border border-border shrink-0"
                            style={{ backgroundColor: preset.hex }}
                          />
                          {preset.name}
                        </Button>
                      );
                    })}
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleAddColorVariant()}
                      className="h-7 px-2.5 text-[11px] font-bold gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Color
                    </Button>
                  </div>
                </div>

                {/* COLOR CARDS LIST */}
                <div className="space-y-5">
                  {formData.colorVariants.map((colorVariant, colorIdx) => {
                    const enabledCount = colorVariant.categories.filter((c) => c.enabled).length;
                    const imageList = colorVariant.images
                      .split(/[\n,]+/)
                      .map((u) => u.trim())
                      .filter(Boolean);

                    return (
                      <div
                        key={colorVariant.id || colorIdx}
                        className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4 transition-all"
                      >
                        {/* COLOR CARD HEADER */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
                          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                            {/* COLOR PICKER SWATCH */}
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={colorVariant.colorHex || '#111111'}
                                onChange={(e) => handleColorVariantChange(colorIdx, 'colorHex', e.target.value)}
                                className="h-8 w-8 rounded-lg cursor-pointer border border-border/80 bg-transparent p-0.5"
                                title="Pick Color Swatch"
                              />
                              <div className="space-y-0.5">
                                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Color Name</Label>
                                <Input
                                  value={colorVariant.color}
                                  onChange={(e) => handleColorVariantChange(colorIdx, 'color', e.target.value)}
                                  placeholder="e.g., Black"
                                  className="h-8 text-xs font-bold w-40 sm:w-56"
                                />
                              </div>
                            </div>

                            <Badge variant="outline" className="text-[10px] hidden sm:inline-flex font-medium">
                              {enabledCount} active
                            </Badge>
                          </div>

                          {/* ACTION BUTTONS FOR THIS COLOR */}
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDuplicateColorVariant(colorIdx)}
                              className="h-8 px-2.5 text-[11px] font-medium gap-1"
                              title="Duplicate this color with its fabric prices and sizes"
                            >
                              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                              Duplicate
                            </Button>

                            {formData.colorVariants.length > 1 && (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => handleCopyFabricToAllColors(colorIdx)}
                                className="h-8 px-2.5 text-[11px] font-medium text-foreground/80 hover:text-foreground"
                                title="Copy fabric prices from this color to all other colors"
                              >
                                Copy Pricing to All
                              </Button>
                            )}

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveColorVariant(colorIdx)}
                              className="h-8 px-2 text-destructive hover:bg-destructive/10"
                              disabled={formData.colorVariants.length <= 1}
                              title="Remove color variant"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* COLOR-SPECIFIC GALLERY PHOTOS */}
                        <div className="space-y-2.5 bg-muted/20 p-3.5 rounded-xl border border-border/50">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <Label className="text-xs font-bold flex items-center gap-1.5">
                              <span>Images for {colorVariant.color || 'this Color'} *</span>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {imageList.length} {imageList.length === 1 ? 'image' : 'images'}
                              </Badge>
                            </Label>
                            <span className="text-[10px] text-muted-foreground">First image is used as primary preview</span>
                          </div>

                          {/* QUICK IMAGE URL INPUT */}
                          <div className="flex items-center gap-2">
                            <Input
                              value={newImageUrlByColor[colorIdx] || ''}
                              onChange={(e) =>
                                setNewImageUrlByColor((prev) => ({ ...prev, [colorIdx]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddSingleImage(colorIdx);
                                }
                              }}
                              placeholder="Direct image URL (e.g., https://.../product.jpg)"
                              className="h-8 text-xs bg-background"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => handleAddSingleImage(colorIdx)}
                              className="h-8 text-xs font-semibold shrink-0"
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Add Image
                            </Button>
                          </div>

                          {/* BULK TEXTAREA */}
                          <div className="space-y-1">
                            <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                              <span>Or enter multiple URLs:</span>
                            </div>
                            <Textarea
                              value={colorVariant.images}
                              onChange={(e) => handleColorVariantChange(colorIdx, 'images', e.target.value)}
                              placeholder={`https://.../front.jpg, https://.../back.jpg`}
                              className="text-xs min-h-[48px] bg-background font-mono"
                              rows={1}
                            />
                          </div>

                          {/* LIVE THUMBNAIL PREVIEW STRIP */}
                          {imageList.length > 0 ? (
                            <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
                              {imageList.map((imgUrl, imgIdx) => (
                                <div
                                  key={imgIdx}
                                  className="relative group h-16 w-14 rounded-lg overflow-hidden border border-border/80 shrink-0 bg-muted shadow-2xs"
                                >
                                  <Image
                                    src={imgUrl}
                                    alt={`${colorVariant.color} view ${imgIdx + 1}`}
                                    fill
                                    className="object-cover"
                                    onError={(e: any) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute top-0.5 left-0.5 bg-black/70 text-[8px] font-medium text-white px-1 rounded-xs">
                                    {imgIdx + 1}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveColorImage(colorIdx, imgIdx)}
                                    className="absolute top-0.5 right-0.5 bg-destructive text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-xs"
                                    title="Remove image"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-3 px-4 rounded-lg border border-dashed border-border/70 text-center text-[11px] text-muted-foreground bg-background/50">
                              No images added for {colorVariant.color || 'this color'} yet. Enter an image URL above.
                            </div>
                          )}
                        </div>

                        {/* FABRIC QUALITY & PRICING MATRIX */}
                        <div className="space-y-2 pt-1">
                          <Label className="text-xs font-bold text-foreground flex items-center justify-between">
                            <span>Fabric Options for {colorVariant.color}:</span>
                            <span className="text-[10px] text-muted-foreground font-normal">
                              Configure pricing, inventory, and sizes for each fabric type
                            </span>
                          </Label>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {colorVariant.categories.map((cat) => (
                              <div
                                key={cat.id}
                                className={cn(
                                  'p-3.5 rounded-xl border transition-all space-y-2.5',
                                  cat.enabled
                                    ? 'bg-card border-primary/30 shadow-xs'
                                    : 'bg-muted/30 border-border/50 opacity-60'
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={cat.enabled}
                                      onCheckedChange={(checked) =>
                                        handleFabricCategoryChange(colorIdx, cat.id, 'enabled', checked)
                                      }
                                      id={`cat-${colorIdx}-${cat.id}`}
                                    />
                                    <Label
                                      htmlFor={`cat-${colorIdx}-${cat.id}`}
                                      className="text-xs font-bold cursor-pointer"
                                    >
                                      {cat.name}
                                    </Label>
                                  </div>
                                  <Badge variant="secondary" className="text-[10px] px-2 py-0">
                                    {cat.gsm || 'Standard'}
                                  </Badge>
                                </div>

                                {cat.enabled && (
                                  <div className="space-y-2.5 pt-1 text-xs">
                                    <div className="grid grid-cols-3 gap-2">
                                      <div className="space-y-1">
                                        <Label className="text-[10px] font-semibold text-muted-foreground">
                                          Price (₹) *
                                        </Label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={cat.price}
                                          onChange={(e) =>
                                            handleFabricCategoryChange(colorIdx, cat.id, 'price', e.target.value)
                                          }
                                          placeholder="499"
                                          className="h-8 text-xs font-bold"
                                        />
                                      </div>

                                      <div className="space-y-1">
                                        <Label className="text-[10px] font-semibold text-muted-foreground">
                                          Compare at (₹)
                                        </Label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={cat.originalPrice}
                                          onChange={(e) =>
                                            handleFabricCategoryChange(colorIdx, cat.id, 'originalPrice', e.target.value)
                                          }
                                          placeholder="999"
                                          className="h-8 text-xs"
                                        />
                                      </div>

                                      <div className="space-y-1">
                                        <Label className="text-[10px] font-semibold text-muted-foreground">
                                          Stock Quantity
                                        </Label>
                                        <Input
                                          type="number"
                                          value={cat.stock}
                                          onChange={(e) =>
                                            handleFabricCategoryChange(colorIdx, cat.id, 'stock', e.target.value)
                                          }
                                          placeholder="50"
                                          className="h-8 text-xs"
                                        />
                                      </div>
                                    </div>

                                    {/* SIZES WITH 1-CLICK TOGGLES */}
                                    <div className="space-y-1 pt-0.5">
                                      <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-semibold text-muted-foreground">
                                          Available Sizes
                                        </Label>
                                        <span className="text-[9px] text-muted-foreground">Click to toggle</span>
                                      </div>

                                      <div className="flex flex-wrap gap-1 mb-1.5">
                                        {STANDARD_SIZES.map((sz) => {
                                          const sizesList = cat.sizes
                                            .split(',')
                                            .map((s) => s.trim())
                                            .filter(Boolean);
                                          const isSelected = sizesList.includes(sz);
                                          return (
                                            <button
                                              key={sz}
                                              type="button"
                                              onClick={() => handleToggleFabricSize(colorIdx, cat.id, sz)}
                                              className={cn(
                                                'px-2 py-0.5 rounded text-[10px] font-bold border transition-all',
                                                isSelected
                                                  ? 'bg-primary text-primary-foreground border-primary'
                                                  : 'bg-background hover:bg-muted text-muted-foreground border-border'
                                              )}
                                            >
                                              {sz}
                                            </button>
                                          );
                                        })}
                                      </div>

                                      <Input
                                        value={cat.sizes}
                                        onChange={(e) =>
                                          handleFabricCategoryChange(colorIdx, cat.id, 'sizes', e.target.value)
                                        }
                                        placeholder="S, M, L, XL, 2XL"
                                        className="h-7 text-xs font-mono"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <DialogFooter className="px-6 py-3.5 border-t bg-card/90 backdrop-blur-xs flex flex-row items-center justify-between shrink-0 gap-3">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="font-semibold text-foreground">
                  Starting at ₹{variantStats.minPrice || 499}
                </span>
                <span>·</span>
                <span>{variantStats.totalStock} Total Units</span>
                <span>·</span>
                <span>{variantStats.totalColors} Colors</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="min-w-[130px] font-bold text-xs">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditing ? 'Updating...' : 'Saving...'}
                    </>
                  ) : isEditing ? (
                    'Update Product'
                  ) : (
                    'Save Product'
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
