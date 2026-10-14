'use client';

import * as React from 'react';
import { User, useUser } from '@/context/user-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  Ban,
  CheckCircle,
  Copy,
  Check,
  ExternalLink,
  ShoppingBag,
  ShoppingCart,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Receipt,
  UserCheck,
  UserX,
  CreditCard,
  Globe,
  Loader2,
} from 'lucide-react';

interface CustomerProfileDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIssueInvoice?: (userId: string) => void;
}

export function CustomerProfileDialog({
  user,
  open,
  onOpenChange,
  onIssueInvoice,
}: CustomerProfileDialogProps) {
  const { toggleUserSuspension, blockIpAddress, unblockIpAddress, updateUserOktocoins } = useUser();
  const { toast } = useToast();

  const [copiedIp, setCopiedIp] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [suspendReason, setSuspendReason] = React.useState('');
  const [showSuspendInput, setShowSuspendInput] = React.useState(false);
  const [newCoinAmount, setNewCoinAmount] = React.useState('');
  const [blockedIps, setBlockedIps] = React.useState<string[]>([]);
  const [checkingBlockedIps, setCheckingBlockedIps] = React.useState(false);

  // Fetch current blocked IPs list to know if user's IP is banned
  const fetchBlockedIps = React.useCallback(async () => {
    if (!open) return;
    try {
      setCheckingBlockedIps(true);
      const res = await fetch('/api/admin/security/blocked-ips');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data.blockedIps)
          ? data.blockedIps.map((entry: any) => entry.ip)
          : [];
        setBlockedIps(list);
      }
    } catch {
      // ignore
    } finally {
      setCheckingBlockedIps(false);
    }
  }, [open]);

  React.useEffect(() => {
    if (open && user) {
      setNewCoinAmount(user.oktocoins !== undefined ? String(user.oktocoins) : '0');
      setShowSuspendInput(false);
      setSuspendReason('');
      fetchBlockedIps();
    }
  }, [open, user, fetchBlockedIps]);

  if (!user) return null;

  const isSuspended = user.status === 'suspended' || user.isBlocked === true;
  const userIp = user.lastLoginIp || '';
  const isIpBlocked = userIp ? blockedIps.includes(userIp) : false;

  const handleCopyIp = () => {
    if (!userIp) return;
    navigator.clipboard.writeText(userIp);
    setCopiedIp(true);
    toast({
      title: 'IP Address Copied',
      description: `${userIp} copied to clipboard.`,
    });
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const handleToggleSuspension = async () => {
    if (!user) return;
    setIsSubmitting(true);
    const targetSuspension = !isSuspended;
    const success = await toggleUserSuspension(
      user.id,
      targetSuspension,
      targetSuspension ? suspendReason.trim() || 'Suspended by admin' : undefined
    );
    setIsSubmitting(false);
    if (success) {
      setShowSuspendInput(false);
    }
  };

  const handleToggleIpBlock = async () => {
    if (!userIp) {
      toast({
        title: 'No IP Available',
        description: 'This user does not have a recorded IP address yet.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    if (isIpBlocked) {
      const ok = await unblockIpAddress(userIp);
      if (ok) {
        setBlockedIps((prev) => prev.filter((ip) => ip !== userIp));
      }
    } else {
      const ok = await blockIpAddress(userIp, `Blocked via user management for user ${user.email}`);
      if (ok) {
        setBlockedIps((prev) => [...prev, userIp]);
      }
    }
    setIsSubmitting(false);
  };

  const handleSaveCoins = async () => {
    const parsed = parseInt(newCoinAmount, 10);
    if (isNaN(parsed) || parsed < 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid non-negative number.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    await updateUserOktocoins(user.id, parsed);
    setIsSubmitting(false);
  };

  const handleQuickAddCoins = async (amount: number) => {
    const current = user.oktocoins || 0;
    const updated = Math.max(0, current + amount);
    setIsSubmitting(true);
    await updateUserOktocoins(user.id, updated);
    setNewCoinAmount(String(updated));
    setIsSubmitting(false);
  };

  const cartItems = Array.isArray(user.cart) ? user.cart : [];
  const cartItemCount = user.cartCount !== undefined ? user.cartCount : cartItems.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] p-0 overflow-hidden flex flex-col bg-card border-border/80">
        <DialogHeader className="p-4 sm:p-6 pb-3 border-b shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* USER IDENTITY ROW */}
            <div className="flex items-center gap-3 min-w-0">
              {user.profilePictureUrl ? (
                <div className="relative h-12 w-12 rounded-full overflow-hidden shrink-0 border-2 border-primary/40">
                  <Image
                    src={user.profilePictureUrl}
                    alt={user.firstName || 'User'}
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-base shrink-0 border border-primary/20">
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-base sm:text-lg font-bold truncate">
                    {user.firstName} {user.lastName}
                  </DialogTitle>
                  <Badge
                    variant={isSuspended ? 'destructive' : 'outline'}
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 ${
                      !isSuspended
                        ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                        : 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                    }`}
                  >
                    {isSuspended ? 'Suspended' : 'Active'}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] uppercase px-1.5 py-0">
                    {user.role}
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-muted-foreground truncate font-mono mt-0.5">
                  {user.email}
                </DialogDescription>
              </div>
            </div>

            {/* QUICK ACTIONS BAR */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {onIssueInvoice && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => {
                    onOpenChange(false);
                    onIssueInvoice(user.id);
                  }}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </Button>
              )}

              <Button
                size="sm"
                variant={isSuspended ? 'default' : 'destructive'}
                className="h-8 text-xs gap-1.5 font-semibold"
                disabled={isSubmitting}
                onClick={() => {
                  if (isSuspended) {
                    handleToggleSuspension();
                  } else {
                    setShowSuspendInput(!showSuspendInput);
                  }
                }}
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isSuspended ? (
                  <UserCheck className="w-3.5 h-3.5" />
                ) : (
                  <UserX className="w-3.5 h-3.5" />
                )}
                <span>{isSuspended ? 'Reactivate' : 'Suspend'}</span>
              </Button>
            </div>
          </div>

          {/* SUSPEND REASON INPUT (Expandable) */}
          {showSuspendInput && !isSuspended && (
            <div className="mt-3 p-3 rounded-lg border border-rose-500/30 bg-rose-500/5 space-y-2">
              <p className="text-xs font-medium text-rose-300">
                Specify reason for account suspension (optional):
              </p>
              <div className="flex items-center gap-2">
                <Input
                  className="h-8 text-xs bg-background"
                  placeholder="e.g. Abusive chargebacks, fake cash-on-delivery orders"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 text-xs shrink-0"
                  disabled={isSubmitting}
                  onClick={handleToggleSuspension}
                >
                  Confirm Suspend
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs shrink-0"
                  onClick={() => setShowSuspendInput(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {isSuspended && user.suspendedReason && (
            <div className="mt-2.5 p-2 rounded-md bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
              <span className="font-semibold">Suspension Reason: </span>
              {user.suspendedReason}
            </div>
          )}
        </DialogHeader>

        {/* DIALOG BODY WITH TABS */}
        <ScrollArea className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Tabs defaultValue="overview" className="w-full space-y-4">
            <TabsList className="grid grid-cols-4 w-full h-9 bg-secondary/40 p-1">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="cart" className="text-xs">
                Cart ({cartItemCount})
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs">Security & IP</TabsTrigger>
              <TabsTrigger value="loyalty" className="text-xs">Loyalty</TabsTrigger>
            </TabsList>

            {/* TAB 1: OVERVIEW */}
            <TabsContent value="overview" className="space-y-4 m-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* CONTACT DETAILS */}
                <div className="p-3.5 rounded-xl border bg-card/60 space-y-2.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    Contact & Personal Info
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-muted-foreground text-[11px]">Email Address</span>
                      <p className="font-mono font-medium truncate">{user.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[11px]">Mobile Phone</span>
                      <p className="font-mono font-medium">
                        {user.mobile || user.phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[11px]">Auth Method</span>
                      <p className="capitalize">
                        {user.authProvider || (user.profilePictureUrl ? 'Google OAuth' : 'Standard Credentials')}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[11px]">Account Created</span>
                      <p>
                        {user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SAVED ADDRESS */}
                <div className="p-3.5 rounded-xl border bg-card/60 space-y-2.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    Delivery Address
                  </h4>
                  {user.address ? (
                    <div className="text-xs space-y-1">
                      <p className="font-medium text-foreground leading-relaxed">
                        {user.address}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        Stored from profile or most recent verified order.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 text-center rounded-lg border border-dashed border-border/60 text-muted-foreground text-xs">
                      No saved delivery address on file.
                    </div>
                  )}
                </div>
              </div>

              {/* COMMERCE SNAPSHOT */}
              <div className="p-3.5 rounded-xl border bg-card/60 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                  Purchasing Activity
                </h4>
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-2.5 rounded-lg bg-secondary/30 border">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Total Orders</span>
                    <p className="text-lg font-bold mt-0.5">{user.totalOrders ?? 0}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-secondary/30 border">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Lifetime Spend</span>
                    <p className="text-lg font-bold mt-0.5 font-mono">
                      Rs. {(user.totalSpent ?? 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-secondary/30 border">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Active Cart</span>
                    <p className="text-lg font-bold mt-0.5 text-primary">
                      {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                {/* LAST ORDER HIGHLIGHT */}
                {user.lastOrder ? (
                  <div className="mt-2 p-3 rounded-lg bg-secondary/20 border flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Last Order:</span>
                        <span className="font-mono font-bold text-foreground">
                          #{user.lastOrder._id.slice(-6).toUpperCase()}
                        </span>
                        <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0">
                          {user.lastOrder.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Amount: Rs. {Number(user.lastOrder.total).toLocaleString('en-IN')} | Date:{' '}
                        {user.lastOrder.createdAt
                          ? format(new Date(user.lastOrder.createdAt), 'MMM d, yyyy')
                          : 'N/A'}
                      </p>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] px-2.5 gap-1 shrink-0"
                    >
                      <Link href={`/admin/orders/${user.lastOrder._id}`}>
                        <span>View Order</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-muted-foreground border rounded-lg">
                    User has not placed any orders yet.
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 2: ACTIVE CART */}
            <TabsContent value="cart" className="space-y-3 m-0">
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="text-muted-foreground">
                  Current products added in this customer basket:
                </span>
                <span className="font-bold text-primary">
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                </span>
              </div>

              {cartItems.length > 0 ? (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {cartItems.map((item: any, idx: number) => {
                    const itemImage =
                      item.imageUrl ||
                      (Array.isArray(item.imageUrls) && item.imageUrls[0]) ||
                      '/placeholder.png';
                    const itemPrice = Number(item.price) || 0;
                    const itemQty = Number(item.quantity) || 1;
                    const itemTotal = itemPrice * itemQty;

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border bg-card/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative h-12 w-12 rounded-md overflow-hidden bg-secondary shrink-0 border">
                            <Image
                              src={itemImage}
                              alt={item.name || 'Product'}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-bold truncate text-foreground">
                              {item.name || 'Product'}
                            </h5>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 flex-wrap">
                              {item.size && <span>Size: {item.size}</span>}
                              {item.color && <span>Color: {item.color}</span>}
                              <span>Qty: {itemQty}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-mono font-bold text-foreground">
                            Rs. {itemTotal.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Rs. {itemPrice.toLocaleString('en-IN')} each
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl border border-dashed border-border/60 text-muted-foreground text-xs space-y-2">
                  <ShoppingCart className="w-8 h-8 mx-auto opacity-40 text-muted-foreground" />
                  <p>Customer cart is currently empty.</p>
                </div>
              )}
            </TabsContent>

            {/* TAB 3: SECURITY & IP TRACKING */}
            <TabsContent value="security" className="space-y-4 m-0">
              <div className="p-4 rounded-xl border bg-card/60 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    Network & IP Address Telemetry
                  </h4>
                  {userIp && (
                    <Badge
                      variant={isIpBlocked ? 'destructive' : 'outline'}
                      className={`text-[10px] ${
                        isIpBlocked
                          ? 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                          : 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                      }`}
                    >
                      {isIpBlocked ? 'IP Blocked' : 'IP Allowed'}
                    </Badge>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-secondary/30 border space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Last Recorded IP Address:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-foreground">
                        {userIp || 'No IP recorded'}
                      </span>
                      {userIp && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={handleCopyIp}
                          title="Copy IP"
                        >
                          {copiedIp ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Last Active / Login:</span>
                    <span className="font-medium">
                      {user.lastLoginAt
                        ? format(new Date(user.lastLoginAt), 'PPP p')
                        : 'Not recorded'}
                    </span>
                  </div>

                  {Array.isArray(user.knownIps) && user.knownIps.length > 0 && (
                    <div className="pt-2 border-t border-border/40">
                      <span className="text-[11px] text-muted-foreground block mb-1">
                        Historical Known IPs ({user.knownIps.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {user.knownIps.map((ip, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="font-mono text-[10px] px-2 py-0"
                          >
                            {ip}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* IP BLOCK ACTION */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="text-xs">
                    <p className="font-medium text-foreground">
                      {isIpBlocked ? 'Unblock Network IP' : 'Block Network IP'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {isIpBlocked
                        ? 'Remove this IP from the security blocklist to allow web and app access.'
                        : 'Prevent all incoming web and mobile requests from this specific IP address.'}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant={isIpBlocked ? 'outline' : 'destructive'}
                    className="h-8 text-xs shrink-0 gap-1.5"
                    disabled={isSubmitting || !userIp || checkingBlockedIps}
                    onClick={handleToggleIpBlock}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isIpBlocked ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Ban className="w-3.5 h-3.5" />
                    )}
                    <span>{isIpBlocked ? 'Unblock IP' : 'Block IP'}</span>
                  </Button>
                </div>
              </div>

              {/* ACCOUNT LOCK STATUS */}
              <div className="p-4 rounded-xl border bg-card/60 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                  Identity Moderation Status
                </h4>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-medium text-foreground">
                      Account Status: {isSuspended ? 'Suspended' : 'Active'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {isSuspended
                        ? 'This customer cannot log in, add items, or place orders.'
                        : 'This customer has full privileges to browse and purchase.'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={isSuspended ? 'outline' : 'destructive'}
                    className="h-8 text-xs shrink-0"
                    disabled={isSubmitting}
                    onClick={handleToggleSuspension}
                  >
                    {isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: LOYALTY WALLET */}
            <TabsContent value="loyalty" className="space-y-4 m-0">
              <div className="p-4 rounded-xl border bg-card/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Image
                      src="https://i.ibb.co/6RXzvrS6/oktocoin-v1-80x80.png"
                      alt="Oktocoin"
                      width={16}
                      height={16}
                    />
                    Oktocoin Rewards Balance
                  </h4>
                  <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
                    {user.oktocoins ?? 0} Coins
                  </Badge>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground block">
                    Update Wallet Balance:
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="h-9 w-32 font-mono text-sm"
                      value={newCoinAmount}
                      onChange={(e) => setNewCoinAmount(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <Button
                      size="sm"
                      className="h-9 text-xs px-4 font-semibold"
                      onClick={handleSaveCoins}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Update Balance'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t">
                  <span className="text-[11px] text-muted-foreground block">
                    Quick Credit / Debit Shortcuts:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2.5"
                      disabled={isSubmitting}
                      onClick={() => handleQuickAddCoins(50)}
                    >
                      +50 Coins
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2.5"
                      disabled={isSubmitting}
                      onClick={() => handleQuickAddCoins(100)}
                    >
                      +100 Coins
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2.5"
                      disabled={isSubmitting}
                      onClick={() => handleQuickAddCoins(500)}
                    >
                      +500 Coins
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2.5 text-rose-400 hover:text-rose-300"
                      disabled={isSubmitting}
                      onClick={() => handleQuickAddCoins(-50)}
                    >
                      -50 Coins
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
