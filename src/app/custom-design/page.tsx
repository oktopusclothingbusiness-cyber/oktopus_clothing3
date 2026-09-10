'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, Palette, Upload, CornerDownRight } from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';
import { MobileFooter } from '@/components/mobile-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { StorefrontHeader } from '@/components/storefront/header';
import { StorefrontFooter } from '@/components/storefront/footer';
import { PageBanner } from '@/components/storefront/page-banner';

type ColorOption = {
    _id: string;
    name: string;
    imageUrl: string;
}

const tshirtSizes = ['S', 'M', 'L', 'XL', 'XXL'];
const MAX_PRINT_WIDTH = 12; // inches
const MIN_PRINT_WIDTH = 4; // inches
const PREVIEW_CONTAINER_WIDTH = 500; // approx width of preview container in pixels

export default function CustomDesignPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [file, setFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);
  const [designAspectRatio, setDesignAspectRatio] = React.useState(1);
  const [notes, setNotes] = React.useState('');
  const [tshirtColor, setTshirtColor] = React.useState('');
  const [tshirtSize, setTshirtSize] = React.useState('M');
  const [printArea, setPrintArea] = React.useState({ width: 8, height: 8 });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [colors, setColors] = React.useState<ColorOption[]>([]);
  const [colorsLoading, setColorsLoading] = React.useState(true);

  const [isResizing, setIsResizing] = React.useState(false);
  const [initialDragState, setInitialDragState] = React.useState<{ x: number, y: number, width: number, height: number} | null>(null);
  const designContainerRef = React.useRef<HTMLDivElement>(null);


  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  React.useEffect(() => {
    const fetchColors = async () => {
        try {
            setColorsLoading(true);
            const res = await fetch('/api/palette');
            if (!res.ok) throw new Error('Failed to fetch colors');
            const data = await res.json();
            setColors(data);
            if (data.length > 0) {
                setTshirtColor(data[0].imageUrl);
            }
        } catch (error) {
            toast({ title: "Error", description: "Could not load color options.", variant: "destructive" });
        } finally {
            setColorsLoading(false);
        }
    };
    fetchColors();
  }, [toast]);
  
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizing(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setInitialDragState({
      x: clientX,
      y: clientY,
      width: designContainerRef.current?.offsetWidth || 0,
      height: designContainerRef.current?.offsetHeight || 0,
    });
  };

  React.useEffect(() => {
    const handleResizeMove = (e: MouseEvent | TouchEvent) => {
      if (!isResizing || !initialDragState || !designContainerRef.current) return;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const dx = clientX - initialDragState.x;
      let newPixelWidth = initialDragState.width + dx;
      
      const containerWidth = designContainerRef.current.parentElement?.offsetWidth || PREVIEW_CONTAINER_WIDTH;
      const maxPixelWidth = containerWidth * 0.9;
      const minPixelWidth = containerWidth * 0.2;

      newPixelWidth = Math.max(minPixelWidth, Math.min(newPixelWidth, maxPixelWidth));

      const newInchWidth = (newPixelWidth / containerWidth) * MAX_PRINT_WIDTH * 1.2;

      setPrintArea({
          width: Math.max(MIN_PRINT_WIDTH, Math.min(newInchWidth, MAX_PRINT_WIDTH)),
          height: Math.max(MIN_PRINT_WIDTH, Math.min(newInchWidth, MAX_PRINT_WIDTH)) / designAspectRatio
      });
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('touchmove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      window.addEventListener('touchend', handleResizeEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('touchmove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
      window.removeEventListener('touchend', handleResizeEnd);
    };
  }, [isResizing, initialDragState, designAspectRatio]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
        setFile(null);
        setFilePreview(null);
        return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/vnd.adobe.photoshop', 'image/webp'];

    if (selectedFile.size > MAX_FILE_SIZE) {
        toast({
            title: 'File Too Large',
            description: 'Please upload a file smaller than 10 MB.',
            variant: 'destructive',
        });
        e.target.value = '';
        setFile(null);
        setFilePreview(null);
        return;
    }

    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
        toast({
            title: 'Invalid File Type',
            description: 'Please upload a .jpg, .png, .webp, or .psd file.',
            variant: 'destructive',
        });
        e.target.value = '';
        setFile(null);
        setFilePreview(null);
        return;
    }
    
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
        const result = reader.result as string;
        setFilePreview(result);
        const img = document.createElement('img');
        img.src = result;
        img.onload = () => {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            setDesignAspectRatio(aspectRatio);
            const initialWidth = 8;
            setPrintArea({ width: initialWidth, height: initialWidth / aspectRatio });
        };
    };
    reader.readAsDataURL(selectedFile);
  };
  
  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) {
      toast({
        title: 'Incomplete Submission',
        description: 'Please select a design file to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const designDataUrl = await toBase64(file);
      
      const response = await fetch('/api/custom-designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          userName: `${user.firstName} ${user.lastName}`,
          designUrl: designDataUrl,
          tshirtColor,
          tshirtSize,
          printArea: {
            width: parseFloat(printArea.width.toFixed(2)),
            height: parseFloat(printArea.height.toFixed(2))
          },
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit design');
      }

      toast({
        title: 'Design Submitted!',
        description: 'Your design has been sent for approval. We will contact you shortly.',
      });
      setFile(null);
      setFilePreview(null);
      setNotes('');
      router.push('/store');

    } catch (error) {
      console.error(error);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your design. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A] text-white font-mono">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F824B]" />
      </div>
    );
  }
  
  const FormControls = ({ isDesktop = false }: { isDesktop?: boolean }) => (
      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
              <Label htmlFor={`design-file-${isDesktop}`} className="text-xs font-mono uppercase text-zinc-300">Design Artwork File</Label>
              <div className="relative">
                  <Input id={`design-file-${isDesktop}`} type="file" onChange={handleFileChange} accept="image/png, image/jpeg, image/vnd.adobe.photoshop, image/webp" className="pr-16 bg-[#121212] border-white/10 text-xs text-white"/>
                   <Upload className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              </div>
              {file && <p className="text-xs font-mono text-[#0F824B]">Selected: {file.name}</p>}
              <p className="text-[10px] font-mono text-zinc-400">.png, .jpg, .webp, .psd accepted. Max 10MB.</p>
          </div>

          <div className="space-y-2">
              <Label className="text-xs font-mono uppercase text-zinc-300">T-Shirt Canvas Base</Label>
              {colorsLoading ? (
                   <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-14 rounded-md bg-zinc-800" />)}
                   </div>
              ) : (
                   <div className="flex flex-wrap gap-2">
                      {colors.map(color => (
                          <button key={color._id} type="button" onClick={() => setTshirtColor(color.imageUrl)} className={cn('h-14 w-14 rounded-xl border-2 overflow-hidden bg-zinc-900 transition-all', tshirtColor === color.imageUrl ? 'border-[#0F824B] ring-2 ring-[#0F824B]' : 'border-white/10')} aria-label={color.name}>
                              {color.imageUrl && <Image src={color.imageUrl} alt={color.name} width={56} height={56} className="object-cover w-full h-full" unoptimized />}
                          </button>
                      ))}
                  </div>
              )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Label htmlFor={`tshirt-size-${isDesktop}`} className="text-xs font-mono uppercase text-zinc-300">T-Shirt Size</Label>
                 <Select value={tshirtSize} onValueChange={setTshirtSize}>
                     <SelectTrigger id={`tshirt-size-${isDesktop}`} className="bg-[#121212] border-white/10 text-white font-mono text-xs">
                         <SelectValue placeholder="Select size" />
                     </SelectTrigger>
                     <SelectContent className="bg-[#121212] border-white/10 text-white font-mono">
                         {tshirtSizes.map(size => (
                             <SelectItem key={size} value={size}>{size}</SelectItem>
                         ))}
                     </SelectContent>
                 </Select>
              </div>
               <div className="space-y-2">
                  <Label className="text-xs font-mono uppercase text-zinc-300">Print Area Dimensions</Label>
                  <Input value={`${printArea.width.toFixed(1)}" x ${printArea.height.toFixed(1)}"`} readOnly disabled className="bg-[#121212] border-white/10 text-white font-mono text-xs" />
              </div>
          </div>

          <div className="space-y-2">
              <Label htmlFor={`notes-${isDesktop}`} className="text-xs font-mono uppercase text-zinc-300">Custom Printing Instructions</Label>
              <Textarea id={`notes-${isDesktop}`} placeholder="Specify placement preferences or custom puff print details..." value={notes} onChange={e => setNotes(e.target.value)} className="bg-[#121212] border-white/10 text-white text-xs" />
          </div>

          <Button type="submit" className="w-full bg-[#0F824B] text-white font-bold hover:bg-[#0b663a] rounded-full h-12 text-xs font-mono uppercase tracking-wider" disabled={!file || isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Submitting Artwork...</> : 'Submit Custom Design'}
          </Button>
      </form>
  );

  const PreviewSection = () => (
      <Card className="bg-[#121212] border-white/10 text-white">
          <CardHeader>
              <CardTitle className="font-bebas text-2xl uppercase tracking-wider text-white">Canvas Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="relative aspect-[4/5] w-full bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden flex items-center justify-center select-none">
                  {tshirtColor && <Image src={tshirtColor} alt="T-Shirt Preview" layout="fill" objectFit="cover" unoptimized />}
                  {filePreview ? (
                      <div
                        ref={designContainerRef}
                        className="absolute transition-all"
                        style={{
                          width: `${(printArea.width / MAX_PRINT_WIDTH) * 80}%`,
                          height: `${(printArea.height / (MAX_PRINT_WIDTH * (5/4))) * 80}%`,
                        }}
                      >
                        <Image 
                            src={filePreview} 
                            alt="Design Preview" 
                            layout="fill" 
                            objectFit="contain"
                            className="pointer-events-none"
                            unoptimized
                        />
                        <div
                          onMouseDown={handleResizeStart}
                          onTouchStart={handleResizeStart}
                          className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#0F824B] text-white rounded-full cursor-se-resize border-2 border-black flex items-center justify-center shadow-lg"
                        >
                          <CornerDownRight className="h-3 w-3 -rotate-90"/>
                        </div>
                      </div>
                  ) : (
                      <div className="text-center text-zinc-500 p-4 font-mono text-xs">
                          <Palette className="h-10 w-10 mx-auto mb-2 text-[#0F824B]" />
                          <p>Upload your design file to preview on canvas</p>
                      </div>
                  )}
              </div>
          </CardContent>
      </Card>
  );


  return (
    <div className="bg-[#0A0A0A] text-[#FAF9F6] font-sans min-h-screen">
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <StorefrontHeader />
        
        {/* DYNAMIC DATABASE BANNER FOR CUSTOM DESIGN PAGE */}
        <PageBanner
          placement="custom_design_page"
          fallbackTitle="OKTOPUS CUSTOM STUDIO"
          fallbackDescription="Bring your vision to life. Upload your graphic design, select apparel colors and sizing, and our master printmakers will craft your custom piece."
          fallbackCtaText="START CUSTOMIZING"
          fallbackCtaLink="/custom-design"
        />

        <main className="flex-grow container mx-auto px-6 lg:px-12 py-12">
            <div className="grid md:grid-cols-2 gap-12 items-start">
                <div className="sticky top-24">
                    <PreviewSection />
                </div>
                <Card className="bg-[#121212] border-white/10 text-white">
                    <CardHeader>
                        <CardTitle className="font-bebas text-3xl uppercase tracking-wider text-white">Design Options & Specs</CardTitle>
                        <CardDescription className="text-zinc-400 font-mono text-xs">Upload artwork files (.png, .psd) and define print specifications.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormControls isDesktop={true} />
                    </CardContent>
                </Card>
            </div>
        </main>
        <StorefrontFooter />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader title="Custom Studio" />
        <main className="bg-[#0A0A0A] min-h-screen pb-24 p-4 space-y-4">
          <PageBanner
            placement="custom_design_page"
            compact={true}
            fallbackTitle="OKTOPUS CUSTOM STUDIO"
            fallbackDescription="Upload your design file to preview on high-density t-shirt canvas."
          />
          <div className="rounded-xl">
            <PreviewSection />
          </div>
          <Card className="bg-[#121212] border-white/10 text-white">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-bebas text-2xl uppercase tracking-wide">
                      <Palette className="text-[#0F824B]" />
                      Design Options
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <FormControls />
              </CardContent>
          </Card>
        </main>
        <MobileFooter />
      </div>
    </div>
  );
}
