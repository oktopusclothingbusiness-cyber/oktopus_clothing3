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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useUser, User } from '@/context/user-context';
import {
  FileText,
  User as UserIcon,
  ShoppingBag,
  Plus,
  Trash2,
  Loader2,
  Mail,
  Send,
  CreditCard,
  CheckCircle2,
  Calendar,
  Sparkles,
  Search,
  Package,
  Users,
  X,
  ChevronsUpDown,
  Check,
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

export interface InvoiceLineItem {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color?: string;
  imageUrl?: string;
}

interface IssueInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedUserId?: string | null;
  onInvoiceIssued?: (invoice: any) => void;
}

export function IssueInvoiceDialog({
  open,
  onOpenChange,
  preselectedUserId,
  onInvoiceIssued,
}: IssueInvoiceDialogProps) {
  const { toast } = useToast();
  const { users: contextUsers, loading: usersLoading } = useUser();
  const [directUsers, setDirectUsers] = React.useState<User[]>([]);
  const [fetchingUsers, setFetchingUsers] = React.useState(false);

  // Combine direct fetched users with context users for 100% complete list
  const allUsers = React.useMemo(() => {
    if (directUsers.length > 0) return directUsers;
    return contextUsers;
  }, [directUsers, contextUsers]);

  // Mode: registered user or custom
  const [userMode, setUserMode] = React.useState<'registered' | 'custom'>('registered');
  const [selectedUserId, setSelectedUserId] = React.useState<string>('');
  const [userSearch, setUserSearch] = React.useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = React.useState(false);

  const selectedUser = React.useMemo(() => {
    if (!selectedUserId) return null;
    return allUsers.find((u) => u.id === selectedUserId || u._id === selectedUserId) || null;
  }, [allUsers, selectedUserId]);

  // Customer Form State
  const [customerName, setCustomerName] = React.useState('');
  const [customerEmail, setCustomerEmail] = React.useState('');
  const [customerMobile, setCustomerMobile] = React.useState('');
  const [customerAddress, setCustomerAddress] = React.useState('');

  // Invoice Details
  const [invoiceNumber, setInvoiceNumber] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [paymentStatus, setPaymentStatus] = React.useState<'paid' | 'pending'>('paid');
  const [paymentMethod, setPaymentMethod] = React.useState('upi');
  const [transactionRef, setTransactionRef] = React.useState('');
  const [dispatchMode, setDispatchMode] = React.useState('Express Shipping');
  const [notes, setNotes] = React.useState(
    'Thank you for your purchase with OKTOPUS CLOTHING! Official Tax Invoice verified by BASKEY Studio.'
  );

  // Line items
  const [items, setItems] = React.useState<InvoiceLineItem[]>([]);

  // Catalog picker
  const [catalogProducts, setCatalogProducts] = React.useState<ProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = React.useState(false);
  const [selectedCatalogId, setSelectedCatalogId] = React.useState('');
  const [selectedSize, setSelectedSize] = React.useState('M');
  const [itemPrice, setItemPrice] = React.useState<number | ''>('');
  const [itemQuantity, setItemQuantity] = React.useState<number>(1);

  // Custom line item mode
  const [isCustomItem, setIsCustomItem] = React.useState(false);
  const [customItemName, setCustomItemName] = React.useState('');
  const [customItemDesc, setCustomItemDesc] = React.useState('');

  // Financial Adjustments
  const [discount, setDiscount] = React.useState<number | ''>(0);
  const [shipping, setShipping] = React.useState<number | ''>(0);

  // Email Delivery
  const [sendEmail, setSendEmail] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Generate fresh invoice number and fetch all users & products when opened
  React.useEffect(() => {
    if (open) {
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      setInvoiceNumber(`OKT-INV-${randomCode}`);

      // Set default due date to 7 days from now
      const due = new Date();
      due.setDate(due.getDate() + 7);
      setDueDate(due.toISOString().split('T')[0]);

      // Direct load all registered users
      setFetchingUsers(true);
      fetch('/api/users')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) {
            const mapped = data.map((u: any) => ({
              ...u,
              id: u._id ? u._id.toString() : (u.id || ''),
            }));
            setDirectUsers(mapped);
          }
        })
        .catch((err) => console.warn('Could not fetch registered users:', err))
        .finally(() => setFetchingUsers(false));

      // Fetch products if not loaded
      if (catalogProducts.length === 0) {
        setLoadingProducts(true);
        fetch('/api/products')
          .then((res) => res.json())
          .then((data) => setCatalogProducts(Array.isArray(data) ? data : []))
          .catch((err) => console.error('Failed to load products for invoice:', err))
          .finally(() => setLoadingProducts(false));
      }
    }
  }, [open, catalogProducts.length]);

  // Handle preselected user if provided
  React.useEffect(() => {
    if (open && preselectedUserId && allUsers.length > 0) {
      const matched = allUsers.find((u) => u.id === preselectedUserId || u._id === preselectedUserId);
      if (matched) {
        setSelectedUserId(matched.id || matched._id);
        setUserMode('registered');
        setCustomerName(`${matched.firstName || ''} ${matched.lastName || ''}`.trim() || 'Customer');
        setCustomerEmail(matched.email || '');
        setCustomerMobile(matched.mobile || '');
        setCustomerAddress(matched.address || 'Standard Shipping Address');
      }
    }
  }, [open, preselectedUserId, allUsers]);

  // When registered user selected
  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    const u = allUsers.find((user) => user.id === userId || user._id === userId);
    if (u) {
      setCustomerName(`${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Customer');
      setCustomerEmail(u.email || '');
      setCustomerMobile(u.mobile || '');
      setCustomerAddress(u.address || 'Standard Shipping Address');
    }
  };

  // Filtered users for search - Includes ALL users without any truncation!
  const filteredUsers = React.useMemo(() => {
    if (!userSearch.trim()) return allUsers;
    const q = userSearch.toLowerCase().trim();
    return allUsers.filter((u) => {
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const mobile = (u.mobile || '').toLowerCase();
      return fullName.includes(q) || email.includes(q) || mobile.includes(q);
    });
  }, [allUsers, userSearch]);

  // Catalog item change
  const currentProduct = React.useMemo(() => {
    return catalogProducts.find((p) => p._id === selectedCatalogId);
  }, [catalogProducts, selectedCatalogId]);

  React.useEffect(() => {
    if (currentProduct) {
      setItemPrice(Number(currentProduct.price) || 0);
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

  // Add Item to Invoice
  const handleAddItem = () => {
    if (isCustomItem) {
      if (!customItemName.trim()) {
        toast({ title: 'Item name required', description: 'Please enter a name for the custom item.', variant: 'destructive' });
        return;
      }
      const priceNum = Number(itemPrice) || 0;
      if (priceNum <= 0) {
        toast({ title: 'Invalid price', description: 'Item price must be greater than 0.', variant: 'destructive' });
        return;
      }
      setItems((prev) => [
        ...prev,
        {
          name: customItemName.trim(),
          price: priceNum,
          quantity: Math.max(1, Number(itemQuantity) || 1),
          size: selectedSize || 'Standard',
          color: customItemDesc.trim(),
        },
      ]);
      setCustomItemName('');
      setCustomItemDesc('');
      setItemPrice('');
      setItemQuantity(1);
    } else {
      if (!currentProduct) {
        toast({ title: 'Select a product', description: 'Please choose a product from the catalog.', variant: 'destructive' });
        return;
      }
      const priceNum = Number(itemPrice) || 0;
      if (priceNum <= 0) {
        toast({ title: 'Invalid price', description: 'Item price must be greater than 0.', variant: 'destructive' });
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
          quantity: Math.max(1, Number(itemQuantity) || 1),
          size: selectedSize || 'Free Size',
          imageUrl: img,
        },
      ]);
      setSelectedCatalogId('');
      setItemPrice('');
      setItemQuantity(1);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Live financial totals
  const subtotal = React.useMemo(() => {
    return items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  }, [items]);

  const discountAmount = React.useMemo(() => {
    return Math.max(0, Number(discount) || 0);
  }, [discount]);

  const shippingAmount = React.useMemo(() => {
    return Math.max(0, Number(shipping) || 0);
  }, [shipping]);

  const grandTotal = React.useMemo(() => {
    return Math.max(0, subtotal + shippingAmount - discountAmount);
  }, [subtotal, shippingAmount, discountAmount]);

  const resetForm = () => {
    setSelectedUserId('');
    setUserSearch('');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerMobile('');
    setCustomerAddress('');
    setItems([]);
    setDiscount(0);
    setShipping(0);
    setPaymentStatus('paid');
    setPaymentMethod('upi');
    setTransactionRef('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast({ title: 'Customer Name Required', description: 'Please specify the customer name.', variant: 'destructive' });
      return;
    }

    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      toast({ title: 'Valid Email Required', description: 'Please provide a valid recipient email for the invoice.', variant: 'destructive' });
      return;
    }

    if (items.length === 0) {
      toast({ title: 'No Line Items', description: 'Please add at least one product or item to the invoice.', variant: 'destructive' });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        userId: userMode === 'registered' && selectedUserId ? selectedUserId : undefined,
        customer: {
          name: customerName.trim(),
          email: customerEmail.trim(),
          mobile: customerMobile.trim(),
          address: customerAddress.trim() || 'Standard Delivery',
        },
        orderId: invoiceNumber.trim(),
        customInvoiceNumber: invoiceNumber.trim(),
        products: items,
        subtotal,
        discount: discountAmount,
        shipping: shippingAmount,
        total: grandTotal,
        paymentDetails: {
          paymentStatus,
          paymentMethod,
          transactionRef: transactionRef.trim(),
        },
        dueDate: dueDate ? new Date(dueDate) : undefined,
        dispatchMode,
        notes: notes.trim(),
        sendEmail,
      };

      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to issue invoice.');
      }

      toast({
        title: 'Invoice Issued Successfully!',
        description: data.message || `Invoice #${invoiceNumber} issued for ${customerName} (₹${grandTotal.toFixed(2)}).`,
      });

      resetForm();
      onOpenChange(false);
      if (onInvoiceIssued) {
        onInvoiceIssued(data.invoice);
      }
    } catch (error: any) {
      console.error('Failed to issue invoice:', error);
      toast({
        title: 'Error Issuing Invoice',
        description: error.message || 'An error occurred while creating or sending the invoice.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6 sm:p-7">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-primary">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">Issue Official Tax Invoice</DialogTitle>
              <DialogDescription className="text-xs">
                Issue a custom or order-linked tax invoice to a specific customer with automatic PDF generation and email delivery.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-3">
          {/* SECTION 1: CUSTOMER SELECTION */}
          <div className="space-y-3 p-4 rounded-xl border bg-muted/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Recipient & Customer Details
                </h3>
              </div>

              {/* Mode switch pills */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs">
                <Button
                  type="button"
                  size="sm"
                  variant={userMode === 'registered' ? 'default' : 'ghost'}
                  className="h-7 text-xs px-2.5"
                  onClick={() => setUserMode('registered')}
                >
                  Registered User
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={userMode === 'custom' ? 'default' : 'ghost'}
                  className="h-7 text-xs px-2.5"
                  onClick={() => {
                    setUserMode('custom');
                    setSelectedUserId('');
                  }}
                >
                  Custom Customer
                </Button>
              </div>
            </div>

            {/* If registered user: Dropdown Menu with Search */}
            {userMode === 'registered' && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span>Select Registered Customer</span>
                  </Label>
                  {selectedUser && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUserId('');
                        setCustomerName('');
                        setCustomerEmail('');
                        setCustomerMobile('');
                        setCustomerAddress('');
                      }}
                      className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                {/* Dropdown Menu Trigger & Popover */}
                <Popover open={isUserDropdownOpen} onOpenChange={setIsUserDropdownOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={isUserDropdownOpen}
                      className="w-full justify-between h-10 px-3 text-xs bg-background hover:bg-muted/40 font-normal border-input"
                    >
                      {selectedUser ? (
                        <div className="flex items-center gap-2 truncate">
                          <UserIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="font-semibold text-foreground truncate">
                            {selectedUser.firstName} {selectedUser.lastName}
                          </span>
                          <span className="text-muted-foreground font-mono text-[11px] truncate">
                            ({selectedUser.email})
                          </span>
                          {selectedUser.role === 'admin' && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                              Admin
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Search className="w-3.5 h-3.5 text-muted-foreground/70" />
                          {fetchingUsers ? 'Loading registered users...' : `Select or search customer (${allUsers.length} available)...`}
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] min-w-[320px] max-w-[550px] p-0 z-[100] shadow-xl border bg-popover"
                    align="start"
                  >
                    {/* Search Input inside Dropdown */}
                    <div className="p-2 border-b bg-muted/40">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search by name, email, or mobile..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="pl-8 pr-8 text-xs h-8 bg-background"
                          autoFocus
                        />
                        {userSearch && (
                          <button
                            type="button"
                            onClick={() => setUserSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Scrollable List of Filtered Users in Dropdown */}
                    <div className="max-h-60 overflow-y-auto divide-y">
                      {fetchingUsers && allUsers.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                          <span>Loading registered users...</span>
                        </div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                          No registered user found matching &quot;{userSearch}&quot;.
                        </div>
                      ) : (
                        filteredUsers.map((u) => {
                          const uid = u.id || u._id;
                          const isSelected = selectedUserId === uid;
                          return (
                            <button
                              key={uid}
                              type="button"
                              onClick={() => {
                                handleSelectUser(uid);
                                setIsUserDropdownOpen(false);
                                setUserSearch('');
                              }}
                              className={`w-full text-left p-2.5 flex items-center justify-between text-xs transition-colors hover:bg-muted/70 ${
                                isSelected ? 'bg-primary/10 font-medium' : ''
                              }`}
                            >
                              <div className="flex flex-col truncate pr-2">
                                <span className="font-semibold text-foreground flex items-center gap-1.5 truncate">
                                  {u.firstName} {u.lastName}
                                  {u.role === 'admin' && (
                                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                                      Admin
                                    </Badge>
                                  )}
                                </span>
                                <span className="text-[11px] text-muted-foreground font-mono truncate">{u.email}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {u.mobile && (
                                  <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded hidden sm:inline">
                                    {u.mobile}
                                  </span>
                                )}
                                {isSelected ? (
                                  <Check className="w-4 h-4 text-primary shrink-0" />
                                ) : null}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Dropdown Footer */}
                    <div className="p-2 px-3 border-t bg-muted/20 text-[11px] text-muted-foreground flex justify-between items-center">
                      <span>
                        Showing {filteredUsers.length} of {allUsers.length} registered users
                      </span>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Editable Customer Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <Label htmlFor="cust_name" className="text-xs">
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cust_name"
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="text-xs h-9 bg-background"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cust_email" className="text-xs">
                  Email Address <span className="text-destructive">*</span>
                  <span className="text-muted-foreground ml-1">(Invoice will be emailed here)</span>
                </Label>
                <Input
                  id="cust_email"
                  type="email"
                  placeholder="e.g. customer@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="text-xs h-9 bg-background"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cust_mobile" className="text-xs">
                  Phone Number
                </Label>
                <Input
                  id="cust_mobile"
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  className="text-xs h-9 bg-background"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cust_address" className="text-xs">
                  Billing / Shipping Address
                </Label>
                <Input
                  id="cust_address"
                  placeholder="e.g. 101 Park Street, Kolkata, West Bengal"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="text-xs h-9 bg-background"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: INVOICE IDENTIFIERS & PAYMENT TERMS */}
          <div className="space-y-3 p-4 rounded-xl border bg-muted/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b pb-2.5">
              <Calendar className="w-4 h-4 text-primary" /> Invoice Meta & Payment Terms
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="inv_num" className="text-xs">
                  Order ID / Invoice Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="inv_num"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="text-xs font-mono font-bold h-9 bg-background"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="due_date" className="text-xs">
                  Payment Due Date
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-xs h-9 bg-background"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Payment Status</Label>
                <Select
                  value={paymentStatus}
                  onValueChange={(val: 'paid' | 'pending') => setPaymentStatus(val)}
                >
                  <SelectTrigger className="text-xs h-9 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid" className="text-xs text-emerald-600 font-semibold">
                      Paid (Fully Settled)
                    </SelectItem>
                    <SelectItem value="pending" className="text-xs text-amber-600 font-semibold">
                      Pending (Payment Due)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="text-xs h-9 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi" className="text-xs">UPI / GPay / PhonePe</SelectItem>
                    <SelectItem value="bank_transfer" className="text-xs">Bank Transfer (NEFT / IMPS)</SelectItem>
                    <SelectItem value="cash" className="text-xs">Cash Payment</SelectItem>
                    <SelectItem value="card" className="text-xs">Credit / Debit Card</SelectItem>
                    <SelectItem value="razorpay" className="text-xs">Razorpay Gateway</SelectItem>
                    <SelectItem value="other" className="text-xs">Other / Store Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="tx_ref" className="text-xs">
                  Transaction / UTR Reference <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="tx_ref"
                  placeholder="e.g. UTR1928374 or pay_Oki91823"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="text-xs font-mono h-9 bg-background"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Dispatch Mode</Label>
                <Select value={dispatchMode} onValueChange={setDispatchMode}>
                  <SelectTrigger className="text-xs h-9 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Express Shipping" className="text-xs">Express Shipping</SelectItem>
                    <SelectItem value="Standard Delivery" className="text-xs">Standard Delivery</SelectItem>
                    <SelectItem value="In-Store Pickup" className="text-xs">In-Store Pickup</SelectItem>
                    <SelectItem value="Digital Delivery" className="text-xs">Digital / Electronic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* SECTION 3: LINE ITEMS SELECTOR */}
          <div className="space-y-3 p-4 rounded-xl border bg-muted/20">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-primary" /> Invoice Line Items ({items.length})
              </h3>
              <div className="flex items-center gap-1 text-xs">
                <Button
                  type="button"
                  variant={!isCustomItem ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => setIsCustomItem(false)}
                >
                  <Package className="w-3.5 h-3.5 mr-1" /> From Catalog
                </Button>
                <Button
                  type="button"
                  variant={isCustomItem ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => setIsCustomItem(true)}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Custom Item
                </Button>
              </div>
            </div>

            {/* Item Input Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end pt-1">
              {!isCustomItem ? (
                <>
                  <div className="sm:col-span-5 space-y-1">
                    <Label className="text-xs">Catalog Product</Label>
                    <Select
                      value={selectedCatalogId}
                      onValueChange={setSelectedCatalogId}
                      disabled={loadingProducts}
                    >
                      <SelectTrigger className="text-xs h-9 bg-background">
                        <SelectValue placeholder={loadingProducts ? 'Loading catalog...' : 'Select store product'} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {catalogProducts.map((p) => (
                          <SelectItem key={p._id} value={p._id} className="text-xs">
                            {p.name} — ₹{p.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-xs">Size</Label>
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger className="text-xs h-9 bg-background">
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
                </>
              ) : (
                <>
                  <div className="sm:col-span-4 space-y-1">
                    <Label className="text-xs">Custom Item / Service Name</Label>
                    <Input
                      placeholder="e.g. Custom Bulk Screenprint Setup"
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      className="text-xs h-9 bg-background"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <Label className="text-xs">Description / Color / Note</Label>
                    <Input
                      placeholder="e.g. Black / Gold Foil Print"
                      value={customItemDesc}
                      onChange={(e) => setCustomItemDesc(e.target.value)}
                      className="text-xs h-9 bg-background"
                    />
                  </div>
                </>
              )}

              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">Unit Price (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Price"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="text-xs font-mono h-9 bg-background"
                />
              </div>

              <div className="sm:col-span-1 space-y-1">
                <Label className="text-xs">Qty</Label>
                <Input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="text-xs h-9 bg-background font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <Button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full text-xs h-9 gap-1 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </Button>
              </div>
            </div>

            {/* Table of added items */}
            <div className="border rounded-lg overflow-hidden bg-background mt-3">
              {items.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-1.5">
                  <ShoppingBag className="w-7 h-7 text-muted-foreground/40" />
                  <span className="font-medium">No line items added to this invoice yet.</span>
                  <span className="text-[11px]">Select a catalog product or custom item above and click &quot;Add Item&quot;.</span>
                </div>
              ) : (
                <div className="divide-y text-xs">
                  <div className="grid grid-cols-12 gap-2 p-2.5 font-semibold bg-muted/60 text-muted-foreground text-[11px] uppercase tracking-wider">
                    <span className="col-span-5">Description</span>
                    <span className="col-span-2 text-center">Variant / Size</span>
                    <span className="col-span-2 text-right">Unit Price</span>
                    <span className="col-span-1 text-center">Qty</span>
                    <span className="col-span-1 text-right">Amount</span>
                    <span className="col-span-1 text-right">Action</span>
                  </div>
                  {items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 p-2.5 items-center hover:bg-muted/10 transition-colors">
                      <div className="col-span-5 font-medium truncate flex items-center gap-2">
                        {it.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.imageUrl} alt={it.name} className="w-7 h-7 rounded object-cover border shrink-0" />
                        )}
                        <span className="truncate">{it.name}</span>
                      </div>
                      <span className="col-span-2 text-center font-mono text-[11px] bg-muted/50 px-1.5 py-0.5 rounded truncate">
                        {it.size}{it.color ? ` • ${it.color}` : ''}
                      </span>
                      <span className="col-span-2 text-right font-mono">₹{it.price.toFixed(2)}</span>
                      <span className="col-span-1 text-center font-bold font-mono">{it.quantity}</span>
                      <span className="col-span-1 text-right font-semibold font-mono text-foreground">
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

          {/* SECTION 4: FINANCIAL SUMMARY & DISCOUNTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3 p-4 rounded-xl border bg-muted/20">
              <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Invoice Notes & Terms for Customer
              </Label>
              <Textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add special instructions, warranty info or terms..."
                className="text-xs bg-background resize-none"
              />

              {/* Email Send Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-background mt-2">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    <span>Send invoice email to customer</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Automatically sends the official HTML Tax Invoice email with attached PDF.
                  </p>
                </div>
                <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="p-4 rounded-xl border bg-card flex flex-col justify-between space-y-3 shadow-xs">
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1.5">
                  Financial Calculation
                </h3>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal ({items.length} items):</span>
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

                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">Shipping Fee (₹):</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={shipping}
                    onChange={(e) => setShipping(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-24 h-7 text-xs text-right font-mono"
                  />
                </div>

                <div className="border-t pt-2 flex justify-between items-baseline">
                  <span className="text-sm font-bold">Total Invoiced:</span>
                  <span className="text-2xl font-black font-mono text-primary">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {sendEmail && customerEmail && (
                <div className="text-[11px] p-2 rounded-lg border border-primary/20 bg-primary/5 text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">Will send PDF invoice to <strong>{customerEmail}</strong></span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t">
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Issuing & Dispatching...
                </>
              ) : sendEmail ? (
                <>
                  <Send className="w-4 h-4" /> Issue & Send Invoice (₹{grandTotal.toFixed(2)})
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Issue Invoice (₹{grandTotal.toFixed(2)})
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
