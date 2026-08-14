"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Smartphone,
  Image as ImageIcon,
  ShoppingBag,
  Truck,
  Coins,
  Palette,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  Ticket,
  Layers
} from "lucide-react";

export default function MobileAdminDashboard() {
  const [stats, setStats] = useState({
    activeBanners: 0,
    totalProducts: 0,
    pendingOrders: 0,
    totalRewards: 0,
    customDesigns: 0,
    totalCategories: 0,
    activeCoupons: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchDatabaseMetrics = async () => {
    try {
      setLoading(true);
      const [bannersRes, productsRes, ordersRes, rewardsRes, designsRes, categoriesRes, couponsRes] =
        await Promise.allSettled([
          fetch("/api/promotions", { headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" } }),
          fetch("/api/products", { headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" } }),
          fetch("/api/orders", { headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" } }),
          fetch("/api/rewards", { headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" } }),
          fetch("/api/custom-designs", { headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" } }),
          fetch("/api/categories", { headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" } }),
          fetch("/api/coupons", { headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" } }),
        ]);

      let activeBanners = 0;
      if (bannersRes.status === "fulfilled" && bannersRes.value.ok) {
        const banners = await bannersRes.value.json();
        activeBanners = Array.isArray(banners) ? banners.filter((b: any) => b.isActive).length : 0;
      }

      let totalProducts = 0;
      if (productsRes.status === "fulfilled" && productsRes.value.ok) {
        const products = await productsRes.value.json();
        totalProducts = Array.isArray(products) ? products.length : 0;
      }

      let pendingOrders = 0;
      if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
        const orders = await ordersRes.value.json();
        pendingOrders = Array.isArray(orders)
          ? orders.filter((o: any) => o.status === "pending" || o.status === "processing").length
          : 0;
      }

      let totalRewards = 0;
      if (rewardsRes.status === "fulfilled" && rewardsRes.value.ok) {
        const rewards = await rewardsRes.value.json();
        totalRewards = Array.isArray(rewards) ? rewards.length : 0;
      }

      let customDesigns = 0;
      if (designsRes.status === "fulfilled" && designsRes.value.ok) {
        const designs = await designsRes.value.json();
        customDesigns = Array.isArray(designs) ? designs.length : 0;
      }

      let totalCategories = 0;
      if (categoriesRes.status === "fulfilled" && categoriesRes.value.ok) {
        const categories = await categoriesRes.value.json();
        totalCategories = Array.isArray(categories) ? categories.length : 0;
      }

      let activeCoupons = 0;
      if (couponsRes.status === "fulfilled" && couponsRes.value.ok) {
        const coupons = await couponsRes.value.json();
        activeCoupons = Array.isArray(coupons) ? coupons.filter((c: any) => c.isActive).length : 0;
      }

      setStats({
        activeBanners,
        totalProducts,
        pendingOrders,
        totalRewards,
        customDesigns,
        totalCategories,
        activeCoupons,
      });
    } catch (err) {
      console.error("Failed to fetch database metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                DATABASE LIVE SYNC
              </span>
              <span className="text-xs text-zinc-400">100% Real MongoDB Collections</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-2 tracking-tight">
              Oktopus Mobile App Control Center
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              Live management portal for mobile hero banners, product catalog, orders pipeline, Oktocoins rewards, custom design queue, and coupons.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={fetchDatabaseMetrics}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition border border-zinc-700 flex items-center space-x-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Metrics</span>
            </button>
            <Link
              href="/mobile-admin/banners"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition shadow-lg flex items-center space-x-2"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Manage Banners</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Database Stat Cards Grid (NO MOCK DATA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Banners */}
        <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              16:9 Hero Banners
            </span>
            <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white flex items-center justify-center group-hover:scale-110 transition">
              <ImageIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">
              {loading ? "..." : stats.activeBanners}
            </span>
            <span className="text-xs text-emerald-400 flex items-center font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Live Database
            </span>
          </div>
          <Link
            href="/mobile-admin/banners"
            className="mt-4 text-xs font-semibold text-white hover:underline flex items-center space-x-1"
          >
            <span>Open Carousel Manager</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Pending Orders */}
        <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Pending Orders
            </span>
            <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white flex items-center justify-center group-hover:scale-110 transition">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">
              {loading ? "..." : stats.pendingOrders}
            </span>
            <span className="text-xs text-blue-400 font-medium">Fulfillment Queue</span>
          </div>
          <Link
            href="/mobile-admin/orders"
            className="mt-4 text-xs font-semibold text-white hover:underline flex items-center space-x-1"
          >
            <span>Fulfillment Pipeline</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Total Products */}
        <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Product Inventory
            </span>
            <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white flex items-center justify-center group-hover:scale-110 transition">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">
              {loading ? "..." : stats.totalProducts}
            </span>
            <span className="text-xs text-zinc-400 font-medium">Items in DB</span>
          </div>
          <Link
            href="/mobile-admin/products"
            className="mt-4 text-xs font-semibold text-white hover:underline flex items-center space-x-1"
          >
            <span>Manage Catalog</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Custom Submissions */}
        <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Custom Submissions
            </span>
            <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white flex items-center justify-center group-hover:scale-110 transition">
              <Palette className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">
              {loading ? "..." : stats.customDesigns}
            </span>
            <span className="text-xs text-purple-400 font-medium">Review Queue</span>
          </div>
          <Link
            href="/mobile-admin/custom-designs"
            className="mt-4 text-xs font-semibold text-white hover:underline flex items-center space-x-1"
          >
            <span>Artwork Inspector</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Management Modules Quick Launch */}
      <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-white" />
            <span>App Management Modules (Direct Real Database Access)</span>
          </h3>
          <span className="text-xs text-zinc-400">Live API Endpoint</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/mobile-admin/banners"
            className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-white transition flex items-start space-x-3 group"
          >
            <div className="p-2.5 rounded-lg bg-zinc-800 text-white group-hover:bg-white group-hover:text-black transition">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">1. Hero Banners & Carousel</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Drag-and-drop 16:9 uploader with mobile live preview and deep-link routing.
              </p>
            </div>
          </Link>

          <Link
            href="/mobile-admin/categories"
            className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-white transition flex items-start space-x-3 group"
          >
            <div className="p-2.5 rounded-lg bg-zinc-800 text-white group-hover:bg-white group-hover:text-black transition">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">2. Categories & Gender Tags</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Circular avatar icons, Men/Women filtering tags, and accent color pickers ({stats.totalCategories} active).
              </p>
            </div>
          </Link>

          <Link
            href="/mobile-admin/products"
            className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-white transition flex items-start space-x-3 group"
          >
            <div className="p-2.5 rounded-lg bg-zinc-800 text-white group-hover:bg-white group-hover:text-black transition">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">3. Product Catalog & Stock</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Multi-image gallery manager, auto % discount calculator, and size/color matrix.
              </p>
            </div>
          </Link>

          <Link
            href="/mobile-admin/orders"
            className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-white transition flex items-start space-x-3 group"
          >
            <div className="p-2.5 rounded-lg bg-zinc-800 text-white group-hover:bg-white group-hover:text-black transition">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">4. Mobile Orders Pipeline</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Status pipeline (Pending → Delivered), GPS location data, and Razorpay badges.
              </p>
            </div>
          </Link>

          <Link
            href="/mobile-admin/rewards"
            className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-white transition flex items-start space-x-3 group"
          >
            <div className="p-2.5 rounded-lg bg-zinc-800 text-white group-hover:bg-white group-hover:text-black transition">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">5. Oktocoins Rewards Store</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Set coin prices, audit user balances, and approve clothing redemptions ({stats.totalRewards} items).
              </p>
            </div>
          </Link>

          <Link
            href="/mobile-admin/custom-designs"
            className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-white transition flex items-start space-x-3 group"
          >
            <div className="p-2.5 rounded-lg bg-zinc-800 text-white group-hover:bg-white group-hover:text-black transition">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">6. Custom Design Review</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                High-res artwork viewer, front/back placement check, and price quote generator.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
