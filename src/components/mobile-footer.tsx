
'use client';

import Link from "next/link";
import { Home, ShoppingBag, Palette, User, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useThemeManager } from "@/context/theme-provider";
import { usePageTransition } from "@/context/page-transition-context";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";


export const MobileFooter = () => {
    const pathname = usePathname();
    const { user } = useAuth();
    const { setAccentColor } = useThemeManager();
    const { startTransition } = usePageTransition();

    const getInitials = (firstName?: string, lastName?: string) => {
      if (!firstName || !lastName) return 'G';
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    const navItems = [
        { href: '/store', icon: Home, label: 'Home', theme: 'slateBlue' },
        { href: '/products', icon: ShoppingBag, label: 'Products', theme: 'slateBlue' },
        { href: '/custom-design', icon: Palette, label: 'Custom', theme: 'slateBlue' },
        { href: '/verify-product', icon: ShieldCheck, label: 'Verify', theme: 'slateBlue' },
        { href: user ? '/profile' : '/login', icon: user ? null : User, label: 'Profile', theme: 'slateBlue' },
    ];
    
     const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (pathname === '/products') {
           startTransition(() => {
                setAccentColor({ name: 'slateBlue', hsl: '240 10% 3.9%' });
           });
        }
    };


    return (
        <footer className="md:hidden fixed bottom-4 left-4 right-4 z-50">
            <div className="bg-background/60 backdrop-blur-lg border shadow-2xl shadow-black/20 rounded-full flex justify-around items-center p-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (pathname.startsWith('/products') && item.href === '/products');
                    return (
                        <Link 
                            key={item.label}
                            href={item.href}
                            onClick={(e) => handleClick(e, item.href)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-full transition-colors",
                                isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                            )}
                        >
                            {item.icon ? (
                                <item.icon className={cn("h-6 w-6")}/>
                            ) : (
                                <Avatar className="h-6 w-6 border-2 border-primary">
                                    <AvatarImage src={user?.profilePictureUrl} alt="User" />
                                    <AvatarFallback className="text-xs">{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                                </Avatar>
                            )}
                            <span className="text-xs font-bold truncate">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </footer>
    )
}
