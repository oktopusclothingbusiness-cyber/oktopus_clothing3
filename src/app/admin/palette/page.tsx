
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Loader2, PlusCircle, Palette, Droplets } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type ColorOption = {
    _id: string;
    name: string;
    hex: string;
}

const emptyColor = {
    name: '',
    hex: '#000000',
};

export default function AdminPalettePage() {
    const [colors, setColors] = React.useState<ColorOption[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [formData, setFormData] = React.useState(emptyColor);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { toast } = useToast();

    const fetchColors = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/palette');
            if (!response.ok) throw new Error('Failed to fetch colors');
            setColors(await response.json());
        } catch (error) {
            toast({ title: 'Error', description: 'Could not fetch colors', variant: 'destructive'});
        } finally {
            setLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchColors();
    }, [fetchColors]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.hex) {
            setIsSubmitting(true);
            try {
                const response = await fetch('/api/palette', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                if (!response.ok) throw new Error('Failed to add color');
                await fetchColors();
                resetForm();
                toast({ title: 'Success', description: 'Color added to palette.' });
            } catch (error) {
                 toast({ title: 'Error', description: 'Could not add color.', variant: 'destructive'});
            } finally {
                setIsSubmitting(false);
            }
        }
    };
    
    const handleDelete = async (colorId: string) => {
        try {
            const response = await fetch(`/api/palette/${colorId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete color');
            setColors(prev => prev.filter(c => c._id !== colorId));
            toast({ title: 'Success', description: 'Color removed from palette.' });
        } catch (error) {
            toast({ title: 'Error', description: 'Could not delete color.', variant: 'destructive'});
        }
    }

    const resetForm = () => {
        setFormData(emptyColor);
    }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Palette Management</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Color</CardTitle>
              <CardDescription>Add a new color to the custom design options.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Color Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Midnight Blue" required disabled={isSubmitting} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="hex">Color Hex Code</Label>
                  <div className="flex items-center gap-2">
                    <Input id="hex" name="hex" type="color" value={formData.hex} onChange={handleInputChange} className="w-12 h-10 p-1" disabled={isSubmitting}/>
                    <Input value={formData.hex} onChange={handleInputChange} name="hex" placeholder="#000080" required disabled={isSubmitting} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : <><PlusCircle className="mr-2 h-4 w-4" /> Add Color</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Colors</CardTitle>
              <CardDescription>Colors available for custom T-shirts.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Color</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Hex Code</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-6 w-6 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                             <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                          </TableRow>
                      ))
                    ) : colors.length > 0 ? (
                      colors.map((color) => (
                        <TableRow key={color._id}>
                          <TableCell>
                            <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: color.hex }}></div>
                          </TableCell>
                          <TableCell className="font-medium">{color.name}</TableCell>
                          <TableCell className="font-mono">{color.hex}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(color._id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                          <div className="flex flex-col items-center gap-2">
                              <Droplets className="h-8 w-8 text-muted-foreground" />
                              <p>No colors found.</p>
                              <Button variant="outline" size="sm" onClick={() => document.getElementById('name')?.focus()}>
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Add New Color
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
