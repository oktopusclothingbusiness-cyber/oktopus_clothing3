
'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, Palette, Upload, Minus, Plus } from 'lucide-react';
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

type ColorOption = {
    _id: string;
    name: string;
    imageUrl: string;
}

const tshirtSizes = ['S', 'M', 'L', 'XL', 'XXL'];

export default function CustomDesignPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [file, setFile] = React.useState<File | null>(null);
  const [notes, setNotes] = React.useState('');
  const [tshirtColor, setTshirtColor] = React.useState('');
  const [tshirtSize, setTshirtSize] = React.useState('M');
  const [printArea, setPrintArea] = React.useState({ width: 8, height: 10 });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [colors, setColors] = React.useState<ColorOption[]>([]);
  const [colorsLoading, setColorsLoading] = React.useState(true);


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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
        setFile(null);
        return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/vnd.adobe.photoshop'];

    if (selectedFile.size > MAX_FILE_SIZE) {
        toast({
            title: 'File Too Large',
            description: 'Please upload a file smaller than 10 MB.',
            variant: 'destructive',
        });
        e.target.value = ''; // Reset the input
        setFile(null);
        return;
    }

    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
        toast({
            title: 'Invalid File Type',
            description: 'Please upload a .jpg, .jpeg, .png, or .psd file.',
            variant: 'destructive',
        });
        e.target.value = ''; // Reset the input
        setFile(null);
        return;
    }
    
    setFile(selectedFile);
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
        title: 'Error',
        description: 'Please select a design file and make sure you are logged in.',
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
          printArea,
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

  return (
    <div className="md:hidden">
      <MobileHeader title="Custom Design" />
      <main className="bg-secondary min-h-screen pb-24 p-4">
        <Card className="card-glass">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Palette />
                    Upload Your Design
                </CardTitle>
                <CardDescription>
                    Have a design in mind? Upload it here and we'll get it printed for you. Our team will review it and get back to you for confirmation.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="design-file">Design File</Label>
                        <div className="relative">
                            <Input id="design-file" type="file" onChange={handleFileChange} accept="image/png, image/jpeg, image/vnd.adobe.photoshop" className="pr-16" required/>
                             <Upload className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        </div>
                        {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
                        <p className="text-xs text-muted-foreground">.png, .jpg, .psd accepted. Max 10MB.</p>
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
                                        <Image src={color.imageUrl} alt={color.name} width={64} height={64} className="object-cover w-full h-full" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label htmlFor="tshirt-size">T-Shirt Size</Label>
                           <Select value={tshirtSize} onValueChange={setTshirtSize}>
                               <SelectTrigger id="tshirt-size">
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
                            <Label>Print Area (inches)</Label>
                            <div className="flex gap-2">
                                <Input type="number" value={printArea.width} onChange={e => setPrintArea(p => ({...p, width: parseInt(e.target.value)}))} placeholder="W" />
                                <Input type="number" value={printArea.height} onChange={e => setPrintArea(p => ({...p, height: parseInt(e.target.value)}))} placeholder="H" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes or Instructions</Label>
                        <Textarea id="notes" placeholder="Any specific instructions? e.g., 'Place this on the center of a black T-shirt.'" value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !file}>
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Submitting...</> : 'Submit for Approval'}
                    </Button>
                </form>
            </CardContent>
        </Card>
      </main>
      <MobileFooter />
    </div>
  );
}
