'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import {
  Fingerprint,
  Search,
  RefreshCw,
  Eye,
  MapPin,
  Globe,
  Monitor,
  Cpu,
  ShoppingBag,
  UserCheck,
  User,
  ShieldAlert,
  ArrowUpDown,
  Download,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Copy,
  Check,
} from 'lucide-react';
import { VisitorProfileDialog, VisitorRecord } from '@/components/admin/visitor-profile-dialog';

interface VisitorStats {
  totalVisitors: number;
  repeatVisitors: number;
  convertedUsers: number;
  activeToday: number;
  totalProductViews: number;
}

export default function AdminVisitorsPage() {
  const { user, isAlphaAdmin, hasPermission } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [visitors, setVisitors] = React.useState<VisitorRecord[]>([]);
  const [stats, setStats] = React.useState<VisitorStats>({
    totalVisitors: 0,
    repeatVisitors: 0,
    convertedUsers: 0,
    activeToday: 0,
    totalProductViews: 0,
  });

  // Query & Filter State
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<string>('last_seen');
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);

  // Inspector Dialog State
  const [selectedVisitor, setSelectedVisitor] = React.useState<VisitorRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const fetchVisitors = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        filter,
        sortBy,
      });
      if (search.trim()) {
        params.set('search', search.trim());
      }

      const res = await fetch(`/api/fingerprint?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setVisitors(data.visitors || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        toast({
          title: 'Error Loading Visitors',
          description: 'Failed to fetch visitor fingerprint logs.',
          variant: 'destructive',
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: 'Network Error',
        description: 'Unable to reach visitor fingerprint service.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, filter, sortBy, search, toast]);

  React.useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  // Handle Search submit / debounce
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVisitors();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: 'Copied',
      description: text,
    });
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleBlockIp = async (ip: string) => {
    try {
      const res = await fetch('/api/admin/ip-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, reason: 'Flagged from Visitor Fingerprinting panel' }),
      });
      if (res.ok) {
        toast({
          title: 'IP Blocked',
          description: `${ip} has been added to blocked network list.`,
        });
      } else {
        toast({
          title: 'Failed to Block IP',
          description: 'Could not update firewall rules.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Network failure while blocking IP.',
        variant: 'destructive',
      });
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (visitors.length === 0) return;
    const headers = [
      'Fingerprint ID',
      'Visitor ID',
      'Status',
      'IP Address',
      'City',
      'Country',
      'ISP',
      'OS',
      'Browser',
      'Screen Size',
      'CPU Cores',
      'RAM GB',
      'GPU',
      'Total Visits',
      'Products Viewed Count',
      'First Seen',
      'Last Seen',
    ];

    const rows = visitors.map((v) => [
      `"${v.fingerprintId}"`,
      `"${v.visitorId}"`,
      `"${v.customer?.isRegistered ? 'Registered User' : 'Anonymous'}"`,
      `"${v.ip}"`,
      `"${v.geo?.city || ''}"`,
      `"${v.geo?.country || ''}"`,
      `"${v.geo?.isp || ''}"`,
      `"${v.device?.os || ''}"`,
      `"${v.device?.browser || ''}"`,
      `"${v.display?.screenWidth || ''}x${v.display?.screenHeight || ''}"`,
      v.hardware?.cpuCores || '',
      v.hardware?.ramGB || '',
      `"${(v.hardware?.gpuRenderer || '').replace(/"/g, '""')}"`,
      v.analytics?.visitCount || 1,
      v.viewedProducts?.length || 0,
      `"${v.analytics?.firstSeenAt ? format(new Date(v.analytics.firstSeenAt), 'yyyy-MM-dd HH:mm') : ''}"`,
      `"${v.analytics?.lastSeenAt ? format(new Date(v.analytics.lastSeenAt), 'yyyy-MM-dd HH:mm') : ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `oktopus_visitor_fingerprints_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visitor Fingerprints</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track returning visitors, hardware environments, network data, and products viewed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchVisitors}
            disabled={loading}
            className="text-xs h-9 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
            disabled={visitors.length === 0}
            className="text-xs h-9 gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-card/70 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Total Visitors
              <Fingerprint className="w-4 h-4 text-muted-foreground" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono mt-1">
              {stats.totalVisitors.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
            Unique visitor profiles
          </CardContent>
        </Card>

        <Card className="bg-card/70 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Repeat Visitors
              <Activity className="w-4 h-4 text-muted-foreground" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono mt-1">
              {stats.repeatVisitors.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
            Visitors with 2+ visits
          </CardContent>
        </Card>

        <Card className="bg-card/70 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Active Today
              <Globe className="w-4 h-4 text-muted-foreground" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono mt-1">
              {stats.activeToday.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
            Recorded in last 24h
          </CardContent>
        </Card>

        <Card className="bg-card/70 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Product Views
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono mt-1">
              {stats.totalProductViews.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
            Total product pages viewed
          </CardContent>
        </Card>

        <Card className="bg-card/70 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Registered Users
              <UserCheck className="w-4 h-4 text-muted-foreground" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono mt-1">
              {stats.convertedUsers.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
            Linked customer accounts
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Controls */}
      <Card className="bg-card/80">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by Fingerprint ID, IP, City, Country, OS, Browser, or Product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </form>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <Select
                value={filter}
                onValueChange={(val) => {
                  setFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[170px] h-9 text-xs">
                  <SelectValue placeholder="Filter Visitors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Visitors</SelectItem>
                  <SelectItem value="repeat">Repeat Visitors (2+)</SelectItem>
                  <SelectItem value="viewed_products">With Viewed Products</SelectItem>
                  <SelectItem value="anonymous">Anonymous Only</SelectItem>
                  <SelectItem value="converted">Registered Users</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select
                value={sortBy}
                onValueChange={(val) => {
                  setSortBy(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[170px] h-9 text-xs">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_seen">Recently Active</SelectItem>
                  <SelectItem value="visits">Most Visits</SelectItem>
                  <SelectItem value="products_count">Most Products Viewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Visitor Fingerprint Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[200px] text-xs">Visitor Identity</TableHead>
                <TableHead className="text-xs">Location & Network</TableHead>
                <TableHead className="text-xs">Device & OS</TableHead>
                <TableHead className="text-xs">Hardware Specs</TableHead>
                <TableHead className="text-xs text-center">Visit Frequency</TableHead>
                <TableHead className="text-xs">Products Viewed</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-8 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : visitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-44 text-center">
                    <Fingerprint className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
                    <div className="font-semibold text-sm">No visitor fingerprints found</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {search ? 'Try clearing your search query.' : 'Visitor logs will populate as shoppers browse the website.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                visitors.map((v) => {
                  const isRegistered = Boolean(v.customer?.isRegistered);
                  const visits = v.analytics?.visitCount || 1;
                  const viewed = v.viewedProducts || [];

                  return (
                    <TableRow key={v._id || v.fingerprintId} className="hover:bg-muted/30">
                      {/* Identity */}
                      <TableCell className="align-top py-3">
                        <div className="flex items-start gap-2.5">
                          <div className={`p-2 rounded-xl shrink-0 ${isRegistered ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                            {isRegistered ? <UserCheck className="w-4 h-4" /> : <Fingerprint className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1 font-mono text-xs font-bold text-foreground">
                              <span title={v.fingerprintId}>{v.fingerprintId.substring(0, 14)}...</span>
                              <button
                                onClick={() => handleCopy(v.fingerprintId, v.fingerprintId)}
                                className="p-0.5 hover:text-primary transition-colors"
                                title="Copy Fingerprint ID"
                              >
                                {copiedId === v.fingerprintId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                              </button>
                            </div>
                            <div className="mt-1">
                              {isRegistered ? (
                                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                                  {v.customer?.name || 'Registered Customer'}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                  Anonymous Visitor
                                </Badge>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                              Last seen:{' '}
                              {v.analytics?.lastSeenAt
                                ? `${formatDistanceToNow(new Date(v.analytics.lastSeenAt))} ago`
                                : 'Just now'}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Location & Network */}
                      <TableCell className="align-top py-3">
                        <div className="text-xs">
                          <div className="font-semibold text-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                            {v.geo?.city ? `${v.geo.city}, ${v.geo.countryCode || v.geo.country}` : v.geo?.country || 'Unknown City'}
                          </div>
                          <div className="font-mono text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            {v.ip}
                          </div>
                          <div className="text-[10px] text-muted-foreground capitalize mt-0.5 flex items-center gap-1">
                            <Wifi className="w-3 h-3 text-blue-500 shrink-0" />
                            {v.network?.networkType || 'Broadband'} • {v.geo?.isp || 'ISP'}
                          </div>
                        </div>
                      </TableCell>

                      {/* Device & OS */}
                      <TableCell className="align-top py-3">
                        <div className="text-xs">
                          <div className="font-medium text-foreground">
                            {v.device?.os || 'Unknown OS'} {v.device?.osVersion || ''}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {v.device?.browser || 'Browser'} {v.device?.browserVersion?.split('.')[0] || ''}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {v.display?.screenWidth}x{v.display?.screenHeight} ({v.display?.pixelRatio || 1}x DPR)
                          </div>
                        </div>
                      </TableCell>

                      {/* Hardware Specs */}
                      <TableCell className="align-top py-3">
                        <div className="text-xs">
                          <div className="font-medium text-foreground">
                            {v.hardware?.cpuCores ? `${v.hardware.cpuCores} Cores` : 'CPU'}
                            {v.hardware?.ramGB ? ` • ~${v.hardware.ramGB} GB RAM` : ''}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate max-w-[150px] mt-0.5" title={v.hardware?.gpuRenderer}>
                            {v.hardware?.gpuRenderer?.split('(')[0] || 'WebGL GPU'}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {v.capabilities?.hasTouch ? 'Touch Screen' : 'Desktop Input'}
                          </div>
                        </div>
                      </TableCell>

                      {/* Visit Frequency */}
                      <TableCell className="align-top py-3 text-center">
                        <Badge
                          variant={visits >= 4 ? 'default' : visits >= 2 ? 'secondary' : 'outline'}
                          className="font-mono font-bold text-xs"
                        >
                          {visits} {visits === 1 ? 'Visit' : 'Visits'}
                        </Badge>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {v.analytics?.sessionCount || 1} sessions
                        </div>
                        {v.analytics?.visitDates && v.analytics.visitDates.length > 1 && (
                          <div className="text-[9px] text-primary font-medium mt-0.5">
                            {v.analytics.visitDates.length} days active
                          </div>
                        )}
                      </TableCell>

                      {/* Viewed Products */}
                      <TableCell className="align-top py-3">
                        {viewed.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">No products viewed</span>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              {viewed.slice(0, 3).map((p, idx) => (
                                <div
                                  key={idx}
                                  className="relative w-8 h-8 rounded-md overflow-hidden bg-muted border shrink-0"
                                  title={`${p.title} (viewed ${p.viewCount} times)`}
                                >
                                  {p.imageUrl ? (
                                    <Image src={p.imageUrl} alt={p.title} fill className="object-cover" />
                                  ) : (
                                    <ShoppingBag className="w-4 h-4 m-auto text-muted-foreground" />
                                  )}
                                </div>
                              ))}
                              {viewed.length > 3 && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-6">
                                  +{viewed.length - 3}
                                </Badge>
                              )}
                            </div>
                            <div className="text-[11px] font-medium text-foreground line-clamp-1">
                              {viewed[0]?.title}
                            </div>
                          </div>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="align-top py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedVisitor(v);
                            setIsDialogOpen(true);
                          }}
                          className="text-xs h-8 gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t bg-muted/10 text-xs text-muted-foreground">
            <div>
              Showing page {page} of {totalPages} ({totalCount} total visitors)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="h-8 gap-1 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="h-8 gap-1 text-xs"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Visitor 360 Dialog */}
      <VisitorProfileDialog
        visitor={selectedVisitor}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onBlockIp={handleBlockIp}
      />
    </div>
  );
}

