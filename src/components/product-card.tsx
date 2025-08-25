
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AddToCartButton } from '@/components/add-to-cart-button';
import type { Product } from '@/context/product-context';
import * as React from 'react';
import { Star } from 'lucide-react';
import { format, addDays, isWithinInterval, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const ProductImageSlider = ({ imageUrls, alt, isMobile }: { imageUrls: string[], alt: string, isMobile: boolean }) => {
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

    React.useEffect(() => {
        if (imageUrls.length > 1) {
            const interval = setInterval(() => {
                setCurrentImageIndex(prevIndex => (prevIndex + 1) % imageUrls.length);
            }, 3000); // Change image every 3 seconds
            return () => clearInterval(interval);
        }
    }, [imageUrls, imageUrls.length]);
    
    if (!imageUrls || imageUrls.length === 0) {
        return (
             <Image
                src="https://placehold.co/600x800.png"
                alt={alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="clothing item"
            />
        )
    }

    return (
        <Image
            src={imageUrls[currentImageIndex]}
            alt={alt}
            fill
            className={cn("object-cover transition-all duration-500 ease-in-out", !isMobile && "group-hover:scale-105")}
            data-ai-hint="clothing item"
        />
    );
};

export function ProductCard({ product, isMobile = false }: { product: Product, isMobile?: boolean }) {
    const [deliveryDate] = React.useState(format(addDays(new Date(), 5), 'MMM dd'));

    const isNew = product.createdAt && isWithinInterval(new Date(product.createdAt), {
        start: subDays(new Date(), 2),
        end: new Date(),
    });

    if (isMobile) {
        return (
             <Card className="overflow-hidden group rounded-lg card-glass">
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-[3/4]">
                    <ProductImageSlider imageUrls={product.imageUrls} alt={product.name} isMobile={isMobile} />
                     {isNew && <Badge variant="destructive" className="absolute top-2 left-2">Fresh</Badge>}
                </div>
                <div className="p-2 space-y-1">
                  <h3 className="truncate text-sm font-semibold">{product.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <p className="text-sm font-bold">₹{product.price.toFixed(2)}</p>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-xs text-muted-foreground line-through">₹{product.originalPrice.toFixed(2)}</p>
                    )}
                  </div>
                   <p className="text-xs text-green-600">Get it by {deliveryDate}</p>
                </div>
              </Link>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden group">
            <Link href={`/products/${product.id}`}>
                <div className="relative aspect-[3/4]">
                    <ProductImageSlider imageUrls={product.imageUrls} alt={product.name} isMobile={isMobile} />
                     {isNew && <Badge variant="destructive" className="absolute top-2 left-2">Fresh</Badge>}
                </div>
                <CardHeader>
                    <CardTitle className="truncate">{product.name}</CardTitle>
                </CardHeader>
            </Link>
            <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground">({product.rating?.toFixed(1)})</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <p className="text-lg font-semibold">₹{product.price.toFixed(2)}</p>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-sm text-muted-foreground line-through">₹{product.originalPrice.toFixed(2)}</p>
                    )}
                </div>
                <p className="text-xs text-green-600">Get it by {deliveryDate}</p>
            </CardContent>
            <CardFooter>
                <AddToCartButton product={product} />
            </CardFooter>
        </Card>
    );
}
