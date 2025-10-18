
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/context/product-context';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export function DolengaProductCard({ product }: { product: Product }) {
    return (
        <div className="group">
            <Link href={`/products/${product.id}`}>
                <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                    <Image
                        src={product.imageUrls[0]}
                        alt={product.name}
                        fill
                        className={cn("object-cover transition-transform duration-500 ease-in-out group-hover:scale-105")}
                    />
                </div>
                <div className="mt-4">
                    <h3 className="text-sm text-muted-foreground">{product.name}</h3>
                    <p className="font-medium">₽{product.price.toFixed(0)}</p>
                </div>
            </Link>
        </div>
    );
}

    