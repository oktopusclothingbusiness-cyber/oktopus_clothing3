
'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, Palette, Upload, Minus, Plus, CornerDownRight } from 'lucide-react';
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
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

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
        e.target.value = ''; // Reset the input
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
        e.target.value = ''; // Reset the input
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
            const initialWidth = 8; // default 8 inches
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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const FormControls = ({ isDesktop = false }: { isDesktop?: boolean }) => (
      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
              <Label htmlFor={`design-file-${isDesktop}`}>Design File</Label>
              <div className="relative">
                  <Input id={`design-file-${isDesktop}`} type="file" onChange={handleFileChange} accept="image/png, image/jpeg, image/vnd.adobe.photoshop, image/webp" className="pr-16"/>
                   <Upload className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
              {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
              <p className="text-xs text-muted-foreground">.png, .jpg, .webp, .psd accepted. Max 10MB.</p>
          </div>

          <div className="space-y-2">
              <Label>T-Shirt Color</Label>
              {colorsLoading ? (
                   <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-16 rounded-md" />)}
                   </div>
              ) : (
                   <div className="flex flex-wrap gap-2">
                      {colors.map(color => (
                          <button key={color._id} type="button" onClick={() => setTshirtColor(color.imageUrl)} className={cn('h-16 w-16 rounded-md border-2 overflow-hidden', tshirtColor === color.imageUrl ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent')} aria-label={color.name}>
                              {color.imageUrl && <Image src={color.imageUrl} alt={color.name} width={64} height={64} className="object-cover w-full h-full" />}
                          </button>
                      ))}
                  </div>
              )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Label htmlFor={`tshirt-size-${isDesktop}`}>T-Shirt Size</Label>
                 <Select value={tshirtSize} onValueChange={setTshirtSize}>
                     <SelectTrigger id={`tshirt-size-${isDesktop}`}>
                         <SelectValue placeholder="Select size" />
                     </SelectTrigger>
                     <SelectContent>
                         {tshirtSizes.map(size => (
                             <SelectItem key={size} value={size}>{size}</SelectItem>
                         ))}
                     </SelectContent>
                 </Select>
              </div>
               <div className="space-y-2">
                  <Label>Print Area</Label>
                  <Input value={`${printArea.width.toFixed(1)}" x ${printArea.height.toFixed(1)}"`} readOnly disabled />
              </div>
          </div>

          <div className="space-y-2">
              <Label htmlFor={`notes-${isDesktop}`}>Notes or Instructions</Label>
              <Textarea id={`notes-${isDesktop}`} placeholder="Any specific instructions? e.g., 'Place this on the center of a black T-shirt.'" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={!file || isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Submitting...</> : 'Submit for Approval'}
          </Button>
      </form>
  );

  const PreviewSection = () => (
      <Card>
          <CardHeader>
              <CardTitle>T-Shirt Preview</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="relative aspect-[4/5] w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center select-none">
                  {tshirtColor && <Image src={tshirtColor} alt="T-Shirt Preview" layout="fill" objectFit="cover" />}
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
                        />
                        <div
                          onMouseDown={handleResizeStart}
                          onTouchStart={handleResizeStart}
                          className="absolute -bottom-2 -right-2 w-5 h-5 bg-primary rounded-full cursor-se-resize border-2 border-background flex items-center justify-center text-primary-foreground"
                        >
                          <CornerDownRight className="h-3 w-3 -rotate-90"/>
                        </div>
                      </div>
                  ) : (
                      <div className="text-center text-muted-foreground p-4">
                          <Palette className="h-10 w-10 mx-auto mb-2" />
                          <p>Your design will appear here</p>
                      </div>
                  )}
              </div>
          </CardContent>
      </Card>
  );


  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Create Your Custom T-Shirt</h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Bring your vision to life. Upload your design, choose your options, and we'll handle the rest.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-start">
                <div className="sticky top-28">
                    <PreviewSection />
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Design Options</CardTitle>
                        <CardDescription>Upload your art, pick your options, and submit for approval.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormControls isDesktop={true} />
                    </CardContent>
                </Card>
            </div>
        </main>
        <Footer />
      </div>


      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader title="Custom Design" />
        <main className="bg-secondary min-h-screen pb-24 p-4 space-y-4">
          <div className="card-glass rounded-xl p-4">
            <PreviewSection />
          </div>
          <Card className="card-glass">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <Palette />
                      Design Options
                  </CardTitle>
                  <CardDescription>
                      Upload your art and pick your options.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <FormControls />
              </CardContent>
          </Card>
        </main>
        <MobileFooter />
      </div>
    </>
  );
}
