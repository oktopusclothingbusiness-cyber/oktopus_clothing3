
'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut, ChevronRight, ShoppingBag, Heart, Edit, Truck, Moon, Settings, FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MobileFooter } from '@/components/mobile-footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

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
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { label: 'My Orders', icon: ShoppingBag, href: '/orders' },
    { label: 'Track Order', icon: Truck, href: '/track-order' },
    { label: 'Wishlist', icon: Heart, href: '/favorites' },
  ];
  
  const settingsItems = [
     { label: 'Edit Profile', icon: Edit, href: '/profile/edit' },
     { label: 'Settings', icon: Settings, href: '#' },
     { label: 'Dark Mode', icon: Moon, href: '#', isThemeToggle: true },
  ]
  
  const policyItems = [
    { label: 'Privacy Policy', icon: FileText, href: '/privacy-policy' },
    { label: 'Terms & Conditions', icon: FileText, href: '/terms-and-conditions' },
  ]

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  return (
    <div className="md:hidden bg-secondary">
      <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-48 bg-foreground text-background profile-header-curve" />
          <main className="relative z-10 min-h-screen pb-24 p-4 space-y-6">
            <Image
                src="https://i.ibb.co/GfTs981G/okto-new-logo-white.png"
                alt="Oktopus Logo"
                width={120}
                height={40}
                className="absolute top-4 left-4"
              />
            <div className="flex flex-col items-center text-center pt-8">
               <Avatar className="h-24 w-24 border-4 border-background mb-4">
                <AvatarImage src={user.profilePictureUrl} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="text-4xl">
                    {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
               <div className="bg-background text-foreground rounded-lg p-4 shadow-lg -mt-12 pt-14 w-full">
                 <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
                 <p className="text-muted-foreground text-sm">{user.email}</p>
               </div>
            </div>
            
            <Card className="card-glass">
                <CardContent className="p-2">
                    {menuItems.map((item, index) => (
                        <Link href={item.href} key={item.label}>
                          <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <item.icon className="h-5 w-5 text-muted-foreground" />
                              <span className="font-medium">{item.label}</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </Link>
                    ))}
                </CardContent>
            </Card>

            <Card className="card-glass">
                 <CardContent className="p-2">
                    {settingsItems.map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg" onClick={() => item.href === '#' && !item.isThemeToggle ? router.push(item.href) : null}>
                            <Link href={item.href} className="flex items-center gap-4">
                                <item.icon className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                            {item.isThemeToggle ? <ThemeToggle /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                        </div>
                    ))}
                 </CardContent>
            </Card>
            
             <Card className="card-glass">
                <CardContent className="p-2">
                    {policyItems.map((item, index) => (
                        <Link href={item.href} key={item.label}>
                          <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <item.icon className="h-5 w-5 text-muted-foreground" />
                              <span className="font-medium">{item.label}</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </Link>
                    ))}
                </CardContent>
            </Card>

            <Button variant="outline" className="w-full bg-background" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </main>
      </div>
      <MobileFooter />
    </div>
  );
}
