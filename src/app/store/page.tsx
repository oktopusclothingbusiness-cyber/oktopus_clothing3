import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Box, Truck, Tag } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AddToCartButton } from "@/components/add-to-cart-button";

const products = [
  { id: '1', name: 'Classic Crewneck Tee', description: 'A timeless crewneck t-shirt made from premium, ultra-soft cotton. Perfect for layering or wearing on its own.', price: 25, imageUrl: 'https://placehold.co/600x600.png', category: 'Tops' },
  { id: '2', name: 'Slim-Fit Chinos', description: 'Versatile slim-fit chinos crafted from a comfortable stretch-cotton blend. Dress them up or down for any occasion.', price: 60, imageUrl: 'https://placehold.co/600x600.png', category: 'Bottoms' },
  { id: '3', name: 'Minimalist Hoodie', description: 'A cozy and stylish hoodie with a clean, minimalist design. Made from a soft fleece-back jersey.', price: 75, imageUrl: 'https://placehold.co/600x600.png', category: 'Outerwear' },
  { id: '4', name: 'Leather Sneakers', description: 'Sleek and comfortable leather sneakers with a durable rubber sole. The perfect finishing touch to any casual outfit.', price: 120, imageUrl: 'https://placehold.co/600x600.png', category: 'Footwear' },
];

export default function Home() {
  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                VogueVerse: Where Style Meets Expression
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover the latest trends and timeless classics. Our curated collection offers high-quality apparel to help you express your unique style.
              </p>
              <div className="flex gap-4">
                <Button size="lg" asChild>
                  <Link href="/products">
                    Shop The Collection <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline">Learn More</Button>
              </div>
            </div>
            <div className="relative h-96 w-full rounded-lg overflow-hidden">
                <Image
                  src="https://placehold.co/600x400.png"
                  alt="Fashion model"
                  fill
                  objectFit="cover"
                  data-ai-hint="fashion model"
                  className="rounded-lg"
                />
            </div>
          </div>
        </section>

        <section className="bg-secondary py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
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
                    <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
                  </CardContent>
                  <CardFooter>
                    <AddToCartButton product={product} />
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button asChild variant="outline">
                <Link href="/products">View All Products</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <Card>
                <CardHeader>
                  <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center">
                    <Truck className="h-8 w-8" />
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
                  <p className="text-muted-foreground">
                    Enjoy free shipping on all orders over $50. We deliver to your doorstep, hassle-free.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center">
                    <Box className="h-8 w-8" />
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-semibold mb-2">Easy Returns</h3>
                  <p className="text-muted-foreground">
                    Not satisfied? We offer a 30-day easy return policy on all our products.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center">
                    <Tag className="h-8 w-8" />
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-semibold mb-2">Quality Guaranteed</h3>
                  <p className="text-muted-foreground">
                    Our apparel is crafted from the finest materials, ensuring both comfort and durability.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
