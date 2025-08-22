import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { products } from '@/lib/data';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ArrowRight, PlayCircle, Search, ShoppingBag } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-background">
      <header className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-8 h-8"
              viewBox="0 0 46 42"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M23 0L45.5 41.25H0.5L23 0Z"
                fill="black"
              />
            </svg>
            <span className="font-bold text-xl">UIXSHUVO</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Live Preview
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Blog
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Categories
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </header>

      <main>
        <section className="text-center py-16 md:py-24 container mx-auto">
          <div className="flex items-center justify-center mb-4">
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl tracking-tighter">
              DIVE INTO A W
            </h1>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-green-200 rounded-full flex items-center justify-center mx-2">
              <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 2L9.19 8.63L2 11l6.19 4.37L9.19 22L12 18.27L14.81 22l-1-6.63L22 11l-7.19-2.37L12 2z"
                />
              </svg>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl tracking-tighter">
              RLD OF ENDLESS
            </h1>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl tracking-tighter mb-4">
            FASHION POSSIBILITIES
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Discover your signature style with our curated selection of fashion
            finds. Your next favorite outfit is just a click away.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" className="rounded-full">
              Shop Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full">
              Explore More Products
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="col-span-1 lg:col-span-1 row-span-2 overflow-hidden bg-gray-100 p-0">
              <Image
                src="https://placehold.co/400x600.png"
                alt="Model in full outfit"
                width={400}
                height={600}
                className="w-full h-full object-cover"
                data-ai-hint="male fashion model"
              />
            </Card>
            <Card className="col-span-1 lg:col-span-1 row-span-1 overflow-hidden bg-gray-100 p-0">
               <Image
                src="https://placehold.co/400x300.png"
                alt="Awesome Collection"
                width={400}
                height={300}
                className="w-full h-full object-cover"
                data-ai-hint="male fashion model selfie"
              />
            </Card>
             <Card className="col-span-1 lg:col-span-1 row-span-2 overflow-hidden bg-gray-100 p-0">
               <Image
                src="https://placehold.co/400x600.png"
                alt="Gucci Formal Set"
                width={400}
                height={600}
                className="w-full h-full object-cover"
                data-ai-hint="male fashion model formal"
              />
            </Card>
             <Card className="col-span-1 lg:col-span-1 row-span-1 overflow-hidden bg-gray-100 p-0">
               <Image
                src="https://placehold.co/400x300.png"
                alt="Product"
                width={400}
                height={300}
                className="w-full h-full object-cover"
                data-ai-hint="clothing item"
              />
            </Card>
          </div>
        </section>


        <section className="py-16 md:py-24">
          <h2 className="text-center font-serif text-3xl md:text-4xl mb-12">
            FEATURED COLLECTION
          </h2>
          <Carousel
            opts={{
              align: 'center',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {products.map((product, index) => (
                <CarouselItem
                  key={index}
                  className="md:basis-1/2 lg:basis-1/4"
                >
                  <Card className="overflow-hidden m-2 border-none shadow-lg">
                    <CardContent className="p-0 relative">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={300}
                        height={400}
                        className="w-full h-full object-cover"
                        data-ai-hint="clothing item"
                      />
                       <div className="absolute top-2 right-2 bg-white/80 text-xs px-2 py-1 rounded-full">SALE</div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="font-bold">{product.name}</h3>
                        <p className="text-sm">{`$${product.price.toFixed(2)} USD`}</p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="text-center mt-8">
                <button className="bg-primary text-primary-foreground rounded-full p-4 inline-flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6"/>
                </button>
            </div>

          </Carousel>
        </section>

        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-serif text-3xl md:text-4xl">
                ELEVATE YOUR WARDROBE WITH OUR FASHION FINDS
              </h2>
              <p className="text-muted-foreground">
                Discover your signature style with our curated selection of
                fashion finds. Your next favorite outfit is just a click away.
              </p>
              <Button variant="outline" className="rounded-full border-primary text-primary">
                Our New Collection Introduction
              </Button>
            </div>
            <div className="relative">
              <Image
                src="https://placehold.co/600x400.png"
                alt="Fashion finds"
                width={600}
                height={400}
                className="rounded-2xl"
                data-ai-hint="male model posing"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <PlayCircle className="w-16 h-16 text-white/80" fill="white"/>
              </div>
            </div>
          </div>
        </section>
        
        <footer className="py-8">
            <div className="container mx-auto text-center">
                <p>&copy; {new Date().getFullYear()} UIXSHUVO. All rights reserved.</p>
            </div>
        </footer>
      </main>
    </div>
  );
}
