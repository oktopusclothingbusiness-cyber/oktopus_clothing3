'use client';

import * as React from 'react';
import { useUser, User } from '@/context/user-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import Image from 'next/image';

export default function UsersPage() {
    const { users, loading, deleteUser, updateUserRole, updateUserOktocoins } = useUser();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [coinBalances, setCoinBalances] = React.useState<{ [key: string]: string }>({});
    const [activeInput, setActiveInput] = React.useState<string | null>(null);
    
    React.useEffect(() => {
        if (users.length > 0) {
            const initialBalances = users.reduce((acc, user) => {
                acc[user.id] = (user.oktocoins || 0).toString();
                return acc;
            }, {} as { [key: string]: string });
            setCoinBalances(initialBalances);
        }
    }, [users]);

    const handleCoinChange = (userId: string, value: string) => {
        setCoinBalances(prev => ({ ...prev, [userId]: value }));
    };

    const handleUpdateCoins = async (userId: string) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setActiveInput(userId);
        const newBalance = parseInt(coinBalances[userId] || '0', 10);
        if (!isNaN(newBalance)) {
            await updateUserOktocoins(userId, newBalance);
        }
        setIsSubmitting(false);
        setActiveInput(null);
    };

    const handleRoleChange = async (userId: string, role: 'user' | 'admin') => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setActiveInput(userId);
      await updateUserRole(userId, role);
      setIsSubmitting(false);
      setActiveInput(null);
    };

    const handleDeleteUser = async (userId: string) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setActiveInput(userId);
        await deleteUser(userId);
        setIsSubmitting(false);
        setActiveInput(null);
    }
    
    const getRoleVariant = (role: string) => {
      return role === 'admin' ? 'default' : 'secondary';
    }
    
    return (
        <>
            <h1 className="text-3xl font-bold mb-8">User Management</h1>
             <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>View and manage all registered users.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Oktocoins</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                           <TableRow key={index}>
                              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                              <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                              <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                           </TableRow>
                        ))
                      ) : users.length > 0 ? (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Select 
                                defaultValue={user.role} 
                                onValueChange={(value: 'user' | 'admin') => handleRoleChange(user.id, value)}
                                disabled={isSubmitting && activeInput === user.id}
                              >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue>
                                        <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Image src="https://i.ibb.co/6RXzvrS6/oktocoin-v1-80x80.png" alt="Oktocoin" width={16} height={16} />
                                    <Input
                                        type="number"
                                        className="h-8 w-24"
                                        value={coinBalances[user.id] || ''}
                                        onChange={(e) => handleCoinChange(user.id, e.target.value)}
                                        onBlur={() => handleUpdateCoins(user.id)}
                                        disabled={isSubmitting && activeInput === user.id}
                                    />
                                     {(isSubmitting && activeInput === user.id) && <Loader2 className="h-4 w-4 animate-spin" />}
                                </div>
                            </TableCell>
                            <TableCell>{format(new Date(user.createdAt), 'PP')}</TableCell>
                            <TableCell className="text-right">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={isSubmitting && activeInput === user.id}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the user
                                        and remove their data from our servers.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">
                             No users found.
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
