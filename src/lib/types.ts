export type ArtKind =
  | "quad"
  | "whoop"
  | "wing"
  | "camdrone"
  | "goggles"
  | "airunit"
  | "fpvcam"
  | "antenna"
  | "frame"
  | "motor"
  | "esc"
  | "board"
  | "prop"
  | "gps"
  | "radio"
  | "receiver"
  | "battery"
  | "charger"
  | "cable"
  | "actioncam"
  | "gimbal"
  | "meter"
  | "iron"
  | "tool"
  | "bag";

export type Tag = "hot" | "new" | "bestseller" | "made-in-india";

export interface VariantOption {
  id?: string;
  label: string;
  price: number;
  mrp?: number;
  stock: number;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp?: number;
  stock: number;
  art: ArtKind;
  hue: number;
  tags: Tag[];
  short: string;
  highlights: string[];
  specs: Record<string, string>;
  inBox?: string[];
  variant?: { name: string; options: VariantOption[] };
  weightG?: number;
  imageUrl?: string;
  lowStockAt: number;
  addedOrder: number;
}

export interface Category {
  slug: string;
  name: string;
  department: string;
  art: ArtKind;
  blurb: string;
}

export interface Department {
  slug: string;
  name: string;
}

/** Lightweight shape shipped to the client for search, cards and filtering. */
export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp?: number;
  maxPrice?: number;
  stock: number;
  art: ArtKind;
  hue: number;
  tags: Tag[];
  hasVariants: boolean;
  imageUrl?: string;
  addedOrder: number;
}

export interface Announcement {
  id: string;
  message: string;
  link: string | null;
  tone: "info" | "deal" | "alert";
}
