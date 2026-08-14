"use client";

import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Smartphone,
  RefreshCw
} from "lucide-react";

interface Banner {
  _id: string;
  imageUrl: string;
  title: string;
  targetRoute: string;
  isActive: boolean;
  order: number;
}

export default function MobileBannersManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New Banner Form State
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetRoute, setTargetRoute] = useState("/category/oversized-tshirts");
  const [isActive, setIsActive] = useState(true);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/promotions", {
        headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" },
      });
      if (res.ok) {
        const data = await res.json();
        setBanners(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch banners", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    try {
      setSaving(true);
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-App-Secret": "okto_mobile_sec_2026_prod",
        },
        body: JSON.stringify({
          title,
          imageUrl,
          targetRoute,
          isActive,
          order: banners.length + 1,
        }),
      });

      if (res.ok) {
        setTitle("");
        setImageUrl("");
        fetchBanners();
      }
    } catch (err) {
      console.error("Failed to create banner", err);
    } finally {
      setSaving(false);
    }
  };

  const toggleBannerStatus = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/promotions/${banner._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-App-Secret": "okto_mobile_sec_2026_prod",
        },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      if (res.ok) {
        setBanners((prev) =>
          prev.map((b) => (b._id === banner._id ? { ...b, isActive: !b.isActive } : b))
        );
      }
    } catch (err) {
      console.error("Failed to toggle banner status", err);
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: "DELETE",
        headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" },
      });
      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete banner", err);
    }
  };

  const activeBanners = banners.filter((b) => b.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161616] p-5 rounded-2xl border border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Mobile Hero Banner Carousel</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Upload 16:9 banners (350x180 mobile aspect ratio) and set target deep links for the mobile app home screen.
          </p>
        </div>

        <button
          onClick={fetchBanners}
          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 flex items-center space-x-2 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Existing Banners List */}
        <div className="lg:col-span-7 space-y-6">
          {/* Form */}
          <form
            onSubmit={handleCreateBanner}
            className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 space-y-4"
          >
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-zinc-800 pb-3">
              <Plus className="w-4 h-4 text-white" />
              <span>Add New Mobile Banner</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Banner Title / Campaign Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Summer Oversized Streetwear Sale"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Banner Image URL (16:9 Ratio - 350x180)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or https://oktopusclothing.in/uploads/banner.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Deep-Link Target Route
                  </label>
                  <select
                    value={targetRoute}
                    onChange={(e) => setTargetRoute(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white"
                  >
                    <option value="/category/oversized-tshirts">/category/oversized-tshirts</option>
                    <option value="/category/hoodies">/category/hoodies</option>
                    <option value="/product/featured">/product/featured</option>
                    <option value="/rewards">/rewards (Oktocoins Store)</option>
                    <option value="/custom-design">/custom-design (Studio)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3 pt-5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-700 text-white focus:ring-white bg-zinc-900"
                    />
                    <span>Publish Immediately</span>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl shadow-lg transition"
            >
              {saving ? "Publishing Banner..." : "Publish Mobile Banner"}
            </button>
          </form>

          {/* Active Banners List */}
          <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-zinc-800 pb-3">
              <span>Database App Banners ({banners.length})</span>
              <span className="text-xs text-emerald-400 font-medium">
                {activeBanners.length} Active on App
              </span>
            </h3>

            {loading ? (
              <div className="py-8 text-center text-xs text-zinc-500">Loading mobile banners...</div>
            ) : banners.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">No banners found in database. Add one above!</div>
            ) : (
              <div className="space-y-3">
                {banners.map((banner) => (
                  <div
                    key={banner._id}
                    className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 group hover:border-zinc-600 transition"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-20 h-12 rounded-lg bg-zinc-800 overflow-hidden shrink-0 relative border border-zinc-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{banner.title}</h4>
                        <span className="text-[10px] text-zinc-400 font-mono block truncate">
                          {banner.targetRoute}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => toggleBannerStatus(banner)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                          banner.isActive
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {banner.isActive ? "ACTIVE" : "INACTIVE"}
                      </button>

                      <button
                        onClick={() => deleteBanner(banner._id)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Mobile App Frame Simulator */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[340px] bg-black rounded-[40px] border-4 border-zinc-800 p-4 shadow-2xl relative overflow-hidden space-y-4">
            {/* Mobile Notch */}
            <div className="w-32 h-4 bg-zinc-900 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
            </div>

            {/* Mobile Header Mock */}
            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-xs font-black text-white font-mono tracking-wider">
                OKTO<span className="text-zinc-400">PUS</span>
              </span>
              <span className="text-[10px] text-zinc-500">Live App Screen</span>
            </div>

            {/* Mobile Hero Carousel Frame */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] px-1">
                <span className="text-zinc-400 font-medium">Hero Banner Carousel</span>
                <span className="text-zinc-300 text-[10px] font-bold">16:9 Aspect</span>
              </div>

              <div className="w-full h-[160px] rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden relative group">
                {activeBanners.length > 0 ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeBanners[0].imageUrl}
                      alt={activeBanners[0].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                      <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                        Featured Banner
                      </span>
                      <h5 className="text-xs font-black text-white leading-tight">
                        {activeBanners[0].title}
                      </h5>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 space-y-2">
                    <Smartphone className="w-8 h-8" />
                    <span className="text-xs text-zinc-500">No active banner in database</span>
                  </div>
                )}
              </div>
            </div>

            <div className="w-24 h-1 bg-zinc-700 rounded-full mx-auto mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
