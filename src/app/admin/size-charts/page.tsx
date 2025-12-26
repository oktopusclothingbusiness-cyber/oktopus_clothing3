
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit, Loader2, PlusCircle, Ruler, X } from 'lucide-react';
import { useSizeChart, SizeChart, SizeEntry } from '@/context/size-chart-context';
import { Skeleton } from '@/components/ui/skeleton';

const emptySize: SizeEntry = { size: '', chest: 0, length: 0, sleeve: 0 };
const emptySizeChart: Omit<SizeChart, '_id' | 'createdAt'> = {
    name: '',
    sizes: [emptySize],
    unit: 'inch',
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

     const handleSizeChange = (index: number, field: keyof SizeEntry, value: string | number) => {
        const newSizes = [...formData.sizes];
        const numValue = typeof value === 'string' ? (field === 'size' ? value : parseFloat(value)) : value;
        // @ts-ignore
        newSizes[index][field] = numValue;
        setFormData(prev => ({ ...prev, sizes: newSizes }));
    };

    const addSizeRow = () => {
        setFormData(prev => ({ ...prev, sizes: [...prev.sizes, emptySize] }));
    };

    const removeSizeRow = (index: number) => {
        const newSizes = formData.sizes.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, sizes: newSizes }));
    };
    
    const handleEditClick = (chart: SizeChart) => {
        setIsEditing(true);
        setEditingId(chart._id);
        setFormData({
            name: chart.name,
            sizes: chart.sizes,
            unit: chart.unit || 'inch'
        });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.sizes.length > 0) {
            setIsSubmitting(true);
            
            const finalData = {
                ...formData,
                sizes: formData.sizes.map(s => ({
                    size: s.size,
                    chest: Number(s.chest),
                    length: Number(s.length),
                    sleeve: Number(s.sleeve),
                })),
            };

            if (isEditing && editingId) {
                await updateSizeChart(editingId, finalData);
            } else {
                await addSizeChart(finalData);
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
      <div className="grid md:grid-cols-2 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Size Chart' : 'Add New Size Chart'}</CardTitle>
              <CardDescription>{isEditing ? 'Update the details of the existing size chart.' : 'Create a new structured size chart.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Chart Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Men's Oversized T-Shirts" required disabled={isSubmitting} />
                </div>
                
                <div className="space-y-4">
                    <Label>Sizes (in {formData.unit})</Label>
                    <div className="space-y-2">
                        {formData.sizes.map((size, index) => (
                            <div key={index} className="grid grid-cols-5 gap-2 items-center">
                                <Input placeholder="Size" value={size.size} onChange={e => handleSizeChange(index, 'size', e.target.value)} className="col-span-1" />
                                <Input type="number" placeholder="Chest" value={size.chest} onChange={e => handleSizeChange(index, 'chest', e.target.value)} className="col-span-1" />
                                <Input type="number" placeholder="Length" value={size.length} onChange={e => handleSizeChange(index, 'length', e.target.value)} className="col-span-1" />
                                <Input type="number" placeholder="Sleeve" value={size.sleeve} onChange={e => handleSizeChange(index, 'sleeve', e.target.value)} className="col-span-1" />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeSizeRow(index)} className="col-span-1">
                                    <X className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" onClick={addSizeRow}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Size
                    </Button>
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
        <div className="md:col-span-1">
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
                      <TableHead>Name</TableHead>
                      <TableHead>Sizes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                          </TableRow>
                      ))
                    ) : sizeCharts.length > 0 ? (
                      sizeCharts.map((chart) => (
                        <TableRow key={chart._id}>
                          <TableCell className="font-medium">{chart.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{chart.sizes.map(s => s.size).join(', ')}</TableCell>
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
