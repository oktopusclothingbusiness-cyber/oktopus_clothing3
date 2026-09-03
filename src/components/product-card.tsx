

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
    const validImageUrls = React.useMemo(() => {
        return (imageUrls || []).filter(url => 
            typeof url === 'string' && 
            (url.trim().startsWith('http://') || url.trim().startsWith('https://') || url.trim().startsWith('/'))
        );
    }, [imageUrls]);

    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

    React.useEffect(() => {
        if (validImageUrls && validImageUrls.length > 1) {
            const interval = setInterval(() => {
                setCurrentImageIndex(prevIndex => (prevIndex + 1) % validImageUrls.length);
            }, 3000); // Change image every 3 seconds
            return () => clearInterval(interval);
        }
    }, [validImageUrls]);
    
    const imageUrl = validImageUrls.length > 0 ? validImageUrls[currentImageIndex] : "https://placehold.co/600x800.png";

    return (
        <Image
            src={imageUrl}
            alt={alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn("object-cover transition-all duration-500 ease-in-out", !isMobile && "group-hover:scale-105")}
            data-ai-hint="clothing item"
        />
    );
};

export function ProductCard({ product, isMobile = false }: { product: Product, isMobile?: boolean }) {
    const [deliveryDate] = React.useState(format(addDays(new Date(), 5), 'MMM dd'));

    if (!product) return null;

    const priceFormatted = (product.price || 0).toFixed(2);
    const originalPriceFormatted = product.originalPrice ? (product.originalPrice || 0).toFixed(2) : null;
    const shortDescription = product.description ? (product.description.split(' ').slice(0, 5).join(' ') + '...') : '';

    const isNew = product.createdAt && isWithinInterval(new Date(product.createdAt), {
        start: subDays(new Date(), 7),
        end: new Date(),
    });

    if (isMobile) {
        return (
             <Card className="overflow-hidden group rounded-lg card-glass">
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-[3/4]">
                    <ProductImageSlider imageUrls={product.imageUrls} alt={product.name || 'Product'} isMobile={isMobile} />
                     {isNew && <Badge variant="destructive" className="absolute top-2 left-2">Fresh</Badge>}
                      {product.discountPercentage && product.discountPercentage > 0 && (
                        <Badge variant="destructive" className="absolute top-2 right-2">
                            {product.discountPercentage}% OFF
                        </Badge>
                    )}
                </div>
                <div className="p-2 space-y-1">
                  <h3 className="truncate text-sm font-semibold">{product.name || 'Unnamed Product'}</h3>
                  <div className="flex items-baseline gap-1">
                    <p className="text-sm font-bold">₹{priceFormatted}</p>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-xs text-muted-foreground line-through">₹{originalPriceFormatted}</p>
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
                    <ProductImageSlider imageUrls={product.imageUrls} alt={product.name || 'Product'} isMobile={isMobile} />
                     {isNew && <Badge variant="default" className="absolute top-3 left-3 bg-stone-900 text-white">New</Badge>}
                      {product.discountPercentage && product.discountPercentage > 0 && (
                        <Badge variant="destructive" className="absolute top-3 right-3">
                            {product.discountPercentage}% OFF
                        </Badge>
                    )}
                </div>
                <CardContent className="p-4 text-center">
                    <h3 className="font-bold text-lg truncate font-serif">{product.name || 'Unnamed Product'}</h3>
                    {shortDescription && <p className="text-muted-foreground text-sm">{shortDescription}</p>}
                    <div className="flex items-baseline justify-center gap-2 mt-2">
                        <p className="text-xl font-bold">₹{priceFormatted}</p>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <p className="text-md text-muted-foreground line-through">₹{originalPriceFormatted}</p>
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
