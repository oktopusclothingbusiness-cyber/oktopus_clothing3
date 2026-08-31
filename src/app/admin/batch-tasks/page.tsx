'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCategory } from '@/context/category-context';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Layers,
  IndianRupee,
  Ruler,
  Package,
  Shapes,
  Play,
  Eye,
  CheckCircle2,
  AlertTriangle,
  History,
  Loader2,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

type TaskAction = 'PRICE_UPDATE' | 'ADD_SIZE' | 'REMOVE_SIZE' | 'STOCK_UPDATE' | 'CATEGORY_ASSIGN';

type PreviewProduct = {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  sizes?: string[];
  stock?: number;
  category?: string[];
  imageUrls?: string[];
};

type BatchLog = {
  _id: string;
  action: TaskAction;
  taskDescription: string;
  adminEmail: string;
  matchedCount: number;
  modifiedCount: number;
  executedAt: string;
};

export default function AdminBatchTasksPage() {
  const { categories, loading: categoriesLoading } = useCategory();
  const { toast } = useToast();

  // Task selection
  const [selectedAction, setSelectedAction] = React.useState<TaskAction>('PRICE_UPDATE');

  // Filter state
  const [allProducts, setAllProducts] = React.useState(false);
  const [targetPriceFilter, setTargetPriceFilter] = React.useState<string>('549');
  const [priceMinFilter, setPriceMinFilter] = React.useState<string>('');
  const [priceMaxFilter, setPriceMaxFilter] = React.useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = React.useState<string>('all');
  const [searchQueryFilter, setSearchQueryFilter] = React.useState<string>('');

  // Payload state
  const [newPrice, setNewPrice] = React.useState<string>('599');
  const [updateOriginalPrice, setUpdateOriginalPrice] = React.useState<boolean>(false);
  const [sizeInput, setSizeInput] = React.useState<string>('XS');
  const [stockValue, setStockValue] = React.useState<string>('100');
  const [stockMode, setStockMode] = React.useState<'set' | 'add' | 'subtract'>('set');
  const [categoryIds, setCategoryIds] = React.useState<string[]>([]);
  const [categoryMode, setCategoryMode] = React.useState<'add' | 'remove'>('add');

  // Preview & execution state
  const [isPreviewing, setIsPreviewing] = React.useState(false);
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [previewCount, setPreviewCount] = React.useState<number | null>(null);
  const [previewProducts, setPreviewProducts] = React.useState<PreviewProduct[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  // History state
  const [history, setHistory] = React.useState<BatchLog[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState(false);

  const fetchHistory = React.useCallback(async () => {
    try {
      setHistoryLoading(true);
      const response = await fetch('/api/products/batch-tasks/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch batch task history', error);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const buildFilterObject = () => {
    return {
      allProducts,
      targetPrice: targetPriceFilter ? parseFloat(targetPriceFilter) : undefined,
      priceMin: priceMinFilter ? parseFloat(priceMinFilter) : undefined,
      priceMax: priceMaxFilter ? parseFloat(priceMaxFilter) : undefined,
      categories: selectedCategoryFilter !== 'all' ? [selectedCategoryFilter] : undefined,
      searchQuery: searchQueryFilter || undefined,
    };
  };

  const buildPayloadObject = () => {
    return {
      newPrice: newPrice ? parseFloat(newPrice) : undefined,
      updateOriginalPrice,
      size: sizeInput,
      stockValue: stockValue ? parseInt(stockValue, 10) : undefined,
      stockMode,
      categoryIds,
      categoryMode,
    };
  };

  const handlePreview = async () => {
    try {
      setIsPreviewing(true);
      const response = await fetch('/api/products/batch-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: selectedAction,
          mode: 'preview',
          filter: buildFilterObject(),
          payload: buildPayloadObject(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to preview batch task.');

      setPreviewCount(data.count);
      setPreviewProducts(data.previewProducts || []);

      toast({
        title: 'Preview Generated',
        description: `Found ${data.count} product(s) matching your filter criteria.`,
      });
    } catch (error: any) {
      toast({
        title: 'Preview Error',
        description: error.message || 'Could not fetch matching products preview.',
        variant: 'destructive',
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleExecuteBatchTask = async () => {
    try {
      setIsExecuting(true);
      setShowConfirmDialog(false);

      const response = await fetch('/api/products/batch-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: selectedAction,
          mode: 'execute',
          filter: buildFilterObject(),
          payload: buildPayloadObject(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to execute batch task.');

      toast({
        title: 'Batch Task Completed!',
        description: `Successfully modified ${data.modifiedCount} product(s).`,
      });

      // Refresh history & reset preview
      fetchHistory();
      setPreviewCount(null);
      setPreviewProducts([]);
    } catch (error: any) {
      toast({
        title: 'Execution Failed',
        description: error.message || 'An error occurred during batch update.',
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Layers className="h-8 w-8 text-primary" />
          Batch Operations Engine
        </h1>
        <p className="text-muted-foreground mt-1">
          Perform bulk pricing adjustments, add/remove size specifications, update inventory, and manage categories across products in one click.
        </p>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Batch Task Builder
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Execution History ({history.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: BATCH TASK BUILDER */}
        <TabsContent value="builder" className="space-y-6">
          {/* STEP 1: SELECT TASK ACTION */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                Select Operation Type
              </CardTitle>
              <CardDescription>Choose the type of bulk task you want to execute.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div
                  onClick={() => setSelectedAction('PRICE_UPDATE')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-2 ${
                    selectedAction === 'PRICE_UPDATE'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600">
                    <IndianRupee className="h-6 w-6" />
                  </div>
                  <div className="font-semibold text-sm">Price Adjustment</div>
                  <p className="text-xs text-muted-foreground">Bulk update prices (e.g. ₹549 → ₹599)</p>
                </div>

                <div
                  onClick={() => setSelectedAction('ADD_SIZE')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-2 ${
                    selectedAction === 'ADD_SIZE' || selectedAction === 'REMOVE_SIZE'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="p-3 rounded-full bg-blue-500/10 text-blue-600">
                    <Ruler className="h-6 w-6" />
                  </div>
                  <div className="font-semibold text-sm">Size Specifications</div>
                  <p className="text-xs text-muted-foreground">Add or remove sizes (e.g. Add "XS")</p>
                </div>

                <div
                  onClick={() => setSelectedAction('STOCK_UPDATE')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-2 ${
                    selectedAction === 'STOCK_UPDATE'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="p-3 rounded-full bg-amber-500/10 text-amber-600">
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="font-semibold text-sm">Stock Level Update</div>
                  <p className="text-xs text-muted-foreground">Set or adjust inventory quantities</p>
                </div>

                <div
                  onClick={() => setSelectedAction('CATEGORY_ASSIGN')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-2 ${
                    selectedAction === 'CATEGORY_ASSIGN'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="p-3 rounded-full bg-purple-500/10 text-purple-600">
                    <Shapes className="h-6 w-6" />
                  </div>
                  <div className="font-semibold text-sm">Category Batching</div>
                  <p className="text-xs text-muted-foreground">Assign or unassign categories in bulk</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* STEP 2: CONFIGURE FILTER CRITERIA & PAYLOAD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FILTER TARGETING */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                  Target Product Filter
                </CardTitle>
                <CardDescription>Specify which products should be targeted by this operation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-secondary/30">
                  <div className="space-y-0.5">
                    <Label htmlFor="all-products-switch" className="font-medium">Target ALL Products</Label>
                    <p className="text-xs text-muted-foreground">Apply operation across the entire catalog</p>
                  </div>
                  <Switch
                    id="all-products-switch"
                    checked={allProducts}
                    onCheckedChange={setAllProducts}
                  />
                </div>

                {!allProducts && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="target-price">Exact Price Match (₹)</Label>
                      <Input
                        id="target-price"
                        type="number"
                        placeholder="e.g., 549"
                        value={targetPriceFilter}
                        onChange={(e) => setTargetPriceFilter(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Leave empty if matching by range or category instead.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price-min">Min Price (₹)</Label>
                        <Input
                          id="price-min"
                          type="number"
                          placeholder="Min"
                          value={priceMinFilter}
                          onChange={(e) => setPriceMinFilter(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price-max">Max Price (₹)</Label>
                        <Input
                          id="price-max"
                          type="number"
                          placeholder="Max"
                          value={priceMaxFilter}
                          onChange={(e) => setPriceMaxFilter(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category-filter">Category Filter</Label>
                      <Select
                        value={selectedCategoryFilter}
                        onValueChange={setSelectedCategoryFilter}
                        disabled={categoriesLoading}
                      >
                        <SelectTrigger id="category-filter">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="search-filter">Keyword / Name Match</Label>
                      <Input
                        id="search-filter"
                        placeholder="e.g., Shirt, Hoodie..."
                        value={searchQueryFilter}
                        onChange={(e) => setSearchQueryFilter(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* OPERATION ACTION DETAILS */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                  Operation Details & Values
                </CardTitle>
                <CardDescription>Configure the new values to apply to matched products.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedAction === 'PRICE_UPDATE' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-price">New Price (₹)</Label>
                      <Input
                        id="new-price"
                        type="number"
                        placeholder="e.g., 599"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="update-original-price"
                        checked={updateOriginalPrice}
                        onCheckedChange={setUpdateOriginalPrice}
                      />
                      <Label htmlFor="update-original-price" className="cursor-pointer">
                        Set Original Price equal to New Price
                      </Label>
                    </div>
                  </div>
                )}

                {(selectedAction === 'ADD_SIZE' || selectedAction === 'REMOVE_SIZE') && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="size-action">Size Operation</Label>
                      <Select
                        value={selectedAction}
                        onValueChange={(val) => setSelectedAction(val as TaskAction)}
                      >
                        <SelectTrigger id="size-action">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADD_SIZE">Add Size to Products</SelectItem>
                          <SelectItem value="REMOVE_SIZE">Remove Size from Products</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="size-val">Target Size</Label>
                      <Input
                        id="size-val"
                        placeholder="e.g., XS, S, M, L, XL, XXL, 3XL"
                        value={sizeInput}
                        onChange={(e) => setSizeInput(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        {selectedAction === 'ADD_SIZE'
                          ? `The size "${sizeInput || 'XS'}" will be safely appended to sizes arrays.`
                          : `The size "${sizeInput || 'XS'}" will be removed from sizes arrays.`}
                      </p>
                    </div>
                  </div>
                )}

                {selectedAction === 'STOCK_UPDATE' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock-mode">Stock Action Mode</Label>
                      <Select
                        value={stockMode}
                        onValueChange={(val: any) => setStockMode(val)}
                      >
                        <SelectTrigger id="stock-mode">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="set">Set Exact Stock Quantity</SelectItem>
                          <SelectItem value="add">Add Stock (Increase)</SelectItem>
                          <SelectItem value="subtract">Subtract Stock (Decrease)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stock-val">Quantity</Label>
                      <Input
                        id="stock-val"
                        type="number"
                        placeholder="100"
                        value={stockValue}
                        onChange={(e) => setStockValue(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {selectedAction === 'CATEGORY_ASSIGN' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category-mode">Category Operation</Label>
                      <Select
                        value={categoryMode}
                        onValueChange={(val: any) => setCategoryMode(val)}
                      >
                        <SelectTrigger id="category-mode">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="add">Add Categories to Products</SelectItem>
                          <SelectItem value="remove">Remove Categories from Products</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Select Target Categories</Label>
                      <div className="grid grid-cols-2 gap-2 border rounded-lg p-3 max-h-48 overflow-y-auto">
                        {categories.map((cat) => {
                          const isSelected = categoryIds.includes(cat.id);
                          return (
                            <div
                              key={cat.id}
                              onClick={() => {
                                setCategoryIds((prev) =>
                                  isSelected ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                                );
                              }}
                              className={`p-2 rounded border text-xs cursor-pointer flex items-center justify-between ${
                                isSelected ? 'border-primary bg-primary/10 font-semibold' : 'border-border'
                              }`}
                            >
                              <span>{cat.name}</span>
                              {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handlePreview}
                  disabled={isPreviewing}
                >
                  {isPreviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                  Preview Impact
                </Button>

                <Button
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={isExecuting || isPreviewing}
                >
                  <Play className="h-4 w-4" />
                  Execute Batch Task
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* STEP 3: PREVIEW IMPACT TABLE */}
          {previewCount !== null && (
            <Card className="border-primary/50 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    Impact Preview ({previewCount} Matched Products)
                  </CardTitle>
                  <CardDescription>
                    Review the first {previewProducts.length} matching products before running the batch update.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1 font-semibold">
                  {previewCount} Total Affected
                </Badge>
              </CardHeader>
              <CardContent>
                {previewProducts.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Current Price</TableHead>
                          <TableHead>Current Sizes</TableHead>
                          <TableHead>Current Stock</TableHead>
                          <TableHead className="text-right font-semibold text-primary">Proposed Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewProducts.map((product) => (
                          <TableRow key={product._id}>
                            <TableCell>
                              <Image
                                src={
                                  product.imageUrls && product.imageUrls.length > 0
                                    ? product.imageUrls[0]
                                    : 'https://placehold.co/40x40.png'
                                }
                                alt={product.name}
                                width={40}
                                height={40}
                                className="rounded object-cover"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>₹{product.price?.toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {(product.sizes || []).map((s) => (
                                  <Badge key={s} variant="outline" className="text-xs">
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>{product.stock ?? 'N/A'}</TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {selectedAction === 'PRICE_UPDATE' && (
                                <span className="text-emerald-600 font-bold">
                                  ₹{product.price} <ArrowRight className="inline h-3 w-3" /> ₹{newPrice}
                                </span>
                              )}
                              {selectedAction === 'ADD_SIZE' && (
                                <span className="text-blue-600 font-bold">+ Size "{sizeInput}"</span>
                              )}
                              {selectedAction === 'REMOVE_SIZE' && (
                                <span className="text-destructive font-bold">- Size "{sizeInput}"</span>
                              )}
                              {selectedAction === 'STOCK_UPDATE' && (
                                <span className="text-amber-600 font-bold">Stock → {stockValue}</span>
                              )}
                              {selectedAction === 'CATEGORY_ASSIGN' && (
                                <span className="text-purple-600 font-bold">Categories Modified</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No products matched the specified filter criteria.</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 2: EXECUTION HISTORY */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Batch Task Audit History</CardTitle>
              <CardDescription>Logs of all previously executed bulk batch operations.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Task Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Admin User</TableHead>
                      <TableHead className="text-right">Products Modified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-4 w-12" /></TableCell>
                        </TableRow>
                      ))
                    ) : history.length > 0 ? (
                      history.map((log) => (
                        <TableRow key={log._id}>
                          <TableCell>{format(new Date(log.executedAt), 'PPpp')}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{log.taskDescription}</TableCell>
                          <TableCell className="text-xs font-mono">{log.adminEmail}</TableCell>
                          <TableCell className="text-right font-bold">{log.modifiedCount}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No batch tasks executed yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CONFIRMATION DIALOG */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Batch Task Execution
            </AlertDialogTitle>
            <AlertDialogDescription asChild className="space-y-2 pt-2">
              <div className="text-sm text-muted-foreground space-y-2 pt-2">
                <p>
                  Are you sure you want to execute this bulk operation? This action will directly update matching products in the database.
                </p>
                <div className="p-3 bg-secondary rounded-lg text-xs font-mono text-foreground">
                  <div><strong>Action:</strong> {selectedAction}</div>
                  {selectedAction === 'PRICE_UPDATE' && <div><strong>Target Price:</strong> ₹{newPrice}</div>}
                  {(selectedAction === 'ADD_SIZE' || selectedAction === 'REMOVE_SIZE') && <div><strong>Size:</strong> {sizeInput}</div>}
                  <div><strong>Filter:</strong> {allProducts ? 'ALL PRODUCTS' : targetPriceFilter ? `Price = ₹${targetPriceFilter}` : 'Custom Criteria'}</div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleExecuteBatchTask} disabled={isExecuting}>
              {isExecuting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm & Execute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
