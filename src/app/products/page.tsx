'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { products } from '@/lib/data';
import type { Product } from '@/types';
import AddToCartButton from '@/components/add-to-cart-button';


export default function ProductsPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-12">All Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden group flex flex-col">
            <Link href={`/products/${product.id}`} className="flex flex-col flex-grow">
              <div className="relative aspect-[3/4]">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint="clothing item"
                />
              </div>
              <CardHeader className="flex-grow">
                <CardTitle className="truncate text-lg">{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{`$${product.price.toFixed(2)}`}</p>
              </CardContent>
            </Link>
             <CardFooter>
               <AddToCartButton product={product} />
             </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
