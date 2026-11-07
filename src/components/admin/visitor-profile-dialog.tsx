'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import {
  Fingerprint,
  Globe,
  Monitor,
  Cpu,
  Activity,
  Layers,
  MapPin,
  Clock,
  ExternalLink,
  Copy,
  Check,
  ShoppingBag,
  Eye,
  ShieldAlert,
  BatteryCharging,
  Battery,
  Wifi,
  Smartphone,
  Calendar,
  UserCheck,
  User,
  Radio,
  Gauge,
  Compass,
  HardDrive,
  Hash,
} from 'lucide-react';

export interface VisitorRecord {
  _id: string;
  visitorId: string;
  fingerprintId: string;
  ip: string;
  geo?: {
    country?: string;
    countryCode?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    isp?: string;
    carrier?: string;
    timezone?: string;
  };
  device?: {
    os?: string;
    osVersion?: string;
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    platform?: string;
    browser?: string;
    browserVersion?: string;
    userAgent?: string;
  };
  display?: {
    screenWidth?: number;
    screenHeight?: number;
    screenAvailWidth?: number;
    screenAvailHeight?: number;
    colorDepth?: number;
    pixelRatio?: number;
    colorGamut?: string;
    prefersColorScheme?: string;
  };
  hardware?: {
    cpuCores?: number;
    ramGB?: number;
    gpuRenderer?: string;
    gpuVendor?: string;
    webglCanvasHash?: string;
    webglMaxTextureSize?: number;
    audioHash?: string;
    canvas2dHash?: string;
  };
  capabilities?: {
    touchPoints?: number;
    hasTouch?: boolean;
    hasAccelerometer?: boolean;
    hasGyroscope?: boolean;
    hasOrientation?: boolean;
    hasAmbientLight?: boolean;
    batteryLevel?: number;
    batteryCharging?: boolean;
    storageQuotaMB?: number;
    storageUsageMB?: number;
  };
  network?: {
    networkType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  locale?: {
    timezone?: string;
    timezoneOffset?: number;
    languages?: string[];
    primaryLanguage?: string;
  };
  analytics?: {
    visitCount?: number;
    sessionCount?: number;
    firstSeenAt?: string | Date;
    lastSeenAt?: string | Date;
    lastPath?: string;
    visitDates?: string[];
  };
  pageHistory?: Array<{
    path: string;
    title?: string;
    referrer?: string;
    timestamp: string | Date;
  }>;
  viewedProducts?: Array<{
    productId: string;
    title: string;
    slug?: string;
    price: number;
    imageUrl?: string;
    category?: string;
    firstViewedAt: string | Date;
    lastViewedAt: string | Date;
    viewCount: number;
  }>;
  customer?: {
    userId?: string;
    email?: string;
    name?: string;
    isRegistered?: boolean;
    linkedAt?: string | Date;
  };
}

interface VisitorProfileDialogProps {
  visitor: VisitorRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBlockIp?: (ip: string) => void;
}

export function VisitorProfileDialog({
  visitor,
  open,
  onOpenChange,
  onBlockIp,
}: VisitorProfileDialogProps) {
  const { toast } = useToast();
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  if (!visitor) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast({
      title: 'Copied to Clipboard',
      description: `${label}: ${text}`,
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isConverted = Boolean(visitor.customer?.isRegistered);
  const totalVisits = visitor.analytics?.visitCount || 1;
  const isRepeatVisitor = totalVisits >= 2;
  const viewedCount = visitor.viewedProducts?.length || 0;

  const lat = visitor.geo?.latitude;
  const lon = visitor.geo?.longitude;
  const mapsUrl = lat && lon ? `https://www.google.com/maps?q=${lat},${lon}` : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] h-[90vh] flex flex-col p-0 overflow-hidden bg-background">
        {/* Header Banner */}
        <DialogHeader className="p-4 sm:p-6 pb-3 border-b bg-card/60 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                <Fingerprint className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-xl font-bold font-mono tracking-tight">
                    {visitor.fingerprintId}
                  </DialogTitle>
                  {isConverted ? (
                    <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 font-semibold">
                      <UserCheck className="w-3.5 h-3.5" />
                      Registered Customer
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 font-semibold">
                      <User className="w-3.5 h-3.5" />
                      Anonymous Visitor
                    </Badge>
                  )}
                  {isRepeatVisitor && (
                    <Badge variant="secondary" className="bg-primary/20 text-primary font-bold">
                      {totalVisits} Total Visits
                    </Badge>
                  )}
                </div>
                <DialogDescription className="mt-1 text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                  <span>
                    First Seen:{' '}
                    {visitor.analytics?.firstSeenAt
                      ? format(new Date(visitor.analytics.firstSeenAt), 'MMM dd, yyyy HH:mm')
                      : 'Unknown'}
                  </span>
                  <span>•</span>
                  <span>
                    Last Seen:{' '}
                    {visitor.analytics?.lastSeenAt
                      ? `${formatDistanceToNow(new Date(visitor.analytics.lastSeenAt))} ago`
                      : 'Just now'}
                  </span>
                  {visitor.geo?.city && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <MapPin className="w-3 h-3 text-red-500" />
                        {visitor.geo.city}, {visitor.geo.country}
                      </span>
                    </>
                  )}
                </DialogDescription>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(visitor.fingerprintId, 'Fingerprint ID')}
                className="text-xs h-8 gap-1.5"
              >
                {copiedKey === 'Fingerprint ID' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Fingerprint
              </Button>
              {onBlockIp && visitor.ip && visitor.ip !== '127.0.0.1' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onBlockIp(visitor.ip)}
                  className="text-xs h-8 gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Block IP
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Tabs Content */}
        <Tabs defaultValue="attributes" className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="px-6 border-b bg-muted/30 shrink-0">
            <TabsList className="bg-transparent h-11 p-0 gap-6">
              <TabsTrigger
                value="attributes"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-1 text-xs font-semibold"
              >
                <Monitor className="w-3.5 h-3.5 mr-1.5" />
                System & Network
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-1 text-xs font-semibold"
              >
                <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                Products Viewed ({viewedCount})
              </TabsTrigger>
              <TabsTrigger
                value="journey"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-1 text-xs font-semibold"
              >
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                Page History ({visitor.pageHistory?.length || 0})
              </TabsTrigger>
              {isConverted && (
                <TabsTrigger
                  value="customer"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-1 text-xs font-semibold"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                  Customer Account
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 overscroll-contain">
            {/* TAB 1: ATTRIBUTES */}
            <TabsContent value="attributes" className="mt-0 space-y-6">
              {/* Highlight KPI Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border bg-card/60">
                  <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-blue-500" />
                    Network & IP
                  </div>
                  <div className="text-sm font-bold mt-1 font-mono">{visitor.ip}</div>
                  <div className="text-[11px] text-muted-foreground capitalize truncate">
                    {visitor.network?.networkType || 'Broadband'} • {visitor.geo?.isp || 'ISP'}
                  </div>
                </div>

                <div className="p-3 rounded-xl border bg-card/60">
                  <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-purple-500" />
                    Device & OS
                  </div>
                  <div className="text-sm font-bold mt-1">
                    {visitor.device?.os || 'Unknown OS'} {visitor.device?.osVersion || ''}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {visitor.device?.browser || 'Browser'} {visitor.device?.browserVersion?.split('.')[0] || ''}
                  </div>
                </div>

                <div className="p-3 rounded-xl border bg-card/60">
                  <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-amber-500" />
                    Hardware Specs
                  </div>
                  <div className="text-sm font-bold mt-1">
                    {visitor.hardware?.cpuCores ? `${visitor.hardware.cpuCores} Cores` : 'Unknown Cores'}
                    {visitor.hardware?.ramGB ? ` / ~${visitor.hardware.ramGB} GB RAM` : ''}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate" title={visitor.hardware?.gpuRenderer}>
                    {visitor.hardware?.gpuRenderer?.split('(')[0] || 'GPU'}
                  </div>
                </div>

                <div className="p-3 rounded-xl border bg-card/60">
                  <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-500" />
                    Location
                  </div>
                  <div className="text-sm font-bold mt-1 truncate">
                    {visitor.geo?.city || 'Unknown City'}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {visitor.geo?.country || 'Unknown Country'}
                  </div>
                </div>
              </div>

              {/* SECTION 1: NETWORK & GEOLOCATION */}
              <Card>
                <CardHeader className="py-3 px-4 border-b bg-muted/20">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5" />
                    Network & Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">IP Address</span>
                    <div className="font-mono font-semibold flex items-center gap-1 mt-0.5">
                      {visitor.ip}
                      <button
                        onClick={() => copyToClipboard(visitor.ip, 'IP Address')}
                        className="p-1 hover:text-primary transition-colors"
                        title="Copy IP"
                      >
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Connection Type</span>
                    <span className="font-medium capitalize mt-0.5 inline-block">
                      {visitor.network?.networkType || 'Unknown'}
                      {visitor.network?.downlink ? ` (${visitor.network.downlink} Mbps downlink)` : ''}
                      {visitor.network?.rtt ? ` • ${visitor.network.rtt}ms RTT` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">ISP / Carrier</span>
                    <span className="font-medium mt-0.5 inline-block" title={visitor.geo?.carrier}>
                      {visitor.geo?.carrier || visitor.geo?.isp || 'Broadband Provider'}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Timezone</span>
                    <span className="font-medium mt-0.5 inline-block">
                      {visitor.locale?.timezone || visitor.geo?.timezone || 'UTC'}
                      {typeof visitor.locale?.timezoneOffset === 'number'
                        ? ` (UTC${visitor.locale.timezoneOffset > 0 ? '-' : '+'}${Math.abs(visitor.locale.timezoneOffset / 60)}h)`
                        : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Location</span>
                    <span className="font-medium mt-0.5 inline-block">
                      {[visitor.geo?.city, visitor.geo?.region, visitor.geo?.country]
                        .filter(Boolean)
                        .join(', ') || 'Unknown Location'}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Coordinates</span>
                    {mapsUrl ? (
                      <Link
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-primary font-medium flex items-center gap-1 hover:underline mt-0.5"
                      >
                        {lat?.toFixed(4)}, {lon?.toFixed(4)}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-muted-foreground mt-0.5 inline-block">Unavailable</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* SECTION 2: DEVICE & DISPLAY */}
              <Card>
                <CardHeader className="py-3 px-4 border-b bg-muted/20">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Monitor className="w-3.5 h-3.5" />
                    Device & Display
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Operating System</span>
                    <span className="font-medium mt-0.5 inline-block">
                      {visitor.device?.os || 'Unknown'} {visitor.device?.osVersion || ''} ({visitor.device?.platform || 'Platform'})
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Browser</span>
                    <span className="font-medium mt-0.5 inline-block">
                      {visitor.device?.browser || 'Browser'}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Browser Version</span>
                    <span className="font-mono font-medium mt-0.5 inline-block">
                      {visitor.device?.browserVersion || 'N/A'}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Screen Resolution</span>
                    <span className="font-medium mt-0.5 inline-block">
                      {visitor.display?.screenWidth}x{visitor.display?.screenHeight} (Avail:{' '}
                      {visitor.display?.screenAvailWidth}x{visitor.display?.screenAvailHeight}) •{' '}
                      {visitor.display?.colorDepth}-bit • {visitor.display?.pixelRatio}x DPR
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Languages</span>
                    <span className="font-medium mt-0.5 inline-block">
                      Primary: {visitor.locale?.primaryLanguage || 'en'} • All:{' '}
                      {visitor.locale?.languages?.join(', ') || 'en'}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Display & Theme</span>
                    <span className="font-medium mt-0.5 capitalize inline-block">
                      {visitor.device?.deviceType || 'Desktop'} • Gamut: {visitor.display?.colorGamut || 'sRGB'} • Theme:{' '}
                      {visitor.display?.prefersColorScheme || 'auto'}
                    </span>
                  </div>

                  <div className="col-span-full pt-2 border-t">
                    <span className="text-muted-foreground block text-[10px]">User-Agent</span>
                    <div className="font-mono text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-lg break-all select-all mt-1">
                      {visitor.device?.userAgent || 'None'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SECTION 3: HARDWARE & SYSTEM */}
              <Card>
                <CardHeader className="py-3 px-4 border-b bg-muted/20">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5" />
                    Hardware & System
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-[11px]">GPU Renderer</span>
                    <span className="font-medium mt-0.5 block break-words" title={visitor.hardware?.gpuRenderer}>
                      {visitor.hardware?.gpuRenderer || 'WebGL Renderer'} ({visitor.hardware?.gpuVendor || 'Vendor'})
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Audio Hash</span>
                    <span className="font-mono font-medium mt-0.5 block bg-muted/30 px-2 py-0.5 rounded text-[11px]">
                      {visitor.hardware?.audioHash || 'unsupported'}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">WebGL Hash</span>
                    <span className="font-mono font-medium mt-0.5 block bg-muted/30 px-2 py-0.5 rounded text-[11px]">
                      {visitor.hardware?.webglCanvasHash || 'N/A'} (Max Texture: {visitor.hardware?.webglMaxTextureSize || 0})
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">CPU Cores</span>
                    <span className="font-medium mt-0.5 block">
                      {visitor.hardware?.cpuCores ? `${visitor.hardware.cpuCores} Threads` : 'Unknown'}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Device Memory</span>
                    <span className="font-medium mt-0.5 block">
                      {visitor.hardware?.ramGB ? `~${visitor.hardware.ramGB} GB RAM` : 'Not Reported'}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Sensors</span>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span className="text-xs font-medium">
                        {[
                          visitor.capabilities?.hasAccelerometer && 'Accelerometer',
                          visitor.capabilities?.hasGyroscope && 'Gyroscope',
                          visitor.capabilities?.hasOrientation && 'Orientation',
                        ]
                          .filter(Boolean)
                          .join(', ') || 'No motion sensors detected'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Battery</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {visitor.capabilities?.batteryLevel !== undefined ? (
                        <>
                          {visitor.capabilities.batteryCharging ? (
                            <BatteryCharging className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Battery className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="font-medium">
                            {visitor.capabilities.batteryLevel}% {visitor.capabilities.batteryCharging ? '(Charging)' : ''}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Not reported by browser</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Touch Support</span>
                    <span className="font-medium mt-0.5 block">
                      {visitor.capabilities?.hasTouch ? `Touch (${visitor.capabilities.touchPoints} Max Touch Points)` : 'No Touch'}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Storage Estimate</span>
                    <span className="font-medium mt-0.5 block">
                      {visitor.capabilities?.storageQuotaMB ? `Quota: ~${visitor.capabilities.storageQuotaMB} MB` : 'Active'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: PRODUCTS BROWSED */}
            <TabsContent value="products" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold">Products Viewed</h4>
                  <p className="text-xs text-muted-foreground">
                    Items opened during browsing sessions
                  </p>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {viewedCount} products
                </Badge>
              </div>

              {viewedCount === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl">
                  <ShoppingBag className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-foreground">No Products Viewed Yet</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                    This visitor has navigated landing pages or blogs, but has not opened any individual product pages.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {visitor.viewedProducts?.map((prod, idx) => (
                    <div
                      key={idx}
                      className="group flex flex-col p-3 rounded-xl border bg-card/60 hover:border-primary/50 transition-all"
                    >
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted mb-2.5">
                        {prod.imageUrl ? (
                          <Image
                            src={prod.imageUrl}
                            alt={prod.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ShoppingBag className="w-8 h-8" />
                          </div>
                        )}
                        <Badge className="absolute top-2 right-2 bg-background/90 text-foreground font-mono text-[10px]">
                          {prod.viewCount} {prod.viewCount === 1 ? 'view' : 'views'}
                        </Badge>
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <Badge variant="outline" className="text-[10px] mb-1">
                            {prod.category || 'Apparel'}
                          </Badge>
                          <h5 className="text-xs font-bold line-clamp-1 group-hover:text-primary transition-colors">
                            {prod.title}
                          </h5>
                          <div className="text-xs font-mono font-semibold text-foreground mt-0.5">
                            ₹{prod.price}
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>
                            {prod.lastViewedAt
                              ? `${formatDistanceToNow(new Date(prod.lastViewedAt))} ago`
                              : 'Recently'}
                          </span>
                          <Link
                            href={`/products/${prod.slug || prod.productId}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 3: BROWSING JOURNEY */}
            <TabsContent value="journey" className="mt-0 space-y-4">
              <div>
                <h4 className="text-sm font-bold">Session & Navigation Log</h4>
                <p className="text-xs text-muted-foreground">
                  Sequential timeline of paths visited on Oktopus Clothing
                </p>
              </div>

              {(!visitor.pageHistory || visitor.pageHistory.length === 0) ? (
                <div className="text-center py-10 border border-dashed rounded-xl">
                  <Clock className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-xs text-muted-foreground">No page transitions recorded yet</p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {[...visitor.pageHistory].reverse().map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-3">
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background ring-2 ring-primary/20" />
                      <div className="p-3 rounded-xl border bg-card/60 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-mono text-xs font-bold text-foreground">
                            {step.path}
                          </div>
                          {step.title && (
                            <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                              {step.title}
                            </div>
                          )}
                          {step.referrer && (
                            <div className="text-[10px] text-muted-foreground/80 mt-0.5">
                              Referrer: {step.referrer}
                            </div>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground shrink-0 font-mono">
                          {format(new Date(step.timestamp), 'MMM dd, HH:mm:ss')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 4: CONVERTED ACCOUNT */}
            {isConverted && (
              <TabsContent value="customer" className="mt-0 space-y-4">
                <Card className="border-border/60 bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-500" />
                      Registered Customer Account
                    </CardTitle>
                    <CardDescription className="text-xs">
                      This visitor is linked to an existing registered customer profile.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Customer Name</span>
                        <span className="text-sm font-bold text-foreground mt-0.5 block">
                          {visitor.customer?.name || 'Customer'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Customer Email</span>
                        <span className="text-sm font-mono font-medium text-foreground mt-0.5 block">
                          {visitor.customer?.email}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">User Account ID</span>
                        <span className="font-mono text-xs text-foreground mt-0.5 block">
                          {visitor.customer?.userId}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Linked Timestamp</span>
                        <span className="text-xs text-foreground mt-0.5 block">
                          {visitor.customer?.linkedAt
                            ? format(new Date(visitor.customer.linkedAt), 'PPpp')
                            : 'Unknown'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <Link href={`/admin/users?search=${encodeURIComponent(visitor.customer?.email || '')}`}>
                        <Button size="sm" className="gap-1.5 text-xs">
                          Open Customer in Team & Access Control
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

