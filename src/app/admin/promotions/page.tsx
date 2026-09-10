'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import Image from 'next/image';
import { Trash2, Edit, Loader2, PlusCircle, Megaphone, Image as ImageIcon, Sparkles, ArrowRight, Eye } from 'lucide-react';
import { usePromotion, Promotion } from '@/context/promotion-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Badge } from "@/components/ui/badge";

const PRESET_PLACEMENTS = [
  { id: 'store_hero', label: 'Storefront Hero Billboard (store_hero / home_hero)' },
  { id: 'store_page', label: 'Store Page Mid Banner (store_page)' },
  { id: 'products_page', label: 'Products Catalog Banner (products_page)' },
  { id: 'collections_page', label: 'Collections Page Banner (collections_page)' },
  { id: 'custom_design_page', label: 'Custom Studio Banner (custom_design_page)' },
  { id: 'checkout_page', label: 'Checkout & Cart Banner (checkout_page)' },
  { id: 'about_page', label: 'About Us Brand Banner (about_page)' },
  { id: 'contact_page', label: 'Contact Support Banner (contact_page)' },
  { id: 'archive_page', label: 'Archive & Drops Banner (archive_page)' },
  { id: 'mobile_banner', label: 'Mobile App Hero Carousel (mobile_banner)' },
];

const emptyPromotion = {
  id: '',
  title: '',
  description: '',
  imageUrl: '',
  ctaText: 'SHOP NOW',
  ctaLink: '/products',
  placement: 'products_page',
  isActive: true,
};

export default function AdminPromotionsPage() {
  const { promotions, addPromotion, deletePromotion, updatePromotion, loading } = usePromotion();
  const [formData, setFormData] = React.useState(emptyPromotion);
  const [customPlacementInput, setCustomPlacementInput] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [selectedPlacementFilter, setSelectedPlacementFilter] = React.useState<string>('all');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (promotion: Promotion) => {
    setIsEditing(true);
    const isPreset = PRESET_PLACEMENTS.some(p => p.id === promotion.placement);
    setFormData({
      id: promotion.id,
      title: promotion.title,
      description: promotion.description || '',
      imageUrl: promotion.imageUrl,
      ctaText: promotion.ctaText || 'SHOP NOW',
      ctaLink: promotion.ctaLink || '/products',
      placement: isPreset ? (promotion.placement || 'products_page') : 'custom',
      isActive: promotion.isActive ?? true,
    });
    if (!isPreset && promotion.placement) {
      setCustomPlacementInput(promotion.placement);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.imageUrl) {
      setIsSubmitting(true);

      const finalPlacement = formData.placement === 'custom' ? customPlacementInput.trim() : formData.placement;

      const promotionData = {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        ctaText: formData.ctaText || 'SHOP NOW',
        ctaLink: formData.ctaLink || '/products',
        placement: finalPlacement || 'products_page',
        isActive: formData.isActive,
      };

      if (isEditing) {
        await updatePromotion({ ...promotionData, id: formData.id });
      } else {
        await addPromotion(promotionData);
      }

      resetForm();
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (promotion: Promotion) => {
    const updatedPromotion = { ...promotion, isActive: !promotion.isActive };
    await updatePromotion(updatedPromotion);
  };

  const resetForm = () => {
    setFormData(emptyPromotion);
    setCustomPlacementInput('');
    setIsEditing(false);
  };

  const activePlacement = formData.placement === 'custom' ? customPlacementInput : formData.placement;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] p-6 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center space-x-3">
            <ImageIcon className="w-7 h-7 text-[#0F824B]" />
            <h1 className="text-3xl font-black font-bebas uppercase tracking-wider text-white">Page Banner & Promotion Customizer</h1>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Upload custom banner graphics, titles, descriptions, and CTA links for every page on the site.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Left Column: Form & Live Preview */}
        <div className="md:col-span-5 space-y-6">
          <Card className="bg-[#141414] border-white/10 text-white">
            <CardHeader>
              <CardTitle className="font-bebas text-2xl uppercase tracking-wider">{isEditing ? 'Edit Page Banner' : 'Add New Page Banner'}</CardTitle>
              <CardDescription className="text-zinc-400 font-mono text-xs">
                {isEditing ? 'Update banner parameters for the selected slot.' : 'Publish a custom banner to any section on the site.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="placement" className="text-zinc-300 font-bold uppercase">Target Page Placement Slot *</Label>
                  <select
                    id="placement"
                    name="placement"
                    value={formData.placement}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#0A0A0A] text-xs text-white focus:outline-none focus:border-[#0F824B]"
                  >
                    {PRESET_PLACEMENTS.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                    <option value="custom">Custom Placement Slot Key...</option>
                  </select>
                </div>

                {formData.placement === 'custom' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="customPlacement" className="text-zinc-300 font-bold uppercase">Custom Placement Key *</Label>
                    <Input
                      id="customPlacement"
                      value={customPlacementInput}
                      onChange={(e) => setCustomPlacementInput(e.target.value)}
                      placeholder="e.g. homepage_popup"
                      required
                      className="bg-[#0A0A0A] border-white/10 text-white text-xs h-10 rounded-xl"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-zinc-300 font-bold uppercase">Banner Headline / Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. AUTUMN STREETWEAR DROP"
                    required
                    disabled={isSubmitting}
                    className="bg-[#0A0A0A] border-white/10 text-white text-xs h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-zinc-300 font-bold uppercase">Description / Subtitle</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="e.g. Heavyweight tees & engineered drop hoodies..."
                    disabled={isSubmitting}
                    className="bg-[#0A0A0A] border-white/10 text-white text-xs rounded-xl min-h-[70px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="imageUrl" className="text-zinc-300 font-bold uppercase">Image URL *</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/... or https://domain.com/banner.jpg"
                    required
                    disabled={isSubmitting}
                    className="bg-[#0A0A0A] border-white/10 text-white text-xs h-10 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ctaText" className="text-zinc-300 font-bold uppercase">CTA Button Text</Label>
                    <Input
                      id="ctaText"
                      name="ctaText"
                      value={formData.ctaText}
                      onChange={handleInputChange}
                      placeholder="e.g. EXPLORE NOW"
                      disabled={isSubmitting}
                      className="bg-[#0A0A0A] border-white/10 text-white text-xs h-10 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ctaLink" className="text-zinc-300 font-bold uppercase">Target CTA Link</Label>
                    <Input
                      id="ctaLink"
                      name="ctaLink"
                      value={formData.ctaLink}
                      onChange={handleInputChange}
                      placeholder="e.g. /products"
                      disabled={isSubmitting}
                      className="bg-[#0A0A0A] border-white/10 text-white text-xs h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <Switch
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="isActive" className="text-xs font-mono font-bold text-white uppercase">Publish & Activate Immediately</Label>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="w-full bg-[#0F824B] hover:bg-[#0b663a] text-black font-bold h-11 text-xs rounded-full uppercase" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditing ? 'Updating...' : 'Publishing...'}</> : (isEditing ? 'Update Page Banner' : 'Publish Page Banner')}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting} className="border-white/20 text-white hover:bg-white hover:text-black rounded-full h-11 px-6">
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Live Preview Card */}
          <Card className="bg-[#141414] border-white/10 text-white overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-mono font-bold text-[#0F824B] uppercase flex items-center gap-2">
                <Eye className="w-4 h-4" /> LIVE BANNER PREVIEW ({activePlacement || 'products_page'})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#0A0A0A] border border-white/10 p-6 flex flex-col justify-end">
                {formData.imageUrl ? (
                  <Image
                    src={formData.imageUrl}
                    alt={formData.title || 'Preview'}
                    fill
                    className="object-cover opacity-35"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0A0A] via-zinc-900 to-black opacity-90" />
                )}
                <div className="relative z-10 space-y-2">
                  <span className="text-[9px] font-mono font-bold text-[#0F824B] uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> PREVIEW • {activePlacement}
                  </span>
                  <h4 className="text-xl font-black font-bebas uppercase tracking-wider text-white leading-tight">
                    {formData.title || 'YOUR BANNER HEADLINE'}
                  </h4>
                  {formData.description && (
                    <p className="text-[10px] text-zinc-300 font-sans line-clamp-2">{formData.description}</p>
                  )}
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 bg-[#0F824B] text-white font-bold text-[10px] px-4 py-1.5 rounded-full uppercase font-mono">
                      {formData.ctaText || 'SHOP NOW'} <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Database Banners Table */}
        <div className="md:col-span-7">
          <Card className="bg-[#141414] border-white/10 text-white">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <CardTitle className="font-bebas text-2xl uppercase tracking-wider">Active Site Banners ({promotions.length})</CardTitle>
                <CardDescription className="text-zinc-400 font-mono text-xs">Filter, view, edit, or remove published page banners.</CardDescription>
              </div>

              {/* Placement Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button
                  type="button"
                  variant={selectedPlacementFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  className={`text-[10px] font-mono font-bold uppercase ${selectedPlacementFilter === 'all' ? 'bg-[#0F824B] text-white' : 'border-white/20 text-white'}`}
                  onClick={() => setSelectedPlacementFilter('all')}
                >
                  All Slots
                </Button>
                {PRESET_PLACEMENTS.slice(0, 5).map((opt) => (
                  <Button
                    key={opt.id}
                    type="button"
                    variant={selectedPlacementFilter === opt.id ? 'default' : 'outline'}
                    size="sm"
                    className={`text-[10px] font-mono font-bold uppercase ${selectedPlacementFilter === opt.id ? 'bg-[#0F824B] text-white' : 'border-white/20 text-zinc-300'}`}
                    onClick={() => setSelectedPlacementFilter(opt.id)}
                  >
                    {opt.id}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0A0A0A]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-zinc-400 font-mono text-xs">Banner Image</TableHead>
                      <TableHead className="text-zinc-400 font-mono text-xs">Title & Placement</TableHead>
                      <TableHead className="text-zinc-400 font-mono text-xs">Status</TableHead>
                      <TableHead className="text-right text-zinc-400 font-mono text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <TableRow key={index} className="border-white/10">
                          <TableCell><Skeleton className="h-12 w-24 rounded-lg bg-zinc-900" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-36 bg-zinc-900" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-12 bg-zinc-900" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-20 bg-zinc-900" /></TableCell>
                        </TableRow>
                      ))
                    ) : promotions.length > 0 ? (
                      promotions
                        .filter(p => selectedPlacementFilter === 'all' || p.placement === selectedPlacementFilter || (!p.placement && selectedPlacementFilter === 'home_page'))
                        .map((promo) => (
                          <TableRow key={promo.id} className="border-white/10 hover:bg-white/5">
                            <TableCell>
                              <div className="w-24 h-12 rounded-lg overflow-hidden relative bg-zinc-900 border border-white/10">
                                <Image src={promo.imageUrl || 'https://placehold.co/96x48.png'} alt={promo.title} layout="fill" objectFit="cover" unoptimized />
                              </div>
                            </TableCell>
                            <TableCell className="font-mono">
                              <div className="font-bold text-white text-xs truncate max-w-[200px]">{promo.title}</div>
                              <Badge variant="outline" className="text-[10px] font-mono mt-1 text-[#0F824B] border-[#0F824B]/30 bg-[#0F824B]/10">
                                {promo.placement || 'home_page'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={promo.isActive}
                                onCheckedChange={() => handleStatusToggle(promo)}
                                aria-label="Toggle active status"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="mr-1 text-zinc-300 hover:text-white hover:bg-white/10" onClick={() => handleEditClick(promo)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/20" onClick={() => deletePromotion(promo.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-32">
                          <div className="flex flex-col items-center gap-2 text-zinc-500 font-mono">
                            <Megaphone className="h-8 w-8 text-[#0F824B]" />
                            <p className="text-xs">No banners found for this filter slot.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
