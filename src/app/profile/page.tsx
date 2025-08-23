
'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, User as UserIcon, LogOut, ChevronRight, ShoppingBag, Heart, Edit, Truck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MobileHeader } from '@/components/mobile-header';
import { MobileFooter } from '@/components/mobile-footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { label: 'My Orders', icon: ShoppingBag, href: '/orders' },
    { label: 'Track Order', icon: Truck, href: '/track-order' },
    { label: 'Wishlist', icon: Heart, href: '/favorites' },
    { label: 'Edit Profile', icon: Edit, href: '/profile/edit' },
  ];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  return (
    <div className="md:hidden">
      <MobileHeader title="My Profile" showCart={false} />
      <main className="bg-secondary min-h-screen pb-24 p-4">
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.profilePictureUrl} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback className="text-2xl">
                {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">{user.firstName} {user.lastName}</h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm">
          {menuItems.map((item, index) => (
            <Link href={item.href} key={item.label}>
              <div className={`flex items-center justify-between p-4 ${index < menuItems.length - 1 ? 'border-b' : ''}`}>
                <div className="flex items-center gap-4">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
        
        <Button variant="outline" className="w-full mt-8 bg-white" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </main>
      <MobileFooter />
    </div>
  );
}
