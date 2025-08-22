'use client';

import { useState } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Minus, Plus } from 'lucide-react';

import { products } from '@/lib/data';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';

function ProductClientComponent({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-12 items-start">
      <div className="relative aspect-square">
        <Image
          src={product.imageUrl}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
          data-ai-hint="clothing item"
        />
      </div>
      <div>
        <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
        <p className="text-2xl text-primary mb-6">{`$${product.price.toFixed(
          2
        )}`}</p>
        <p className="text-muted-foreground mb-8">{product.description}</p>
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button size="lg" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Category: {product.category}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto py-16 md:py-24">
      <ProductClientComponent product={product} />
    </div>
  );
}
