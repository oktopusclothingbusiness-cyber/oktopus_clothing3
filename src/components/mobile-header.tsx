
'use client';

import Link from "next/link";
import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, ShoppingCart, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import BaskeyAttribution from "./baskey-attribution";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCategory } from "@/context/category-context";


type MobileHeaderProps = {
    showCart?: boolean;
    title?: string;
    rightAction?: React.ReactNode;
}

export const MobileHeader = ({ showCart = true, title, rightAction }: MobileHeaderProps) => {
    const { user } = useAuth();
    const router = useRouter();
    const { categories, loading: categoriesLoading } = useCategory();
    const [searchQuery, setSearchQuery] = React.useState('');

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim() !== '') {
            router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
        }
    }
    
    const headerClasses = "md:hidden sticky top-0 z-50 p-4 bg-background/80 backdrop-blur-lg border-b";

    if (title) {
        return (
            <header className="md:hidden sticky top-0 z-50 py-2.5 px-3 bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-xs">
                <div className="flex justify-between items-center gap-2">
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       onClick={() => router.back()}
                       className="h-9 w-9 rounded-full hover:bg-muted/80 shrink-0 transition-colors"
                     >
                        <ArrowLeft className="h-5 w-5 text-foreground" />
                    </Button>

                    <div className="text-center flex flex-col items-center max-w-[68%] min-w-0 px-1">
                        <h1 className="font-extrabold text-sm text-foreground truncate w-full leading-tight">
                            {title}
                        </h1>
                        <BaskeyAttribution className="text-[6.5px] tracking-[0.2em] opacity-70 mt-0.5 block" />
                    </div>

                    <div className="w-9 shrink-0 flex items-center justify-end">
                        {rightAction ? (
                            rightAction
                        ) : showCart ? (
                            <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-full">
                                <Link href="/cart">
                                    <ShoppingCart className="h-4 w-4" />
                                </Link>
                            </Button>
                        ) : (
                            <div className="w-9 h-9" />
                        )}
                    </div>
                </div>
            </header>
        )
    }

    const getInitials = (firstName?: string, lastName?: string) => {
        if (!firstName || !lastName) return 'G';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    return (
        <header className={cn(headerClasses, "space-y-4")}>
            <div className="flex justify-between items-center">
                <Link href={user ? '/profile' : '/login'}>
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={user?.profilePictureUrl} alt="User" />
                            <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-xs text-muted-foreground">Welcome Back</p>
                            <p className="font-bold text-sm">{user ? `${user.firstName} ${user.lastName}` : 'Guest'}</p>
                        </div>
                    </div>
                </Link>
                <BaskeyAttribution className="text-[7.5px] tracking-[0.2em] opacity-80" />
            </div>
            <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="What's on your list?" 
                        className="w-full rounded-full pl-10 bg-secondary border-none" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                         <Button variant="outline" size="icon" className="bg-secondary border-none">
                            <SlidersHorizontal className="h-5 w-5 text-primary" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom">
                        <SheetHeader>
                            <SheetTitle>Filter Products</SheetTitle>
                            <SheetDescription>Select a category to narrow down your results.</SheetDescription>
                        </SheetHeader>
                        <div className="py-4">
                            <h3 className="mb-4 font-semibold text-lg">Categories</h3>
                            <div className="flex flex-wrap gap-3">
                                {categoriesLoading ? (
                                    <p>Loading categories...</p>
                                ) : (
                                    categories.map(category => {
                                        const catId = category?.id || (category as any)?._id?.toString() || '';
                                        const href = catId ? `/products?category=${catId}` : '/products';
                                        return (
                                            <Button asChild key={category.id || catId} variant="outline">
                                                <Link href={href}>{category.name}</Link>
                                            </Button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
