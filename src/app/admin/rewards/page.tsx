
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import Image from 'next/image';
import { Trash2, Edit, Loader2, PlusCircle, Gift } from 'lucide-react';
import { useReward, Reward } from '@/context/reward-context';
import { Skeleton } from '@/components/ui/skeleton';

const emptyReward = {
    id: '',
    name: '',
    description: '',
    imageUrl: '',
    sizes: '',
};

export default function AdminRewardsPage() {
    const { rewards, addReward, deleteReward, updateReward, loading } = useReward();
    const [formData, setFormData] = React.useState<Omit<Reward, '_id' | 'sizes'> & { sizes: string }>(emptyReward);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleEditClick = (reward: Reward) => {
        setIsEditing(true);
        setFormData({
            id: reward.id,
            name: reward.name,
            description: reward.description,
            imageUrl: reward.imageUrl,
            sizes: reward.sizes.join(', '),
        });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.imageUrl) {
            setIsSubmitting(true);
            
            const rewardData = {
                name: formData.name,
                description: formData.description,
                imageUrl: formData.imageUrl,
                sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
            };

            if (isEditing) {
                await updateReward({ ...rewardData, id: formData.id });
            } else {
                await addReward(rewardData);
            }
            
            resetForm();
            setIsSubmitting(false);
        }
    };
    
    const resetForm = () => {
        setFormData(emptyReward);
        setIsEditing(false);
    }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Reward Management</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Reward' : 'Add New Reward'}</CardTitle>
              <CardDescription>{isEditing ? 'Update the details of the existing reward.' : 'Create a new reward item.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Reward Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Exclusive Tee" required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="A short description" disabled={isSubmitting} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://placehold.co/400x400.png" required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sizes">Available Sizes</Label>
                  <Input id="sizes" name="sizes" value={formData.sizes} onChange={handleInputChange} placeholder="e.g., S, M, L, XL" disabled={isSubmitting} />
                    <p className="text-xs text-muted-foreground">Comma-separated sizes.</p>
                </div>
                <p className="text-sm text-muted-foreground">Rewards are redeemable for a fixed cost of 500 Oktocoins.</p>

                <div className="flex gap-2">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditing ? 'Updating...' : 'Adding...'}</> : (isEditing ? 'Update Reward' : 'Add Reward')}
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
              <CardTitle>Manage Rewards</CardTitle>
              <CardDescription>View, edit, or delete your redeemable reward items.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Sizes</TableHead>
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
                    ) : rewards.length > 0 ? (
                      rewards.map((reward) => (
                        <TableRow key={reward.id}>
                          <TableCell>
                            <Image src={reward.imageUrl || 'https://placehold.co/40x40.png'} alt={reward.name} width={40} height={40} className="rounded-md object-cover" />
                          </TableCell>
                          <TableCell className="font-medium">{reward.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{reward.sizes.join(', ')}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEditClick(reward)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteReward(reward.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                          <div className="flex flex-col items-center gap-2">
                              <Gift className="h-8 w-8 text-muted-foreground" />
                              <p>No rewards found.</p>
                              <Button variant="outline" size="sm" onClick={() => document.getElementById('name')?.focus()}>
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Add New Reward
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
