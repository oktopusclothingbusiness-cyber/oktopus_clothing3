"use client";

import React, { useState, useEffect } from "react";
import { Layers, Plus, Trash2, RefreshCw, Sparkles, Edit, X, Image as ImageIcon } from "lucide-react";

interface FeaturedProduct {
  id: string;
  name: string;
  image_url: string;
  price: string;
}

interface Category {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  square_image_url?: string;
  landscape_image_url?: string;
  hero_image_url?: string;
  imageUrl?: string;
  icon_name?: string;
  item_count?: number;
  accent_color?: string;
  colorToken?: string;
  bg_tint?: string;
  gender?: "Men" | "Women" | "Unisex";
  featured_products?: FeaturedProduct[];
}

export default function MobileCategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Mode State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [squareImageUrl, setSquareImageUrl] = useState("");
  const [landscapeImageUrl, setLandscapeImageUrl] = useState("");
  const [iconName, setIconName] = useState("shirt");
  const [accentColor, setAccentColor] = useState("#D4A02E");
  const [bgTint, setBgTint] = useState("#FAF6E8");
  const [gender, setGender] = useState<"Men" | "Women" | "Unisex">("Unisex");
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories", {
        headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat._id);
    setName(cat.name || "");
    setDescription(cat.description || "");
    setSquareImageUrl(cat.square_image_url || cat.imageUrl || "");
    setLandscapeImageUrl(cat.landscape_image_url || cat.hero_image_url || "");
    setIconName(cat.icon_name || "shirt");
    setAccentColor(cat.accent_color || cat.colorToken || "#D4A02E");
    setBgTint(cat.bg_tint || "#FAF6E8");
    setGender(cat.gender || "Unisex");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setSquareImageUrl("");
    setLandscapeImageUrl("");
    setIconName("shirt");
    setAccentColor("#D4A02E");
    setBgTint("#FAF6E8");
    setGender("Unisex");
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      setSaving(true);
      const sqImg = squareImageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500";
      const landImg = landscapeImageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000";

      const payload = {
        name,
        description: description || `Premium ${name} collection for streetwear fits.`,
        square_image_url: sqImg,
        landscape_image_url: landImg,
        imageUrl: sqImg,
        hero_image_url: landImg,
        icon_name: iconName || "shirt",
        accent_color: accentColor || "#D4A02E",
        colorToken: accentColor || "#D4A02E",
        bg_tint: bgTint || "#FAF6E8",
        gender,
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/categories/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-App-Secret": "okto_mobile_sec_2026_prod",
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-App-Secret": "okto_mobile_sec_2026_prod",
          },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        handleCancelEdit();
        fetchCategories();
      }
    } catch (err) {
      console.error("Failed to save category", err);
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" },
      });
      if (res.ok) {
        if (editingId === id) handleCancelEdit();
        setCategories((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete category", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161616] p-5 rounded-2xl border border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Category Dual-Image & Layout Manager</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Configure <code className="text-amber-400 font-mono">square_image_url</code> (1:1 for small panels/chips) and <code className="text-amber-400 font-mono">landscape_image_url</code> (16:9 for big hero cards).
          </p>
        </div>

        <button
          onClick={fetchCategories}
          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 flex items-center space-x-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSaveCategory}
            className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 space-y-4 sticky top-20 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                {editingId ? (
                  <Edit className="w-4 h-4 text-amber-400" />
                ) : (
                  <Plus className="w-4 h-4 text-amber-400" />
                )}
                <span>{editingId ? "Edit Category Dual Images" : "Create New Dual-Image Category"}</span>
              </h3>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-zinc-400 hover:text-white flex items-center space-x-1 bg-zinc-800 px-2 py-1 rounded-lg"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Category Title (`name`)</label>
                <input
                  type="text"
                  placeholder="e.g. French Terry, Oversized Tees, Hoodies"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Subtitle / Fit Description (`description`)</label>
                <textarea
                  placeholder="e.g. Premium 400 GSM heavy loopback cotton engineered for relaxed streetwear fits."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 1. Square Image (1:1) */}
              <div>
                <label className="text-xs font-semibold text-amber-400 block mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> 🔳 Square Image URL (`square_image_url` - 1:1 for Small Panels)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-... (Square 500x500)"
                  value={squareImageUrl}
                  onChange={(e) => setSquareImageUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 2. Landscape Image (16:9) */}
              <div>
                <label className="text-xs font-semibold text-amber-400 block mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> 🖼️ Landscape Image URL (`landscape_image_url` - 16:9 for Big Hero Panels)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-... (Landscape 1000x562)"
                  value={landscapeImageUrl}
                  onChange={(e) => setLandscapeImageUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Icon Identifier (`icon_name`)</label>
                  <select
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="shirt">shirt (Tees / Terry)</option>
                    <option value="square">square (Oversized)</option>
                    <option value="layers">layers (Sweatshirts)</option>
                    <option value="zap">zap (Hoodies)</option>
                    <option value="box">box (Cargo Pants)</option>
                    <option value="tag">tag (Women / Accessories)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Gender Tag</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Accent Highlight (`accent_color`)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-zinc-400">{accentColor}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Background Tint (`bg_tint`)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={bgTint}
                      onChange={(e) => setBgTint(e.target.value)}
                      className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-zinc-400">{bgTint}</span>
                  </div>
                </div>
              </div>

              {/* Fan-Out Card & Circle Preview */}
              <div
                className="p-4 border rounded-xl space-y-3 transition shadow-md"
                style={{ backgroundColor: bgTint, borderColor: accentColor }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-black/70 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Dual Image Live Preview
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black text-white">
                    {iconName}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Small Square 1:1 Chip */}
                  <div className="w-12 h-12 rounded-full border-2 p-0.5 shrink-0 overflow-hidden bg-black/10 border-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={squareImageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"}
                      alt="Square 1:1"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-black/60 uppercase">Small Circle/Square (1:1)</span>
                    <h4 className="text-sm font-extrabold text-black">{name || "French Terry"}</h4>
                  </div>
                </div>

                {/* Big Landscape 16:9 Hero Cover */}
                <div className="w-full h-24 rounded-lg overflow-hidden border border-black/20 relative bg-black/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={landscapeImageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000"}
                    alt="Landscape 16:9"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 p-2 flex items-end">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                      Big Hero Panel (16:9 Landscape)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-xl shadow-lg transition"
              >
                {saving ? "Saving Category..." : editingId ? "Update Category Images" : "Save New Category"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Categories List */}
        <div className="lg:col-span-7">
          <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-3 flex items-center justify-between">
              <span>Database App Categories ({categories.length})</span>
              <span className="text-xs font-mono text-amber-400">GET /api/categories</span>
            </h3>

            {loading ? (
              <div className="py-8 text-center text-xs text-zinc-500">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">No categories found in database.</div>
            ) : (
              <div className="space-y-3">
                {categories.map((cat) => {
                  const isBeingEdited = editingId === cat._id;
                  const sq = cat.square_image_url || cat.imageUrl;
                  const land = cat.landscape_image_url || cat.hero_image_url;
                  return (
                    <div
                      key={cat._id}
                      className={`p-4 bg-zinc-900 border rounded-xl flex flex-col space-y-3 transition ${
                        isBeingEdited ? "border-amber-400 bg-amber-400/5" : "border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-3 min-w-0">
                          {/* Square 1:1 Small Thumbnail */}
                          <div
                            className="w-10 h-10 rounded-full border-2 p-0.5 shrink-0 overflow-hidden"
                            style={{ borderColor: cat.accent_color || cat.colorToken || "#D4A02E" }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={sq || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300"}
                              alt={cat.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-bold text-white truncate">{cat.name}</h4>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-amber-400/20">
                                {cat.icon_name || "shirt"}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 line-clamp-1">
                              {cat.description || "Premium streetwear collection."}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleStartEdit(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${
                              isBeingEdited
                                ? "bg-amber-400 text-black"
                                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                            }`}
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>{isBeingEdited ? "Editing" : "Edit"}</span>
                          </button>

                          <button
                            onClick={() => deleteCategory(cat._id)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Dual Image Preview Strip */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400">
                        <div className="flex items-center space-x-2 bg-zinc-950 p-2 rounded-lg border border-zinc-800/60">
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-zinc-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={sq || ""} alt="Square" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-zinc-300 block">Square (1:1 Small)</span>
                            <span className="truncate block font-mono text-[9px] text-zinc-500">{sq}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 bg-zinc-950 p-2 rounded-lg border border-zinc-800/60">
                          <div className="w-10 h-6 rounded-md overflow-hidden shrink-0 border border-zinc-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={land || ""} alt="Landscape" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-zinc-300 block">Landscape (16:9 Hero)</span>
                            <span className="truncate block font-mono text-[9px] text-zinc-500">{land}</span>
                          </div>
                        </div>
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
