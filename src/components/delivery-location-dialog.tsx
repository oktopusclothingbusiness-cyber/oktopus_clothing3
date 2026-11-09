'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  MapPin,
  CheckCircle2,
  Navigation,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { getOrCreatePersistentVisitorId } from '@/lib/fingerprint';

export interface DeliveryLocationInfo {
  city?: string;
  pincode?: string;
  streetAddress?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  source: 'gps' | 'pincode' | 'ip';
  updatedAt: string;
}

export function getSavedDeliveryLocation(): DeliveryLocationInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('okto_delivery_location');
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return null;
}

export function saveDeliveryLocation(info: DeliveryLocationInfo) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('okto_delivery_location', JSON.stringify(info));
    window.dispatchEvent(new CustomEvent('okto-delivery-location-changed', { detail: info }));
  } catch {
    // fallback
  }
}

export function DeliveryLocationDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLocating, setIsLocating] = React.useState(false);
  const [isCheckingPincode, setIsCheckingPincode] = React.useState(false);
  const [manualPincode, setManualPincode] = React.useState('');
  const [currentLocation, setCurrentLocation] = React.useState<DeliveryLocationInfo | null>(null);
  const [successInfo, setSuccessInfo] = React.useState<string | null>(null);

  // Load saved location on mount
  React.useEffect(() => {
    const saved = getSavedDeliveryLocation();
    if (saved) {
      setCurrentLocation(saved);
    }

    // Listen for custom open event
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('okto-open-delivery-modal', handleOpen);

    // Auto-prompt once per session after 4s on storefront if never checked
    const hasPrompted = sessionStorage.getItem('okto_delivery_prompted');
    if (!saved && !hasPrompted) {
      const timer = setTimeout(() => {
        sessionStorage.setItem('okto_delivery_prompted', 'true');
        setIsOpen(true);
      }, 4000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('okto-open-delivery-modal', handleOpen);
      };
    }

    return () => {
      window.removeEventListener('okto-open-delivery-modal', handleOpen);
    };
  }, []);

  // Handle GPS detection
  const handleDetectGPS = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      toast({
        title: 'Geolocation Unsupported',
        description: 'Your browser does not support GPS location. Please enter your pincode.',
        variant: 'destructive',
      });
      return;
    }

    setIsLocating(true);
    setSuccessInfo(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;
          const vid = getOrCreatePersistentVisitorId();

          const res = await fetch('/api/fingerprint/geo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              visitorId: vid,
              coords: {
                latitude: lat,
                longitude: lon,
                accuracyMeters: accuracy,
              },
            }),
          });

          let streetAddress = '';
          let city = 'Your Area';

          if (res.ok) {
            const data = await res.json();
            streetAddress = data.streetAddress || '';
            if (streetAddress) {
              const parts = streetAddress.split(',');
              city = parts[0]?.trim() || 'Your City';
            }
          }

          const locationData: DeliveryLocationInfo = {
            latitude: lat,
            longitude: lon,
            streetAddress,
            city,
            source: 'gps',
            updatedAt: new Date().toISOString(),
          };

          saveDeliveryLocation(locationData);
          setCurrentLocation(locationData);
          setSuccessInfo(streetAddress ? `${city} (Exact Doorstep Location)` : 'Location verified via GPS');

          toast({
            title: 'Delivery Address Verified',
            description: `Delivering to ${city}. Express 3-5 days delivery available!`,
          });

          setTimeout(() => {
            setIsOpen(false);
          }, 1800);
        } catch {
          toast({
            title: 'Failed to save location',
            description: 'Could not sync GPS coordinates with server.',
            variant: 'destructive',
          });
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === 1) {
          toast({
            title: 'Location Permission Denied',
            description: 'Please enter your 6-digit PIN code manually below.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Location Unavailable',
            description: 'Could not acquire GPS fix. Please enter your pincode.',
            variant: 'destructive',
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  // Handle Manual PIN Code verification
  const handleCheckPincode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = manualPincode.trim().replace(/\D/g, '');

    if (clean.length !== 6) {
      toast({
        title: 'Invalid Pincode',
        description: 'Please enter a valid 6-digit Indian Postal PIN Code.',
        variant: 'destructive',
      });
      return;
    }

    setIsCheckingPincode(true);
    setSuccessInfo(null);

    try {
      const vid = getOrCreatePersistentVisitorId();
      const res = await fetch('/api/delivery/check-pincode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pincode: clean,
          visitorId: vid,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const cityLabel = data.district || data.city || 'India';
        const locationData: DeliveryLocationInfo = {
          pincode: clean,
          city: cityLabel,
          state: data.state || '',
          source: 'pincode',
          updatedAt: new Date().toISOString(),
        };

        saveDeliveryLocation(locationData);
        setCurrentLocation(locationData);
        setSuccessInfo(`${cityLabel} - ${clean} is serviceable!`);

        toast({
          title: 'Pincode Verified',
          description: `Deliverable to ${cityLabel} (${clean}) in ${data.deliveryDays || 3} business days.`,
        });

        setTimeout(() => {
          setIsOpen(false);
        }, 1500);
      } else {
        toast({
          title: 'Verification Failed',
          description: 'Unable to verify pincode. Please try again.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Network Error',
        description: 'Failed to verify pincode. Check your connection.',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingPincode(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[340px] sm:max-w-[360px] p-5 bg-background border border-border rounded-2xl shadow-xl space-y-4">
        {/* Header */}
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <DialogTitle className="text-sm font-bold text-foreground">
              Delivery Location
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Check courier reach, speed, and delivery charges.
          </DialogDescription>
        </DialogHeader>

        {/* Success Feedback */}
        {successInfo && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold text-[11px] truncate">{successInfo}</span>
          </div>
        )}

        {/* Option A: One-Tap GPS Detection */}
        <Button
          type="button"
          onClick={handleDetectGPS}
          disabled={isLocating}
          className="w-full h-9 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs rounded-xl gap-2 shadow-xs transition-all"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Locating...
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5" />
              Use Current Location
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full"></div>
          <span className="bg-background px-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider absolute">
            or pincode
          </span>
        </div>

        {/* Option B: Manual Indian Pincode */}
        <form onSubmit={handleCheckPincode} className="flex gap-2">
          <Input
            type="text"
            placeholder="6-digit PIN code"
            maxLength={6}
            value={manualPincode}
            onChange={(e) => setManualPincode(e.target.value.replace(/\D/g, ''))}
            className="h-9 text-xs font-mono tracking-wider text-center rounded-xl"
          />
          <Button
            type="submit"
            disabled={isCheckingPincode || manualPincode.length !== 6}
            variant="secondary"
            className="h-9 px-4 text-xs font-semibold rounded-xl shrink-0"
          >
            {isCheckingPincode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Top Header Delivery Pill Component (Desktop & Mobile)
 * Displays the current delivery city/pincode and opens the modal on click.
 */
export function DeliveryLocationPill({ className }: { className?: string }) {
  const [location, setLocation] = React.useState<DeliveryLocationInfo | null>(null);

  React.useEffect(() => {
    setLocation(getSavedDeliveryLocation());

    const handleChange = (e: any) => {
      if (e.detail) {
        setLocation(e.detail);
      }
    };

    window.addEventListener('okto-delivery-location-changed', handleChange);
    return () => {
      window.removeEventListener('okto-delivery-location-changed', handleChange);
    };
  }, []);

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('okto-open-delivery-modal'));
  };

  const displayText = location?.pincode
    ? `${location.city || 'India'} (${location.pincode})`
    : location?.city
    ? location.city
    : 'Select Location';

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border border-border/60 hover:border-primary/50 bg-background/60 hover:bg-muted/50 cursor-pointer ${className || ''}`}
      title="Check or Change Delivery Location"
    >
      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
      <span className="text-[11px] text-muted-foreground">Deliver to:</span>
      <span className="text-[11px] font-bold text-foreground truncate max-w-[120px] sm:max-w-[160px]">
        {displayText}
      </span>
      <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />
    </button>
  );
}

