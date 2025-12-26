
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from 'next/image';
import { Trash2, Edit, Loader2, PlusCircle, Ruler } from 'lucide-react';
import { useSizeChart, SizeChart } from '@/context/size-chart-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const emptySizeChart: Omit<SizeChart, '_id' | 'createdAt'> = {
    name: '',
    imageUrl: '',
};

export default function AdminSizeChartsPage() {
    const { sizeCharts, addSizeChart, deleteSizeChart, updateSizeChart, loading } = useSizeChart();
    const [formData, setFormData] = React.useState(emptySizeChart);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleEditClick = (chart: SizeChart) => {
        setIsEditing(true);
        setEditingId(chart._id);
        setFormData({
            name: chart.name,
            imageUrl: chart.imageUrl,
        });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.imageUrl) {
            setIsSubmitting(true);

            if (isEditing && editingId) {
                await updateSizeChart(editingId, formData);
            } else {
                await addSizeChart(formData);
            }
            
            resetForm();
            setIsSubmitting(false);
        }
    };
    
    const resetForm = () => {
        setFormData(emptySizeChart);
        setIsEditing(false);
        setEditingId(null);
    }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Size Chart Management</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Size Chart' : 'Add New Size Chart'}</CardTitle>
              <CardDescription>{isEditing ? 'Update the details of the existing size chart.' : 'Upload a new size chart image.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Chart Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Men's T-Shirts" required disabled={isSubmitting} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://placehold.co/600x800.png" required disabled={isSubmitting} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditing ? 'Updating...' : 'Adding...'}</> : (isEditing ? 'Update Chart' : 'Add Chart')}
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
              <CardTitle>Manage Size Charts</CardTitle>
              <CardDescription>View, edit, or delete your existing size charts.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Preview</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                          </TableRow>
                      ))
                    ) : sizeCharts.length > 0 ? (
                      sizeCharts.map((chart) => (
                        <TableRow key={chart._id}>
                          <TableCell>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Image src={chart.imageUrl || 'https://placehold.co/40x40.png'} alt={chart.name} width={40} height={40} className="rounded-md object-cover cursor-pointer" />
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{chart.name}</DialogTitle>
                                    </DialogHeader>
                                    <Image src={chart.imageUrl} alt={chart.name} width={500} height={700} className="rounded-lg object-contain" />
                                </DialogContent>
                            </Dialog>
                          </TableCell>
                          <TableCell className="font-medium">{chart.name}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEditClick(chart)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteSizeChart(chart._id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">
                          <div className="flex flex-col items-center gap-2">
                              <Ruler className="h-8 w-8 text-muted-foreground" />
                              <p>No size charts found.</p>
                              <Button variant="outline" size="sm" onClick={() => document.getElementById('name')?.focus()}>
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Add New Size Chart
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
