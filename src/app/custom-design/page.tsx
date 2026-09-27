'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Upload,
  Minus,
  Plus,
  RotateCw,
  Move,
  Check,
  Grid,
  Maximize2,
  Sliders,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  RotateCcw,
  Trash2,
  Shirt,
  ShieldCheck,
  FileImage,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';
import { MobileFooter } from '@/components/mobile-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

type ColorOption = {
  _id: string;
  name: string;
  imageUrl: string;
  images?: string[];
};

type FabricOption = {
  id: string;
  name: string;
  gsm: string;
  description: string;
  price: number;
};

const FABRIC_OPTIONS: FabricOption[] = [
  {
    id: 'Regular',
    name: 'Regular Fit',
    gsm: '180 GSM',
    description: '100% Combed Cotton. Lightweight, breathable everyday comfort.',
    price: 499,
  },
  {
    id: 'Oversized',
    name: 'Oversized Fit',
    gsm: '240 GSM',
    description: 'Heavyweight loopback jersey. Dropped shoulder boxy streetwear drape.',
    price: 599,
  },
  {
    id: 'French Terry',
    name: 'French Terry',
    gsm: '320 GSM',
    description: 'Ultra-dense looped interior knit. Superior structure and shape retention.',
    price: 749,
  },
  {
    id: 'Sweatshirt',
    name: 'Sweatshirt',
    gsm: '380 GSM',
    description: 'Heavy fleece lined brushed cotton. Thermal insulation with reinforced ribs.',
    price: 799,
  },
];

const TSHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

// Graphic dimension constants (in inches)
const MAX_PRINT_WIDTH_INCHES = 14.0;
const MIN_PRINT_WIDTH_INCHES = 3.5;
const DEFAULT_PRINT_WIDTH_INCHES = 9.5;

// Sample architectural graphics for instant testing
const SAMPLE_ARTWORKS = [
  {
    id: 'archive_badge',
    title: 'Archive Monogram',
    category: 'Minimalist Emblem',
    svgData: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400"><circle cx="200" cy="200" r="170" stroke="%23EAFF9F" stroke-width="6" fill="none" stroke-dasharray="14 10"/><circle cx="200" cy="200" r="140" stroke="%23FFFFFF" stroke-width="2" fill="none"/><polygon points="200,80 300,240 100,240" stroke="%23FFFFFF" stroke-width="5" fill="none"/><text x="200" y="278" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="%23EAFF9F" text-anchor="middle" letter-spacing="6">OKTOPUS</text><text x="200" y="304" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="%23FFFFFF" text-anchor="middle" letter-spacing="4">STUDIO ARCHIVE // 2026</text><text x="200" y="325" font-family="monospace, sans-serif" font-size="9" font-weight="600" fill="%23A0A0A0" text-anchor="middle" letter-spacing="3">LIMITED BESPOKE PRESS</text></svg>`,
  },
  {
    id: 'cyber_brutalist',
    title: 'Brutalist Block',
    category: 'Architectural Typo',
    svgData: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400"><rect x="30" y="50" width="340" height="300" stroke="%23FFFFFF" stroke-width="3" fill="none"/><line x1="30" y1="120" x2="370" y2="120" stroke="%23EAFF9F" stroke-width="5"/><text x="50" y="100" font-family="system-ui, sans-serif" font-size="34" font-weight="900" fill="%23FFFFFF" letter-spacing="4">UNDERGROUND</text><text x="50" y="180" font-family="system-ui, sans-serif" font-size="44" font-weight="900" fill="%23EAFF9F" letter-spacing="2">AESTHETICS</text><rect x="50" y="205" width="200" height="28" fill="%23EAFF9F"/><text x="60" y="224" font-family="monospace, sans-serif" font-size="12" font-weight="900" fill="%23000000" letter-spacing="2">PROJECT CODE: OKTO-26</text><text x="50" y="275" font-family="monospace, sans-serif" font-size="11" font-weight="600" fill="%23FFFFFF" letter-spacing="4">TOKYO // SEOUL // BERLIN</text><text x="50" y="300" font-family="monospace, sans-serif" font-size="10" font-weight="500" fill="%23A0A0A0" letter-spacing="2">320 GSM HEAVYWEIGHT GRADE</text></svg>`,
  },
  {
    id: 'kinetic_wave',
    title: 'Kinetic Contour',
    category: 'Abstract Geometry',
    svgData: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400"><path d="M50 200 Q 125 100, 200 200 T 350 200" stroke="%23EAFF9F" stroke-width="10" fill="none"/><path d="M50 225 Q 125 125, 200 225 T 350 225" stroke="%23FFFFFF" stroke-width="5" fill="none"/><path d="M50 175 Q 125 75, 200 175 T 350 175" stroke="%23FFFFFF" stroke-width="5" fill="none"/><circle cx="200" cy="200" r="160" stroke="%23888888" stroke-width="2" stroke-dasharray="8 8" fill="none"/><text x="200" y="315" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="%23FFFFFF" text-anchor="middle" letter-spacing="6">KINETIC HARMONICS</text><text x="200" y="338" font-family="monospace, sans-serif" font-size="10" font-weight="600" fill="%23EAFF9F" text-anchor="middle" letter-spacing="3">PRECISION DIRECT-TO-GARMENT</text></svg>`,
  },
];

type PlacementPreset = {
  id: string;
  name: string;
  posX: number; // percentage (0 to 100) across the garment
  posY: number; // percentage (0 to 100) across the garment
  widthInches: number;
};

const PLACEMENT_PRESETS: PlacementPreset[] = [
  { id: 'left_chest', name: 'Left Chest', posX: 36, posY: 32, widthInches: 4.5 },
  { id: 'center_chest', name: 'Center Chest', posX: 50, posY: 38, widthInches: 9.5 },
  { id: 'oversized_front', name: 'Oversized Front', posX: 50, posY: 46, widthInches: 13.0 },
  { id: 'upper_yoke', name: 'Upper Yoke', posX: 50, posY: 22, widthInches: 6.5 },
  { id: 'full_statement', name: 'Full Statement', posX: 50, posY: 50, widthInches: 13.5 },
];

export default function CustomDesignPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Artwork state
  const [file, setFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);
  const [designAspectRatio, setDesignAspectRatio] = React.useState(1);
  const [activeSampleId, setActiveSampleId] = React.useState<string | null>(null);

  // Garment options
  const [colors, setColors] = React.useState<ColorOption[]>([]);
  const [colorsLoading, setColorsLoading] = React.useState(true);
  const [selectedColorOption, setSelectedColorOption] = React.useState<ColorOption | null>(null);
  const [activeViewIndex, setActiveViewIndex] = React.useState<number>(0);
  const [tshirtSize, setTshirtSize] = React.useState('L');
  const [selectedFabric, setSelectedFabric] = React.useState<FabricOption>(FABRIC_OPTIONS[1]); // Default Oversized
  const [notes, setNotes] = React.useState('');

  // 2D Positioning coordinates on the garment stage:
  // posX (0 - 100%) and posY (0 - 100%) relative to the entire t-shirt container
  const [posX, setPosX] = React.useState<number>(50);
  const [posY, setPosY] = React.useState<number>(38);
  const [printWidthInches, setPrintWidthInches] = React.useState<number>(DEFAULT_PRINT_WIDTH_INCHES);
  const [rotation, setRotation] = React.useState<number>(0);
  const [opacity, setOpacity] = React.useState<number>(100);

  // Modes & studio toggles
  const [showGuides, setShowGuides] = React.useState<boolean>(true);
  const [printFinish, setPrintFinish] = React.useState<'natural' | 'solid'>('solid');
  const [invertGraphic, setInvertGraphic] = React.useState<boolean>(false);
  const [mobileTab, setMobileTab] = React.useState<string>('artwork');

  // Dragging & Interaction states
  const [isInteracting, setIsInteracting] = React.useState<boolean>(false);
  const [isCenterSnapped, setIsCenterSnapped] = React.useState<boolean>(false);
  const stageContainerRef = React.useRef<HTMLDivElement>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Authentication check
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch color options
  React.useEffect(() => {
    const fetchColors = async () => {
      try {
        setColorsLoading(true);
        const res = await fetch('/api/palette');
        if (!res.ok) throw new Error('Failed to fetch colors');
        const data: ColorOption[] = await res.json();
        setColors(data);
        if (data.length > 0) {
          setSelectedColorOption(data[0]);
          setActiveViewIndex(0);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Could not load garment color options.',
          variant: 'destructive',
        });
      } finally {
        setColorsLoading(false);
      }
    };
    fetchColors();
  }, [toast]);

  // Garment images list for active colorway
  const currentViewImages = React.useMemo(() => {
    if (!selectedColorOption) return [];
    return Array.isArray(selectedColorOption.images) && selectedColorOption.images.length > 0
      ? selectedColorOption.images
      : selectedColorOption.imageUrl
      ? [selectedColorOption.imageUrl]
      : [];
  }, [selectedColorOption]);

  const activeTshirtImageUrl = currentViewImages[activeViewIndex] || currentViewImages[0] || '';

  // Width in percentage relative to t-shirt container (14" is approx 68% of shirt width)
  const graphicWidthPercent = (printWidthInches / MAX_PRINT_WIDTH_INCHES) * 65;

  // Print area dimensions in physical inches
  const printArea = React.useMemo(() => {
    const width = parseFloat(printWidthInches.toFixed(1));
    const height = parseFloat((printWidthInches / designAspectRatio).toFixed(1));
    return { width, height };
  }, [printWidthInches, designAspectRatio]);

  const totalPrice = selectedFabric.price;

  // Handle uploaded artwork file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/vnd.adobe.photoshop', 'image/webp'];

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        title: 'File Exceeds Limit',
        description: 'Please upload an image smaller than 10 MB.',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      toast({
        title: 'Unsupported Format',
        description: 'Please upload a PNG, JPG, WEBP, or PSD file.',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
    setActiveSampleId(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setFilePreview(result);
      const img = new window.Image();
      img.src = result;
      img.onload = () => {
        const aspectRatio = img.naturalWidth / img.naturalHeight || 1;
        setDesignAspectRatio(aspectRatio);
      };
    };
    reader.readAsDataURL(selectedFile);
  };

  // Select sample graphic
  const handleSelectSample = (sample: (typeof SAMPLE_ARTWORKS)[0]) => {
    setActiveSampleId(sample.id);
    setFilePreview(sample.svgData);
    setDesignAspectRatio(1);
    fetch(sample.svgData)
      .then((res) => res.blob())
      .then((blob) => {
        const sampleFile = new File([blob], `${sample.id}.svg`, { type: 'image/svg+xml' });
        setFile(sampleFile);
      })
      .catch(() => {});
  };

  // Clear current graphic
  const handleClearGraphic = () => {
    setFile(null);
    setFilePreview(null);
    setActiveSampleId(null);
    setRotation(0);
    setPosX(50);
    setPosY(38);
    setPrintWidthInches(DEFAULT_PRINT_WIDTH_INCHES);
  };

  // Apply placement preset
  const handleApplyPreset = (preset: PlacementPreset) => {
    setPosX(preset.posX);
    setPosY(preset.posY);
    setPrintWidthInches(preset.widthInches);
    setRotation(0);
    toast({
      title: `${preset.name} Positioned`,
      description: `Targeted at ${preset.widthInches}" print width.`,
    });
  };

  // --- FREE 2D DRAGGING LOGIC ---
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!stageContainerRef.current || !filePreview) return;

    setIsInteracting(true);
    const stageRect = stageContainerRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPosX = posX;
    const initialPosY = posY;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      // Convert delta pixels to percentage of the garment stage
      const deltaPercentX = (deltaX / stageRect.width) * 100;
      const deltaPercentY = (deltaY / stageRect.height) * 100;

      let nextX = initialPosX + deltaPercentX;
      let nextY = initialPosY + deltaPercentY;

      // Center Snapping on X-axis (between 48.5% and 51.5%)
      if (Math.abs(nextX - 50) < 2.0) {
        nextX = 50;
        setIsCenterSnapped(true);
      } else {
        setIsCenterSnapped(false);
      }

      // Clamping within garment printable bounds
      nextX = Math.max(16, Math.min(84, nextX));
      nextY = Math.max(14, Math.min(86, nextY));

      setPosX(parseFloat(nextX.toFixed(1)));
      setPosY(parseFloat(nextY.toFixed(1)));
    };

    const onPointerUp = () => {
      setIsInteracting(false);
      setIsCenterSnapped(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // --- DIRECT ON-CANVAS CORNER RESIZE HANDLE ---
  const handleResizeHandleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!stageContainerRef.current) return;

    setIsInteracting(true);
    const startX = e.clientX;
    const initialWidthInches = printWidthInches;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      // 100px movement = ~3.0 inches scale change
      const deltaInches = (deltaX / 100) * 3.0;
      let newWidth = initialWidthInches + deltaInches;
      newWidth = Math.max(MIN_PRINT_WIDTH_INCHES, Math.min(MAX_PRINT_WIDTH_INCHES, newWidth));
      setPrintWidthInches(parseFloat(newWidth.toFixed(1)));
    };

    const onPointerUp = () => {
      setIsInteracting(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // --- DIRECT ON-CANVAS ROTATION PIVOT HANDLE ---
  const handleRotateHandleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!stageContainerRef.current) return;

    setIsInteracting(true);
    const stageRect = stageContainerRef.current.getBoundingClientRect();
    const graphicCenterX = stageRect.left + (posX / 100) * stageRect.width;
    const graphicCenterY = stageRect.top + (posY / 100) * stageRect.height;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const angleRad = Math.atan2(moveEvent.clientY - graphicCenterY, moveEvent.clientX - graphicCenterX);
      let angleDeg = Math.round(angleRad * (180 / Math.PI)) + 90;
      if (angleDeg > 180) angleDeg -= 360;
      if (angleDeg < -180) angleDeg += 360;

      // Snap to 0 deg if near zero
      if (Math.abs(angleDeg) < 3) angleDeg = 0;

      setRotation(angleDeg);
    };

    const onPointerUp = () => {
      setIsInteracting(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Convert uploaded file to base64
  const toBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // --- COMPOSITE MOCKUP GENERATOR ---
  // Renders the exact t-shirt + user design at exact coordinates onto an offscreen canvas
  const generateMockupSnapshot = async (): Promise<string | null> => {
    if (!filePreview || !activeTshirtImageUrl) return null;

    return new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1250;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);

        const tshirtImg = new window.Image();
        tshirtImg.crossOrigin = 'anonymous';

        tshirtImg.onload = () => {
          try {
            ctx.drawImage(tshirtImg, 0, 0, canvas.width, canvas.height);

            const designImg = new window.Image();
            designImg.crossOrigin = 'anonymous';

            designImg.onload = () => {
              try {
                ctx.save();
                const centerX = (posX / 100) * canvas.width;
                const centerY = (posY / 100) * canvas.height;
                const dWidth = (graphicWidthPercent / 100) * canvas.width;
                const dHeight = dWidth / designAspectRatio;

                ctx.translate(centerX, centerY);
                if (rotation !== 0) {
                  ctx.rotate((rotation * Math.PI) / 180);
                }

                if (printFinish === 'natural') {
                  ctx.globalCompositeOperation = 'multiply';
                }

                ctx.globalAlpha = opacity / 100;
                ctx.drawImage(designImg, -dWidth / 2, -dHeight / 2, dWidth, dHeight);
                ctx.restore();

                const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                resolve(dataUrl);
              } catch (err) {
                console.warn('Canvas render fallback:', err);
                resolve(null);
              }
            };
            designImg.onerror = () => resolve(null);
            designImg.src = filePreview;
          } catch (err) {
            resolve(null);
          }
        };
        tshirtImg.onerror = () => resolve(null);
        tshirtImg.src = activeTshirtImageUrl;
      } catch (err) {
        resolve(null);
      }
    });
  };

  // Submit customization order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) {
      toast({
        title: 'Artwork Required',
        description: 'Please upload or select an artwork graphic before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const designDataUrl = await toBase64(file);
      const selectedViewName =
        activeViewIndex === 0 ? 'Front View' : activeViewIndex === 1 ? 'Back View' : `View ${activeViewIndex + 1}`;

      // Capture exact coordinates & mockup snapshot
      const mockupSnapshot = await generateMockupSnapshot();

      const exactPlacement = {
        xPercent: parseFloat(posX.toFixed(1)),
        yPercent: parseFloat(posY.toFixed(1)),
        widthPercent: parseFloat(graphicWidthPercent.toFixed(1)),
        heightPercent: parseFloat((graphicWidthPercent / designAspectRatio).toFixed(1)),
        scaleInches: parseFloat(printWidthInches.toFixed(1)),
        rotation: Math.round(rotation),
        printArea: {
          width: printArea.width,
          height: printArea.height,
        },
      };

      const response = await fetch('/api/custom-designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          designUrl: designDataUrl, // Raw user-uploaded graphic file
          mockupUrl: mockupSnapshot, // Rendered snapshot on exact tshirt
          placement: exactPlacement, // Exact placement coordinates
          tshirtColor: activeTshirtImageUrl,
          colorName: selectedColorOption?.name || '',
          colorId: selectedColorOption?._id || '',
          viewImageUrl: activeTshirtImageUrl,
          selectedView: selectedViewName,
          tshirtSize,
          fabricQuality: selectedFabric.name,
          price: totalPrice,
          printArea: {
            width: printArea.width,
            height: printArea.height,
          },
          transform: exactPlacement,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit design');
      }

      toast({
        title: 'Design Placed & Submitted',
        description: 'Exact t-shirt placement and artwork file successfully recorded.',
      });

      setFile(null);
      setFilePreview(null);
      setNotes('');
      router.push('/my-designs');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Submission Failed',
        description: 'An error occurred while saving your design. Please retry.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // --- INTERACTIVE GARMENT CANVAS STAGE ---
  const GarmentStage = () => (
    <div className="relative flex flex-col rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card/95 to-card/70 p-4 shadow-xl backdrop-blur-md">
      {/* Top View Selector Bar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        {/* Front / Back Angle Switcher */}
        <div className="flex items-center gap-1.5 rounded-lg bg-secondary/80 p-1 border border-border/40">
          {currentViewImages.map((imgUrl, viewIdx) => (
            <button
              key={viewIdx}
              type="button"
              onClick={() => setActiveViewIndex(viewIdx)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold tracking-wider uppercase transition-all',
                activeViewIndex === viewIdx
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative h-4 w-4 overflow-hidden rounded-full border border-border/40">
                <Image src={imgUrl} alt={`Angle ${viewIdx + 1}`} fill className="object-cover" />
              </div>
              <span>{viewIdx === 0 ? 'Front View' : viewIdx === 1 ? 'Back View' : `Angle ${viewIdx + 1}`}</span>
            </button>
          ))}
        </div>

        {/* Studio Utilities: Grid Guides & Blend Mode */}
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
            <Grid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Guides</span>
            <Switch
              checked={showGuides}
              onCheckedChange={setShowGuides}
              className="scale-75 data-[state=checked]:bg-primary"
            />
          </label>

          <div className="h-4 w-px bg-border/60" />

          <button
            type="button"
            onClick={() => setPrintFinish(printFinish === 'solid' ? 'natural' : 'solid')}
            className={cn(
              'rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wider border transition-colors',
              printFinish === 'natural'
                ? 'bg-primary/10 border-primary text-primary'
                : 'border-border/60 text-muted-foreground hover:text-foreground'
            )}
            title="Toggle between Natural Fabric Ink and Solid HD Finish"
          >
            {printFinish === 'natural' ? 'Natural Ink' : 'Solid HD'}
          </button>
        </div>
      </div>

      {/* Main Interactive Stage Container */}
      <div
        ref={stageContainerRef}
        className="relative aspect-[4/5] w-full select-none overflow-hidden rounded-xl border border-border/60 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 shadow-inner flex items-center justify-center touch-none"
      >
        {/* Spotlight Vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(234,255,159,0.05),transparent_65%)]" />

        {/* T-Shirt Garment Base Image */}
        {activeTshirtImageUrl ? (
          <Image
            src={activeTshirtImageUrl}
            alt="T-Shirt Garment"
            fill
            sizes="(max-width: 768px) 100vw, 550px"
            className="object-contain p-2 pointer-events-none transition-opacity duration-300"
            priority
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Shirt className="h-12 w-12 opacity-30 mb-2" />
            <span className="text-xs">Loading Garment...</span>
          </div>
        )}

        {/* Alignment Crosshairs & Snap Guides */}
        {showGuides && (
          <div className="pointer-events-none absolute inset-0">
            {/* Center Vertical Guide Line */}
            <div
              className={cn(
                'absolute inset-y-0 left-1/2 -translate-x-1/2 border-l transition-colors',
                isCenterSnapped
                  ? 'border-primary border-solid shadow-[0_0_8px_rgba(234,255,159,0.8)]'
                  : 'border-primary/20 border-dashed'
              )}
            />
            {/* Chest Horizontal Alignment Reference Line */}
            <div className="absolute inset-x-0 top-[38%] border-t border-dashed border-primary/20" />
            {/* Upper Chest Collar Margin Line */}
            <div className="absolute inset-x-0 top-[20%] border-t border-dotted border-border/40" />

            {/* Subtle Alignment Badge */}
            {isCenterSnapped && (
              <span className="absolute top-2 left-1/2 -translate-x-1/2 rounded bg-primary px-2 py-0.5 text-[9px] font-mono font-bold text-primary-foreground shadow-md uppercase tracking-wider">
                Snapped to Center
              </span>
            )}
          </div>
        )}

        {/* Draggable & Resizable Graphic Element */}
        {filePreview ? (
          <div
            onPointerDown={handlePointerDown}
            className={cn(
              'absolute cursor-move select-none group',
              isInteracting && 'ring-1 ring-primary shadow-2xl'
            )}
            style={{
              left: `${posX}%`,
              top: `${posY}%`,
              width: `${graphicWidthPercent}%`,
              aspectRatio: `${designAspectRatio}`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              opacity: opacity / 100,
            }}
          >
            {/* Direct Rotation Pivot Pin (Top Center Handle) */}
            <div
              onPointerDown={handleRotateHandleDown}
              className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing group/rot"
              title="Drag to Rotate Graphic"
            >
              <div className="h-4 w-4 rounded-full border-2 border-primary bg-background flex items-center justify-center text-primary shadow-md hover:scale-110 transition-transform">
                <RotateCw className="h-2 w-2" />
              </div>
              <div className="h-3 w-px bg-primary/80" />
            </div>

            {/* Bounding Box Container */}
            <div
              className={cn(
                'relative h-full w-full rounded transition-all',
                isInteracting || showGuides
                  ? 'ring-1 ring-primary/80 bg-primary/[0.04]'
                  : 'group-hover:ring-1 group-hover:ring-primary/40'
              )}
            >
              {/* Graphic Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={filePreview}
                alt="Custom Graphic"
                className={cn(
                  'h-full w-full object-contain pointer-events-none select-none transition-all',
                  printFinish === 'natural' && 'mix-blend-multiply filter contrast-105',
                  invertGraphic && 'invert'
                )}
                draggable={false}
              />

              {/* 4 Corner Resize Handles */}
              <div
                onPointerDown={handleResizeHandleDown}
                className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary shadow-md cursor-nwse-resize hover:scale-125 transition-transform"
                title="Drag Corner to Scale"
              />
              <div
                onPointerDown={handleResizeHandleDown}
                className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary shadow-md cursor-nesw-resize hover:scale-125 transition-transform"
                title="Drag Corner to Scale"
              />
              <div
                onPointerDown={handleResizeHandleDown}
                className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary shadow-md cursor-nesw-resize hover:scale-125 transition-transform"
                title="Drag Corner to Scale"
              />
              <div
                onPointerDown={handleResizeHandleDown}
                className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary shadow-md cursor-nwse-resize hover:scale-125 transition-transform"
                title="Drag Corner to Scale"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="rounded-full bg-secondary/80 p-4 text-muted-foreground mb-3 border border-border/40">
              <FileImage className="h-8 w-8 opacity-60" />
            </div>
            <p className="text-xs font-bold text-foreground">Free Drag Placement Stage</p>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-[220px]">
              Upload artwork or choose a studio sample to drag freely across the garment.
            </p>
          </div>
        )}

        {/* Live Coordinate & Dimension HUD Overlay */}
        {filePreview && (
          <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span className="rounded-md bg-background/85 px-2 py-1 backdrop-blur-sm border border-border/50">
              {printArea.width}&quot; × {printArea.height}&quot; ({(printArea.width * 2.54).toFixed(0)} ×{' '}
              {(printArea.height * 2.54).toFixed(0)} cm)
            </span>
            <span className="rounded-md bg-background/85 px-2 py-1 backdrop-blur-sm border border-border/50">
              X: {posX}% | Y: {posY}% | {rotation}°
            </span>
          </div>
        )}
      </div>

      {/* Quick Calibration Bar Beneath Canvas */}
      {filePreview && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/40 p-2 border border-border/50">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPosX(50)}
              className="h-7 px-2 text-[11px] font-medium"
              title="Snap Center Horizontally"
            >
              <AlignHorizontalJustifyCenter className="h-3 w-3 mr-1" />
              Center
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPosY(38)}
              className="h-7 px-2 text-[11px] font-medium"
              title="Chest Level"
            >
              <AlignVerticalJustifyCenter className="h-3 w-3 mr-1" />
              Chest
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="h-7 px-2 text-[11px] font-medium"
              title="Turn 90 Degrees"
            >
              <RotateCw className="h-3 w-3 mr-1" />
              +90°
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setRotation(0);
                setPosX(50);
                setPosY(38);
                setPrintWidthInches(DEFAULT_PRINT_WIDTH_INCHES);
              }}
              className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
              title="Reset Position"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setInvertGraphic((v) => !v)}
              className={cn(
                'h-7 px-2 text-[11px] font-medium',
                invertGraphic && 'bg-primary text-primary-foreground'
              )}
            >
              Invert
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearGraphic}
              className="h-7 px-2 text-[11px] text-destructive hover:bg-destructive/10"
              title="Remove Artwork"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Quick Placement Presets */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
          <span>Placement Presets</span>
          <span>1-Tap Setup</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          {PLACEMENT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={!filePreview}
              onClick={() => handleApplyPreset(preset)}
              className={cn(
                'rounded-lg border px-2 py-1.5 text-center text-xs font-semibold tracking-tight transition-all',
                !filePreview
                  ? 'border-border/40 text-muted-foreground/40 cursor-not-allowed'
                  : 'border-border/70 bg-card hover:border-primary/80 hover:bg-secondary/70 text-foreground'
              )}
            >
              <span className="block truncate">{preset.name}</span>
              <span className="block text-[10px] text-muted-foreground font-mono">{preset.widthInches}&quot;</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // --- STUDIO INSPECTOR / CONFIGURATION PANEL ---
  const StudioInspectorContent = () => (
    <div className="space-y-6">
      {/* 1. ARTWORK UPLOAD & LIBRARY */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-mono text-primary-foreground">
              1
            </span>
            Upload Artwork Graphic
          </Label>
          {file && (
            <span className="text-[11px] font-mono text-primary flex items-center gap-1">
              <Check className="h-3 w-3" /> Ready
            </span>
          )}
        </div>

        {/* Dropzone */}
        <div className="relative group">
          <input
            id="artwork-file-input"
            type="file"
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/vnd.adobe.photoshop, image/webp"
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          />
          <div
            className={cn(
              'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all',
              file
                ? 'border-primary/60 bg-primary/[0.03]'
                : 'border-border/80 bg-secondary/30 group-hover:border-primary/40 group-hover:bg-secondary/50'
            )}
          >
            <Upload className="h-6 w-6 text-muted-foreground mb-1 group-hover:text-primary transition-colors" />
            <p className="text-xs font-bold text-foreground">
              {file ? file.name : 'Select or drop your artwork file'}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
              High-res PNG (Transparent), JPG, WEBP, PSD • Max 10MB
            </p>
          </div>
        </div>

        {/* Built-in Studio Archive Graphics */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Or test with archive graphics:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_ARTWORKS.map((sample) => {
              const isSelected = activeSampleId === sample.id;
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all',
                    isSelected
                      ? 'border-primary bg-primary/[0.08] ring-1 ring-primary'
                      : 'border-border/60 bg-card hover:border-foreground/30 hover:bg-secondary/50'
                  )}
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-md bg-neutral-900 border border-border/40 p-1 mb-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sample.svgData} alt={sample.title} className="h-full w-full object-contain" />
                  </div>
                  <span className="text-[11px] font-bold text-foreground leading-tight truncate w-full">
                    {sample.title}
                  </span>
                  <span className="text-[9px] text-muted-foreground truncate w-full">{sample.category}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. GARMENT COLORWAY */}
      <section className="space-y-3 pt-4 border-t border-border/60">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-mono text-primary-foreground">
              2
            </span>
            Garment Colorway
          </Label>
          <span className="text-xs font-bold text-primary font-mono">
            {selectedColorOption?.name || 'Select'}
          </span>
        </div>

        {colorsLoading ? (
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-12 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {colors.map((color) => {
              const isSelected = selectedColorOption?._id === color._id;
              const thumb = (color.images && color.images[0]) || color.imageUrl;
              return (
                <button
                  key={color._id}
                  type="button"
                  onClick={() => {
                    setSelectedColorOption(color);
                    setActiveViewIndex(0);
                  }}
                  className={cn(
                    'relative h-12 w-12 rounded-xl border-2 overflow-hidden transition-all',
                    isSelected
                      ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 shadow-md'
                      : 'border-border/70 hover:border-foreground/40'
                  )}
                  title={color.name}
                >
                  {thumb && (
                    <Image src={thumb} alt={color.name} width={48} height={48} className="object-cover w-full h-full" />
                  )}
                  {isSelected && (
                    <span className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. FABRIC GRADE & SILHOUETTE */}
      <section className="space-y-3 pt-4 border-t border-border/60">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-mono text-primary-foreground">
              3
            </span>
            Fabric Grade & Silhouette
          </Label>
          <Badge variant="outline" className="text-[10px] font-mono border-primary/40 text-primary">
            {selectedFabric.gsm}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {FABRIC_OPTIONS.map((fabric) => {
            const isSelected = selectedFabric.id === fabric.id;
            return (
              <button
                key={fabric.id}
                type="button"
                onClick={() => setSelectedFabric(fabric)}
                className={cn(
                  'flex flex-col text-left p-3 rounded-xl border transition-all relative overflow-hidden',
                  isSelected
                    ? 'border-primary bg-primary/[0.08] ring-1 ring-primary shadow-sm'
                    : 'border-border/70 bg-card hover:border-border hover:bg-secondary/40'
                )}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-foreground">{fabric.name}</span>
                  <span className="text-xs font-bold font-mono text-primary">₹{fabric.price}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug">{fabric.description}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
                    {fabric.gsm}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-semibold text-primary flex items-center gap-0.5">
                      <Check className="h-2.5 w-2.5" /> Selected
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. GARMENT SIZING */}
      <section className="space-y-3 pt-4 border-t border-border/60">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-mono text-primary-foreground">
              4
            </span>
            Garment Size
          </Label>
          <span className="text-xs font-mono text-muted-foreground">Standard Unisex Cut</span>
        </div>

        <div className="flex gap-2">
          {TSHIRT_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setTshirtSize(size)}
              className={cn(
                'flex-1 h-10 rounded-xl border text-xs font-bold transition-all',
                tshirtSize === size
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border/70 bg-secondary/50 text-foreground hover:border-foreground/30'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </section>

      {/* 5. FINE-TUNING DIMENSION & ORIENTATION SLIDERS */}
      {filePreview && (
        <section className="space-y-4 pt-4 border-t border-border/60">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-mono text-primary-foreground">
                5
              </span>
              Fine-Tuning Controls
            </Label>
            <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
          </div>

          {/* Scale Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-muted-foreground">Print Scale:</span>
              <span className="font-mono text-primary font-bold">{printWidthInches.toFixed(1)}&quot;</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-lg shrink-0"
                onClick={() => setPrintWidthInches((v) => Math.max(MIN_PRINT_WIDTH_INCHES, v - 0.5))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Slider
                value={[printWidthInches]}
                min={MIN_PRINT_WIDTH_INCHES}
                max={MAX_PRINT_WIDTH_INCHES}
                step={0.1}
                onValueChange={(val) => setPrintWidthInches(val[0])}
                className="flex-grow"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-lg shrink-0"
                onClick={() => setPrintWidthInches((v) => Math.min(MAX_PRINT_WIDTH_INCHES, v + 0.5))}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Rotation Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-muted-foreground">Angle Rotation:</span>
              <span className="font-mono text-primary font-bold">{rotation}°</span>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[rotation]}
                min={-180}
                max={180}
                step={1}
                onValueChange={(val) => setRotation(val[0])}
                className="flex-grow"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRotation(0)}
                className="h-7 px-2 text-[10px] font-mono"
              >
                0°
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* 6. PRODUCTION NOTES */}
      <section className="space-y-2 pt-4 border-t border-border/60">
        <Label htmlFor="production-notes" className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-mono text-primary-foreground">
            6
          </span>
          Placement Instructions (Optional)
        </Label>
        <Textarea
          id="production-notes"
          placeholder="e.g. Align exactly 2.5 inches below collar, special pantone match, or matte puff ink."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="text-xs bg-secondary/30 border-border/70 resize-none"
        />
      </section>

      {/* 7. LIVE QUOTE & SUBMIT */}
      <div className="rounded-xl border border-primary/30 bg-primary/[0.04] p-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground block">
              Estimated Total
            </span>
            <div className="text-2xl font-black font-mono text-primary">₹{totalPrice}</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-muted-foreground block">
              {selectedFabric.name} • {tshirtSize}
            </span>
            <span className="text-[10px] font-mono text-foreground font-semibold">
              {printArea.width}&quot; × {printArea.height}&quot; Print
            </span>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!file || isSubmitting}
          className="w-full h-11 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recording Placement & Submitting...
            </>
          ) : (
            'Submit Customization Request'
          )}
        </Button>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground text-center">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span>Placement coordinates and original file saved for studio verification.</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP STUDIO */}
      <div className="hidden md:flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-6 py-8">
          {/* Header Bar */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between border-b border-border/60 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest text-primary border-primary/40 bg-primary/10">
                  Custom Atelier Studio
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">Drag & Placement Engine</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground">Customization Studio</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Upload your graphic, drag it freely on the garment to place it, and submit for direct-to-garment production.
              </p>
            </div>

            {/* Live Spec Pill */}
            <div className="flex items-center gap-4 rounded-xl border border-border/80 bg-card p-3 shadow-xs">
              <div className="border-r border-border/60 pr-4">
                <span className="text-[10px] font-mono text-muted-foreground uppercase block">Fabric Silhouette</span>
                <span className="text-xs font-bold text-foreground">{selectedFabric.name}</span>
              </div>
              <div className="border-r border-border/60 pr-4">
                <span className="text-[10px] font-mono text-muted-foreground uppercase block">Dimensions</span>
                <span className="text-xs font-mono font-bold text-foreground">
                  {printArea.width}&quot; × {printArea.height}&quot;
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase block">Total Price</span>
                <span className="text-base font-black font-mono text-primary">₹{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Studio Layout */}
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Left Column: Interactive Garment Stage */}
            <div className="col-span-7 sticky top-24 space-y-4">
              <GarmentStage />
            </div>

            {/* Right Column: Studio Inspector Panel */}
            <div className="col-span-5">
              <Card className="border-border/80 bg-card/90 shadow-lg backdrop-blur-md">
                <CardHeader className="border-b border-border/60 pb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>Studio Parameters</span>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {selectedColorOption?.name || 'Garment'}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Adjust dimensions, select fabric grade, and inspect live specifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <StudioInspectorContent />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {/* MOBILE STUDIO */}
      <div className="md:hidden flex flex-col min-h-screen bg-background">
        <MobileHeader title="Custom Studio" />
        <main className="flex-grow p-4 pb-28 space-y-4">
          <GarmentStage />

          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-md">
            <Tabs value={mobileTab} onValueChange={setMobileTab} className="w-full">
              <TabsList className="grid grid-cols-4 h-9 bg-secondary/80 p-0.5">
                <TabsTrigger value="artwork" className="text-[10px] font-bold">
                  Artwork
                </TabsTrigger>
                <TabsTrigger value="fabric" className="text-[10px] font-bold">
                  Fabric
                </TabsTrigger>
                <TabsTrigger value="adjust" className="text-[10px] font-bold">
                  Adjust
                </TabsTrigger>
                <TabsTrigger value="order" className="text-[10px] font-bold">
                  Submit
                </TabsTrigger>
              </TabsList>

              <TabsContent value="artwork" className="space-y-4 pt-3">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Upload Design</Label>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/vnd.adobe.photoshop, image/webp"
                    className="text-xs"
                  />
                  {file && <p className="text-[11px] font-semibold text-primary">Selected: {file.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Archive Samples</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {SAMPLE_ARTWORKS.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => handleSelectSample(sample)}
                        className={cn(
                          'p-2 rounded-xl border text-center text-xs transition-all',
                          activeSampleId === sample.id
                            ? 'border-primary bg-primary/10 font-bold text-primary'
                            : 'border-border/70 bg-secondary/40 text-foreground'
                        )}
                      >
                        <div className="relative h-8 w-8 mx-auto mb-1 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={sample.svgData} alt={sample.title} className="h-full w-full object-contain" />
                        </div>
                        <span className="block truncate text-[10px]">{sample.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/60">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>Garment Color</span>
                    <span className="text-primary font-mono">{selectedColorOption?.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => {
                      const isSelected = selectedColorOption?._id === color._id;
                      const thumb = (color.images && color.images[0]) || color.imageUrl;
                      return (
                        <button
                          key={color._id}
                          type="button"
                          onClick={() => {
                            setSelectedColorOption(color);
                            setActiveViewIndex(0);
                          }}
                          className={cn(
                            'relative h-10 w-10 rounded-xl border-2 overflow-hidden',
                            isSelected ? 'border-primary ring-2 ring-primary scale-105' : 'border-border/60'
                          )}
                        >
                          {thumb && <Image src={thumb} alt={color.name} width={40} height={40} className="object-cover" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fabric" className="space-y-4 pt-3">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Fabric Grade</Label>
                  <div className="space-y-2">
                    {FABRIC_OPTIONS.map((fabric) => (
                      <button
                        key={fabric.id}
                        type="button"
                        onClick={() => setSelectedFabric(fabric)}
                        className={cn(
                          'w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all',
                          selectedFabric.id === fabric.id
                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                            : 'border-border/70 bg-secondary/30'
                        )}
                      >
                        <div>
                          <div className="font-bold text-foreground">{fabric.name}</div>
                          <div className="text-[10px] text-muted-foreground">{fabric.gsm}</div>
                        </div>
                        <span className="font-mono font-bold text-primary">₹{fabric.price}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/60">
                  <Label className="text-xs font-bold uppercase tracking-wider">Size</Label>
                  <div className="flex gap-1.5">
                    {TSHIRT_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setTshirtSize(size)}
                        className={cn(
                          'flex-1 h-9 rounded-lg border text-xs font-bold',
                          tshirtSize === size
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border/70 bg-secondary/40'
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="adjust" className="space-y-4 pt-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Print Scale:</span>
                    <span className="font-mono text-primary">{printWidthInches.toFixed(1)}&quot;</span>
                  </div>
                  <Slider
                    value={[printWidthInches]}
                    min={MIN_PRINT_WIDTH_INCHES}
                    max={MAX_PRINT_WIDTH_INCHES}
                    step={0.1}
                    onValueChange={(val) => setPrintWidthInches(val[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Rotation:</span>
                    <span className="font-mono text-primary">{rotation}°</span>
                  </div>
                  <Slider
                    value={[rotation]}
                    min={-180}
                    max={180}
                    step={1}
                    onValueChange={(val) => setRotation(val[0])}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPosX(50);
                      setPosY(38);
                    }}
                    className="flex-1 text-xs"
                  >
                    Center Graphic
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation(0)}
                    className="flex-1 text-xs"
                  >
                    Reset Angle
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="order" className="space-y-4 pt-3">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Placement Instructions</Label>
                  <Textarea
                    placeholder="Specific placement notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="text-xs bg-secondary/30 resize-none"
                  />
                </div>

                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Fabric & Fit:</span>
                    <span className="font-bold text-foreground">{selectedFabric.name} ({selectedFabric.gsm})</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span className="font-mono font-bold text-foreground">{printArea.width}&quot; × {printArea.height}&quot;</span>
                  </div>
                  <div className="border-t border-border/60 pt-2 flex justify-between items-center text-sm font-bold">
                    <span>Total Estimate:</span>
                    <span className="font-mono text-base text-primary">₹{totalPrice}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!file || isSubmitting}
                  className="w-full h-11 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Submit For Atelier Approval'
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Mobile Sticky Bar */}
        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-md p-3 px-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-mono uppercase text-muted-foreground block">
              {selectedFabric.name} • {tshirtSize}
            </span>
            <span className="text-lg font-black font-mono text-primary leading-tight">₹{totalPrice}</span>
          </div>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!file || isSubmitting}
            size="sm"
            className="h-10 px-5 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Design'}
          </Button>
        </div>
      </div>
    </>
  );
}
