
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit, Loader2, PlusCircle, Ticket } from 'lucide-react';
import { useCoupon, Coupon } from '@/context/coupon-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const emptyCoupon = {
    id: '',
    code: '',
    discountPercentage: 0,
    isActive: true,
};

export default function AdminCouponsPage() {
    const { coupons, addCoupon, deleteCoupon, updateCoupon, loading } = useCoupon();
    const [formData, setFormData] = React.useState<Omit<Coupon, '_id' | 'createdAt'>>(emptyCoupon);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
          setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
        }
        else {
           setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
        }
    };
    
    const handleEditClick = (coupon: Coupon) => {
        setIsEditing(true);
        setFormData({
            id: coupon.id,
            code: coupon.code,
            discountPercentage: coupon.discountPercentage,
            isActive: coupon.isActive,
        });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.code && formData.discountPercentage > 0) {
            setIsSubmitting(true);
            
            const couponData = {
                code: formData.code,
                discountPercentage: formData.discountPercentage,
                isActive: formData.isActive
            };

            if (isEditing) {
                await updateCoupon({ ...couponData, id: formData.id });
            } else {
                await addCoupon(couponData);
            }
            
            resetForm();
            setIsSubmitting(false);
        }
    };

    const handleStatusToggle = async (coupon: Coupon) => {
        const updatedCoupon = { ...coupon, isActive: !coupon.isActive };
        await updateCoupon(updatedCoupon);
    };
    
    const resetForm = () => {
        setFormData(emptyCoupon);
        setIsEditing(false);
    }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Coupon Management</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Coupon' : 'Add New Coupon'}</CardTitle>
              <CardDescription>{isEditing ? 'Update the details of the existing coupon.' : 'Create a new discount coupon.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input id="code" name="code" value={formData.code} onChange={handleInputChange} placeholder="e.g., SUMMER20" required disabled={isSubmitting} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
                  <Input id="discountPercentage" name="discountPercentage" type="number" min="1" max="100" value={formData.discountPercentage} onChange={handleInputChange} placeholder="e.g., 20" required disabled={isSubmitting} />
                </div>
                 <div className="flex items-center space-x-2">
                    <Switch id="isActive" name="isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))} disabled={isSubmitting} />
                    <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditing ? 'Updating...' : 'Adding...'}</> : (isEditing ? 'Update Coupon' : 'Add Coupon')}
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
              <CardTitle>Manage Coupons</CardTitle>
              <CardDescription>View, edit, or delete your existing coupons.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                             <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                          </TableRow>
                      ))
                    ) : coupons.length > 0 ? (
                      coupons.map((coupon) => (
                        <TableRow key={coupon.id}>
                          <TableCell className="font-medium font-mono"><Badge variant="outline">{coupon.code}</Badge></TableCell>
                          <TableCell>{coupon.discountPercentage}%</TableCell>
                           <TableCell>
                                <Switch
                                    checked={coupon.isActive}
                                    onCheckedChange={() => handleStatusToggle(coupon)}
                                    aria-label="Toggle active status"
                                />
                           </TableCell>
                           <TableCell>{format(new Date(coupon.createdAt), 'PP')}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEditClick(coupon)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteCoupon(coupon.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                          <div className="flex flex-col items-center gap-2">
                              <Ticket className="h-8 w-8 text-muted-foreground" />
                              <p>No coupons found.</p>
                              <Button variant="outline" size="sm" onClick={() => document.getElementById('code')?.focus()}>
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Add New Coupon
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
