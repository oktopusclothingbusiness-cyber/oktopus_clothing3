
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import Image from 'next/image';
import { Trash2, Edit, Loader2, PlusCircle, Megaphone } from 'lucide-react';
import { usePromotion, Promotion } from '@/context/promotion-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

const emptyPromotion = {
    id: '',
    title: '',
    description: '',
    imageUrl: '',
    ctaText: '',
    ctaLink: '',
    isActive: false,
};

export default function AdminPromotionsPage() {
    const { promotions, addPromotion, deletePromotion, updatePromotion, loading } = usePromotion();
    const [formData, setFormData] = React.useState(emptyPromotion);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleEditClick = (promotion: Promotion) => {
        setIsEditing(true);
        setFormData({
            id: promotion.id,
            title: promotion.title,
            description: promotion.description,
            imageUrl: promotion.imageUrl,
            ctaText: promotion.ctaText,
            ctaLink: promotion.ctaLink,
            isActive: promotion.isActive || false
        });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.title && formData.imageUrl) {
            setIsSubmitting(true);
            
            const promotionData = {
                title: formData.title,
                description: formData.description,
                imageUrl: formData.imageUrl,
                ctaText: formData.ctaText,
                ctaLink: formData.ctaLink,
                isActive: formData.isActive
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
        setIsEditing(false);
    }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Promotion Management</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Promotion' : 'Add New Promotion'}</CardTitle>
              <CardDescription>{isEditing ? 'Update the details of the existing promotion.' : 'Create a new promotional banner.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., #FASHION DAY" required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="e.g., 80% OFF" disabled={isSubmitting} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://placehold.co/800x450.png" required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaText">CTA Button Text</Label>
                  <Input id="ctaText" name="ctaText" value={formData.ctaText} onChange={handleInputChange} placeholder="e.g., Check this out" disabled={isSubmitting} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="ctaLink">CTA Button Link</Label>
                  <Input id="ctaLink" name="ctaLink" value={formData.ctaLink} onChange={handleInputChange} placeholder="e.g., /products" disabled={isSubmitting} />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="isActive" name="isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))} disabled={isSubmitting} />
                    <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditing ? 'Updating...' : 'Adding...'}</> : (isEditing ? 'Update Promotion' : 'Add Promotion')}
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
              <CardTitle>Manage Promotions</CardTitle>
              <CardDescription>View, edit, or delete your existing promotions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-10 w-20 rounded-md" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                          </TableRow>
                      ))
                    ) : promotions.length > 0 ? (
                      promotions.map((promo) => (
                        <TableRow key={promo.id}>
                          <TableCell>
                            <Image src={promo.imageUrl || 'https://placehold.co/80x40.png'} alt={promo.title} width={80} height={40} className="rounded-md object-cover" />
                          </TableCell>
                          <TableCell className="font-medium">{promo.title}</TableCell>
                           <TableCell>
                                <Switch
                                    checked={promo.isActive}
                                    onCheckedChange={() => handleStatusToggle(promo)}
                                    aria-label="Toggle active status"
                                />
                           </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEditClick(promo)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deletePromotion(promo.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                          <div className="flex flex-col items-center gap-2">
                              <Megaphone className="h-8 w-8 text-muted-foreground" />
                              <p>No promotions found.</p>
                              <Button variant="outline" size="sm" onClick={() => document.getElementById('title')?.focus()}>
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Add New Promotion
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
