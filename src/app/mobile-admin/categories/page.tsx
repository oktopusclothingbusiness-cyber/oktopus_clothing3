"use client";

import React, { useState, useEffect } from "react";
import { Layers, Plus, Trash2, RefreshCw } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  imageUrl?: string;
  gender?: "Men" | "Women" | "Unisex";
  colorToken?: string;
}

export default function MobileCategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [gender, setGender] = useState<"Men" | "Women" | "Unisex">("Unisex");
  const [colorToken, setColorToken] = useState("#FFFFFF");
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

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      setSaving(true);
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-App-Secret": "okto_mobile_sec_2026_prod",
        },
        body: JSON.stringify({
          name,
          imageUrl:
            imageUrl ||
            "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=300&auto=format&fit=crop&q=80",
          gender,
          colorToken,
        }),
      });

      if (res.ok) {
        setName("");
        setImageUrl("");
        fetchCategories();
      }
    } catch (err) {
      console.error("Failed to create category", err);
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" },
      });
      if (res.ok) {
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
            <h2 className="text-xl font-bold text-white">App Categories & Gender Tagging</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manage circular category chips and Men/Women/Unisex filtering tags for the mobile app home screen.
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
            onSubmit={handleCreateCategory}
            className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 space-y-4 sticky top-20"
          >
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-zinc-800 pb-3">
              <Plus className="w-4 h-4 text-white" />
              <span>Create Category Chip</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Oversized Tees, Hoodies, Cargo Pants"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Circular Avatar Icon URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Gender Association</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Color Token</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={colorToken}
                      onChange={(e) => setColorToken(e.target.value)}
                      className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-zinc-400">{colorToken}</span>
                  </div>
                </div>
              </div>

              {/* Circular Preview Container */}
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-full border-2 p-0.5 shrink-0 overflow-hidden shadow-md"
                  style={{ borderColor: colorToken }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      imageUrl ||
                      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=300&auto=format&fit=crop&q=80"
                    }
                    alt="Preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Mobile App Circle Icon Preview
                  </span>
                  <p className="text-xs font-bold text-white">{name || "Category Name"}</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl shadow-lg transition"
            >
              {saving ? "Saving Category..." : "Save Category Chip"}
            </button>
          </form>
        </div>

        {/* Existing Categories List */}
        <div className="lg:col-span-7">
          <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-3">
              Database App Categories ({categories.length})
            </h3>

            {loading ? (
              <div className="py-8 text-center text-xs text-zinc-500">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">No categories found in database.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 group hover:border-zinc-600 transition"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full border-2 p-0.5 shrink-0 overflow-hidden"
                        style={{ borderColor: cat.colorToken || "#FFFFFF" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            cat.imageUrl ||
                            "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=300&auto=format&fit=crop&q=80"
                          }
                          alt={cat.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{cat.name}</h4>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-zinc-800 text-zinc-300 mt-0.5">
                          {cat.gender || "Unisex"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteCategory(cat._id)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
