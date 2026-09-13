'use client';

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useProduct, Product } from "@/context/product-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MobileHeader } from "@/components/mobile-header";
import { MobileFooter } from "@/components/mobile-footer";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/context/cart-context";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Ruler, 
  XCircle, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  ChevronRight,
  Sparkles,
  Check,
  Share2,
  Tag,
  Zap
} from "lucide-react";
import { format, addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { cn, getOptimizedImageUrl } from "@/lib/utils";
import { useSizeChart, SizeChart } from "@/context/size-chart-context";
import { useCategory } from "@/context/category-context";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { products, loading } = useProduct();
  const { categories } = useCategory();
  const [product, setProduct] = React.useState<Product | null | undefined>(undefined);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user, addToWishlist, removeFromWishlist, isInWishlist } = useAuth();
  const { sizeCharts, loading: sizeChartsLoading } = useSizeChart();

  const [selectedSize, setSelectedSize] = React.useState<string>('');
  const [selectedColor, setSelectedColor] = React.useState<string>('');
  const [sizeChart, setSizeChart] = React.useState<SizeChart | null>(null);
  const [activeImageIndex, setActiveImageIndex] = React.useState<number>(0);

  // Set product and default size/color when products load
  React.useEffect(() => {
    if (!loading) {
      const foundProduct = products.find((p) => p.id === params.id || (p as any)._id === params.id);
      setProduct(foundProduct);
      if (foundProduct && foundProduct.sizes && foundProduct.sizes.length > 0) {
        setSelectedSize(foundProduct.sizes[0]);
      }
      if (foundProduct && foundProduct.colors && foundProduct.colors.length > 0) {
        setSelectedColor(foundProduct.colors[0]);
      }
    }
  }, [params.id, products, loading]);

  // Find linked size chart
  React.useEffect(() => {
    if (product && !sizeChartsLoading) {
      const pCats = Array.isArray(product.category) 
        ? product.category 
        : product.category ? [product.category] : [];
      const chart = sizeCharts.find(sc => 
        sc.categoryIds?.some(catId => pCats.includes(catId))
      );
      setSizeChart(chart || null);
    }
  }, [product, sizeCharts, sizeChartsLoading]);

  // Reset active image index when selected color changes
  React.useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedColor]);

  // Color-wired images hook
  const productImages = React.useMemo(() => {
    if (!product) return ["https://placehold.co/600x800"];
    
    if (selectedColor && product.colorImages && product.colorImages[selectedColor] && product.colorImages[selectedColor].length > 0) {
      return product.colorImages[selectedColor];
    }

    if (product.imageUrls && product.imageUrls.length > 0) {
      return product.imageUrls;
    }

    return ["https://placehold.co/600x800"];
  }, [product, selectedColor]);

  // 10 days ahead delivery estimate hook
  const deliveryDate = React.useMemo(() => format(addDays(new Date(), 10), 'EEEE, MMM dd'), []);

  // Related products hook
  const relatedProducts = React.useMemo(() => {
    if (!product) return [];
    const currentCategories = Array.isArray(product.category) 
      ? product.category 
      : product.category ? [product.category] : [];

    return (products || []).filter(p => {
      if (!p || p.id === product.id) return false;
      const pCats = Array.isArray(p.category) ? p.category : p.category ? [p.category] : [];
      return pCats.some(cat => currentCategories.includes(cat));
    }).slice(0, 4);
  }, [products, product]);

  const discountPercent = React.useMemo(() => {
    if (product?.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  }, [product]);

  const categoryName = React.useMemo(() => {
    if (!product || !product.category) return null;
    const catIds = Array.isArray(product.category) ? product.category : [product.category];
    if (catIds.length === 0) return null;
    const foundCat = (categories || []).find(c => c.id === catIds[0] || (c as any)._id === catIds[0]);
    return foundCat?.name || null;
  }, [product, categories]);

  const handleAddToCart = () => {
    if (product) {
      if (!selectedSize && product.sizes && product.sizes.length > 0) {
        toast({ title: 'Please select a size.', variant: 'destructive' });
        return;
      }
      if (!selectedColor && product.colors && product.colors.length > 0) {
        toast({ title: 'Please select a color.', variant: 'destructive' });
        return;
      }
      addToCart(product, selectedSize, selectedColor);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      if (!selectedSize && product.sizes && product.sizes.length > 0) {
        toast({ title: 'Please select a size.', variant: 'destructive' });
        return;
      }
      if (!selectedColor && product.colors && product.colors.length > 0) {
        toast({ title: 'Please select a color.', variant: 'destructive' });
        return;
      }
      addToCart(product, selectedSize, selectedColor);
      if (!user) {
        toast({ title: "Redirecting to Login", description: "Please log in to complete your checkout." });
        router.push(`/login?redirect=${encodeURIComponent('/checkout')}`);
      } else {
        router.push('/checkout');
      }
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({ title: "Removed from Wishlist" });
    } else {
      addToWishlist(product.id);
      toast({ title: "Added to Wishlist ❤️" });
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied!", description: "Product URL copied to clipboard." });
    }
  };
  
  const isWishlisted = product ? isInWishlist(product.id) : false;
  const isOutOfStock = product ? (product.stock || 0) <= 0 : false;
  const pageLoading = loading || product === undefined || sizeChartsLoading;

  if (pageLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    notFound();
  }

  const activeImage = productImages[activeImageIndex] || productImages[0];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />
      <MobileHeader 
        title={product.name} 
        showCart={false} 
        rightAction={
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleShare} 
            className="h-9 w-9 rounded-full hover:bg-muted/80 shrink-0 transition-colors"
            title="Share Product"
          >
            <Share2 className="h-4 w-4 text-foreground" />
          </Button>
        } 
      />

      <main className="flex-grow pb-24 md:pb-16">
        {/* BREADCRUMB HEADER STRIP */}
        <div className="border-b border-border/40 bg-muted/20 py-3">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium overflow-x-auto scrollbar-none">
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
                <Link href="/products" className="hover:text-foreground transition-colors">
                  Store
                </Link>
                {categoryName && (
                  <>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
                    <Link 
                      href={`/products?category=${Array.isArray(product?.category) ? product?.category[0] : product?.category}`} 
                      className="hover:text-foreground transition-colors font-semibold text-foreground/80"
                    >
                      {categoryName}
                    </Link>
                  </>
                )}
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
                <span className="text-foreground font-bold truncate max-w-[200px] sm:max-w-[350px]">
                  {product.name}
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-2.5 py-0.5">
                  <Check className="h-3 w-3 mr-1" /> Authentic Drop
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN PRODUCT HERO GRID */}
        <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: INTERACTIVE GALLERY & THUMBNAILS (COL-SPAN-7) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Desktop Main Image Showcase */}
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-card border border-border shadow-sm group">
                <Image
                  src={getOptimizedImageUrl(activeImage, 1200)}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {discountPercent > 0 && (
                    <Badge variant="destructive" className="bg-red-600 text-white font-bold text-xs px-3 py-1 shadow-md">
                      <Tag className="h-3 w-3 mr-1" /> {discountPercent}% OFF
                    </Badge>
                  )}
                  {product.featured && (
                    <Badge className="bg-amber-500 text-black font-extrabold text-xs px-3 py-1 uppercase tracking-wider shadow-md">
                      <Sparkles className="h-3 w-3 mr-1" /> Featured Drop
                    </Badge>
                  )}
                </div>

                <Button 
                  onClick={handleWishlistToggle}
                  size="icon" 
                  variant="secondary"
                  className="absolute top-4 right-4 z-10 rounded-full shadow-md backdrop-blur-md bg-background/80 hover:bg-background"
                >
                  <Heart className={cn("h-5 w-5 transition-colors", isWishlisted ? "fill-red-500 text-red-500" : "text-foreground")} />
                </Button>
              </div>

              {/* Interactive Thumbnail Strip */}
              {productImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {productImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={cn(
                        "relative w-20 h-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200",
                        activeImageIndex === idx 
                          ? "border-primary ring-2 ring-primary/20 scale-105 shadow-md" 
                          : "border-transparent opacity-70 hover:opacity-100"
                      )}
                    >
                      <Image
                        src={getOptimizedImageUrl(imgUrl, 200)}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: PRODUCT DETAILS & PURCHASING OPTIONS (COL-SPAN-5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Title & Brand Meta */}
              <div className="space-y-3 pb-2 border-b border-border/40">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-widest border border-primary/20">
                    <Sparkles className="h-3 w-3 fill-primary/30" /> OKTOPUS STREETWEAR
                  </div>
                  {categoryName && (
                    <Badge variant="secondary" className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-card text-foreground/80 border border-border/80">
                      {categoryName}
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-serif text-foreground leading-[1.15]">
                  {product.name}
                </h1>
                
                {/* Rating, Verified Badge & Share */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={cn(
                            "h-3.5 w-3.5", 
                            i < Math.round(product.rating || 4.5) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
                          )} 
                        />
                      ))}
                      <span className="text-xs font-extrabold text-amber-500 ml-1">
                        {product.rating ? product.rating.toFixed(1) : '4.8'}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground hidden sm:inline-block">
                      Verified Streetwear Drop
                    </span>
                  </div>

                  <Button onClick={handleShare} size="sm" variant="ghost" className="text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-xl">
                    <Share2 className="h-4 w-4 mr-1.5" /> Share
                  </Button>
                </div>
              </div>

              {/* Price & Savings Box */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2 shadow-xs">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl lg:text-4xl font-black tracking-tight text-foreground">₹{product.price.toFixed(2)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-lg text-muted-foreground line-through font-medium">₹{product.originalPrice.toFixed(2)}</span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full">
                      Save ₹{(product.originalPrice! - product.price).toFixed(0)}
                    </span>
                  )}
                </div>

                {/* Delivery Guarantee Badge */}
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
                  <Truck className="h-4 w-4 shrink-0" />
                  <span>Get it by <strong className="underline decoration-emerald-500/40">{deliveryDate}</strong></span>
                </div>
              </div>

              {/* Color Variant Selector (Pills) */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="font-bold text-foreground">Select Color: <span className="text-muted-foreground font-normal">{selectedColor || 'Default'}</span></span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2",
                          selectedColor === color
                            ? "bg-foreground text-background border-foreground shadow-sm scale-105"
                            : "bg-card text-foreground hover:bg-muted border-border"
                        )}
                      >
                        {selectedColor === color && <Check className="h-3.5 w-3.5" />}
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Variant Selector (Pills) & Size Chart Link */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="font-bold text-foreground">Select Size: <span className="text-muted-foreground font-normal">{selectedSize || 'Select'}</span></span>
                    
                    {sizeChart && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="link" size="sm" className="p-0 h-auto text-xs font-bold text-amber-500 hover:text-amber-600">
                            <Ruler className="mr-1 h-3.5 w-3.5" /> Size Guide
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                          <DialogHeader>
                            <DialogTitle>{sizeChart.name}</DialogTitle>
                            <DialogDescription>All measurements in {sizeChart.unit}.</DialogDescription>
                          </DialogHeader>
                          <Table className="mt-2">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="font-bold">Size</TableHead>
                                <TableHead>Chest</TableHead>
                                <TableHead>Length</TableHead>
                                <TableHead>Sleeve</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sizeChart.sizes.map((s, i) => (
                                <TableRow key={i}>
                                  <TableCell className="font-bold">{s.size}</TableCell>
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

                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "py-3 rounded-xl text-sm font-bold transition-all border flex items-center justify-center",
                          selectedSize === size
                            ? "bg-foreground text-background border-foreground shadow-sm scale-105"
                            : "bg-card text-foreground hover:bg-muted border-border"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary Action Buttons (Prominent Same Row Layout) */}
              <div className="pt-2 flex flex-row items-center gap-3 w-full">
                {isOutOfStock ? (
                  <Button disabled className="w-full h-14 text-sm font-bold rounded-xl" size="lg">
                    <XCircle className="mr-2 h-5 w-5" /> Sold Out
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleBuyNow} 
                      className="flex-1 h-14 md:h-15 text-sm sm:text-base font-black uppercase tracking-wider rounded-2xl shadow-xl transition-all duration-300 active:scale-95 bg-amber-400 hover:bg-amber-300 text-black px-4" 
                      size="lg"
                    >
                      <Zap className="mr-2 h-5 w-5 fill-black shrink-0" /> Buy Now
                    </Button>
                    <Button 
                      onClick={handleAddToCart} 
                      className="flex-1 h-14 md:h-15 text-sm sm:text-base font-black uppercase tracking-wider rounded-2xl shadow-xl transition-all duration-300 active:scale-95 bg-foreground text-background hover:bg-foreground/90 px-4" 
                      size="lg"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5 shrink-0" /> Add to Cart
                    </Button>
                  </>
                )}

                <Button 
                  onClick={handleWishlistToggle} 
                  size="lg" 
                  variant="outline"
                  className="h-14 md:h-15 w-14 md:w-15 p-0 rounded-2xl border-2 border-border hover:bg-muted font-bold shrink-0 flex items-center justify-center shadow-sm"
                  title={isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                >
                  <Heart className={cn("h-6 w-6 transition-colors", isWishlisted && "fill-red-500 text-red-500")} />
                </Button>
              </div>

              {/* Brand Trust Badges Grid */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/60">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-card border border-border/50">
                  <Truck className="h-4 w-4 text-primary shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <p className="font-bold">Free Express Delivery</p>
                    <p className="text-muted-foreground">Orders above ₹999</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-card border border-border/50">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <p className="font-bold">100% Heavyweight Cotton</p>
                    <p className="text-muted-foreground">240 GSM Premium Craft</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-card border border-border/50">
                  <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <p className="font-bold">100% Authentic Drop</p>
                    <p className="text-muted-foreground">Guaranteed Quality Craft</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-card border border-border/50">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <p className="font-bold">Oktocoin Rewards</p>
                    <p className="text-muted-foreground">Earn on Mobile App</p>
                  </div>
                </div>
              </div>

              {/* Description Accordion/Box */}
              {product.description && (
                <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Description</h4>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
                </div>
              )}

            </div>
          </div>

          {/* RECOMMENDED DROPS SECTION */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-border/60 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black tracking-tight font-serif uppercase">YOU MAY ALSO LIKE</h2>
                  <p className="text-xs text-muted-foreground">Curated streetwear drops matching this aesthetic</p>
                </div>
                <Link href="/products" className="text-xs font-bold text-amber-500 hover:underline">
                  View All Drops →
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map(relProduct => (
                  <ProductCard key={relProduct.id} product={relProduct} />
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      {!isOutOfStock && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/80 p-3 flex items-center gap-2.5 shadow-2xl">
          <Button 
            onClick={handleBuyNow}
            className="flex-1 h-13 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl bg-amber-400 hover:bg-amber-300 text-black shadow-lg active:scale-95 flex items-center justify-center"
          >
            <Zap className="mr-1.5 h-4 w-4 fill-black shrink-0" /> Buy Now
          </Button>
          <Button 
            onClick={handleAddToCart}
            variant="outline"
            className="flex-1 h-13 text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-xl border-2 border-foreground/30 bg-background text-foreground shadow-xs active:scale-95 flex items-center justify-center"
          >
            <ShoppingCart className="mr-1.5 h-4 w-4 shrink-0" /> Add to Cart
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <MobileHeader title="Loading..." showCart={false} />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="relative aspect-[3/4] w-full rounded-2xl" />
            <div className="flex gap-3">
              <Skeleton className="w-20 h-24 rounded-xl" />
              <Skeleton className="w-20 h-24 rounded-xl" />
              <Skeleton className="w-20 h-24 rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
