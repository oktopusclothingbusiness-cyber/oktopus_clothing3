import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { OktopusHeader } from "@/components/oktopus-header";
import { OktopusFooter } from "@/components/oktopus-footer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const featuredProducts = [
  { id: '1', name: 'Classic White Shirt', price: 40, imageUrl: 'https://placehold.co/600x800.png', category: 'Tops' },
  { id: '2', name: 'Slim Fit Trousers', price: 50, imageUrl: 'https://placehold.co/600x800.png', category: 'Bottoms' },
  { id: '3', name: 'Minimalist Hoodie', price: 75, imageUrl: 'https://placehold.co/600x800.png', category: 'Outerwear' },
  { id: '4', name: 'Leather Sneakers', price: 120, imageUrl: 'https://placehold.co/600x800.png', category: 'Footwear' },
];

export default function OktopusStorePage() {
  return (
    <div className="bg-white text-stone-900 font-sans">
      <OktopusHeader />
      <main>
        <section className="container mx-auto px-4 py-12 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <span className="text-accent font-semibold uppercase tracking-wider">Premium Collection</span>
              <h1 className="text-4xl md:text-6xl font-bold font-serif tracking-tight leading-tight">
                Dive into a World of Endless Fashion Possibilities
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover premium clothing collections tailored for a modern and stylish lifestyle.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="bg-accent text-white hover:bg-accent/90 rounded-full">
                  <Link href="/products">Shop Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full">
                  Explore More Products
                </Button>
              </div>
            </div>
            <div className="relative h-[500px] w-full rounded-lg overflow-hidden">
                <Image
                  src="https://placehold.co/600x800.png"
                  alt="Fashion model"
                  fill
                  objectFit="cover"
                  data-ai-hint="male model showcase"
                  className="rounded-lg"
                />
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 font-serif">Featured Collection</h2>
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent>
                {featuredProducts.map((product) => (
                  <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/4">
                    <div className="p-1">
                      <Card className="overflow-hidden group border-none shadow-none">
                        <Link href={`/products/${product.id}`}>
                          <div className="relative aspect-[3/4] bg-gray-100 rounded-lg">
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              data-ai-hint="product model"
                            />
                          </div>
                        </Link>
                        <CardHeader className="p-4">
                          <CardTitle className="truncate font-serif text-lg">{product.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Button className="w-full bg-accent text-white hover:bg-accent/90 rounded-full">
                            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          </div>
        </section>
        
        <section className="container mx-auto px-4 my-20">
          <div className="relative bg-gray-100 rounded-lg p-8 md:p-16 grid md:grid-cols-2 items-center gap-8 overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">Elevate Your Wardrobe with Our Fashion Finds</h2>
              <Button asChild className="bg-accent text-white hover:bg-accent/90 rounded-full">
                <Link href="/products">Shop Collection</Link>
              </Button>
            </div>
            <div className="relative h-64 md:h-96">
               <Image src="https://placehold.co/600x600.png" alt="Model in a suit" fill objectFit="cover" className="rounded-lg" data-ai-hint="model suit" />
            </div>
          </div>
        </section>


        <section className="container mx-auto px-4 my-20">
          <h2 className="text-3xl font-bold text-center mb-12 font-serif">Fashion at Your Fingertips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="relative h-80 rounded-lg overflow-hidden border-none">
              <Image src="https://placehold.co/600x600.png" alt="Happy Customers" layout="fill" objectFit="cover" data-ai-hint="customer showcase" />
              <div className="absolute inset-0 bg-black/40 flex items-end p-8">
                <h3 className="text-2xl font-bold text-white font-serif">1200+ Happy Customers</h3>
              </div>
            </Card>
            <Card className="relative h-80 rounded-lg overflow-hidden border-none">
              <Image src="https://placehold.co/600x600.png" alt="New Arrivals" layout="fill" objectFit="cover" data-ai-hint="customer showcase" />
              <div className="absolute inset-0 bg-black/40 flex items-end p-8">
                <h3 className="text-2xl font-bold text-white font-serif">New Arrivals Weekly</h3>
              </div>
            </Card>
          </div>
        </section>

      </main>
      <OktopusFooter />
    </div>
  );
}