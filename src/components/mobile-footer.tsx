
'use client';

import Link from "next/link";
import { Home, Box, Palette, User, ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";


export const MobileFooter = () => {
    const pathname = usePathname();
    const { user } = useAuth();

    const navItems = [
        { href: '/store', icon: Home, label: 'Home' },
        { href: '/products', icon: ShoppingBag, label: 'Products' },
        { href: '/custom-design', icon: Palette, label: 'Custom' },
        { href: user ? '/profile' : '/login', icon: User, label: 'Profile' },
    ];

    return (
        <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg rounded-t-3xl border-t">
            <div className="flex justify-around items-center p-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (pathname.startsWith('/products') && item.href === '/products');
                    return (
                        <Link 
                            key={item.label}
                            href={item.href} 
                            className={cn(
                                "flex flex-col items-center gap-1 w-16",
                                isActive ? 'text-primary' : 'text-muted-foreground'
                            )}
                        >
                            <item.icon className={cn("h-6 w-6", isActive && "fill-current")}/>
                            <span className="text-xs font-bold truncate">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </footer>
    )
}
