
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from 'next/image';
import { Trash2, Edit, Loader2, PlusCircle, Shapes, Film, Video, X } from 'lucide-react';
import { useCategory, Category } from '@/context/category-context';
import { Skeleton } from '@/components/ui/skeleton';

const emptyCategory = {
    id: '',
    name: '',
    imageUrl: '',
    animation_video_url: '',
};

export default function AdminCategoriesPage() {
    const { categories, addCategory, deleteCategory, updateCategory, loading } = useCategory();
    const [formData, setFormData] = React.useState(emptyCategory);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleEditClick = (category: Category) => {
        setIsEditing(true);
        setFormData({
            id: category.id,
            name: category.name,
            imageUrl: category.imageUrl,
            animation_video_url: category.animation_video_url || category.splash_animation_url || '',
        });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.imageUrl) {
            setIsSubmitting(true);
            
            const categoryData = {
                name: formData.name,
                imageUrl: formData.imageUrl,
                animation_video_url: formData.animation_video_url.trim() || null,
                splash_animation_url: formData.animation_video_url.trim() || null,
            };

            if (isEditing) {
                await updateCategory({ ...categoryData, id: formData.id });
            } else {
                await addCategory(categoryData);
            }
            
            resetForm();
            setIsSubmitting(false);
        }
    };
    
    const resetForm = () => {
        setFormData(emptyCategory);
        setIsEditing(false);
    }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Category Management</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</CardTitle>
              <CardDescription>{isEditing ? 'Update the details of the existing category.' : 'Create a new product category.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., T-Shirts" required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://placehold.co/400x400.png" required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="animation_video_url" className="text-emerald-500 flex items-center gap-1.5 font-medium">
                      <Film className="w-3.5 h-3.5" /> Splash Animation Video / Cloudinary URL
                    </Label>
                    {formData.animation_video_url && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, animation_video_url: '' }))}
                        className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Clear Video
                      </button>
                    )}
                  </div>
                  <Input
                    id="animation_video_url"
                    name="animation_video_url"
                    value={formData.animation_video_url}
                    onChange={handleInputChange}
                    placeholder="https://res.cloudinary.com/.../animation.mp4 (or .json, .webp)"
                    disabled={isSubmitting}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Attach a Cloudinary video (MP4) or Lottie/GIF to play when mobile users enter this category.
                  </p>

                  {/* Media Preview Widget */}
                  {formData.animation_video_url.trim() && (
                    <div className="mt-2 p-2.5 rounded-lg border bg-muted/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                          <Video className="w-3 h-3" /> Live Preview
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-background text-muted-foreground border">
                          {(() => {
                            const clean = formData.animation_video_url.toLowerCase().split('?')[0];
                            if (clean.endsWith('.json')) return 'Lottie JSON';
                            if (clean.endsWith('.gif') || clean.endsWith('.webp') || clean.endsWith('.png') || clean.endsWith('.jpg')) return 'Image / GIF';
                            return 'Video (MP4/WebM)';
                          })()}
                        </span>
                      </div>

                      {(() => {
                        const clean = formData.animation_video_url.toLowerCase().split('?')[0];
                        if (clean.endsWith('.json')) {
                          return (
                            <div className="p-2 bg-background rounded border text-[11px] font-mono break-all text-muted-foreground">
                              <span className="text-amber-500 font-bold mr-1">LOTTIE:</span>
                              {formData.animation_video_url}
                            </div>
                          );
                        }
                        if (clean.endsWith('.gif') || clean.endsWith('.webp') || clean.endsWith('.png') || clean.endsWith('.jpg') || clean.endsWith('.jpeg')) {
                          return (
                            <div className="rounded overflow-hidden border bg-black/20 flex items-center justify-center p-1">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={formData.animation_video_url}
                                alt="Splash Preview"
                                className="max-h-36 w-full object-contain rounded"
                              />
                            </div>
                          );
                        }
                        return (
                          <div className="rounded overflow-hidden border bg-black">
                            <video
                              key={formData.animation_video_url}
                              src={formData.animation_video_url}
                              muted
                              autoPlay
                              loop
                              controls
                              playsInline
                              className="w-full max-h-40 object-contain rounded"
                            />
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditing ? 'Updating...' : 'Adding...'}</> : (isEditing ? 'Update Category' : 'Add Category')}
                  </Button>
                  {isEditing && (
                      <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>Cancel</Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Manage Categories</CardTitle>
              <CardDescription>View, edit, or delete your existing product categories.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Animation Video</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                          </TableRow>
                      ))
                    ) : categories.length > 0 ? (
                      categories.map((cat) => (
                        <TableRow key={cat.id}>
                          <TableCell>
                            <Image src={cat.imageUrl || 'https://placehold.co/40x40.png'} alt={cat.name} width={40} height={40} className="rounded-md object-cover" />
                          </TableCell>
                          <TableCell className="font-medium">{cat.name}</TableCell>
                          <TableCell>
                            {cat.animation_video_url ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                                <Film className="w-3 h-3" /> 🎬 Video Attached
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                None
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEditClick(cat)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteCategory(cat.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                          <div className="flex flex-col items-center gap-2">
                              <Shapes className="h-8 w-8 text-muted-foreground" />
                              <p>No categories found.</p>
                              <Button variant="outline" size="sm" onClick={() => document.getElementById('name')?.focus()}>
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Add New Category
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
    </>
  );
}
