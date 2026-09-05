'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Loader2,
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';

interface ProductItem {
  _id: string;
  name: string;
  price: number;
  stock?: number;
  sizes?: string[] | string;
  imageUrls?: string[];
  imageUrl?: string;
}

interface SelectedItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color?: string;
  imageUrl?: string;
}

interface OfflineSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated?: () => void;
}

export function OfflineSaleDialog({
  open,
  onOpenChange,
  onOrderCreated,
}: OfflineSaleDialogProps) {
  const { toast } = useToast();

  // Products from catalog
  const [products, setProducts] = React.useState<ProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = React.useState(false);

  // Customer Form State
  const [customerName, setCustomerName] = React.useState('');
  const [customerMobile, setCustomerMobile] = React.useState('');
  const [customerEmail, setCustomerEmail] = React.useState('');
  const [customerAddress, setCustomerAddress] = React.useState('');

  // Item Picker State
  const [selectedProductId, setSelectedProductId] = React.useState('');
  const [selectedSize, setSelectedSize] = React.useState('M');
  const [unitPrice, setUnitPrice] = React.useState<number | ''>('');
  const [quantity, setQuantity] = React.useState<number>(1);

  // Cart Items
  const [items, setItems] = React.useState<SelectedItem[]>([]);

  // Payment & Details State
  const [paymentMethod, setPaymentMethod] = React.useState('cash');
  const [orderStatus, setOrderStatus] = React.useState('delivered');
  const [discount, setDiscount] = React.useState<number | ''>(0);
  const [notes, setNotes] = React.useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch products on dialog open
  React.useEffect(() => {
    if (open) {
      const loadProducts = async () => {
        try {
          setLoadingProducts(true);
          const res = await fetch('/api/products');
          if (res.ok) {
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          console.error('Failed to load products for offline sale:', err);
        } finally {
          setLoadingProducts(false);
        }
      };
      loadProducts();
    }
  }, [open]);

  // When selected product changes, update price and available sizes
  const currentProduct = React.useMemo(() => {
    return products.find((p) => p._id === selectedProductId);
  }, [products, selectedProductId]);

  React.useEffect(() => {
    if (currentProduct) {
      setUnitPrice(Number(currentProduct.price) || 0);
      let availSizes: string[] = [];
      if (Array.isArray(currentProduct.sizes)) {
        availSizes = currentProduct.sizes;
      } else if (typeof currentProduct.sizes === 'string') {
        availSizes = currentProduct.sizes.split(',').map((s) => s.trim());
      }
      if (availSizes.length > 0) {
        setSelectedSize(availSizes[0]);
      } else {
        setSelectedSize('Free Size');
      }
    }
  }, [currentProduct]);

  const availableSizes = React.useMemo(() => {
    if (!currentProduct) return ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
    if (Array.isArray(currentProduct.sizes) && currentProduct.sizes.length > 0) {
      return currentProduct.sizes;
    }
    if (typeof currentProduct.sizes === 'string' && currentProduct.sizes.trim()) {
      return currentProduct.sizes.split(',').map((s) => s.trim());
    }
    return ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  }, [currentProduct]);

  const handleAddItem = () => {
    if (!currentProduct) {
      toast({
        title: 'Select a product',
        description: 'Please select a product from the list first.',
        variant: 'destructive',
      });
      return;
    }

    const priceNum = Number(unitPrice) || 0;
    if (priceNum <= 0) {
      toast({
        title: 'Invalid price',
        description: 'Please enter a valid price for the item.',
        variant: 'destructive',
      });
      return;
    }

    const qtyNum = Number(quantity) || 1;
    if (qtyNum <= 0) {
      toast({
        title: 'Invalid quantity',
        description: 'Quantity must be at least 1.',
        variant: 'destructive',
      });
      return;
    }

    const img =
      (Array.isArray(currentProduct.imageUrls) && currentProduct.imageUrls[0]) ||
      currentProduct.imageUrl ||
      '';

    setItems((prev) => [
      ...prev,
      {
        productId: currentProduct._id,
        name: currentProduct.name,
        price: priceNum,
        quantity: qtyNum,
        size: selectedSize || 'Free Size',
        imageUrl: img,
      },
    ]);

    // Reset picker
    setSelectedProductId('');
    setUnitPrice('');
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Live totals
  const subtotal = React.useMemo(() => {
    return items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  }, [items]);

  const discountAmount = React.useMemo(() => {
    return Math.max(0, Number(discount) || 0);
  }, [discount]);

  const grandTotal = React.useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const resetForm = () => {
    setCustomerName('');
    setCustomerMobile('');
    setCustomerEmail('');
    setCustomerAddress('');
    setSelectedProductId('');
    setUnitPrice('');
    setQuantity(1);
    setItems([]);
    setPaymentMethod('cash');
    setOrderStatus('delivered');
    setDiscount(0);
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast({
        title: 'Customer Name required',
        description: 'Please enter the customer name.',
        variant: 'destructive',
      });
      return;
    }

    if (!customerMobile.trim()) {
      toast({
        title: 'Mobile number required',
        description: 'Please enter the customer mobile number.',
        variant: 'destructive',
      });
      return;
    }

    if (!customerAddress.trim()) {
      toast({
        title: 'Address required',
        description: 'Please enter an address or click "In-Store Walk-in".',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'No products selected',
        description: 'Please select and add at least one product to the sale.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        customer: {
          name: customerName.trim(),
          mobile: customerMobile.trim(),
          email: customerEmail.trim() || undefined,
          address: customerAddress.trim(),
        },
        items: items.map((it) => ({
          productId: it.productId,
          name: it.name,
          quantity: it.quantity,
          price: it.price,
          size: it.size,
          imageUrl: it.imageUrl,
        })),
        paymentMethod,
        orderStatus,
        discount: discountAmount,
        notes: notes.trim(),
      };

      const response = await fetch('/api/admin/orders/offline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Secret': 'okto_mobile_sec_2026_prod',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to record offline sale.');
      }

      toast({
        title: 'Offline Sale Recorded',
        description: `Order #${(data.orderId || '').slice(-6)} created for ${customerName} (₹${grandTotal.toFixed(2)}).`,
      });

      resetForm();
      onOpenChange(false);
      if (onOrderCreated) {
        onOrderCreated();
      }
    } catch (error: any) {
      console.error('Error saving offline sale:', error);
      toast({
        title: 'Failed to record sale',
        description: error.message || 'Could not save the offline order.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Store className="w-5 h-5" />
            <DialogTitle className="text-xl">Record Offline / POS Sale</DialogTitle>
          </div>
          <DialogDescription>
            Record in-store counter purchases. This generates a normal order invoice and automatically decrements inventory stock.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Section 1: Customer Details */}
          <div className="space-y-3 p-4 rounded-xl border bg-muted/30">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" /> Customer Information
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-7 gap-1"
                onClick={() => setCustomerAddress('In-Store Walk-in Counter Sale')}
              >
                <MapPin className="w-3 h-3" /> Set In-Store Walk-in
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cust_name" className="text-xs">
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cust_name"
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cust_mobile" className="text-xs">
                  Mobile Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cust_mobile"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cust_email" className="text-xs">
                  Email Address <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="cust_email"
                  type="email"
                  placeholder="e.g. rahul@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cust_address" className="text-xs">
                  Address / City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cust_address"
                  placeholder="e.g. In-Store Walk-in or Customer Home Address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Product Selector */}
          <div className="space-y-3 p-4 rounded-xl border bg-muted/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-primary" /> Select Sold Products
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5 space-y-1">
                <Label className="text-xs">Choose Product</Label>
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                  disabled={loadingProducts}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder={loadingProducts ? 'Loading catalog...' : 'Select a product'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {products.map((p) => (
                      <SelectItem key={p._id} value={p._id} className="text-xs">
                        {p.name} — ₹{p.price} {typeof p.stock === 'number' ? `(Stock: ${p.stock})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">Size</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSizes.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">Price (₹)</Label>
                <Input
                  type="number"
                  placeholder="Price"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="text-xs"
                />
              </div>

              <div className="sm:col-span-1 space-y-1">
                <Label className="text-xs">Qty</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <Button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full text-xs h-9 bg-primary hover:bg-primary/90 flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
            </div>

            {/* Selected Items Table */}
            <div className="mt-3 border rounded-lg overflow-hidden bg-background">
              {items.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-1">
                  <ShoppingBag className="w-6 h-6 stroke-[1.5] text-muted-foreground/60" />
                  <span>No products added to this sale yet.</span>
                  <span className="text-[11px]">Select a product above and click &quot;Add&quot;.</span>
                </div>
              ) : (
                <div className="divide-y text-xs">
                  <div className="grid grid-cols-12 gap-2 p-2.5 font-semibold bg-muted/50 text-muted-foreground text-[11px]">
                    <span className="col-span-5">Product</span>
                    <span className="col-span-2 text-center">Size</span>
                    <span className="col-span-2 text-right">Price</span>
                    <span className="col-span-1 text-center">Qty</span>
                    <span className="col-span-1 text-right">Total</span>
                    <span className="col-span-1 text-right">Action</span>
                  </div>
                  {items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 p-2.5 items-center">
                      <div className="col-span-5 font-medium truncate flex items-center gap-2">
                        {it.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={it.imageUrl}
                            alt={it.name}
                            className="w-7 h-7 rounded object-cover border"
                          />
                        )}
                        <span className="truncate">{it.name}</span>
                      </div>
                      <span className="col-span-2 text-center font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
                        {it.size}
                      </span>
                      <span className="col-span-2 text-right font-mono">₹{it.price.toFixed(2)}</span>
                      <span className="col-span-1 text-center font-bold">{it.quantity}</span>
                      <span className="col-span-1 text-right font-semibold font-mono">
                        ₹{(it.price * it.quantity).toFixed(2)}
                      </span>
                      <div className="col-span-1 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveItem(idx)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Payment, Status & Billing Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3 p-4 rounded-xl border bg-muted/30">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-primary" /> Payment & Status
              </h3>

              <div className="space-y-1">
                <Label className="text-xs">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash" className="text-xs">Cash Payment</SelectItem>
                    <SelectItem value="upi" className="text-xs">UPI / QR Code (GPay / PhonePe / Paytm)</SelectItem>
                    <SelectItem value="card" className="text-xs">Card / POS Machine</SelectItem>
                    <SelectItem value="other" className="text-xs">Other / Store Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Order Status</Label>
                <Select value={orderStatus} onValueChange={setOrderStatus}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivered" className="text-xs">Delivered (Completed in-store)</SelectItem>
                    <SelectItem value="accepted" className="text-xs">Accepted / Packaging</SelectItem>
                    <SelectItem value="pending" className="text-xs">Pending Confirmation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="notes" className="text-xs">
                  Store Notes / Receipt Info <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="notes"
                  placeholder="e.g. Counter 1, Invoice Slip #45"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Bill Calculation Box */}
            <div className="p-4 rounded-xl border bg-card flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Order Summary
                </h3>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'}):</span>
                  <span className="font-mono font-medium text-foreground">₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">Discount (₹):</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-24 h-7 text-xs text-right font-mono"
                  />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Store Shipping / Pickup:</span>
                  <span className="font-mono text-emerald-600 font-medium">FREE</span>
                </div>

                <div className="border-t pt-2 flex justify-between items-baseline">
                  <span className="text-sm font-bold">Grand Total:</span>
                  <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Product stocks will be decremented automatically upon recording.</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Recording Sale...
                </>
              ) : (
                <>
                  <Store className="w-4 h-4" /> Record Offline Sale (₹{grandTotal.toFixed(2)})
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
