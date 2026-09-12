/**
 * Quantizes dynamic pixel widths into standard CDN breakpoint buckets (500, 800, 1920)
 * to maximize Cloudinary edge caching and ensure app & web share identical CDN cache hits.
 */
export const getTargetWidthBucket = (width: number): number => {
  if (width <= 450) return 500;
  if (width <= 850) return 800;
  return 1920;
};

export const normalizeImageUrl = (url: string | undefined | null): string | null => {
  if (!url || typeof url !== 'string' || url.trim() === '') return null;
  let trimmed = url.trim();
  if (trimmed.startsWith('http:')) trimmed = trimmed.replace(/^http:/i, 'https:');
  return trimmed;
};

export const getOptimizedImageUrl = (
  url: string | undefined | null,
  width: number = 500,
  quality: number | 'auto' = 'auto'
): string => {
  const normalized = normalizeImageUrl(url);
  if (!normalized) return '';

  const bucketedWidth = getTargetWidthBucket(width);

  // 1. Cloudinary CDN Transformation
  if (normalized.includes('res.cloudinary.com') && normalized.includes('/upload/')) {
    // If the URL already has explicit width constraint (e.g., ,w_500 or /w_500/), return as-is
    if (normalized.includes(',w_') || normalized.includes('/w_')) {
      return normalized;
    }
    const transformStr = `f_auto,q_${quality},w_${bucketedWidth},c_limit`;
    return normalized.replace(/\/upload\/(?:f_auto,q_auto\/|f_auto\/|q_auto\/)?/i, `/upload/${transformStr}/`);
  }

  // 2. Unsplash Dynamic Width Transformer
  if (normalized.includes('images.unsplash.com')) {
    if (normalized.includes('w=') || normalized.includes('fmt=')) return normalized;
    const hasParam = normalized.includes('?');
    return `${normalized}${hasParam ? '&' : '?'}auto=format&fit=crop&w=${bucketedWidth}&q=80`;
  }

  return normalized;
};
