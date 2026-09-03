

'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/context/product-context';
import { cn, getProductImage } from '@/lib/utils';
import { Button } from './ui/button';

export function DolengaProductCard({ product }: { product: Product }) {
    const productId = product?.id || (product as any)?._id?.toString() || '';
    const productHref = productId ? `/products/${productId}` : '/products';
    const priceFormatted = typeof product?.price === 'number' ? product.price.toFixed(0) : '0';

    return (
        <div className="group">
            <Link href={productHref}>
                <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                    <Image
                        src={getProductImage(product?.imageUrls)}
                        alt={product?.name || 'Product'}
                        fill
                        className={cn("object-cover transition-transform duration-500 ease-in-out group-hover:scale-105")}
                    />
                </div>
                <div className="mt-4">
                    <h3 className="text-sm text-muted-foreground">{product?.name || 'Product'}</h3>
                    <p className="font-medium">₹{priceFormatted}</p>
                </div>
            </Link>
        </div>
    );
}

    
