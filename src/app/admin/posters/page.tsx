'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Image from 'next/image';
import {
  Trash2,
  Edit,
  Loader2,
  PlusCircle,
  Sparkles,
  ExternalLink,
  Layers,
  Calendar,
  Clock,
  Smartphone,
  Monitor,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X,
} from 'lucide-react';
import { usePoster, Poster } from '@/context/poster-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const DEFAULT_DESKTOP_PLACEHOLDER = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&auto=format&fit=crop&q=80';
const DEFAULT_MOBILE_PLACEHOLDER = 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80';

const emptyFormData: Omit<Poster, 'id' | '_id'> = {
  title: '',
  description: '',
  desktopImageUrl: '',
  mobileImageUrl: '',
  redirectPath: '/store',
  targetPages: ['all'],
  displayDurationSeconds: 8,
  durationDays: 7,
  startDate: new Date().toISOString().slice(0, 16),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  isActive: true,
  priority: 1,
};

const POPULAR_PAGES = [
  { label: 'All Pages', value: 'all' },
  { label: 'Home Page (/)', value: '/' },
  { label: 'Store (/store)', value: '/store' },
  { label: 'Categories (/categories)', value: '/categories' },
  { label: 'Rewards (/rewards)', value: '/rewards' },
  { label: 'Custom Designs (/custom-designs)', value: '/custom-designs' },
];

export default function AdminPostersPage() {
  const { posters, loading, addPoster, updatePoster, deletePoster, togglePosterStatus } = usePoster();

  const [formData, setFormData] = React.useState<Omit<Poster, 'id' | '_id'>>(emptyFormData);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [previewTab, setPreviewTab] = React.useState<'desktop' | 'mobile'>('desktop');
  const [customPageInput, setCustomPageInput] = React.useState('');

  // Live test popup preview modal
  const [previewModalPoster, setPreviewModalPoster] = React.useState<Poster | null>(null);
  const [previewModalDevice, setPreviewModalDevice] = React.useState<'desktop' | 'mobile'>('desktop');

  const formRef = React.useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Target page toggles
  const handleToggleTargetPage = (pageValue: string) => {
    setFormData((prev) => {
      let current = [...prev.targetPages];
      if (pageValue === 'all') {
        return { ...prev, targetPages: ['all'] };
      }

      current = current.filter((p) => p !== 'all');
      if (current.includes(pageValue)) {
        current = current.filter((p) => p !== pageValue);
        if (current.length === 0) current = ['all'];
      } else {
        current.push(pageValue);
      }
      return { ...prev, targetPages: current };
    });
  };

  const handleAddCustomPage = () => {
    if (!customPageInput.trim()) return;
    const formatted = customPageInput.trim().startsWith('/') ? customPageInput.trim() : `/${customPageInput.trim()}`;
    setFormData((prev) => {
      const current = prev.targetPages.filter((p) => p !== 'all');
      if (!current.includes(formatted)) {
        current.push(formatted);
      }
      return { ...prev, targetPages: current };
    });
    setCustomPageInput('');
  };

  // Duration in days changed -> update endDate
  const handleDurationDaysChange = (days: number) => {
    const numDays = Math.max(0, days);
    setFormData((prev) => {
      const start = prev.startDate ? new Date(prev.startDate) : new Date();
      const end = numDays > 0 ? new Date(start.getTime() + numDays * 24 * 60 * 60 * 1000) : null;
      return {
        ...prev,
        durationDays: numDays,
        endDate: end ? end.toISOString().slice(0, 16) : null,
      };
    });
  };

  const handleEditClick = (poster: Poster) => {
    setEditingId(poster.id);
    setFormData({
      title: poster.title,
      description: poster.description || '',
      desktopImageUrl: poster.desktopImageUrl,
      mobileImageUrl: poster.mobileImageUrl || poster.desktopImageUrl,
      redirectPath: poster.redirectPath || '',
      targetPages: poster.targetPages || ['all'],
      displayDurationSeconds: poster.displayDurationSeconds ?? 8,
      durationDays: poster.durationDays ?? 7,
      startDate: poster.startDate ? new Date(poster.startDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      endDate: poster.endDate ? new Date(poster.endDate).toISOString().slice(0, 16) : null,
      isActive: poster.isActive,
      priority: poster.priority || 1,
    });
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(emptyFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.desktopImageUrl) {
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...formData,
      mobileImageUrl: formData.mobileImageUrl.trim() || formData.desktopImageUrl.trim(),
      displayDurationSeconds: Number(formData.displayDurationSeconds) || 0,
      durationDays: Number(formData.durationDays) || 0,
      priority: Number(formData.priority) || 1,
    };

    let success = false;
    if (editingId) {
      success = await updatePoster(editingId, payload);
    } else {
      success = await addPoster(payload);
    }

    if (success) {
      resetForm();
    }
    setIsSubmitting(false);
  };

  // Metrics computation
  const now = new Date();
  const totalCount = posters.length;
  const activeCount = posters.filter((p) => p.isActive).length;
  const liveCount = posters.filter((p) => {
    if (!p.isActive) return false;
    if (p.startDate && new Date(p.startDate) > now) return false;
    if (p.endDate && new Date(p.endDate) < now) return false;
    return true;
  }).length;

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Exclusive Posters & Popups</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Launch interactive storefront posters with separate mobile/desktop creative, dedicated redirect links, and sequential queueing.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => {
            resetForm();
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm px-4 shrink-0"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Poster
        </Button>
      </div>

      {/* METRICS OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/60 border-border/50 shadow-sm">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Posters</p>
              <h3 className="text-2xl font-bold mt-1">{totalCount}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-secondary text-foreground">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-amber-500/30 shadow-sm">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-500">Live in Storefront</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-500">{liveCount}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/50 shadow-sm">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Enabled Campaigns</p>
              <h3 className="text-2xl font-bold mt-1">{activeCount}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-secondary text-foreground">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/50 shadow-sm">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Queue Mode</p>
              <div className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>One-by-One Active</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-secondary text-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CREATE / EDIT POSTER FORM */}
      <div ref={formRef}>
        <Card className="border-amber-500/20 bg-card/60 shadow-md overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4 bg-muted/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <span>{editingId ? 'Edit Exclusive Poster' : 'Create Exclusive Poster'}</span>
                  {editingId && <Badge variant="outline" className="text-amber-500 border-amber-500/30">Editing</Badge>}
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Configure desktop & mobile images, dedicated click-through redirect, target routes, and duration.
                </CardDescription>
              </div>

              {editingId && (
                <Button variant="ghost" size="sm" onClick={resetForm} className="text-xs text-muted-foreground hover:text-foreground">
                  Cancel Edit
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ROW 1: TITLE & REDIRECT PATH */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-6 space-y-2">
                  <Label htmlFor="title" className="text-xs font-semibold">Poster Campaign Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Summer Typography Drop 2026"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-[11px] text-muted-foreground">Admin identifier and fallback title.</p>
                </div>

                <div className="md:col-span-6 space-y-2">
                  <Label htmlFor="redirectPath" className="text-xs font-semibold flex items-center justify-between">
                    <span>Dedicated Redirect Path *</span>
                    <span className="text-[10px] text-muted-foreground">When clicked</span>
                  </Label>
                  <Input
                    id="redirectPath"
                    name="redirectPath"
                    value={formData.redirectPath}
                    onChange={handleInputChange}
                    placeholder="e.g. /store or /products/summer-tee"
                    disabled={isSubmitting}
                  />
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-muted-foreground">Quick Fill:</span>
                    {['/store', '/rewards', '/categories', '/custom-designs'].map((path) => (
                      <button
                        key={path}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, redirectPath: path }))}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-secondary/80 hover:bg-secondary text-secondary-foreground transition"
                      >
                        {path}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ROW 2: IMAGES (DESKTOP & MOBILE) & LIVE PREVIEW TABS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start border-y border-border/40 py-5">
                <div className="lg:col-span-7 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="desktopImageUrl" className="text-xs font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-primary" />
                        <span>Desktop View Image URL *</span>
                      </span>
                      <span className="text-[11px] text-amber-400 font-mono">1200 × 675 px (16:9)</span>
                    </Label>
                    <Input
                      id="desktopImageUrl"
                      name="desktopImageUrl"
                      value={formData.desktopImageUrl}
                      onChange={handleInputChange}
                      placeholder="https://images.unsplash.com/... or https://i.ibb.co/..."
                      required
                      disabled={isSubmitting}
                      className="font-mono text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Best size: <strong>1200 × 675 px</strong> (16:9 Landscape) or <strong>1080 × 1350 px</strong> (4:5 Portrait). Shown on screens ≥ 768px.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobileImageUrl" className="text-xs font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                        <span>Mobile View Image URL</span>
                      </span>
                      <span className="text-[11px] text-amber-400 font-mono">1080 × 1350 px (4:5)</span>
                    </Label>
                    <Input
                      id="mobileImageUrl"
                      name="mobileImageUrl"
                      value={formData.mobileImageUrl}
                      onChange={handleInputChange}
                      placeholder="Leave blank to use desktop image, or provide vertical mobile poster"
                      disabled={isSubmitting}
                      className="font-mono text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Best size: <strong>1080 × 1350 px</strong> (4:5 vertical fit) or <strong>1080 × 1920 px</strong> (9:16 full vertical).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-semibold">Optional Campaign Subtitle / Note</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="e.g. Flash sale ending this Sunday. Get 20% off all hoodies."
                      rows={2}
                      disabled={isSubmitting}
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* VISUAL DEVICE PREVIEW */}
                <div className="lg:col-span-5 bg-zinc-950 border border-border/60 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                    <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      Live Device Frame Preview
                    </span>

                    <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setPreviewTab('desktop')}
                        className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition ${
                          previewTab === 'desktop' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Monitor className="w-3 h-3" />
                        Desktop
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('mobile')}
                        className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition ${
                          previewTab === 'mobile' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        Mobile
                      </button>
                    </div>
                  </div>

                  {/* FRAME SIMULATION */}
                  <div className="flex items-center justify-center p-2 min-h-[220px]">
                    {previewTab === 'desktop' ? (
                      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-xl group">
                        <Image
                          src={formData.desktopImageUrl || DEFAULT_DESKTOP_PLACEHOLDER}
                          alt="Desktop preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        {/* Simulated Top Right Close Button */}
                        <div className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white border border-white/20">
                          <X className="w-3.5 h-3.5" />
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white">
                          Desktop 16:9
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-40 aspect-[9/16] rounded-2xl overflow-hidden border-2 border-zinc-700 bg-zinc-900 shadow-2xl">
                        <Image
                          src={formData.mobileImageUrl || formData.desktopImageUrl || DEFAULT_MOBILE_PLACEHOLDER}
                          alt="Mobile preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        {/* Simulated Top Right Close Button */}
                        <div className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white border border-white/20">
                          <X className="w-3 h-3" />
                        </div>
                        <div className="absolute bottom-2 inset-x-2 text-center py-0.5 rounded bg-black/60 text-[9px] text-white">
                          Mobile 9:16
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-center text-zinc-500">
                    Includes floating top-right close button and click-through redirect trigger.
                  </p>
                </div>
              </div>

              {/* ROW 3: TARGET PAGES */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold flex items-center justify-between">
                  <span>In Which Pages Will This Poster Popup? *</span>
                  <span className="text-[11px] text-muted-foreground">Select one or multiple storefront pages</span>
                </Label>

                <div className="flex flex-wrap gap-2">
                  {POPULAR_PAGES.map((page) => {
                    const isSelected = formData.targetPages.includes(page.value);
                    return (
                      <button
                        key={page.value}
                        type="button"
                        onClick={() => handleToggleTargetPage(page.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-sm'
                            : 'bg-secondary/40 border-border text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />}
                        <span>{page.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* CUSTOM PATH INPUT */}
                <div className="flex items-center gap-2 max-w-md pt-1">
                  <Input
                    placeholder="Add custom route e.g. /profile or /about"
                    value={customPageInput}
                    onChange={(e) => setCustomPageInput(e.target.value)}
                    className="text-xs h-8"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomPage}
                    className="h-8 text-xs shrink-0"
                  >
                    Add Page
                  </Button>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                  <span className="text-muted-foreground">Currently Targeted:</span>
                  {formData.targetPages.map((target) => (
                    <Badge key={target} variant="secondary" className="font-mono text-[11px]">
                      {target}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* ROW 4: DURATION IN DAYS & DURATION IN SECONDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-border/40 pt-5">
                <div className="space-y-2">
                  <Label htmlFor="durationDays" className="text-xs font-semibold flex items-center justify-between">
                    <span>Duration in Days *</span>
                    <span className="text-[10px] text-muted-foreground">Campaign lifespan</span>
                  </Label>
                  <Input
                    id="durationDays"
                    name="durationDays"
                    type="number"
                    min="0"
                    value={formData.durationDays}
                    onChange={(e) => handleDurationDaysChange(Number(e.target.value))}
                    placeholder="7"
                    disabled={isSubmitting}
                  />
                  <p className="text-[11px] text-muted-foreground">Days until poster automatically expires (0 for infinite).</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayDurationSeconds" className="text-xs font-semibold flex items-center justify-between">
                    <span>Duration in Seconds *</span>
                    <span className="text-[10px] text-muted-foreground">Per view</span>
                  </Label>
                  <Input
                    id="displayDurationSeconds"
                    name="displayDurationSeconds"
                    type="number"
                    min="0"
                    value={formData.displayDurationSeconds}
                    onChange={handleInputChange}
                    placeholder="8"
                    disabled={isSubmitting}
                  />
                  <p className="text-[11px] text-muted-foreground">Seconds shown before auto-advancing (0 to disable timer).</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-xs font-semibold flex items-center justify-between">
                    <span>Queue Priority</span>
                    <span className="text-[10px] text-muted-foreground">Order in queue</span>
                  </Label>
                  <Input
                    id="priority"
                    name="priority"
                    type="number"
                    min="1"
                    value={formData.priority}
                    onChange={handleInputChange}
                    placeholder="1"
                    disabled={isSubmitting}
                  />
                  <p className="text-[11px] text-muted-foreground">1 appears first, 2 appears second, etc.</p>
                </div>

                <div className="space-y-2 flex flex-col justify-between">
                  <Label className="text-xs font-semibold">Active Status</Label>
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/20">
                    <span className="text-xs text-muted-foreground">
                      {formData.isActive ? 'Active (Live)' : 'Inactive (Draft)'}
                    </span>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Toggle to enable or pause this poster.</p>
                </div>
              </div>

              {/* FORM SUBMISSION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm px-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Poster...
                    </>
                  ) : editingId ? (
                    'Update Exclusive Poster'
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Exclusive Poster
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* POSTERS DIRECTORY & MANAGEMENT TABLE */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl">Posters Directory</CardTitle>
              <CardDescription className="text-xs">
                All configured exclusive storefront posters, page targets, duration schedules, and queue statuses.
              </CardDescription>
            </div>
            <Badge variant="outline" className="w-fit text-xs font-medium">
              Sequential Display Active (Queue)
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6 overflow-x-auto">
          <div className="border rounded-xl overflow-hidden w-full">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-16">Creative</TableHead>
                  <TableHead>Title & Campaign</TableHead>
                  <TableHead>Target Pages</TableHead>
                  <TableHead>Duration Schedule</TableHead>
                  <TableHead>Redirect Path</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-12 w-16 rounded-md" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : posters.length > 0 ? (
                  posters.map((poster) => {
                    const isExpired = poster.endDate && new Date(poster.endDate) < now;
                    return (
                      <TableRow key={poster.id} className="hover:bg-muted/40 transition">
                        {/* THUMBNAILS */}
                        <TableCell>
                          <div className="relative h-12 w-16 rounded-lg overflow-hidden border border-border bg-black shrink-0">
                            <Image
                              src={poster.desktopImageUrl}
                              alt={poster.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        </TableCell>

                        {/* TITLE & DESCRIPTION */}
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="font-semibold text-sm flex items-center gap-1.5">
                              <span>{poster.title}</span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                                Pri #{poster.priority || 1}
                              </Badge>
                            </div>
                            {poster.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {poster.description}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        {/* TARGET PAGES */}
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {poster.targetPages?.map((p) => (
                              <Badge key={p} variant="secondary" className="text-[10px] px-1.5 py-0">
                                {p === 'all' ? 'All Pages' : p}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>

                        {/* DURATION IN DAYS & SECONDS */}
                        <TableCell>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="w-3 h-3 text-amber-500 shrink-0" />
                              <span>{poster.durationDays > 0 ? `${poster.durationDays} Days` : 'Unlimited Days'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3 h-3 text-sky-400 shrink-0" />
                              <span>{poster.displayDurationSeconds > 0 ? `${poster.displayDurationSeconds}s on screen` : 'Manual close'}</span>
                            </div>
                          </div>
                        </TableCell>

                        {/* REDIRECT PATH */}
                        <TableCell>
                          {poster.redirectPath ? (
                            <a
                              href={poster.redirectPath}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline font-mono"
                            >
                              <span>{poster.redirectPath}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </TableCell>

                        {/* STATUS TOGGLE */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={poster.isActive}
                              onCheckedChange={() => togglePosterStatus(poster.id, poster.isActive)}
                            />
                            <span className="text-xs">
                              {isExpired ? (
                                <Badge variant="outline" className="text-destructive border-destructive/30 text-[10px]">
                                  Expired
                                </Badge>
                              ) : poster.isActive ? (
                                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px]">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground text-[10px]">
                                  Disabled
                                </Badge>
                              )}
                            </span>
                          </div>
                        </TableCell>

                        {/* ACTIONS */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setPreviewModalPoster(poster);
                                setPreviewModalDevice('desktop');
                              }}
                              title="Test Live Storefront View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => handleEditClick(poster)}
                              title="Edit Poster"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => deletePoster(poster.id)}
                              title="Delete Poster"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-32">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Sparkles className="h-8 w-8 text-amber-500/50" />
                        <p className="text-sm font-medium">No exclusive posters configured yet.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
                          className="mt-1"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create Your First Poster
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* LIVE TEST SIMULATION MODAL */}
      {previewModalPoster && (
        <Dialog open={Boolean(previewModalPoster)} onOpenChange={() => setPreviewModalPoster(null)}>
          <DialogContent className="max-w-2xl bg-zinc-950 border border-zinc-800 text-white p-0 overflow-hidden shadow-2xl">
            <DialogHeader className="p-4 border-b border-zinc-800 flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-sm font-bold flex items-center gap-2">
                  <span>Storefront Simulation: {previewModalPoster.title}</span>
                </DialogTitle>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Redirects to: {previewModalPoster.redirectPath || 'None'}
                </p>
              </div>

              <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 mr-6">
                <button
                  type="button"
                  onClick={() => setPreviewModalDevice('desktop')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                    previewModalDevice === 'desktop' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3 h-3" />
                  Desktop View
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModalDevice('mobile')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                    previewModalDevice === 'mobile' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  Mobile View
                </button>
              </div>
            </DialogHeader>

            <div className="p-6 flex items-center justify-center bg-black/60">
              <div
                className={`relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl group ${
                  previewModalDevice === 'desktop' ? 'w-full aspect-[16/9]' : 'w-64 aspect-[9/16]'
                }`}
              >
                {/* TOP RIGHT CLOSE BUTTON */}
                <div className="absolute top-3 right-3 z-50 p-2 rounded-full bg-black/70 text-white border border-white/20 shadow-lg cursor-pointer">
                  <X className="w-4 h-4" />
                </div>

                <Image
                  src={
                    previewModalDevice === 'desktop'
                      ? previewModalPoster.desktopImageUrl
                      : previewModalPoster.mobileImageUrl || previewModalPoster.desktopImageUrl
                  }
                  alt={previewModalPoster.title}
                  fill
                  unoptimized
                  className="object-cover"
                />

                {previewModalPoster.redirectPath && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-center justify-between text-white">
                    <span className="text-xs font-bold truncate">{previewModalPoster.title}</span>
                    <span className="text-[10px] px-2 py-1 rounded bg-amber-500 text-black font-semibold">
                      Click to Open
                    </span>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
