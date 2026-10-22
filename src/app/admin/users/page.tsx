'use client';

import * as React from 'react';
import { useUser, User } from '@/context/user-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Trash2,
  Loader2,
  Receipt,
  Search,
  Eye,
  UserCheck,
  UserX,
  ShoppingCart,
  ShoppingBag,
  Globe,
  ExternalLink,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { IssueInvoiceDialog } from '@/components/admin/issue-invoice-dialog';
import { CustomerProfileDialog } from '@/components/admin/customer-profile-dialog';

export default function UsersPage() {
  const {
    users,
    loading,
    deleteUser,
    updateUserRole,
    updateUserOktocoins,
    toggleUserSuspension,
    refetchUsers,
  } = useUser();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [coinBalances, setCoinBalances] = React.useState<{ [key: string]: string }>({});
  const [activeInput, setActiveInput] = React.useState<string | null>(null);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'suspended' | 'admin'>('all');

  // Customer 360 Dialog State
  const [selectedUserForProfile, setSelectedUserForProfile] = React.useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);

  // Invoice Dialog State
  const [selectedUserForInvoice, setSelectedUserForInvoice] = React.useState<string | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = React.useState(false);
  const [coinIconUrl, setCoinIconUrl] = React.useState('https://i.ibb.co/6RXzvrS6/oktocoin-v1-80x80.png');

  React.useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.oktocoinIconUrl) setCoinIconUrl(data.oktocoinIconUrl);
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (users.length > 0) {
      const initialBalances = users.reduce((acc, user) => {
        acc[user.id] = (user.oktocoins || 0).toString();
        return acc;
      }, {} as { [key: string]: string });
      setCoinBalances(initialBalances);
    }
  }, [users]);

  // Keep selected user profile up to date with user state
  React.useEffect(() => {
    if (selectedUserForProfile) {
      const updated = users.find((u) => u.id === selectedUserForProfile.id);
      if (updated) {
        setSelectedUserForProfile(updated);
      }
    }
  }, [users, selectedUserForProfile]);

  const handleCoinChange = (userId: string, value: string) => {
    setCoinBalances((prev) => ({ ...prev, [userId]: value }));
  };

  const handleUpdateCoins = async (userId: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setActiveInput(userId);
    const newBalance = parseInt(coinBalances[userId] || '0', 10);
    if (!isNaN(newBalance)) {
      await updateUserOktocoins(userId, newBalance);
    }
    setIsSubmitting(false);
    setActiveInput(null);
  };

  const handleRoleChange = async (userId: string, role: 'user' | 'admin') => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setActiveInput(userId);
    await updateUserRole(userId, role);
    setIsSubmitting(false);
    setActiveInput(null);
  };

  const handleToggleSuspend = async (userId: string, currentSuspended: boolean) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setActiveInput(userId);
    await toggleUserSuspension(userId, !currentSuspended);
    setIsSubmitting(false);
    setActiveInput(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setActiveInput(userId);
    await deleteUser(userId);
    setIsSubmitting(false);
    setActiveInput(null);
  };

  const openCustomerProfile = (user: User) => {
    setSelectedUserForProfile(user);
    setIsProfileModalOpen(true);
  };

  // Filtered Users computation
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      // 1. Status Filter
      const isSuspended = user.status === 'suspended' || user.isBlocked === true;
      if (statusFilter === 'active' && isSuspended) return false;
      if (statusFilter === 'suspended' && !isSuspended) return false;
      if (statusFilter === 'admin' && user.role !== 'admin') return false;

      // 2. Search Query (Name, Email, Mobile, IP, Order ID)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        const mobile = (user.mobile || user.phone || '').toLowerCase();
        const ip = (user.lastLoginIp || '').toLowerCase();
        const orderId = (user.lastOrder?._id || '').toLowerCase();

        return (
          fullName.includes(query) ||
          email.includes(query) ||
          mobile.includes(query) ||
          ip.includes(query) ||
          orderId.includes(query)
        );
      }

      return true;
    });
  }, [users, statusFilter, searchQuery]);

  const activeCount = users.filter((u) => u.status !== 'suspended' && !u.isBlocked).length;
  const suspendedCount = users.filter((u) => u.status === 'suspended' || u.isBlocked).length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="space-y-6 sm:space-y-8 min-w-0 max-w-full overflow-x-hidden">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Enterprise customer database, IP tracking, fraud moderation, and live cart inspection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => refetchUsers()}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 bg-card/70 border-border/70">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-muted-foreground uppercase font-semibold">Total Users</span>
            <Badge variant="outline" className="text-[10px] font-mono">{users.length}</Badge>
          </div>
          <p className="text-xl sm:text-2xl font-bold mt-1">{users.length}</p>
        </Card>

        <Card className="p-3 sm:p-4 bg-card/70 border-border/70">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-muted-foreground uppercase font-semibold">Active Customers</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-xl sm:text-2xl font-bold mt-1 text-emerald-400">{activeCount}</p>
        </Card>

        <Card className="p-3 sm:p-4 bg-card/70 border-border/70">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-muted-foreground uppercase font-semibold">Suspended</span>
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
          </div>
          <p className="text-xl sm:text-2xl font-bold mt-1 text-rose-400">{suspendedCount}</p>
        </Card>

        <Card className="p-3 sm:p-4 bg-card/70 border-border/70">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-muted-foreground uppercase font-semibold">Admins</span>
            <Badge variant="secondary" className="text-[10px] font-mono">{adminCount}</Badge>
          </div>
          <p className="text-xl sm:text-2xl font-bold mt-1 text-primary">{adminCount}</p>
        </Card>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, IP, or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs sm:text-sm bg-background/60"
              />
            </div>

            {/* STATUS FILTER PILLS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <Button
                size="sm"
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                className="h-8 text-xs px-3"
                onClick={() => setStatusFilter('all')}
              >
                All ({users.length})
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                className="h-8 text-xs px-3 text-emerald-400 border-emerald-500/30"
                onClick={() => setStatusFilter('active')}
              >
                Active ({activeCount})
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'suspended' ? 'default' : 'outline'}
                className="h-8 text-xs px-3 text-rose-400 border-rose-500/30"
                onClick={() => setStatusFilter('suspended')}
              >
                Suspended ({suspendedCount})
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'admin' ? 'default' : 'outline'}
                className="h-8 text-xs px-3"
                onClick={() => setStatusFilter('admin')}
              >
                Admins ({adminCount})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="min-w-0 overflow-hidden p-3 sm:p-6">
          {/* MOBILE USER CARDS (< md) */}
          <div className="space-y-3 md:hidden">
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="p-4 rounded-xl border bg-card space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                </div>
              ))
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const isSuspended = user.status === 'suspended' || user.isBlocked === true;
                const cartCount = user.cartCount ?? (Array.isArray(user.cart) ? user.cart.length : 0);

                return (
                  <div
                    key={user.id}
                    className="p-4 rounded-xl border bg-card shadow-xs space-y-3 hover:border-primary/40 transition-all"
                  >
                    {/* USER HEADER */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 truncate">
                        {user.profilePictureUrl ? (
                          <div className="relative h-9 w-9 rounded-full overflow-hidden shrink-0 border border-primary/30">
                            <Image
                              src={user.profilePictureUrl}
                              alt={user.firstName || 'User'}
                              fill
                              sizes="36px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0 border border-primary/20">
                            {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}

                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs truncate">
                              {user.firstName} {user.lastName}
                            </h4>
                            <Badge
                              variant={isSuspended ? 'destructive' : 'outline'}
                              className={`text-[9px] uppercase px-1.5 py-0 ${
                                !isSuspended
                                  ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                                  : 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                              }`}
                            >
                              {isSuspended ? 'Suspended' : 'Active'}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate font-mono">{user.email}</p>
                        </div>
                      </div>

                      <Select
                        defaultValue={user.role}
                        onValueChange={(value: 'user' | 'admin') => handleRoleChange(user.id, value)}
                        disabled={isSubmitting && activeInput === user.id}
                      >
                        <SelectTrigger className="h-7 text-[10px] w-20 shrink-0">
                          <SelectValue>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-[9px] px-1.5 py-0">
                              {user.role}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user" className="text-xs">User</SelectItem>
                          <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* METRICS ROW (IP, Cart, Orders) */}
                    <div className="grid grid-cols-3 gap-2 bg-secondary/20 p-2.5 rounded-lg text-center text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">IP Address</span>
                        <span className="font-mono text-[11px] font-semibold truncate block">
                          {user.lastLoginIp || 'No IP'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Cart Items</span>
                        <span className="font-semibold text-[11px] text-primary">
                          {cartCount} in cart
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Orders</span>
                        <span className="font-semibold text-[11px]">
                          {user.totalOrders ?? 0} orders
                        </span>
                      </div>
                    </div>

                    {/* COINS ROW */}
                    <div className="flex items-center justify-between gap-2 bg-secondary/30 p-2.5 rounded-lg">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Image src={coinIconUrl || "https://i.ibb.co/6RXzvrS6/oktocoin-v1-80x80.png"} alt="Oktocoin" width={16} height={16} unoptimized />
                        <span>Oktocoins:</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          className="h-7 w-20 text-xs font-mono"
                          value={coinBalances[user.id] || ''}
                          onChange={(e) => handleCoinChange(user.id, e.target.value)}
                          disabled={isSubmitting && activeInput === user.id}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[10px] px-2 font-semibold"
                          onClick={() => handleUpdateCoins(user.id)}
                          disabled={isSubmitting && activeInput === user.id}
                        >
                          Save
                        </Button>
                      </div>
                    </div>

                    {/* ACTIONS ROW */}
                    <div className="flex items-center justify-between pt-1 border-t gap-2 text-xs">
                      <span className="text-[10px] text-muted-foreground">
                        Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] px-2 gap-1 border-primary/40 text-primary hover:bg-primary/10"
                          onClick={() => openCustomerProfile(user)}
                        >
                          <Eye className="w-3 h-3" />
                          <span>Profile</span>
                        </Button>

                        <Button
                          variant={isSuspended ? 'outline' : 'ghost'}
                          size="sm"
                          className={`h-7 text-[10px] px-2 gap-1 ${
                            isSuspended ? 'text-emerald-400 border-emerald-500/30' : 'text-rose-400 hover:bg-rose-500/10'
                          }`}
                          onClick={() => handleToggleSuspend(user.id, isSuspended)}
                          disabled={isSubmitting && activeInput === user.id}
                        >
                          {isSuspended ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          <span>{isSuspended ? 'Reactivate' : 'Suspend'}</span>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              disabled={isSubmitting && activeInput === user.id}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user account.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-muted-foreground border rounded-xl">
                No users match the search and filter criteria.
              </div>
            )}
          </div>

          {/* DESKTOP TABLE VIEW (>= md) */}
          <div className="border rounded-lg overflow-x-auto hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Cart / Orders</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Oktocoins</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-28" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const isSuspended = user.status === 'suspended' || user.isBlocked === true;
                    const cartCount = user.cartCount ?? (Array.isArray(user.cart) ? user.cart.length : 0);

                    return (
                      <TableRow key={user.id} className="hover:bg-muted/40 transition-colors">
                        {/* CUSTOMER NAME & GOOGLE AVATAR */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {user.profilePictureUrl ? (
                              <div className="relative h-9 w-9 rounded-full overflow-hidden shrink-0 border border-primary/30">
                                <Image
                                  src={user.profilePictureUrl}
                                  alt={user.firstName || 'User'}
                                  fill
                                  sizes="36px"
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0 border border-primary/20">
                                {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-xs text-foreground truncate">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-[11px] text-muted-foreground font-mono truncate">
                                {user.email}
                              </p>
                              {(user.mobile || user.phone) && (
                                <p className="text-[10px] text-muted-foreground font-mono truncate">
                                  {user.mobile || user.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* STATUS BADGE */}
                        <TableCell>
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
                        </TableCell>

                        {/* IP ADDRESS */}
                        <TableCell>
                          {user.lastLoginIp ? (
                            <div className="font-mono text-xs">
                              <span className="font-semibold text-foreground">{user.lastLoginIp}</span>
                              {user.lastLoginAt && (
                                <p className="text-[10px] text-muted-foreground">
                                  {format(new Date(user.lastLoginAt), 'MMM d, p')}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No IP recorded</span>
                          )}
                        </TableCell>

                        {/* CART & ORDERS */}
                        <TableCell>
                          <div className="text-xs space-y-0.5">
                            <p className="font-medium text-primary">
                              {cartCount} in cart
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {user.totalOrders ?? 0} {user.totalOrders === 1 ? 'order' : 'orders'}
                            </p>
                            {user.lastOrder && (
                              <Link
                                href={`/admin/orders/${user.lastOrder._id}`}
                                className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 font-mono"
                              >
                                <span>Last: #{user.lastOrder._id.slice(-6).toUpperCase()}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            )}
                          </div>
                        </TableCell>

                        {/* ROLE SELECT */}
                        <TableCell>
                          <Select
                            defaultValue={user.role}
                            onValueChange={(value: 'user' | 'admin') => handleRoleChange(user.id, value)}
                            disabled={isSubmitting && activeInput === user.id}
                          >
                            <SelectTrigger className="w-[95px] h-8 text-xs">
                              <SelectValue>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-[10px]">
                                  {user.role}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user" className="text-xs">User</SelectItem>
                              <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>

                        {/* OKTOCOINS */}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Image
                              src={coinIconUrl || "https://i.ibb.co/6RXzvrS6/oktocoin-v1-80x80.png"}
                              alt="Oktocoin"
                              width={16}
                              height={16}
                              unoptimized
                            />
                            <Input
                              type="number"
                              className="h-8 w-20 font-mono text-xs"
                              value={coinBalances[user.id] || ''}
                              onChange={(e) => handleCoinChange(user.id, e.target.value)}
                              onBlur={() => handleUpdateCoins(user.id)}
                              disabled={isSubmitting && activeInput === user.id}
                            />
                            {isSubmitting && activeInput === user.id && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            )}
                          </div>
                        </TableCell>

                        {/* JOINED DATE */}
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(user.createdAt), 'PP')}
                        </TableCell>

                        {/* ACTIONS */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* CUSTOMER 360 PROFILE */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs gap-1.5 border-primary/30 hover:bg-primary/10 hover:text-primary transition-colors"
                              onClick={() => openCustomerProfile(user)}
                              title="View Customer 360 Profile"
                            >
                              <Eye className="w-3.5 h-3.5 text-primary" />
                              <span>Customer 360</span>
                            </Button>

                            {/* QUICK SUSPEND / REACTIVATE */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${
                                isSuspended
                                  ? 'text-emerald-400 hover:bg-emerald-500/10'
                                  : 'text-rose-400 hover:bg-rose-500/10'
                              }`}
                              onClick={() => handleToggleSuspend(user.id, isSuspended)}
                              disabled={isSubmitting && activeInput === user.id}
                              title={isSuspended ? 'Reactivate User Account' : 'Suspend User Account'}
                            >
                              {isSuspended ? (
                                <UserCheck className="h-4 w-4" />
                              ) : (
                                <UserX className="h-4 w-4" />
                              )}
                            </Button>

                            {/* ISSUE INVOICE */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary hover:bg-primary/10"
                              onClick={() => {
                                setSelectedUserForInvoice(user.id);
                                setIsInvoiceModalOpen(true);
                              }}
                              title={`Issue Invoice to ${user.firstName || 'User'}`}
                            >
                              <Receipt className="w-4 h-4" />
                            </Button>

                            {/* DELETE ACCOUNT */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                  disabled={isSubmitting && activeInput === user.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the user
                                    and remove their data from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24 text-muted-foreground text-xs">
                      No users match the search and filter criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* CUSTOMER 360 PROFILE DIALOG */}
      <CustomerProfileDialog
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        user={selectedUserForProfile}
        coinIconUrl={coinIconUrl}
        onIssueInvoice={(userId) => {
          setSelectedUserForInvoice(userId);
          setIsInvoiceModalOpen(true);
        }}
      />

      {/* ISSUE INVOICE DIALOG */}
      <IssueInvoiceDialog
        open={isInvoiceModalOpen}
        onOpenChange={setIsInvoiceModalOpen}
        preselectedUserId={selectedUserForInvoice}
        onInvoiceIssued={() => {
          refetchUsers();
        }}
      />
    </div>
  );
}
