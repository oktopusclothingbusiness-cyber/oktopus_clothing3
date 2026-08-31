'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  AlertTriangle,
  X,
  RefreshCw,
  Package,
  Image as ImageIcon,
  Zap,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ExternalLink,
  PlusCircle,
  ShieldAlert,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { NotificationItem } from '@/app/api/admin/notifications/route';

export function AdminNotificationPanel() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'all' | 'critical' | 'inventory' | 'image_perf' | 'orders'>('all');
  const [mounted, setMounted] = React.useState(false);

  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const fetchNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch admin notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    // Refresh alerts every 60 seconds automatically
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const criticalCount = React.useMemo(() => {
    return notifications.filter((n) => n.severity === 'critical').length;
  }, [notifications]);

  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === 'critical') return n.severity === 'critical';
      if (activeTab === 'inventory') return n.category === 'inventory';
      if (activeTab === 'image_perf') return n.category === 'image' || n.category === 'performance';
      if (activeTab === 'orders') return n.category === 'orders';
      return true;
    });
  }, [notifications, activeTab]);

  const handleQuickAction = async (item: NotificationItem) => {
    if (item.actionType === 'RESTOCK' && item.productId) {
      try {
        setActionLoadingId(item.id);
        const response = await fetch('/api/admin/notifications/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actionType: 'RESTOCK', productId: item.productId, amount: 50 }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Restock failed');

        toast({
          title: 'Stock Updated (+50)',
          description: `Inventory incremented for ${item.title}.`,
        });

        // Re-scan health to clear resolved stock alert
        await fetchNotifications();
      } catch (error: any) {
        toast({
          title: 'Restock Error',
          description: error.message || 'Failed to update stock.',
          variant: 'destructive',
        });
      } finally {
        setActionLoadingId(null);
      }
    } else if (item.actionType === 'EDIT_PRODUCT') {
      setIsOpen(false);
      router.push('/admin/products');
    } else if (item.actionType === 'VIEW_ORDERS') {
      setIsOpen(false);
      router.push(item.actionUrl || '/admin/orders');
    }
  };

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inventory':
        return <Package className="h-4 w-4 text-amber-500" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 text-rose-500" />;
      case 'performance':
        return <Zap className="h-4 w-4 text-purple-500" />;
      case 'orders':
        return <ShoppingBag className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="relative">
      {/* FLOATING TRIGGER BELL BUTTON */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full hover:bg-secondary transition-all shadow-sm"
        aria-label="Admin Notifications"
      >
        <Bell className="h-5 w-5 text-foreground" />
        {notifications.length > 0 && (
          <span
            className={cn(
              'absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-md animate-pulse',
              criticalCount > 0 ? 'bg-destructive' : 'bg-amber-500'
            )}
          >
            {notifications.length > 99 ? '99+' : notifications.length}
          </span>
        )}
      </Button>

      {/* FLOATING GLASSMORPHISM PANEL OVERLAY VIA PORTAL */}
      {isOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/30 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed inset-y-0 right-0 z-[99999] flex w-full max-w-md flex-col bg-background/98 backdrop-blur-md border-l shadow-2xl transition-all duration-300 animate-in slide-in-from-right sm:w-[420px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-lg font-bold">Catalog & Health Alerts</h2>
                  <p className="text-xs text-muted-foreground">
                    {notifications.length} issue(s) detected • {criticalCount} critical
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={fetchNotifications}
                  disabled={loading}
                  title="Rescan Catalog Health"
                >
                  <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* TAB CATEGORY SELECTOR */}
            <div className="flex border-b px-4 py-2 gap-1 overflow-x-auto text-xs bg-secondary/30">
              <button
                onClick={() => setActiveTab('all')}
                className={cn(
                  'px-3 py-1.5 rounded-full font-medium transition-all',
                  activeTab === 'all' ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-secondary text-muted-foreground'
                )}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('critical')}
                className={cn(
                  'px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1',
                  activeTab === 'critical' ? 'bg-destructive text-destructive-foreground font-bold' : 'hover:bg-secondary text-muted-foreground'
                )}
              >
                Critical ({criticalCount})
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={cn(
                  'px-3 py-1.5 rounded-full font-medium transition-all',
                  activeTab === 'inventory' ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-secondary text-muted-foreground'
                )}
              >
                Inventory
              </button>
              <button
                onClick={() => setActiveTab('image_perf')}
                className={cn(
                  'px-3 py-1.5 rounded-full font-medium transition-all',
                  activeTab === 'image_perf' ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-secondary text-muted-foreground'
                )}
              >
                Images & Speed
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={cn(
                  'px-3 py-1.5 rounded-full font-medium transition-all',
                  activeTab === 'orders' ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-secondary text-muted-foreground'
                )}
              >
                Orders
              </button>
            </div>

            {/* NOTIFICATION CARDS LIST */}
            <ScrollArea className="flex-1 p-4">
              {loading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm">Scanning catalog & image health...</p>
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="space-y-3">
                  {filteredNotifications.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'group relative rounded-xl border p-4 transition-all hover:shadow-md bg-card text-card-foreground',
                        item.severity === 'critical' && 'border-destructive/40 bg-destructive/5',
                        item.severity === 'warning' && 'border-amber-500/30 bg-amber-500/5'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {(() => {
                          const rawUrl = item.imageUrl?.trim();
                          let validUrl: string | null = null;
                          if (rawUrl) {
                            if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('/')) {
                              validUrl = rawUrl;
                            } else if (rawUrl.startsWith('www.')) {
                              validUrl = `https://${rawUrl}`;
                            }
                          }

                          if (validUrl) {
                            return (
                              <Image
                                src={validUrl}
                                alt="Product"
                                width={44}
                                height={44}
                                className="rounded-lg object-cover border bg-background shrink-0"
                                unoptimized={validUrl.includes('www.google.com') || !validUrl.includes('.')}
                              />
                            );
                          }

                          return (
                            <div className="p-2.5 rounded-lg border bg-background shrink-0">
                              {getCategoryIcon(item.category)}
                            </div>
                          );
                        })()}

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 truncate">
                              {getCategoryIcon(item.category)}
                              <h4 className="text-xs font-bold truncate">{item.title}</h4>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-60 hover:opacity-100"
                              onClick={() => handleDismiss(item.id)}
                              title="Dismiss notification"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>

                          {/* ACTION BUTTON */}
                          <div className="pt-2 flex items-center justify-between">
                            <Badge
                              variant={item.severity === 'critical' ? 'destructive' : item.severity === 'warning' ? 'outline' : 'secondary'}
                              className="text-[10px] px-2 py-0.5"
                            >
                              {item.severity.toUpperCase()}
                            </Badge>

                            <Button
                              size="sm"
                              variant={item.actionType === 'RESTOCK' ? 'default' : 'outline'}
                              className="h-7 text-xs px-3 font-semibold flex items-center gap-1.5"
                              onClick={() => handleQuickAction(item)}
                              disabled={actionLoadingId === item.id}
                            >
                              {actionLoadingId === item.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : item.actionType === 'RESTOCK' ? (
                                <PlusCircle className="h-3 w-3" />
                              ) : (
                                <ArrowRight className="h-3 w-3" />
                              )}
                              {item.actionText}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="font-bold text-base">Catalog & Assets Healthy!</h3>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    No broken images, low stock items, or performance issues detected.
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
