"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Plus,
  Trash2,
  RefreshCw,
  Search
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sizes?: string[];
  colors?: string[];
  imageUrls?: string[];
  category?: string[];
  description?: string;
}

export default function MobileProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">(699);
  const [originalPrice, setOriginalPrice] = useState<number | "">(1199);
  const [stock, setStock] = useState<number>(45);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

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

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    try {
      setSaving(true);
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-App-Secret": "okto_mobile_sec_2026_prod",
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : undefined,
          stock,
          sizes: selectedSizes,
          imageUrls: [
            imageUrl ||
              "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
          ],
          description: description || "Premium 240 GSM heavy cotton oversized t-shirt.",
        }),
      });

      if (res.ok) {
        setName("");
        setImageUrl("");
        setDescription("");
        fetchProducts();
      }
    } catch (err) {
      console.error("Failed to create product", err);
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

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Discount calculation helper
  const calcDiscount = (p: number, orig?: number) => {
    if (!orig || orig <= p) return 0;
    return Math.round(((orig - p) / orig) * 100);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161616] p-5 rounded-2xl border border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Product Inventory & Catalog</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manage product items, prices, strikethrough discounts, sizes, and instant out-of-stock switches.
          </p>
        </div>

        <button
          onClick={fetchProducts}
          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 flex items-center space-x-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Add Product Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleCreateProduct}
            className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 space-y-4 sticky top-20"
          >
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-zinc-800 pb-3">
              <Plus className="w-4 h-4 text-white" />
              <span>Add New Apparel Item</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Oktopus Graphic Oversized Tee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Strikethrough Price (₹)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : "")}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* Auto Discount Badge preview */}
              {price && originalPrice && Number(originalPrice) > Number(price) && (
                <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-zinc-300 font-medium">Calculated Discount Badge:</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-white text-black">
                    {calcDiscount(Number(price), Number(originalPrice))}% OFF
                  </span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Available Sizes</label>
                <div className="flex flex-wrap gap-1.5">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((sz) => {
                    const active = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleSize(sz)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          active
                            ? "bg-white text-black"
                            : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Initial Stock</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl shadow-lg transition"
            >
              {saving ? "Saving Product..." : "Save Product Item"}
            </button>
          </form>
        </div>

        {/* Right: Products List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                Products Inventory ({products.length})
              </h3>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-zinc-500">Loading catalog...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">No products found.</div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((p) => {
                  const discount = calcDiscount(p.price, p.originalPrice);
                  const isOutOfStock = p.stock === 0;

                  return (
                    <div
                      key={p._id}
                      className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 hover:border-zinc-600 transition"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-12 h-14 rounded-lg bg-zinc-800 overflow-hidden shrink-0 relative border border-zinc-700">
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

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-xs font-black text-white">₹{p.price}</span>
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

                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isOutOfStock
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              }`}
                            >
                              {isOutOfStock ? "OUT OF STOCK" : `STOCK: ${p.stock}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
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
        </div>
      </div>
    </div>
  );
}
