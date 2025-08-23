
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, ShoppingCart, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";


type MobileHeaderProps = {
    showCart?: boolean;
    title?: string;
}

export const MobileHeader = ({ showCart = true, title }: MobileHeaderProps) => {
    const { user } = useAuth();
    const router = useRouter();

    if (title) {
        return (
            <header className="md:hidden sticky top-0 z-50 bg-background p-4 border-b">
                <div className="flex justify-between items-center">
                     <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="font-bold text-lg truncate">{title}</h1>
                    <div className="w-10">
                        {showCart && (
                             <Button variant="ghost" size="icon" asChild>
                                <Link href="/cart">
                                    <ShoppingCart className="h-6 w-6" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </header>
        )
    }

    return (
        <header className="md:hidden sticky top-0 z-50 bg-background p-4 space-y-4">
            <div className="flex justify-between items-center">
                <Link href={user ? '#' : '/login'}>
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={user ? "https://i.ibb.co/L1L4B1X/avatar.png" : "https://placehold.co/40x40.png"} alt="User" />
                            <AvatarFallback>{user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-xs text-muted-foreground">Welcome Back</p>
                            <p className="font-bold text-sm">{user ? `${user.firstName} ${user.lastName}` : 'Guest'}</p>
                        </div>
                    </div>
                </Link>
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/cart">
                        <ShoppingCart className="h-6 w-6" />
                    </Link>
                </Button>
            </div>
            <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="What's on your list?" className="w-full rounded-full pl-10 bg-secondary border-none" />
                </div>
                <Button variant="outline" size="icon" className="bg-secondary border-none">
                    <SlidersHorizontal className="h-5 w-5 text-primary" />
                </Button>
            </div>
        </header>
    );
}
