"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  X,
  Copy,
  Sparkles,
  Shirt,
  Check,
  ChevronRight,
  Layers,
  SlidersHorizontal,
} from "lucide-react";

export interface MobileFabricVariant {
  id: string;
  name: string;
  enabled: boolean;
  price: string;
  originalPrice: string;
  stock: string;
  sizes: string;
  gsm?: string;
}

export interface MobileColorVariant {
  id: string;
  color: string;
  colorHex?: string;
  images: string;
  categories: MobileFabricVariant[];
}

export const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

export const QUICK_COLOR_PRESETS = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#F8F9FA" },
];

export const createDefaultFabricCategories = (
  baseSizes = "S, M, L, XL, 2XL"
): MobileFabricVariant[] => [
  {
    id: "regular",
    name: "Regular",
    enabled: true,
    price: "499",
    originalPrice: "799",
    stock: "10",
    sizes: baseSizes || "S, M, L, XL, 2XL",
    gsm: "180 GSM Bio-Washed",
  },
  {
    id: "oversized",
    name: "Oversized",
    enabled: true,
    price: "599",
    originalPrice: "999",
    stock: "10",
    sizes: baseSizes || "S, M, L, XL, 2XL",
    gsm: "240 GSM Boxy Cotton",
  },
  {
    id: "french-terry",
    name: "French Terry",
    enabled: true,
    price: "749",
    originalPrice: "1199",
    stock: "10",
    sizes: baseSizes || "S, M, L, XL, 2XL",
    gsm: "320 GSM French Terry",
  },
  {
    id: "sweatshirt",
    name: "Sweatshirt",
    enabled: false,
    price: "799",
    originalPrice: "1299",
    stock: "10",
    sizes: "M, L, XL, 2XL",
    gsm: "320 GSM Fleece",
  },
];

interface Product {
  _id: string;
  id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sizes?: string[];
  colors?: string[];
  imageUrls?: string[];
  colorImages?: Record<string, string[]>;
  colorVariants?: {
    id: string;
    color: string;
    colorHex?: string;
    images: string[];
    categories: {
      id: string;
      name: string;
      price: number;
      originalPrice?: number;
      stock?: number;
      sizes: string[];
      gsm?: string;
    }[];
  }[];
  category?: string[];
  description?: string;
}

export default function MobileProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [colorVariants, setColorVariants] = useState<MobileColorVariant[]>([
    {
      id: "color-black",
      color: "Black",
      colorHex: "#111111",
      images: "",
      categories: createDefaultFabricCategories("S, M, L, XL, 2XL"),
    },
  ]);
  const [newImageUrlByColor, setNewImageUrlByColor] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  // LIVE STATS COMPUTATION
  const variantStats = useMemo(() => {
    const prices: number[] = [];
    const originalPrices: number[] = [];
    let totalStock = 0;
    const activeFabrics = new Set<string>();

    colorVariants.forEach((cv) => {
      cv.categories.forEach((cat) => {
        if (cat.enabled) {
          activeFabrics.add(cat.name);
          const p = parseFloat(cat.price);
          if (p > 0) prices.push(p);
          const op = parseFloat(cat.originalPrice);
          if (op > 0) originalPrices.push(op);
          const s = parseInt(cat.stock, 10);
          if (!isNaN(s)) totalStock += s;
        }
      });
    });

    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    return {
      minPrice,
      maxPrice,
      priceLabel: prices.length > 0 ? (minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} – ₹${maxPrice}`) : "₹0",
      totalStock,
      totalColors: colorVariants.length,
      activeFabricsCount: activeFabrics.size,
      activeFabricsList: Array.from(activeFabrics),
    };
  }, [colorVariants]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products", {
        headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddColorVariant = (preset?: { name: string; hex: string }) => {
    const colorName = preset?.name || `Color ${colorVariants.length + 1}`;
    const colorHex = preset?.hex || "#111111";
    setColorVariants((prev) => [
      ...prev,
      {
        id: `color-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        color: colorName,
        colorHex,
        images: "",
        categories: createDefaultFabricCategories("S, M, L, XL, 2XL"),
      },
    ]);
  };

  const handleDuplicateColorVariant = (sourceIdx: number) => {
    const source = colorVariants[sourceIdx];
    if (!source) return;
    const duplicated: MobileColorVariant = {
      id: `color-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      color: `${source.color} (Copy)`,
      colorHex: source.colorHex || "#111111",
      images: source.images,
      categories: source.categories.map((c) => ({ ...c })),
    };
    setColorVariants((prev) => [...prev, duplicated]);
  };

  const handleRemoveColorVariant = (index: number) => {
    if (colorVariants.length <= 1) return;
    setColorVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleColorVariantChange = (index: number, field: string, value: any) => {
    setColorVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleFabricCategoryChange = (
    colorIdx: number,
    catId: string,
    field: string,
    value: any
  ) => {
    setColorVariants((prev) => {
      const updated = [...prev];
      const variant = { ...updated[colorIdx] };
      variant.categories = variant.categories.map((c) =>
        c.id === catId ? { ...c, [field]: value } : c
      );
      updated[colorIdx] = variant;
      return updated;
    });
  };

  const handleToggleFabricSize = (colorIdx: number, catId: string, size: string) => {
    setColorVariants((prev) => {
      const updated = [...prev];
      const variant = { ...updated[colorIdx] };
      variant.categories = variant.categories.map((c) => {
        if (c.id !== catId) return c;
        const currentSizes = c.sizes.split(",").map((s) => s.trim()).filter(Boolean);
        const nextSizes = currentSizes.includes(size)
          ? currentSizes.filter((s) => s !== size)
          : [...currentSizes, size];
        return { ...c, sizes: nextSizes.join(", ") };
      });
      updated[colorIdx] = variant;
      return updated;
    });
  };

  const handleCopyFabricToAllColors = (sourceIdx: number) => {
    const source = colorVariants[sourceIdx];
    if (!source) return;
    const sourceCategories = source.categories;
    setColorVariants((prev) =>
      prev.map((v, i) =>
        i === sourceIdx
          ? v
          : { ...v, categories: sourceCategories.map((c) => ({ ...c })) }
      )
    );
  };

  const handleApplyPresetMatrixToAll = () => {
    setColorVariants((prev) =>
      prev.map((v) => ({
        ...v,
        categories: [
          { id: "regular", name: "Regular", enabled: true, price: "499", originalPrice: "799", stock: "10", sizes: "S, M, L, XL, 2XL", gsm: "180 GSM Bio-Washed" },
          { id: "oversized", name: "Oversized", enabled: true, price: "599", originalPrice: "999", stock: "10", sizes: "S, M, L, XL, 2XL", gsm: "240 GSM Boxy Cotton" },
          { id: "french-terry", name: "French Terry", enabled: true, price: "749", originalPrice: "1199", stock: "10", sizes: "S, M, L, XL, 2XL", gsm: "320 GSM French Terry" },
          { id: "sweatshirt", name: "Sweatshirt", enabled: false, price: "799", originalPrice: "1299", stock: "10", sizes: "M, L, XL, 2XL", gsm: "320 GSM Fleece" },
        ],
      }))
    );
  };

  const handleRemoveColorImage = (colorIdx: number, imgIdx: number) => {
    setColorVariants((prev) => {
      const updated = [...prev];
      const variant = { ...updated[colorIdx] };
      const imagesArr = variant.images.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean);
      variant.images = imagesArr.filter((_, i) => i !== imgIdx).join(", ");
      updated[colorIdx] = variant;
      return updated;
    });
  };

  const handleAddSingleImage = (colorIdx: number) => {
    const url = (newImageUrlByColor[colorIdx] || "").trim();
    if (!url) return;
    setColorVariants((prev) => {
      const updated = [...prev];
      const variant = { ...updated[colorIdx] };
      const imagesArr = variant.images.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean);
      imagesArr.push(url);
      variant.images = imagesArr.join(", ");
      updated[colorIdx] = variant;
      return updated;
    });
    setNewImageUrlByColor((prev) => ({ ...prev, [colorIdx]: "" }));
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setColorVariants([
      {
        id: "color-black",
        color: "Black",
        colorHex: "#111111",
        images: "",
        categories: createDefaultFabricCategories("S, M, L, XL, 2XL"),
      },
    ]);
    setNewImageUrlByColor({});
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const hasEnabled = colorVariants.some((cv) =>
      cv.categories.some((c) => c.enabled && parseFloat(c.price) > 0)
    );
    if (!hasEnabled) {
      alert("Please enable at least one fabric quality (e.g. Regular or Oversized) with a valid price.");
      return;
    }

    try {
      setSaving(true);

      const validColorVariants = colorVariants.filter((cv) => cv.color.trim());
      const finalColorVariants = validColorVariants.map((cv) => ({
        id: cv.id || cv.color.toLowerCase().replace(/\s+/g, "-"),
        color: cv.color.trim(),
        colorHex: cv.colorHex || "#111111",
        images: cv.images.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean),
        categories: cv.categories
          .filter((c) => c.enabled)
          .map((c) => ({
            id: c.id,
            name: c.name,
            price: parseFloat(c.price) || 0,
            originalPrice: c.originalPrice ? parseFloat(c.originalPrice) : undefined,
            stock: c.stock ? parseInt(c.stock, 10) : 50,
            sizes: c.sizes.split(",").map((s) => s.trim()).filter(Boolean),
            gsm: c.gsm,
          })),
      }));

      const colorImagesObj: Record<string, string[]> = {};
      finalColorVariants.forEach((cv) => {
        if (cv.images.length > 0) colorImagesObj[cv.color] = cv.images;
      });

      const allVariantPrices: number[] = [];
      const allOriginalPrices: number[] = [];
      let totalStock = 0;
      const allSizesSet = new Set<string>();

      finalColorVariants.forEach((cv) => {
        cv.categories.forEach((cat) => {
          if (cat.price > 0) allVariantPrices.push(cat.price);
          if (cat.originalPrice && cat.originalPrice > 0) allOriginalPrices.push(cat.originalPrice);
          if (typeof cat.stock === "number") totalStock += cat.stock;
          cat.sizes.forEach((s) => allSizesSet.add(s));
        });
      });

      const resolvedPrice = allVariantPrices.length > 0 ? Math.min(...allVariantPrices) : 499;
      const resolvedOriginalPrice = allOriginalPrices.length > 0 ? Math.max(...allOriginalPrices) : undefined;
      const resolvedSizes = allSizesSet.size > 0 ? Array.from(allSizesSet) : ["S", "M", "L", "XL", "2XL"];
      const resolvedColors = finalColorVariants.map((cv) => cv.color);
      const allImagesList = Array.from(new Set(finalColorVariants.flatMap((cv) => cv.images)));

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-App-Secret": "okto_mobile_sec_2026_prod",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || "Premium graphic drop.",
          price: resolvedPrice,
          originalPrice: resolvedOriginalPrice,
          stock: totalStock > 0 ? totalStock : 10,
          sizes: resolvedSizes,
          colors: resolvedColors.length > 0 ? resolvedColors : ["Black"],
          imageUrls: allImagesList.length > 0 ? allImagesList : ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"],
          colorImages: Object.keys(colorImagesObj).length > 0 ? colorImagesObj : undefined,
          colorVariants: finalColorVariants.length > 0 ? finalColorVariants : undefined,
        }),
      });

      if (res.ok) {
        resetForm();
        setIsModalOpen(false);
        fetchProducts();
      } else {
        alert("Failed to create product. Please check required fields.");
      }
    } catch (err) {
      console.error("Failed to create product", err);
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStockZero = async (product: Product) => {
    const newStock = product.stock === 0 ? 50 : 0;
    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-App-Secret": "okto_mobile_sec_2026_prod",
        },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, stock: newStock } : p))
        );
      }
    } catch (err) {
      console.error("Failed to update stock", err);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" },
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  const calcDiscount = (p: number, orig?: number) => {
    if (!orig || orig <= p) return 0;
    return Math.round(((orig - p) / orig) * 100);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161616] p-5 rounded-2xl border border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Product Inventory & Catalog</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manage multi-tier apparel drops, colorways, fabric categories, and instant stock controls.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold flex items-center space-x-1.5 transition shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>

          <button
            onClick={fetchProducts}
            className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 flex items-center space-x-2 transition"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* PRODUCTS CATALOG LIST */}
      <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-white">
            Catalog Items ({products.length})
          </h3>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-500">Loading catalog items...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredProducts.map((p) => {
              const discount = calcDiscount(p.price, p.originalPrice);
              const isOutOfStock = p.stock === 0;
              const hasColorVariants = Array.isArray(p.colorVariants) && p.colorVariants.length > 0;
              const colorsCount = hasColorVariants ? p.colorVariants!.length : (p.colors?.length || 1);

              return (
                <div
                  key={p._id}
                  className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-start justify-between gap-3 hover:border-zinc-700 transition"
                >
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    <div className="w-14 h-16 rounded-lg bg-zinc-800 overflow-hidden shrink-0 relative border border-zinc-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          p.imageUrls?.[0] ||
                          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80"
                        }
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-xs font-black text-white">From ₹{p.price}</span>
                        {p.originalPrice && (
                          <span className="text-[10px] text-zinc-500 line-through">
                            ₹{p.originalPrice}
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-zinc-800 text-zinc-200">
                            {discount}% OFF
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold">
                          {colorsCount} {colorsCount === 1 ? "Color" : "Colors"}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isOutOfStock
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {isOutOfStock ? "OUT OF STOCK" : `${p.stock} units`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1.5 shrink-0">
                    <button
                      onClick={() => toggleStockZero(p)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                        isOutOfStock
                          ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      }`}
                      title="Toggle Stock Switch"
                    >
                      {isOutOfStock ? "RESTOCK" : "MARK OOS"}
                    </button>

                    <button
                      onClick={() => deleteProduct(p._id)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MOBILE-ADMIN PRODUCT ADDITION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#141416] border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* MODAL HEADER */}
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 shrink-0">
              <div>
                <div className="flex items-center space-x-2">
                  <Shirt className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-bold text-white">Add New Product</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white text-black">
                    {variantStats.priceLabel}
                  </span>
                  <span className="text-[11px] font-medium text-zinc-400">
                    {variantStats.totalStock} in stock
                  </span>
                  <span className="text-[11px] font-medium text-zinc-400">
                    {variantStats.totalColors} {variantStats.totalColors === 1 ? 'color' : 'colors'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SCROLLABLE MODAL BODY */}
            <form onSubmit={handleCreateProduct} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* SECTION 1: DESIGN TITLE & STORY */}
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Heavyweight Boxy Tee"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Description
                    </label>
                    <textarea
                      placeholder="Enter product description, fit notes, and fabric details..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                {/* SECTION 2: 1-CLICK PRESET PRICING MATRIX */}
                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-zinc-300">
                    <span className="font-bold flex items-center gap-1.5 text-white">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-white" /> Default Pricing Presets:
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">
                      Regular: ₹499 · Oversized: ₹599 · French Terry (320 GSM): ₹749 · Sweatshirt: ₹799
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyPresetMatrixToAll}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium shrink-0 transition"
                  >
                    Apply Defaults to All Colors
                  </button>
                </div>

                {/* SECTION 3: COLORWAYS STUDIO */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Colorways & Fabric Options
                      </h4>
                      <p className="text-[10px] text-zinc-400">
                        Upload photos for each color, toggle fabric qualities (Regular, Oversized, French Terry 320 GSM, Sweatshirt)
                      </p>
                    </div>

                    {/* QUICK ADD CHIPS: BLACK & WHITE */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-zinc-500 font-semibold mr-1">Quick Add:</span>
                      {QUICK_COLOR_PRESETS.map((preset) => {
                        const exists = colorVariants.some(
                          (cv) => cv.color.toLowerCase() === preset.name.toLowerCase()
                        );
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            disabled={exists}
                            onClick={() => handleAddColorVariant(preset)}
                            className="px-2 py-1 rounded-md text-[10px] font-bold border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 flex items-center gap-1 transition"
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-zinc-600 shrink-0"
                              style={{ backgroundColor: preset.hex }}
                            />
                            <span>{preset.name}</span>
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => handleAddColorVariant()}
                        className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-white text-black hover:bg-zinc-200 transition"
                      >
                        + Custom Color
                      </button>
                    </div>
                  </div>

                  {/* COLORWAYS LIST */}
                  <div className="space-y-4">
                    {colorVariants.map((cv, colorIdx) => {
                      const imageList = cv.images.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean);

                      return (
                        <div
                          key={cv.id || colorIdx}
                          className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3.5"
                        >
                          {/* COLORWAY HEADER */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={cv.colorHex || "#111111"}
                                onChange={(e) =>
                                  handleColorVariantChange(colorIdx, "colorHex", e.target.value)
                                }
                                className="w-7 h-7 rounded-lg cursor-pointer border border-zinc-700 bg-transparent p-0.5"
                              />
                              <input
                                type="text"
                                value={cv.color}
                                onChange={(e) =>
                                  handleColorVariantChange(colorIdx, "color", e.target.value)
                                }
                                placeholder="Color name"
                                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-bold text-white w-36"
                              />
                              <span className="text-[10px] text-zinc-500">
                                ({cv.categories.filter((c) => c.enabled).length} Active Fits)
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDuplicateColorVariant(colorIdx)}
                                className="px-2 py-1 rounded text-[10px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" /> Duplicate
                              </button>

                              {colorVariants.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyFabricToAllColors(colorIdx)}
                                  className="px-2 py-1 rounded text-[10px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                                >
                                  Copy Pricing to All
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveColorVariant(colorIdx)}
                                disabled={colorVariants.length <= 1}
                                className="p-1 rounded text-zinc-500 hover:text-red-400 disabled:opacity-30"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* COLOR GALLERY PHOTOS */}
                          <div className="space-y-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                            <label className="text-[11px] font-semibold text-zinc-300 block">
                              Images for {cv.color} ({imageList.length} added)
                            </label>

                            <div className="flex items-center gap-2">
                              <input
                                type="url"
                                value={newImageUrlByColor[colorIdx] || ""}
                                onChange={(e) =>
                                  setNewImageUrlByColor((prev) => ({
                                    ...prev,
                                    [colorIdx]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddSingleImage(colorIdx);
                                  }
                                }}
                                placeholder="Paste image URL (https://...)"
                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddSingleImage(colorIdx)}
                                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold shrink-0"
                              >
                                + Add Image
                              </button>
                            </div>

                            {/* THUMBNAIL STRIP */}
                            {imageList.length > 0 && (
                              <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
                                {imageList.map((url, imgIdx) => (
                                  <div
                                    key={imgIdx}
                                    className="relative group w-14 h-16 rounded-md overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={url}
                                      alt={`${cv.color} view ${imgIdx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                    <span className="absolute top-0.5 left-0.5 bg-black/80 text-[8px] font-medium text-white px-1 rounded">
                                      {imgIdx + 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveColorImage(colorIdx, imgIdx)}
                                      className="absolute top-0.5 right-0.5 bg-red-600 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                                      title="Remove image"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* FABRIC CATEGORIES FOR THIS COLOR */}
                          <div className="space-y-2">
                            <label className="text-[11px] font-semibold text-zinc-300 block">
                              Fabric Options & Pricing:
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {cv.categories.map((cat) => (
                                <div
                                  key={cat.id}
                                  className={`p-3 rounded-xl border transition ${
                                    cat.enabled
                                      ? "bg-zinc-950 border-zinc-700"
                                      : "bg-zinc-950/40 border-zinc-850 opacity-50"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={cat.enabled}
                                        onChange={(e) =>
                                          handleFabricCategoryChange(
                                            colorIdx,
                                            cat.id,
                                            "enabled",
                                            e.target.checked
                                          )
                                        }
                                        className="rounded border-zinc-700 bg-zinc-900"
                                      />
                                      <span className="text-xs font-bold text-white">{cat.name}</span>
                                    </label>
                                    <span className="text-[9px] font-semibold text-zinc-400 px-1.5 py-0.5 bg-zinc-800 rounded">
                                      {cat.gsm || "Standard"}
                                    </span>
                                  </div>

                                  {cat.enabled && (
                                    <div className="space-y-2">
                                      <div className="grid grid-cols-3 gap-2">
                                        <div>
                                          <span className="text-[9px] text-zinc-400 block mb-0.5">Price (₹)</span>
                                          <input
                                            type="number"
                                            value={cat.price}
                                            onChange={(e) =>
                                              handleFabricCategoryChange(colorIdx, cat.id, "price", e.target.value)
                                            }
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white font-bold"
                                          />
                                        </div>
                                        <div>
                                          <span className="text-[9px] text-zinc-400 block mb-0.5">Compare at (₹)</span>
                                          <input
                                            type="number"
                                            value={cat.originalPrice}
                                            onChange={(e) =>
                                              handleFabricCategoryChange(colorIdx, cat.id, "originalPrice", e.target.value)
                                            }
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300"
                                          />
                                        </div>
                                        <div>
                                          <span className="text-[9px] text-zinc-400 block mb-0.5">Stock</span>
                                          <input
                                            type="number"
                                            value={cat.stock}
                                            onChange={(e) =>
                                              handleFabricCategoryChange(colorIdx, cat.id, "stock", e.target.value)
                                            }
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300"
                                          />
                                        </div>
                                      </div>

                                      {/* SIZES PILLS */}
                                      <div>
                                        <span className="text-[9px] text-zinc-400 block mb-1">Available Sizes (click to toggle):</span>
                                        <div className="flex flex-wrap gap-1">
                                          {STANDARD_SIZES.map((sz) => {
                                            const activeSizes = cat.sizes.split(",").map((s) => s.trim()).filter(Boolean);
                                            const isSelected = activeSizes.includes(sz);
                                            return (
                                              <button
                                                key={sz}
                                                type="button"
                                                onClick={() => handleToggleFabricSize(colorIdx, cat.id, sz)}
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                                  isSelected
                                                    ? "bg-white text-black"
                                                    : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white"
                                                }`}
                                              >
                                                {sz}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="px-5 py-3.5 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/60 shrink-0">
                <span className="text-xs text-zinc-400">
                  Starting at <strong className="text-white">₹{variantStats.minPrice || 499}</strong> · {variantStats.totalStock} units
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl shadow-lg transition"
                  >
                    {saving ? "Saving..." : "Save Product"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
