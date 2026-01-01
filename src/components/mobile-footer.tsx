
'use client';

import Link from "next/link";
import { Home, ShoppingBag, Palette, User, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useThemeManager } from "@/context/theme-provider";


export const MobileFooter = () => {
    const pathname = usePathname();
    const { user } = useAuth();
    const { setAccentColor } = useThemeManager();

    const navItems = [
        { href: '/store', icon: Home, label: 'Home', theme: 'slateBlue' },
        { href: '/products', icon: ShoppingBag, label: 'Products', theme: 'slateBlue' },
        { href: '/custom-design', icon: Palette, label: 'Custom', theme: 'slateBlue' },
        { href: '/verify-product', icon: ShieldCheck, label: 'Verify', theme: 'slateBlue' },
        { href: user ? '/profile' : '/login', icon: User, label: 'Profile', theme: 'slateBlue' },
    ];
    
     const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, themeName: string) => {
        // Always revert to default theme when navigating away from products page
        if (pathname === '/products') {
            setAccentColor({ name: 'slateBlue', hsl: '240 10% 3.9%' });
        }
    };


    return (
        <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg rounded-t-3xl border-t">
            <div className="flex justify-around items-center p-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (pathname.startsWith('/products') && item.href === '/products');
                    return (
                        <Link 
                            key={item.label}
                            href={item.href}
                            onClick={(e) => handleClick(e, item.href, item.theme)}
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
