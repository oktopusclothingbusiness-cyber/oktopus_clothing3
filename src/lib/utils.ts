import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getOptimizedImageUrl } from "./imageUtils"

export * from "./imageUtils"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProductImage(imageUrls: any, fallback = "https://placehold.co/600x800.png", targetWidth = 500): string {
  if (!Array.isArray(imageUrls)) return getOptimizedImageUrl(fallback, targetWidth);
  const valid = imageUrls.find(url => 
    typeof url === 'string' && 
    (url.trim().startsWith('http://') || url.trim().startsWith('https://') || url.trim().startsWith('/'))
  );
  return getOptimizedImageUrl(valid ? valid.trim() : fallback, targetWidth);
}

/**
 * Generates a clean, deterministic 6-digit alphanumeric Order ID
 * from a raw MongoDB ObjectId or order ID string.
 */
export function getShortOrderId(id?: string): string {
  if (!id || typeof id !== 'string') return '000000';
  const clean = id.trim().replace(/[^a-zA-Z0-9]/g, '');
  if (clean.length === 6) return clean.toUpperCase();
  
  if (clean.length >= 6) {
    const sub = clean.slice(-6);
    const num = parseInt(sub, 16);
    if (!isNaN(num)) {
      return num.toString(36).toUpperCase().padStart(6, '0').slice(-6);
    }
    return sub.toUpperCase();
  }
  return clean.padStart(6, '0').toUpperCase();
}


