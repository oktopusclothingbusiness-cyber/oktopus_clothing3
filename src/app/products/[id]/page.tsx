
'use client'

import * as React from "react";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { useProduct } from "@/context/product-context";


export default function ProductDetailPage() {
  const params = useParams();
  const { products } = useProduct();
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="relative aspect-square">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
              data-ai-hint="product image"
            />
          </div>
          <div className="space-y-6">
            <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">{product.description}</p>
            <p className="text-3xl font-bold">${product.price.toFixed(2)}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Size</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Color</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.colors.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <AddToCartButton product={product} className="w-full" size="lg" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
