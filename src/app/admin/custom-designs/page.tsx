'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Trash2, IndianRupee, Eye, ExternalLink, Shirt, FileImage, Sliders } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type DesignStatus = 'pending' | 'approved' | 'rejected' | 'paid';

type PlacementData = {
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent?: number;
  scaleInches?: number;
  rotation?: number;
  printArea?: { width: number; height: number };
};

type CustomDesign = {
  _id: string;
  userId: string;
  userName: string;
  designUrl: string; // Raw uploaded artwork file
  mockupUrl?: string | null; // Composite snapshot of design on tshirt
  placement?: PlacementData | null;
  transform?: PlacementData | null;
  tshirtColor: string; // T-shirt view image URL
  colorName?: string;
  colorId?: string;
  viewImageUrl?: string;
  selectedView?: string;
  tshirtSize: string;
  fabricQuality?: string;
  printArea?: { width: number; height: number };
  notes?: string;
  status: DesignStatus;
  price?: number;
  createdAt: string;
};

type ColorOption = {
  _id: string;
  name: string;
  imageUrl: string;
  images?: string[];
};

const statusOptions: DesignStatus[] = ['pending', 'approved', 'rejected', 'paid'];

export default function CustomDesignsPage() {
  const [designs, setDesigns] = React.useState<CustomDesign[]>([]);
  const [colors, setColors] = React.useState<ColorOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [priceInputs, setPriceInputs] = React.useState<{ [key: string]: string }>({});
  const [selectedInspectDesign, setSelectedInspectDesign] = React.useState<CustomDesign | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = React.useState(false);
  const [showPlacementGuides, setShowPlacementGuides] = React.useState(true);

  const { toast } = useToast();

  const colorMap = React.useMemo(() => {
    return new Map(colors.map((c) => [c.imageUrl, c.name]));
  }, [colors]);

  const fetchDesignsAndColors = React.useCallback(async () => {
    try {
      setLoading(true);
      const [designsRes, colorsRes] = await Promise.all([
        fetch('/api/custom-designs'),
        fetch('/api/palette'),
      ]);

      if (!designsRes.ok) throw new Error('Failed to fetch custom designs');
      if (!colorsRes.ok) throw new Error('Failed to fetch colors');

      const designsData = await designsRes.json();
      const colorsData = await colorsRes.json();

      setDesigns(designsData);
      setColors(colorsData);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error fetching data',
        description: 'Could not load designs or colors.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchDesignsAndColors();
  }, [fetchDesignsAndColors]);

  const handleStatusChange = async (designId: string, status: DesignStatus) => {
    const price = priceInputs[designId] ? parseFloat(priceInputs[designId]) : undefined;

    if (status === 'approved' && (!price || price <= 0)) {
      toast({
        title: 'Invalid Price',
        description: 'Please set a valid price before approving a design.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/custom-designs/${designId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, price }),
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      setDesigns((prev) =>
        prev.map((d) => (d._id === designId ? { ...d, status, price } : d))
      );
      if (selectedInspectDesign && selectedInspectDesign._id === designId) {
        setSelectedInspectDesign((prev) => (prev ? { ...prev, status, price } : null));
      }
      toast({
        title: 'Status Updated',
        description: `Design status changed to ${status}.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Could not update design status.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (designId: string) => {
    try {
      const response = await fetch(`/api/custom-designs/${designId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete design');
      }
      setDesigns((prev) => prev.filter((d) => d._id !== designId));
      if (selectedInspectDesign?._id === designId) {
        setInspectModalOpen(false);
        setSelectedInspectDesign(null);
      }
      toast({
        title: 'Design Deleted',
        description: 'The custom design request has been deleted.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Could not delete the design request.',
        variant: 'destructive',
      });
    }
  };

  const handlePriceChange = (designId: string, value: string) => {
    setPriceInputs((prev) => ({ ...prev, [designId]: value }));
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      case 'paid':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const openInspection = (design: CustomDesign) => {
    setSelectedInspectDesign(design);
    setInspectModalOpen(true);
  };

  // Helper to extract normalized coordinates
  const getPlacement = (design: CustomDesign): PlacementData => {
    const p = (design.placement || design.transform || {}) as Partial<PlacementData>;
    return {
      xPercent: p.xPercent ?? 50,
      yPercent: p.yPercent ?? 38,
      widthPercent: p.widthPercent ?? 50,
      rotation: p.rotation ?? 0,
      scaleInches: p.scaleInches ?? design.printArea?.width ?? 9.5,
      printArea: design.printArea || p.printArea,
    };
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Custom Design Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review user-placed garment mockups, inspect original graphic files, and configure pricing.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDesignsAndColors} disabled={loading}>
          Refresh Queue
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
          <CardDescription>
            Each request includes the user&apos;s exact garment placement preview and the separate high-res graphic file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Garment Mockup</TableHead>
                  <TableHead>User / Customer</TableHead>
                  <TableHead>Garment & Placement</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : designs.length > 0 ? (
                  designs.map((design) => {
                    const placement = getPlacement(design);
                    const tshirtImg = design.viewImageUrl || design.tshirtColor;

                    return (
                      <TableRow key={design._id}>
                        {/* Garment Mockup Thumbnail */}
                        <TableCell>
                          <div
                            onClick={() => openInspection(design)}
                            className="relative h-16 w-16 rounded-lg overflow-hidden border border-border/80 bg-neutral-950 cursor-pointer group shadow-xs hover:border-primary transition-all"
                            title="Click to inspect exact placement and high-res artwork"
                          >
                            {design.mockupUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={design.mockupUrl}
                                alt="Garment Mockup"
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              // Live placement preview recreation
                              <div className="relative h-full w-full">
                                {tshirtImg && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={tshirtImg}
                                    alt="Garment"
                                    className="h-full w-full object-contain p-0.5"
                                  />
                                )}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={design.designUrl}
                                  alt="Placed Art"
                                  className="absolute object-contain pointer-events-none"
                                  style={{
                                    left: `${placement.xPercent}%`,
                                    top: `${placement.yPercent}%`,
                                    width: `${placement.widthPercent}%`,
                                    transform: `translate(-50%, -50%) rotate(${placement.rotation || 0}deg)`,
                                  }}
                                />
                              </div>
                            )}

                            {/* Hover Inspector Overlay */}
                            <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="h-4 w-4 text-foreground" />
                            </div>
                          </div>
                        </TableCell>

                        {/* Customer */}
                        <TableCell className="font-semibold">{design.userName}</TableCell>

                        {/* Garment & Placement Details */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">
                                {design.colorName || colorMap.get(design.tshirtColor) || 'Garment'}
                              </span>
                              <Badge variant="outline" className="text-[10px] font-mono">
                                {design.selectedView || 'Front'}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {design.fabricQuality || 'Regular'} • Size {design.tshirtSize}
                            </div>
                            <div className="text-[11px] text-primary font-mono">
                              {design.printArea ? `${design.printArea.width}" × ${design.printArea.height}"` : ''}{' '}
                              (X: {placement.xPercent}%, Y: {placement.yPercent}%)
                            </div>
                          </div>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(design.createdAt), 'PP')}
                        </TableCell>

                        {/* Price */}
                        <TableCell>
                          {design.status === 'pending' || design.status === 'approved' ? (
                            <div className="relative">
                              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                              <Input
                                type="number"
                                className="pl-7 h-8 text-xs font-mono w-28"
                                placeholder="Set Price"
                                value={priceInputs[design._id] !== undefined ? priceInputs[design._id] : (design.price || '')}
                                onChange={(e) => handlePriceChange(design._id, e.target.value)}
                                disabled={design.status !== 'pending'}
                              />
                            </div>
                          ) : design.price ? (
                            <span className="font-mono font-bold">₹{design.price.toFixed(2)}</span>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>

                        {/* Status Select */}
                        <TableCell>
                          {design.status === 'paid' ? (
                            <Badge variant={getStatusVariant(design.status)}>Paid</Badge>
                          ) : (
                            <Select
                              value={design.status}
                              onValueChange={(value: DesignStatus) => handleStatusChange(design._id, value)}
                            >
                              <SelectTrigger className="w-[125px] h-8 text-xs">
                                <SelectValue>
                                  <Badge variant={getStatusVariant(design.status)}>{design.status}</Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs font-semibold"
                            onClick={() => openInspection(design)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Inspect
                          </Button>

                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a
                              href={design.designUrl}
                              download={`artwork-${design._id}.png`}
                              title="Download Raw Artwork File"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Design Request?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Permanently removes this customization request and artwork.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(design._id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-28 text-muted-foreground">
                      No custom design requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* --- DETAILED ATELIER INSPECTION MODAL --- */}
      {selectedInspectDesign && (
        <Dialog open={inspectModalOpen} onOpenChange={setInspectModalOpen}>
          <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6">
            <DialogHeader className="border-b border-border/60 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                    <span>Custom Design Specification</span>
                    <Badge variant="outline" className="font-mono text-primary border-primary/40">
                      {selectedInspectDesign.status.toUpperCase()}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-xs mt-0.5">
                    Submitted by {selectedInspectDesign.userName} on{' '}
                    {format(new Date(selectedInspectDesign.createdAt), 'PPP')}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Tabs defaultValue="mockup" className="w-full mt-4">
              <TabsList className="grid grid-cols-2 w-full max-w-sm">
                <TabsTrigger value="mockup" className="text-xs font-bold">
                  <Shirt className="h-3.5 w-3.5 mr-1.5" />
                  Exact T-Shirt Mockup
                </TabsTrigger>
                <TabsTrigger value="artwork" className="text-xs font-bold">
                  <FileImage className="h-3.5 w-3.5 mr-1.5" />
                  Original Graphic File
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: EXACT T-SHIRT MOCKUP WITH PLACEMENT */}
              <TabsContent value="mockup" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Left Stage */}
                  <div className="md:col-span-7 space-y-2">
                    <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-border/80 bg-neutral-950 flex items-center justify-center shadow-lg">
                      {/* T-Shirt Garment Background */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedInspectDesign.viewImageUrl || selectedInspectDesign.tshirtColor}
                        alt="T-Shirt Garment"
                        className="h-full w-full object-contain p-2"
                      />

                      {/* Design Placement Overlay */}
                      {(() => {
                        const placement = getPlacement(selectedInspectDesign);
                        return (
                          <div
                            className={cn(
                              'absolute transition-all',
                              showPlacementGuides && 'ring-1 ring-primary/80 bg-primary/[0.04]'
                            )}
                            style={{
                              left: `${placement.xPercent}%`,
                              top: `${placement.yPercent}%`,
                              width: `${placement.widthPercent}%`,
                              transform: `translate(-50%, -50%) rotate(${placement.rotation || 0}deg)`,
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={selectedInspectDesign.designUrl}
                              alt="Placed Artwork"
                              className="w-full h-full object-contain drop-shadow-md"
                            />

                            {/* Corner Indicators */}
                            {showPlacementGuides && (
                              <>
                                <div className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-primary" />
                                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                                <div className="absolute -bottom-1 -left-1 h-2 w-2 rounded-full bg-primary" />
                                <div className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                              </>
                            )}
                          </div>
                        );
                      })()}

                      {/* Overlay Coordinate Badge */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                        <span className="rounded-md bg-black/80 px-2 py-1 border border-zinc-800 text-white">
                          View: {selectedInspectDesign.selectedView || 'Front'}
                        </span>
                        <span className="rounded-md bg-black/80 px-2 py-1 border border-zinc-800 text-primary">
                          X: {getPlacement(selectedInspectDesign).xPercent}% | Y:{' '}
                          {getPlacement(selectedInspectDesign).yPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center px-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPlacementGuides((v) => !v)}
                        className="text-xs text-muted-foreground hover:text-foreground h-7"
                      >
                        {showPlacementGuides ? 'Hide Placement Outlines' : 'Show Placement Outlines'}
                      </Button>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        Angle: {getPlacement(selectedInspectDesign).rotation || 0}°
                      </span>
                    </div>
                  </div>

                  {/* Right Specification Inspector */}
                  <div className="md:col-span-5 space-y-4">
                    <Card className="border-border/80 bg-card">
                      <CardHeader className="pb-3 border-b border-border/60">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider">
                          Garment & Print Specs
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-3 text-xs">
                        <div className="flex justify-between py-1 border-b border-border/40">
                          <span className="text-muted-foreground">Garment Color:</span>
                          <span className="font-bold text-foreground">
                            {selectedInspectDesign.colorName ||
                              colorMap.get(selectedInspectDesign.tshirtColor) ||
                              'Garment'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/40">
                          <span className="text-muted-foreground">Fabric Grade:</span>
                          <span className="font-bold text-foreground">
                            {selectedInspectDesign.fabricQuality || 'Regular Fit'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/40">
                          <span className="text-muted-foreground">Garment Size:</span>
                          <span className="font-bold font-mono text-foreground">
                            {selectedInspectDesign.tshirtSize}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/40">
                          <span className="text-muted-foreground">Print Scale:</span>
                          <span className="font-mono font-bold text-primary">
                            {selectedInspectDesign.printArea
                              ? `${selectedInspectDesign.printArea.width}" × ${selectedInspectDesign.printArea.height}"`
                              : 'Standard'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/40">
                          <span className="text-muted-foreground">Coordinates:</span>
                          <span className="font-mono font-bold text-foreground">
                            X: {getPlacement(selectedInspectDesign).xPercent}% | Y:{' '}
                            {getPlacement(selectedInspectDesign).yPercent}%
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Rotation:</span>
                          <span className="font-mono font-bold text-foreground">
                            {getPlacement(selectedInspectDesign).rotation || 0}°
                          </span>
                        </div>

                        {/* Customer Notes */}
                        {selectedInspectDesign.notes && (
                          <div className="pt-2 border-t border-border/60">
                            <span className="text-muted-foreground block text-[11px] mb-1 font-semibold uppercase tracking-wider">
                              Customer Notes:
                            </span>
                            <p className="rounded-lg bg-secondary/50 p-2.5 text-xs text-foreground italic">
                              &ldquo;{selectedInspectDesign.notes}&rdquo;
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Price & Approval Controls */}
                    <Card className="border-border/80 bg-card">
                      <CardHeader className="pb-3 border-b border-border/60">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider">
                          Quote & Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-3">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-muted-foreground">
                            Approval Price (₹):
                          </label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              type="number"
                              className="pl-7 h-9 text-xs font-mono font-bold"
                              value={
                                priceInputs[selectedInspectDesign._id] !== undefined
                                  ? priceInputs[selectedInspectDesign._id]
                                  : (selectedInspectDesign.price || '')
                              }
                              onChange={(e) => handlePriceChange(selectedInspectDesign._id, e.target.value)}
                              placeholder="Set final price"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-muted-foreground">Status:</label>
                          <Select
                            value={selectedInspectDesign.status}
                            onValueChange={(val: DesignStatus) =>
                              handleStatusChange(selectedInspectDesign._id, val)
                            }
                          >
                            <SelectTrigger className="h-9 text-xs font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((st) => (
                                <SelectItem key={st} value={st}>
                                  {st.charAt(0).toUpperCase() + st.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: ORIGINAL UPLOADED GRAPHIC FILE */}
              <TabsContent value="artwork" className="space-y-4 pt-4">
                <div className="space-y-4">
                  {/* High-res Artwork Container with Checkerboard Background for Transparency */}
                  <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-border/80 bg-[repeating-conic-gradient(#1e1e1e_0%_25%,#121212_0%_50%)] bg-[length:24px_24px] flex items-center justify-center p-8 shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedInspectDesign.designUrl}
                      alt="Raw Artwork Graphic"
                      className="max-h-full max-w-full object-contain drop-shadow-2xl"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-border/80 bg-card">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Original Customer Artwork File</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        High-resolution asset provided by customer for Direct-to-Garment or Screen Printing.
                      </p>
                    </div>

                    <Button asChild className="h-10 px-4 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground">
                      <a
                        href={selectedInspectDesign.designUrl}
                        download={`customer-artwork-${selectedInspectDesign._id}.png`}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Artwork File
                      </a>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
