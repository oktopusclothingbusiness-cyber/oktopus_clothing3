'use client'

import * as React from "react";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AddToCartButton } from "@/components/add-to-cart-button";

const products = [
    { id: '1', name: 'Classic Crewneck Tee', description: 'A timeless crewneck t-shirt made from premium, ultra-soft cotton. Perfect for layering or wearing on its own.', price: 25, imageUrl: 'https://placehold.co/600x600.png', category: 'Tops', sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Gray'] },
    { id: '2', name: 'Slim-Fit Chinos', description: 'Versatile slim-fit chinos crafted from a comfortable stretch-cotton blend. Dress them up or down for any occasion.', price: 60, imageUrl: 'https://placehold.co/600x600.png', category: 'Bottoms', sizes: ['30', '32', '34', '36'], colors: ['Khaki', 'Navy', 'Olive'] },
    { id: '3', name: 'Minimalist Hoodie', description: 'A cozy and stylish hoodie with a clean, minimalist design. Made from a soft fleece-back jersey.', price: 75, imageUrl: 'https://placehold.co/600x600.png', category: 'Outerwear', sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Heather Gray', 'Burgundy'] },
    { id: '4', name: 'Leather Sneakers', description: 'Sleek and comfortable leather sneakers with a durable rubber sole. The perfect finishing touch to any casual outfit.', price: 120, imageUrl: 'https://placehold.co/600x600.png', category: 'Footwear', sizes: ['8', '9', '10', '11', '12'], colors: ['White', 'Black', 'Brown'] },
    { id: '5', name: 'Denim Jacket', description: 'A classic denim jacket with a modern fit. Made from durable, high-quality denim.', price: 90, imageUrl: 'https://placehold.co/600x600.png', category: 'Outerwear', sizes: ['S', 'M', 'L', 'XL'], colors: ['Blue', 'Black'] },
    { id: '6', name: 'Linen Shirt', description: 'A lightweight and breathable linen shirt, perfect for warm weather.', price: 45, imageUrl: 'https://placehold.co/600x600.png', category: 'Tops', sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'Light Blue', 'Natural'] },
    { id: '7', name: 'Tailored Trousers', description: 'Sharp and sophisticated tailored trousers for a polished look.', price: 80, imageUrl: 'https://placehold.co/600x600.png', category: 'Bottoms', sizes: ['30', '32', '34', '36'], colors: ['Charcoal', 'Navy'] },
    { id: '8', name: 'Suede Loafers', description: 'Elegant suede loafers that combine comfort and style.', price: 150, imageUrl: 'https://placehold.co/600x600.png', category: 'Footwear', sizes: ['8', '9', '10', '11', '12'], colors: ['Tan', 'Dark Brown', 'Navy'] },
  ];

export default function ProductDetailPage() {
  const params = useParams();
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
