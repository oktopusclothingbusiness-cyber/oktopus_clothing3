'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit2, Loader2, PlusCircle, Palette, Image as ImageIcon, X, Check, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

type ColorOption = {
  _id: string;
  name: string;
  imageUrl: string;
  images?: string[];
};

export default function AdminPalettePage() {
  const [colors, setColors] = React.useState<ColorOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [name, setName] = React.useState('');
  const [images, setImages] = React.useState<string[]>(['']);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const formCardRef = React.useRef<HTMLDivElement>(null);

  const fetchColors = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/palette');
      if (!response.ok) throw new Error('Failed to fetch colors');
      const data = await response.json();
      setColors(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Could not fetch colors', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  const handleAddImageUrlField = () => {
    setImages(prev => [...prev, '']);
  };

  const handleRemoveImageUrlField = (index: number) => {
    if (images.length <= 1) {
      setImages(['']);
      return;
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUrlChange = (index: number, value: string) => {
    setImages(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleEditClick = (color: ColorOption) => {
    setEditingId(color._id);
    setName(color.name);
    const colorImages = Array.isArray(color.images) && color.images.length > 0
      ? color.images
      : (color.imageUrl ? [color.imageUrl] : ['']);
    setImages(colorImages);

    if (formCardRef.current) {
      formCardRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setImages(['']);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validImages = images.map(u => u.trim()).filter(Boolean);

    if (!name.trim()) {
      toast({ title: 'Missing Name', description: 'Please enter a color name.', variant: 'destructive' });
      return;
    }

    if (validImages.length === 0) {
      toast({ title: 'Missing Image', description: 'Please provide at least one valid image URL.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        imageUrl: validImages[0],
        images: validImages,
      };

      if (editingId) {
        // Update existing color
        const response = await fetch(`/api/palette/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to update color');
        toast({ title: 'Success', description: `Color "${name}" updated successfully.` });
      } else {
        // Create new color
        const response = await fetch('/api/palette', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to add color');
        toast({ title: 'Success', description: `Color "${name}" added to palette.` });
      }

      await fetchColors();
      handleCancelEdit();
    } catch (error) {
      toast({
        title: 'Error',
        description: editingId ? 'Could not update color option.' : 'Could not add color option.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (colorId: string) => {
    if (!confirm('Are you sure you want to delete this color option?')) return;

    try {
      const response = await fetch(`/api/palette/${colorId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete color');
      setColors(prev => prev.filter(c => c._id !== colorId));
      if (editingId === colorId) {
        handleCancelEdit();
      }
      toast({ title: 'Success', description: 'Color option removed from palette.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Could not delete color option.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customization Palette Management</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage blank T-shirt colors and multi-angle mockups available for customer design customization.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* ADD / EDIT FORM (1 COLUMN) */}
        <div className="md:col-span-1" ref={formCardRef}>
          <Card className={editingId ? 'border-primary shadow-md' : 'shadow-xs'}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  {editingId ? 'Edit T-shirt Color' : 'Add T-shirt Color'}
                </CardTitle>
                {editingId && (
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                    Editing Mode
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs">
                {editingId 
                  ? 'Update color name and multi-angle image links.' 
                  : 'Add a new blank T-shirt color with multiple views (Front, Back, etc.).'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold">Color Name *</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="e.g., Midnight Black" 
                    required 
                    disabled={isSubmitting}
                    className="h-9 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold">Multi-Angle Image URLs *</Label>
                    <span className="text-[10px] text-muted-foreground">Front, Back, Side, etc.</span>
                  </div>

                  <div className="space-y-2">
                    {images.map((imgUrl, idx) => (
                      <div key={idx} className="space-y-1.5 p-2 rounded-lg bg-muted/40 border border-border/60">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-muted-foreground w-12 shrink-0">
                            {idx === 0 ? 'Front' : idx === 1 ? 'Back' : `View ${idx + 1}`}
                          </span>
                          <Input
                            value={imgUrl}
                            onChange={e => handleImageUrlChange(idx, e.target.value)}
                            placeholder="https://.../tshirt.png"
                            disabled={isSubmitting}
                            className="h-8 text-xs font-mono"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveImageUrlField(idx)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                            disabled={images.length <= 1 && !imgUrl}
                            title="Remove image URL"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {/* Live Image Thumbnail Preview */}
                        {imgUrl.trim().startsWith('http') && (
                          <div className="relative h-16 w-16 rounded-md overflow-hidden border border-border/80 ml-13 bg-background">
                            <Image
                              src={imgUrl}
                              alt={`View ${idx + 1}`}
                              fill
                              className="object-cover"
                              onError={(e: any) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddImageUrlField}
                    className="w-full h-8 text-xs font-semibold gap-1 mt-1 border-dashed"
                    disabled={isSubmitting}
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> Add Another View Image URL
                  </Button>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  {editingId && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      disabled={isSubmitting}
                      className="flex-1 h-9 text-xs"
                    >
                      <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Cancel
                    </Button>
                  )}
                  <Button type="submit" className="flex-1 h-9 text-xs font-bold" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> {editingId ? 'Saving...' : 'Adding...'}</>
                    ) : editingId ? (
                      <><Check className="mr-1.5 h-3.5 w-3.5" /> Save Changes</>
                    ) : (
                      <><PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Add Color Option</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* AVAILABLE COLORS TABLE (2 COLUMNS) */}
        <div className="md:col-span-2">
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Available Customization Colors</CardTitle>
                  <CardDescription className="text-xs">
                    T-shirt colors and multi-angle views active in the customization studio & mobile app.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs font-bold">
                  {colors.length} Colors
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 text-xs">
                      <TableHead className="w-16 font-bold">Preview</TableHead>
                      <TableHead className="font-bold">Color Name</TableHead>
                      <TableHead className="font-bold">Views / Images</TableHead>
                      <TableHead className="text-right font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : colors.length > 0 ? (
                      colors.map((color) => {
                        const viewImages = Array.isArray(color.images) && color.images.length > 0
                          ? color.images
                          : (color.imageUrl ? [color.imageUrl] : []);
                        const isCurrentEditing = editingId === color._id;

                        return (
                          <TableRow 
                            key={color._id} 
                            className={isCurrentEditing ? 'bg-primary/5 border-l-4 border-l-primary' : undefined}
                          >
                            <TableCell>
                              <div className="relative h-11 w-11 rounded-lg overflow-hidden border border-border bg-muted/30">
                                {viewImages[0] ? (
                                  <Image 
                                    src={viewImages[0]} 
                                    alt={color.name} 
                                    fill 
                                    className="object-cover" 
                                  />
                                ) : (
                                  <ImageIcon className="h-5 w-5 text-muted-foreground m-auto" />
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="space-y-0.5">
                                <span className="font-bold text-xs sm:text-sm text-foreground">{color.name}</span>
                                {isCurrentEditing && (
                                  <span className="block text-[10px] text-primary font-semibold">Editing now</span>
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {viewImages.map((img, i) => (
                                  <div 
                                    key={i} 
                                    className="relative h-8 w-8 rounded-md overflow-hidden border border-border/80 bg-muted shrink-0"
                                    title={`View ${i + 1}`}
                                  >
                                    <Image 
                                      src={img} 
                                      alt={`${color.name} ${i + 1}`} 
                                      fill 
                                      className="object-cover" 
                                    />
                                  </div>
                                ))}
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                                  {viewImages.length} {viewImages.length === 1 ? 'view' : 'views'}
                                </Badge>
                              </div>
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEditClick(color)}
                                  className="h-8 text-xs gap-1 font-semibold hover:bg-muted text-foreground"
                                  title="Edit color and images"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-primary" />
                                  <span className="hidden sm:inline">Edit</span>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDelete(color._id)}
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                  title="Delete color option"
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
                        <TableCell colSpan={4} className="text-center h-28">
                          <div className="flex flex-col items-center gap-2">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">No customization color options found.</p>
                            <Button variant="outline" size="sm" onClick={() => document.getElementById('name')?.focus()} className="text-xs">
                              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                              Add First Color Option
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
        </div>
      </div>
    </div>
  );
}
