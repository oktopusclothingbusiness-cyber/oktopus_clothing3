import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { products } from '@/lib/data';
import { Heart } from 'lucide-react';

export default function Home() {
  return (
    <>
      <section className="relative w-full h-[60vh] bg-gray-900 text-white flex items-center justify-center">
        <Image
          src="https://placehold.co/1600x900.png"
          alt="Hero background"
          layout="fill"
          objectFit="cover"
          className="opacity-40"
          data-ai-hint="fashion runway"
        />
        <div className="relative z-10 text-center p-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Style Redefined
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
            Explore our curated collection of modern apparel. Quality and style
            for the discerning individual.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/products">Shop Now</Link>
          </Button>
        </div>
      </section>
      <section id="products" className="py-16 md:py-24">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden group"
              >
                <Link href={`/products/${product.id}`}>
                  <div className="relative aspect-square">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint="clothing item"
                    />
                    <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="w-5 h-5 text-gray-700" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg truncate">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground">{`$${product.price}`}</p>
                  </CardContent>
                </Link>
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
    </>
  );
}
