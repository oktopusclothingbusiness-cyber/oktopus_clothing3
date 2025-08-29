
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
import { Button } from './ui/button';

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
        start: subDays(new Date(), 7), // A week for new
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
        <Card className="overflow-hidden group border rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
            <Link href={`/products/${product.id}`}>
                <div className="relative aspect-[3/4] bg-gray-100">
                    <ProductImageSlider imageUrls={product.imageUrls} alt={product.name} isMobile={isMobile} />
                     {isNew && <Badge variant="default" className="absolute top-3 left-3 bg-stone-900 text-white">New</Badge>}
                </div>
                <CardContent className="p-4 text-center">
                    <h3 className="font-bold text-lg truncate font-serif">{product.name}</h3>
                    <p className="text-muted-foreground text-sm">{product.description.split(' ').slice(0, 5).join(' ') + '...'}</p>
                    <div className="flex items-baseline justify-center gap-2 mt-2">
                        <p className="text-xl font-bold">₹{product.price.toFixed(2)}</p>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <p className="text-md text-muted-foreground line-through">₹{product.originalPrice.toFixed(2)}</p>
                        )}
                    </div>
                </CardContent>
            </Link>
            <CardFooter className="p-4 pt-0">
                <AddToCartButton product={product} className="bg-stone-900 text-white hover:bg-stone-700 rounded-full" />
            </CardFooter>
        </Card>
    );
}
