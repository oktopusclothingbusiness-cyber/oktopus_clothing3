
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { products } from '@/data/products';

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
