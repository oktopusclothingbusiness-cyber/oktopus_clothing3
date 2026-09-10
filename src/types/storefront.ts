export type ProductColor = {
  name: string;
  hex: string;
  inStock?: boolean;
};

export type SignalType = 'RAW' | 'DARK' | 'LOUD' | 'MINIMAL' | 'CHAOTIC' | 'CALM' | 'UNKNOWN';

export type StorefrontProduct = {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  price: number;
  compareAtPrice?: number;
  badge?: string;
  colors: ProductColor[];
  sizes: string[];
  images: string[];
  collectionIds: string[];
  tags: string[];
  signal?: SignalType;
  fit?: string;
  fabric?: string;
  gsm?: number;
  print?: string;
  finish?: string;
  care?: string;
  description?: string;
  available: boolean;
  stock?: number;
  featured?: boolean;
  isHero?: boolean;
};

export type CollectionItem = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl: string;
  badge?: string;
  itemCount: number;
  signal?: SignalType;
};

export type DropItem = {
  dropNumber: string;
  title: string;
  season: string;
  releaseDate: string;
  itemCount: number;
  heroImage: string;
  description: string;
  slug: string;
};

export type FilterState = {
  category?: string;
  size?: string;
  color?: string;
  fit?: string;
  priceRange?: [number, number];
  signal?: string;
  inStockOnly?: boolean;
};

export type SortOption =
  | 'featured'
  | 'newest'
  | 'best_selling'
  | 'price_asc'
  | 'price_desc';
