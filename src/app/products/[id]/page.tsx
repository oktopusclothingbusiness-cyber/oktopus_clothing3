
'use client'

import * as React from "react";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useProduct, Product } from "@/context/product-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MobileHeader } from "@/components/mobile-header";
import { MobileFooter } from "@/components/mobile-footer";
import { useCart } from "@/context/cart-context";
import { Star, ShoppingCart, Heart, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { useSizeChart, SizeChart } from "@/context/size-chart-context";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


export default function ProductDetailPage() {
  const params = useParams();
  const { products, loading } = useProduct();
  const [product, setProduct] = React.useState<Product | null | undefined>(undefined);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user, addToWishlist, removeFromWishlist, isInWishlist } = useAuth();
  const { sizeCharts, loading: sizeChartsLoading } = useSizeChart();
  
  const [selectedSize, setSelectedSize] = React.useState<string>('');
  const [selectedColor, setSelectedColor] = React.useState<string>('');
  const [sizeChart, setSizeChart] = React.useState<SizeChart | null>(null);

  React.useEffect(() => {
    if (!loading) {
      const foundProduct = products.find((p) => p.id === params.id);
      setProduct(foundProduct);
      if (foundProduct?.sizes?.length > 0) {
        setSelectedSize(foundProduct.sizes[0]);
      }
      if (foundProduct?.colors?.length > 0) {
        setSelectedColor(foundProduct.colors[0]);
      }
    }
  }, [params.id, products, loading]);

  React.useEffect(() => {
    if (product && !sizeChartsLoading) {
      // Find a size chart that is linked to one of the product's categories
      const chart = sizeCharts.find(sc => 
        sc.categoryIds?.some(catId => product.category.includes(catId))
      );
      setSizeChart(chart || null);
    }
  }, [product, sizeCharts, sizeChartsLoading]);


  const handleAddToCart = () => {
    if (product) {
      if (!selectedSize && product.sizes.length > 0) {
        toast({ title: 'Please select a size.', variant: 'destructive' });
        return;
      }
      if (!selectedColor && product.colors.length > 0) {
        toast({ title: 'Please select a color.', variant: 'destructive' });
        return;
      }
      addToCart(product, selectedSize, selectedColor);
    }
  };

  const handleWishlistToggle = () => {
      if (!product) return;
      if (isInWishlist(product.id)) {
          removeFromWishlist(product.id);
      } else {
          addToWishlist(product.id);
      }
  }
  
  const isWishlisted = product ? isInWishlist(product.id) : false;

  const pageLoading = loading || product === undefined || sizeChartsLoading;

  if (pageLoading) {
    return (
        <>
            <div className="hidden md:block">
                <ProductDetailSkeleton />
            </div>
            <div className="md:hidden">
                <MobileHeader title="Product Details" showCart={false} />
                <ProductDetailSkeleton />
                <MobileFooter />
            </div>
        </>
    )
  }

  if (!product) {
    notFound();
  }
  
  const productImages = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : ["https://placehold.co/600x800"];

  return (
      <>
        {/* Desktop View */}
        <div className="hidden md:flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <Carousel className="w-full">
                  <CarouselContent>
                    {productImages.map((url, index) => (
                      <CarouselItem key={index}>
                        <div className="relative aspect-square">
                          <Image
                            src={url}
                            alt={`${product.name} image ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                            data-ai-hint="product image"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
              <div className="space-y-6">
                <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        {Array.from({length: 5}).map((_, i) => (
                            <Star key={i} className={`h-5 w-5 ${i < Math.round(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                    </div>
                    <span className="text-muted-foreground">({product.rating?.toFixed(1)})</span>
                </div>
                <p className="text-muted-foreground">{product.description}</p>
                 <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">₹{product.price.toFixed(2)}</p>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-xl text-muted-foreground line-through">₹{product.originalPrice.toFixed(2)}</p>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {product.sizes.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Size</label>
                        {sizeChart && (
                          <Dialog>
                              <DialogTrigger asChild>
                                  <Button variant="link" size="sm" className="p-0 h-auto">
                                      <Ruler className="mr-1 h-4 w-4" /> Size Chart
                                  </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                      <DialogTitle>{sizeChart.name}</DialogTitle>
                                      <DialogDescription>All measurements are in {sizeChart.unit}.</DialogDescription>
                                  </DialogHeader>
                                  <Table>
                                  <TableHeader>
                                      <TableRow>
                                          <TableHead>Size</TableHead>
                                          <TableHead>Chest</TableHead>
                                          <TableHead>Length</TableHead>
                                          <TableHead>Sleeve</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {sizeChart.sizes.map((s, i) => (
                                          <TableRow key={i}>
                                              <TableCell className="font-medium">{s.size}</TableCell>
                                              <TableCell>{s.chest}"</TableCell>
                                              <TableCell>{s.length}"</TableCell>
                                              <TableCell>{s.sleeve}"</TableCell>
                                          </TableRow>
                                      ))}
                                  </TableBody>
                              </Table>
                              </DialogContent>
                          </Dialog>
                        )}
                      </div>
                      <Select value={selectedSize} onValueChange={setSelectedSize}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {product.sizes.map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {product.colors.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Color</label>
                     <Select value={selectedColor} onValueChange={setSelectedColor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.colors.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  )}
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleAddToCart} className="w-full" size="lg">
                        <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                    <Button onClick={handleWishlistToggle} size="lg" variant="outline">
                        <Heart className={cn("mr-2 h-4 w-4", isWishlisted && "fill-red-500 text-red-500")} />
                        {isWishlisted ? "Wishlisted" : "Wishlist"}
                    </Button>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
        {/* Mobile View */}
        <div className="md:hidden">
            <MobileHeader title={product.name} showCart={false} />
            <main className="pb-24">
                <Carousel className="w-full">
                  <CarouselContent>
                    {productImages.map((url, index) => (
                      <CarouselItem key={index}>
                        <div className="relative aspect-square">
                          <Image
                            src={url}
                            alt={`${product.name} image ${index + 1}`}
                            fill
                            className="object-cover"
                            data-ai-hint="product image"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
                <div className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                        <h1 className="text-2xl font-bold">{product.name}</h1>
                        <Button onClick={handleWishlistToggle} size="icon" variant="ghost">
                           <Heart className={cn("h-6 w-6 text-muted-foreground", isWishlisted && "fill-red-500 text-red-500")} />
                        </Button>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold">₹{product.price.toFixed(2)}</p>
                         {product.originalPrice && product.originalPrice > product.price && (
                            <p className="text-lg text-muted-foreground line-through">₹{product.originalPrice.toFixed(2)}</p>
                        )}
                    </div>
                    <p className="text-muted-foreground text-sm">{product.description}</p>
                     <div className="grid grid-cols-2 gap-4">
                       {product.sizes.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-medium">Size</label>
                                {sizeChart && (
                                  <Dialog>
                                      <DialogTrigger asChild>
                                          <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                                              <Ruler className="mr-1 h-3 w-3" /> Size Chart
                                          </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                          <DialogHeader>
                                              <DialogTitle>{sizeChart.name}</DialogTitle>
                                              <DialogDescription>All measurements are in {sizeChart.unit}.</DialogDescription>
                                          </DialogHeader>
                                          <Table>
                                              <TableHeader>
                                                  <TableRow>
                                                      <TableHead>Size</TableHead>
                                                      <TableHead>Chest</TableHead>
                                                      <TableHead>Length</TableHead>
                                                      <TableHead>Sleeve</TableHead>
                                                  </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                  {sizeChart.sizes.map((s, i) => (
                                                      <TableRow key={i}>
                                                          <TableCell className="font-medium">{s.size}</TableCell>
                                                          <TableCell>{s.chest}"</TableCell>
                                                          <TableCell>{s.length}"</TableCell>
                                                          <TableCell>{s.sleeve}"</TableCell>
                                                      </TableRow>
                                                  ))}
                                              </TableBody>
                                          </Table>
                                      </DialogContent>
                                  </Dialog>
                                )}
                            </div>
                          <Select value={selectedSize} onValueChange={setSelectedSize}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              {product.sizes.map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                       )}
                       {product.colors.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Color</label>
                          <Select value={selectedColor} onValueChange={setSelectedColor}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                            <SelectContent>
                              {product.colors.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                       )}
                    </div>
                    <Button onClick={handleAddToCart} className="w-full" size="lg">
                        <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                </div>
            </main>
            <MobileFooter/>
        </div>
    </>
  );
}

function ProductDetailSkeleton() {
  return (
      <>
        {/* Desktop Skeleton */}
        <div className="hidden md:flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <Skeleton className="relative aspect-square rounded-lg" />
              <div className="space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-1/4" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </main>
          <Footer />
        </div>
        {/* Mobile Skeleton */}
        <div className="md:hidden">
            <main className="pb-24">
                <Skeleton className="w-full aspect-square" />
                <div className="p-4 space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-16 w-full" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                </div>
            </main>
        </div>
    </>
  )
}
