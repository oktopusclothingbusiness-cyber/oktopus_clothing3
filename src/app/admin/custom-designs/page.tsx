
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Download, Trash2 } from 'lucide-react';

type DesignStatus = 'pending' | 'approved' | 'rejected';

type CustomDesign = {
  _id: string;
  userId: string;
  userName: string;
  designUrl: string;
  tshirtColor: string;
  tshirtSize: string;
  printArea?: { width: number; height: number };
  notes: string;
  status: DesignStatus;
  createdAt: string;
};

export default function CustomDesignsPage() {
  const [designs, setDesigns] = React.useState<CustomDesign[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchDesigns = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/custom-designs');
      if (!response.ok) {
        throw new Error('Failed to fetch custom designs');
      }
      const data = await response.json();
      setDesigns(data);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error fetching designs',
        description: 'Could not load custom designs.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  const handleStatusChange = async (designId: string, status: DesignStatus) => {
    // This function would call a new API endpoint to update the status
    // For now, we'll just show a toast and optimistically update the UI
     setDesigns(prev => prev.map(d => d._id === designId ? {...d, status} : d));
     toast({
        title: 'Status Updated',
        description: `Design status changed to ${status}.`,
     });
  };

  const handleDelete = async (designId: string) => {
    try {
        const response = await fetch(`/api/custom-designs/${designId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete design');
        }
        setDesigns(prev => prev.filter(d => d._id !== designId));
        toast({
            title: 'Design Deleted',
            description: 'The custom design request has been deleted.',
        });
    } catch (error) {
        console.error(error);
        toast({
            title: 'Error',
            description: 'Could not delete the design request.',
            variant: 'destructive',
        });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const statusOptions: DesignStatus[] = ['pending', 'approved', 'rejected'];

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Custom Design Requests</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
          <CardDescription>Review and manage all user-submitted custom designs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Design</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-10 w-16 rounded-md" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : designs.length > 0 ? (
                  designs.map((design) => (
                    <TableRow key={design._id}>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                             <Image src={design.designUrl} alt="User design" width={64} height={64} className="rounded-md object-cover cursor-pointer" />
                          </DialogTrigger>
                          <DialogContent className="max-w-xl">
                            <DialogHeader>
                               <DialogTitle>Design Preview</DialogTitle>
                               <DialogDescription>Submitted by {design.userName}</DialogDescription>
                            </DialogHeader>
                             <Image src={design.designUrl} alt="User design full preview" width={500} height={500} className="rounded-md object-contain" />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="font-medium">{design.userName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: design.tshirtColor }}></div>
                           <span>{design.tshirtSize}</span>
                           {design.printArea && <span>{design.printArea.width}"x{design.printArea.height}"</span>}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(design.createdAt), 'PP')}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{design.notes || 'N/A'}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={design.status}
                          onValueChange={(value: DesignStatus) => handleStatusChange(design._id, value)}
                        >
                           <SelectTrigger className="w-[140px]">
                              <SelectValue>
                                 <Badge variant={getStatusVariant(design.status)}>{design.status}</Badge>
                              </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(status => (
                                <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                            <a href={design.designUrl} download={`design-${design._id}.png`}>
                                <Download className="h-4 w-4" />
                            </a>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Design Request?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the design request. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(design._id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      No custom designs submitted yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
