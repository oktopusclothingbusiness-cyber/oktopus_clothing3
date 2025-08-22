import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AddToCartButton } from "@/components/add-to-cart-button";

const products = [
  { id: '1', name: 'Classic Crewneck Tee', description: 'A timeless crewneck t-shirt made from premium, ultra-soft cotton. Perfect for layering or wearing on its own.', price: 25, imageUrl: 'https://placehold.co/600x600.png', category: 'Tops' },
  { id: '2', name: 'Slim-Fit Chinos', description: 'Versatile slim-fit chinos crafted from a comfortable stretch-cotton blend. Dress them up or down for any occasion.', price: 60, imageUrl: 'https://placehold.co/600x600.png', category: 'Bottoms' },
  { id: '3', name: 'Minimalist Hoodie', description: 'A cozy and stylish hoodie with a clean, minimalist design. Made from a soft fleece-back jersey.', price: 75, imageUrl: 'https://placehold.co/600x600.png', category: 'Outerwear' },
  { id: '4', name: 'Leather Sneakers', description: 'Sleek and comfortable leather sneakers with a durable rubber sole. The perfect finishing touch to any casual outfit.', price: 120, imageUrl: 'https://placehold.co/600x600.png', category: 'Footwear' },
  { id: '5', name: 'Denim Jacket', description: 'A classic denim jacket with a modern fit. Made from durable, high-quality denim.', price: 90, imageUrl: 'https://placehold.co/600x600.png', category: 'Outerwear' },
  { id: '6', name: 'Linen Shirt', description: 'A lightweight and breathable linen shirt, perfect for warm weather.', price: 45, imageUrl: 'https://placehold.co/600x600.png', category: 'Tops' },
  { id: '7', name: 'Tailored Trousers', description: 'Sharp and sophisticated tailored trousers for a polished look.', price: 80, imageUrl: 'https://placehold.co/600x600.png', category: 'Bottoms' },
  { id: '8', name: 'Suede Loafers', description: 'Elegant suede loafers that combine comfort and style.', price: 150, imageUrl: 'https://placehold.co/600x600.png', category: 'Footwear' },
];

export default function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">All Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden group">
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-[3/4]">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="clothing item"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="truncate">{product.name}</CardTitle>
                </CardHeader>
              </Link>
              <CardContent>
                <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
              </CardContent>
              <CardFooter>
                <AddToCartButton product={product} />
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
