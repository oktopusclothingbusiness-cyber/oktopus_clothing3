'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  FileText,
  PlusCircle,
  Search,
  RefreshCw,
  Mail,
  Send,
  Download,
  ExternalLink,
  CheckCircle2,
  Clock,
  Trash2,
  MoreVertical,
  DollarSign,
  TrendingUp,
  Copy,
  Check,
  User,
  AlertCircle,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { IssueInvoiceDialog } from '@/components/admin/issue-invoice-dialog';

interface InvoiceItem {
  _id: string;
  invoiceNumber: string;
  userId?: string;
  customer: {
    name: string;
    email: string;
    mobile?: string;
    address?: string;
  };
  products: {
    name: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentDetails: {
    paymentStatus: 'paid' | 'pending';
    paymentMethod?: string;
    transactionRef?: string;
    paidAt?: string;
  };
  notes?: string;
  dueDate?: string;
  createdAt: string;
  emailSent?: boolean;
  emailSentAt?: string;
  lastEmailError?: string;
}

interface InvoiceStats {
  totalCount: number;
  totalAmount: number;
  paidCount: number;
  paidAmount: number;
  pendingCount: number;
  pendingAmount: number;
  sentCount: number;
}

export default function AdminInvoicesPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = React.useState<InvoiceItem[]>([]);
  const [stats, setStats] = React.useState<InvoiceStats>({
    totalCount: 0,
    totalAmount: 0,
    paidCount: 0,
    paidAmount: 0,
    pendingCount: 0,
    pendingAmount: 0,
    sentCount: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'paid' | 'pending'>('all');

  // Issue Dialog State
  const [isIssueModalOpen, setIsIssueModalOpen] = React.useState(false);
  const [sendingEmailId, setSendingEmailId] = React.useState<string | null>(null);

  // Delete State
  const [invoiceToDelete, setInvoiceToDelete] = React.useState<InvoiceItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Copy Feedback
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const fetchInvoices = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`/api/admin/invoices?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load invoices.');
      const data = await res.json();
      setInvoices(data.invoices || []);
      if (data.stats) setStats(data.stats);
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error loading invoices',
        description: error.message || 'Could not fetch invoices from server.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, toast]);

  React.useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: 'Copied to clipboard', description: text });
  };

  const handleSendEmail = async (invoice: InvoiceItem) => {
    try {
      setSendingEmailId(invoice._id);
      const res = await fetch(`/api/admin/invoices/${invoice._id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: invoice.customer.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to dispatch email.');

      toast({
        title: 'Invoice Email Sent!',
        description: `Tax invoice with PDF attachment dispatched to ${invoice.customer.email}.`,
      });

      // Update local item
      setInvoices((prev) =>
        prev.map((inv) =>
          inv._id === invoice._id
            ? { ...inv, emailSent: true, emailSentAt: new Date().toISOString() }
            : inv
        )
      );
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Email Delivery Failed',
        description: error.message || 'Could not send invoice email.',
        variant: 'destructive',
      });
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleTogglePaymentStatus = async (invoice: InvoiceItem) => {
    const nextStatus = invoice.paymentDetails.paymentStatus === 'paid' ? 'pending' : 'paid';
    try {
      const res = await fetch(`/api/admin/invoices/${invoice._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: nextStatus }),
      });

      if (!res.ok) throw new Error('Failed to update payment status.');

      toast({
        title: 'Status Updated',
        description: `Invoice #${invoice.invoiceNumber} marked as ${nextStatus.toUpperCase()}.`,
      });

      setInvoices((prev) =>
        prev.map((inv) =>
          inv._id === invoice._id
            ? {
                ...inv,
                paymentDetails: { ...inv.paymentDetails, paymentStatus: nextStatus },
              }
            : inv
        )
      );
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/invoices/${invoiceToDelete._id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete invoice.');

      toast({
        title: 'Invoice Deleted',
        description: `Invoice #${invoiceToDelete.invoiceNumber} removed from database.`,
      });

      setInvoices((prev) => prev.filter((inv) => inv._id !== invoiceToDelete._id));
      setInvoiceToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-primary" /> Invoices Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Issue official tax invoices directly to registered customers or walk-in clients with instant PDF generation and email delivery.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInvoices}
            disabled={loading}
            className="text-xs gap-1.5 h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsIssueModalOpen(true)}
            className="text-xs gap-1.5 h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
          >
            <PlusCircle className="w-4 h-4" /> Issue New Invoice
          </Button>
        </div>
      </div>

      {/* METRIC STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs border-muted/50 bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>Total Invoiced</span>
              <DollarSign className="w-4 h-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl font-black font-mono text-foreground">
              ₹{stats.totalAmount.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">
              {stats.totalCount} {stats.totalCount === 1 ? 'invoice' : 'invoices'} issued
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
              <span>Paid & Settled</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              ₹{stats.paidAmount.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">
              {stats.paidCount} settled invoices
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center justify-between">
              <span>Pending Due</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
              ₹{stats.pendingAmount.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">
              {stats.pendingCount} awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center justify-between">
              <span>Emails Sent</span>
              <Mail className="w-4 h-4 text-blue-600" />
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
              {stats.sentCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">
              Delivered with PDF invoice
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <Card className="shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by invoice #, customer, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9 bg-background"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-8 px-3"
                onClick={() => setStatusFilter('all')}
              >
                All ({stats.totalCount})
              </Button>
              <Button
                variant={statusFilter === 'paid' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-8 px-3 text-emerald-600 font-semibold"
                onClick={() => setStatusFilter('paid')}
              >
                Paid ({stats.paidCount})
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-8 px-3 text-amber-600 font-semibold"
                onClick={() => setStatusFilter('pending')}
              >
                Pending ({stats.pendingCount})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* INVOICES TABLE */}
      <Card className="shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[180px] text-xs font-bold uppercase tracking-wider">Invoice #</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Customer</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Line Items</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-right">Amount (₹)</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-center">Payment</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-center">Email Status</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Date Issued</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-20 mx-auto rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <FileText className="w-10 h-10 stroke-[1.2] text-muted-foreground/40" />
                      <p className="text-sm font-semibold text-foreground">No invoices found</p>
                      <p className="text-xs max-w-sm">
                        {searchQuery
                          ? 'No invoices match your search query. Try clearing the filter.'
                          : 'No tax invoices issued yet. Click "Issue New Invoice" to create one.'}
                      </p>
                      <Button
                        size="sm"
                        className="mt-2 text-xs gap-1.5"
                        onClick={() => setIsIssueModalOpen(true)}
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Issue First Invoice
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => {
                  const isPaid = inv.paymentDetails.paymentStatus === 'paid';
                  const isSendingThisEmail = sendingEmailId === inv._id;

                  return (
                    <TableRow key={inv._id} className="hover:bg-muted/20 transition-colors">
                      {/* Invoice Number */}
                      <TableCell className="font-mono text-xs font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className="text-primary truncate">{inv.invoiceNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(inv.invoiceNumber, inv._id)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
                            title="Copy invoice number"
                          >
                            {copiedId === inv._id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </TableCell>

                      {/* Customer */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-xs text-foreground truncate">
                            {inv.customer.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate font-mono">
                            {inv.customer.email}
                          </span>
                          {inv.customer.mobile && (
                            <span className="text-[10px] text-muted-foreground/80 font-mono">
                              {inv.customer.mobile}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Products Summary */}
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="font-medium text-foreground">
                            {inv.products.length} {inv.products.length === 1 ? 'item' : 'items'}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                            {inv.products[0]?.name || 'Apparel'}
                            {inv.products.length > 1 && ` +${inv.products.length - 1} more`}
                          </span>
                        </div>
                      </TableCell>

                      {/* Total Amount */}
                      <TableCell className="text-right font-mono font-bold text-xs text-foreground">
                        ₹{Number(inv.total || 0).toFixed(2)}
                      </TableCell>

                      {/* Payment Status */}
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          onClick={() => handleTogglePaymentStatus(inv)}
                          className={`cursor-pointer text-[10px] px-2 py-0.5 capitalize transition-all select-none ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                          title="Click to toggle Paid / Pending"
                        >
                          {isPaid ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Paid
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> Pending
                            </span>
                          )}
                        </Badge>
                      </TableCell>

                      {/* Email Status */}
                      <TableCell className="text-center">
                        {inv.emailSent ? (
                          <Badge
                            variant="outline"
                            className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 text-[10px] px-2 py-0.5 gap-1"
                            title={inv.emailSentAt ? `Sent on ${format(new Date(inv.emailSentAt), 'PPp')}` : 'Email Sent'}
                          >
                            <Mail className="w-2.5 h-2.5" /> Sent
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 gap-1"
                          >
                            Not Sent
                          </Badge>
                        )}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {inv.createdAt ? format(new Date(inv.createdAt), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Send Email Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleSendEmail(inv)}
                            disabled={isSendingThisEmail}
                            title="Send / Resend Invoice Email"
                          >
                            {isSendingThisEmail ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                          </Button>

                          {/* Quick Download PDF Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Download / View PDF"
                          >
                            <a
                              href={`/api/admin/invoices/${inv._id}/pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </Button>

                          {/* More Options Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs w-48">
                              <DropdownMenuLabel className="text-[11px] font-mono">
                                #{inv.invoiceNumber}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              <DropdownMenuItem asChild>
                                <a
                                  href={`/invoice/${inv._id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" /> View Web Invoice
                                </a>
                              </DropdownMenuItem>

                              <DropdownMenuItem asChild>
                                <a
                                  href={`/api/admin/invoices/${inv._id}/pdf`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" /> Download Official PDF
                                </a>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleSendEmail(inv)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Mail className="w-3.5 h-3.5" /> Send Invoice via Email
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleTogglePaymentStatus(inv)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Mark as {isPaid ? 'Pending' : 'Paid'}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => setInvoiceToDelete(inv)}
                                className="flex items-center gap-2 text-destructive cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Invoice
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ISSUE INVOICE DIALOG */}
      <IssueInvoiceDialog
        open={isIssueModalOpen}
        onOpenChange={setIsIssueModalOpen}
        onInvoiceIssued={() => {
          fetchInvoices();
        }}
      />

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={!!invoiceToDelete} onOpenChange={(open) => !open && setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">Delete Invoice?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to permanently delete Tax Invoice{' '}
              <strong className="font-mono text-foreground">#{invoiceToDelete?.invoiceNumber}</strong> for{' '}
              <span className="font-semibold text-foreground">{invoiceToDelete?.customer.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInvoice}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs"
            >
              {isDeleting ? 'Deleting...' : 'Delete Invoice'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
