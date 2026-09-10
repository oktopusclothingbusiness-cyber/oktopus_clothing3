'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut, ChevronRight, ShoppingBag, Heart, Edit, Truck, Moon, Settings, FileText, User as UserIcon, Palette, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MobileFooter } from '@/components/mobile-footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { StorefrontHeader } from '@/components/storefront/header';
import { StorefrontFooter } from '@/components/storefront/footer';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const menuItems = [
    { label: 'My Orders', icon: ShoppingBag, href: '/orders' },
    { label: 'My Custom Designs', icon: Palette, href: '/my-designs' },
    { label: 'Track Order Dispatch', icon: Truck, href: '/track-order' },
    { label: 'Saved Wishlist', icon: Heart, href: '/favorites' },
  ];
  
  const policyItems = [
    { label: 'Privacy Policy', icon: FileText, href: '/privacy-policy' },
    { label: 'Terms & Conditions', icon: FileText, href: '/terms-and-conditions' },
    { label: 'Shipping & Delivery', icon: FileText, href: '/shipping-policy' },
    { label: 'Return & Exchange Policy', icon: FileText, href: '/return-policy' },
  ];

  const getInitials = (firstName: string, lastName: string) => {
    return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase() || 'U';
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A] text-white font-mono">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F824B]" />
      </div>
    );
  }

  const ListItem = ({ item }: { item: { label: string, icon: React.ElementType, href: string }}) => (
     <Link href={item.href || '#'}>
        <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-white/10 font-mono text-xs">
            <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4 text-[#0F824B]" />
                <span className="font-bold text-white uppercase">{item.label}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-400" />
        </div>
    </Link>
  );

  return (
    <div className="bg-[#0A0A0A] text-[#FAF9F6] font-sans min-h-screen">
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <StorefrontHeader />
        <main className="flex-grow container mx-auto px-6 lg:px-12 py-12">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-black font-bebas uppercase tracking-wider text-white mb-8 flex items-center gap-3">
                <UserIcon className="h-8 w-8 text-[#0F824B]" />
                MY ACCOUNT DASHBOARD
              </h1>

              <Card className="bg-[#121212] border-white/10 text-white shadow-2xl rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-0">
                  <div className="lg:col-span-1 lg:border-r border-white/10 p-8 flex flex-col items-center text-center bg-[#0e0e0e]">
                       <Avatar className="h-28 w-28 border-4 border-[#0F824B] mb-4 shadow-xl">
                          <AvatarImage src={user.profilePictureUrl} alt={`${user.firstName} ${user.lastName}`} />
                          <AvatarFallback className="text-4xl font-bebas font-black bg-[#1A1A1A] text-white">
                              {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                      </Avatar>
                      <h2 className="text-2xl font-black font-bebas uppercase text-white">{user.firstName} {user.lastName}</h2>
                      <p className="text-zinc-400 font-mono text-xs mb-4">{user.email}</p>
                      
                      <div className="flex items-center gap-2 mb-6 bg-[#0F824B]/10 text-[#0F824B] border border-[#0F824B]/30 px-4 py-1.5 rounded-full text-xs font-mono font-bold">
                          <Image src="https://i.ibb.co/6RXzvrS6/oktocoin-v1-80x80.png" alt="Oktocoin" width={18} height={18} unoptimized />
                          <span>{user.oktocoins || 0} OKTOCOINS</span>
                      </div>

                      {user?.role === 'admin' && (
                        <Button asChild className="w-full mb-3 bg-[#0F824B] text-white font-bold text-xs font-mono rounded-full">
                          <Link href="/admin"><Shield className="mr-2 h-4 w-4" /> Admin Portal</Link>
                        </Button>
                      )}

                      <Button variant="ghost" className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/20 font-mono text-xs rounded-full" onClick={logout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout Account
                      </Button>
                  </div>

                  <div className="lg:col-span-2 p-8 space-y-6">
                      <div>
                          <h3 className="text-xl font-black font-bebas uppercase tracking-wider text-white mb-3">Order & Product Management</h3>
                          <div className="space-y-1">
                            {menuItems.map((item) => <ListItem key={item.label} item={item} />)}
                          </div>
                      </div>

                      <div className="pt-4 border-t border-white/10">
                          <h3 className="text-xl font-black font-bebas uppercase tracking-wider text-white mb-3">Information & Legal</h3>
                          <div className="space-y-1">
                            {policyItems.map((item) => <ListItem key={item.label} item={item} />)}
                          </div>
                      </div>
                  </div>
              </Card>
            </div>
        </main>
        <StorefrontFooter />
      </div>

      {/* Mobile View */}
      <div className="md:hidden bg-[#0A0A0A] min-h-screen">
        <main className="pb-24 p-4 space-y-6">
          <div className="flex flex-col items-center text-center pt-8">
             <Avatar className="h-24 w-24 border-4 border-[#0F824B] mb-3">
              <AvatarImage src={user.profilePictureUrl} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="text-3xl font-bebas font-black bg-zinc-900 text-white">
                  {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
             <div className="bg-[#121212] border border-white/10 text-white rounded-2xl p-4 w-full space-y-1">
               <h1 className="text-2xl font-black font-bebas uppercase text-white">{user.firstName} {user.lastName}</h1>
               <p className="text-zinc-400 font-mono text-xs">{user.email}</p>
               <div className="inline-flex items-center gap-2 mt-2 bg-[#0F824B]/10 text-[#0F824B] border border-[#0F824B]/30 px-3 py-1 rounded-full text-xs font-mono font-bold">
                  <Image src="https://i.ibb.co/6RXzvrS6/oktocoin-v1-80x80.png" alt="Oktocoin" width={16} height={16} unoptimized />
                  <span>{user.oktocoins || 0} OKTOCOINS</span>
               </div>
             </div>
          </div>
          
          <Card className="bg-[#121212] border-white/10 text-white rounded-2xl">
              <CardContent className="p-2">
                  {menuItems.map((item) => (
                      <Link href={item.href || '#'} key={item.label}>
                        <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl font-mono text-xs">
                          <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4 text-[#0F824B]" />
                            <span className="font-bold text-white uppercase">{item.label}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-zinc-400" />
                        </div>
                      </Link>
                  ))}
              </CardContent>
          </Card>

           <Card className="bg-[#121212] border-white/10 text-white rounded-2xl">
              <CardContent className="p-2">
                  {policyItems.map((item) => (
                      <Link href={item.href || '#'} key={item.label}>
                        <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl font-mono text-xs">
                          <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4 text-[#0F824B]" />
                            <span className="font-bold text-white uppercase">{item.label}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-zinc-400" />
                        </div>
                      </Link>
                  ))}
              </CardContent>
          </Card>

          <Button variant="outline" className="w-full border-white/20 text-red-400 font-mono text-xs rounded-full h-11" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout Account
          </Button>
        </main>
        <MobileFooter />
      </div>
    </div>
  );
}
