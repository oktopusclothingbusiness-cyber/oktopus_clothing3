
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import Image from 'next/image';
import { Trash2, Edit, Loader2, PlusCircle, MessageSquare } from 'lucide-react';
import { usePopup, Popup } from '@/context/popup-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

const emptyPopup = {
    id: '',
    title: '',
    description: '',
    imageUrl: '',
    ctaText: '',
    ctaLink: '',
    isActive: false,
};

export default function AdminPopupsPage() {
    const { popups, addPopup, deletePopup, updatePopup, loading } = usePopup();
    const [formData, setFormData] = React.useState(emptyPopup);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleEditClick = (popup: Popup) => {
        setIsEditing(true);
        setFormData({
            id: popup.id,
            title: popup.title,
            description: popup.description,
            imageUrl: popup.imageUrl,
            ctaText: popup.ctaText,
            ctaLink: popup.ctaLink,
            isActive: popup.isActive || false
        });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.title && formData.imageUrl) {
            setIsSubmitting(true);
            
            const popupData = {
                title: formData.title,
                description: formData.description,
                imageUrl: formData.imageUrl,
                ctaText: formData.ctaText,
                ctaLink: formData.ctaLink,
                isActive: formData.isActive
            };

            if (isEditing) {
                // Ensure only one popup can be active
                if (popupData.isActive) {
                    const activePopup = popups.find(p => p.isActive && p.id !== formData.id);
                    if (activePopup) {
                        await updatePopup({ ...activePopup, isActive: false });
                    }
                }
                await updatePopup({ ...popupData, id: formData.id });
            } else {
                 if (popupData.isActive) {
                    const activePopup = popups.find(p => p.isActive);
                    if (activePopup) {
                        await updatePopup({ ...activePopup, isActive: false });
                    }
                }
                await addPopup(popupData);
            }
            
            resetForm();
            setIsSubmitting(false);
        }
    };

    const handleStatusToggle = async (popup: Popup) => {
        const newStatus = !popup.isActive;
        // If we are activating a popup, deactivate any other currently active one.
        if (newStatus) {
            const currentlyActive = popups.find(p => p.isActive && p.id !== popup.id);
            if (currentlyActive) {
                await updatePopup({ ...currentlyActive, isActive: false });
            }
        }
        await updatePopup({ ...popup, isActive: !popup.isActive });
    };
    
    const resetForm = () => {
        setFormData(emptyPopup);
        setIsEditing(false);
    }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Popup Management</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Popup' : 'Add New Popup'}</CardTitle>
              <CardDescription>{isEditing ? 'Update the details of the existing popup.' : 'Create a new promotional popup.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Grand Opening Sale" required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="e.g., Up to 50% off everything!" disabled={isSubmitting} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://placehold.co/800x450.png" required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaText">CTA Button Text</Label>
                  <Input id="ctaText" name="ctaText" value={formData.ctaText} onChange={handleInputChange} placeholder="e.g., Shop Now" disabled={isSubmitting} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="ctaLink">CTA Button Link</Label>
                  <Input id="ctaLink" name="ctaLink" value={formData.ctaLink} onChange={handleInputChange} placeholder="e.g., /products?tag=sale" disabled={isSubmitting} />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="isActive" name="isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))} disabled={isSubmitting} />
                    <Label htmlFor="isActive">Active (Only one can be active)</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditing ? 'Updating...' : 'Adding...'}</> : (isEditing ? 'Update Popup' : 'Add Popup')}
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
              <CardTitle>Manage Popups</CardTitle>
              <CardDescription>View, edit, or delete your existing store popups.</CardDescription>
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
                    ) : popups.length > 0 ? (
                      popups.map((popup) => (
                        <TableRow key={popup.id}>
                          <TableCell>
                            <Image src={popup.imageUrl || 'https://placehold.co/80x40.png'} alt={popup.title} width={80} height={40} className="rounded-md object-cover" />
                          </TableCell>
                          <TableCell className="font-medium">{popup.title}</TableCell>
                           <TableCell>
                                <Switch
                                    checked={popup.isActive}
                                    onCheckedChange={() => handleStatusToggle(popup)}
                                    aria-label="Toggle active status"
                                />
                           </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEditClick(popup)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deletePopup(popup.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                          <div className="flex flex-col items-center gap-2">
                              <MessageSquare className="h-8 w-8 text-muted-foreground" />
                              <p>No popups found.</p>
                              <Button variant="outline" size="sm" onClick={() => document.getElementById('title')?.focus()}>
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Add New Popup
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
