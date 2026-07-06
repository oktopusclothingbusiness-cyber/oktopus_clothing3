import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProductImage(imageUrls: any, fallback = "https://placehold.co/600x800.png"): string {
  if (!Array.isArray(imageUrls)) return fallback;
  const valid = imageUrls.find(url => 
    typeof url === 'string' && 
    (url.trim().startsWith('http://') || url.trim().startsWith('https://') || url.trim().startsWith('/'))
  );
  return valid ? valid.trim() : fallback;
}
