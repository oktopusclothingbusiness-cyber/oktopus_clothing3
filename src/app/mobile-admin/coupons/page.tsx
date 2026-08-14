"use client";

import React, { useState, useEffect } from "react";
import { Ticket, Plus, Trash2, RefreshCw, Smartphone } from "lucide-react";

interface MobileCoupon {
  _id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountCap?: number;
  userType: "all_app_users" | "first_app_order";
  isActive: boolean;
  expiryDate?: string;
}

export default function MobileCouponsManager() {
  const [coupons, setCoupons] = useState<MobileCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("flat");
  const [discountValue, setDiscountValue] = useState<number>(300);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(999);
  const [maxDiscountCap, setMaxDiscountCap] = useState<number>(500);
  const [userType, setUserType] = useState<"all_app_users" | "first_app_order">("first_app_order");
  const [saving, setSaving] = useState(false);

  const fetchMobileCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/mobile/coupons", {
        headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" },
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch mobile coupons", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMobileCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;

    try {
      setSaving(true);
      const res = await fetch("/api/mobile/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-App-Secret": "okto_mobile_sec_2026_prod",
        },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          discountType,
          discountValue: Number(discountValue),
          minOrderAmount: Number(minOrderAmount),
          maxDiscountCap: Number(maxDiscountCap),
          userType,
          isActive: true,
        }),
      });

      if (res.ok) {
        setCode("");
        fetchMobileCoupons();
      }
    } catch (err) {
      console.error("Failed to create mobile coupon", err);
    } finally {
      setSaving(false);
    }
  };

  const toggleCouponStatus = async (coupon: MobileCoupon) => {
    try {
      const res = await fetch(`/api/mobile/coupons/${coupon._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-App-Secret": "okto_mobile_sec_2026_prod",
        },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c._id === coupon._id ? { ...c, isActive: !c.isActive } : c))
        );
      }
    } catch (err) {
      console.error("Failed to toggle mobile coupon", err);
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      const res = await fetch(`/api/mobile/coupons/${id}`, {
        method: "DELETE",
        headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" },
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete mobile coupon", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161616] p-5 rounded-2xl border border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <Ticket className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Mobile-Exclusive Coupons Engine</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Publish app-exclusive promo codes (App First-Order Discounts, Flat ₹ Off, App-Only Deals).
          </p>
        </div>

        <button
          onClick={fetchMobileCoupons}
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
            onSubmit={handleCreateCoupon}
            className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 space-y-4 sticky top-20"
          >
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-zinc-800 pb-3">
              <Plus className="w-4 h-4 text-white" />
              <span>Create Mobile App Coupon</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. APPFIRST300 or OKTOAPP20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-white uppercase placeholder-zinc-500 focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                  >
                    <option value="flat">Flat Amount (₹ Off)</option>
                    <option value="percentage">Percentage (% OFF)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    {discountType === "flat" ? "Flat Value (₹)" : "Percentage (%)"}
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Target User Rule</label>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                >
                  <option value="first_app_order">First App Order Only (e.g. APPFIRST300)</option>
                  <option value="all_app_users">All Mobile App Users</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={maxDiscountCap}
                    onChange={(e) => setMaxDiscountCap(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl shadow-lg transition"
            >
              {saving ? "Publishing..." : "Publish Mobile Coupon"}
            </button>
          </form>
        </div>

        {/* Coupon List */}
        <div className="lg:col-span-7">
          <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-3">
              Mobile App Exclusive Coupons ({coupons.length})
            </h3>

            {loading ? (
              <div className="py-8 text-center text-xs text-zinc-500">Loading mobile coupons...</div>
            ) : coupons.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">No app-exclusive coupons found in database.</div>
            ) : (
              <div className="space-y-3">
                {coupons.map((c) => (
                  <div
                    key={c._id}
                    className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 hover:border-zinc-600 transition"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-zinc-800 text-white border border-zinc-700 shrink-0">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-mono font-bold text-white tracking-wider">
                            {c.code}
                          </h4>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                            {c.userType === "first_app_order" ? "FIRST APP ORDER" : "ALL APP USERS"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-zinc-400">
                          <span className="text-white font-bold">
                            {c.discountType === "flat" ? `₹${c.discountValue} OFF` : `${c.discountValue}% OFF`}
                          </span>
                          {c.minOrderAmount ? <span>| Min: ₹{c.minOrderAmount}</span> : null}
                          {c.maxDiscountCap ? <span>| Cap: ₹{c.maxDiscountCap}</span> : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => toggleCouponStatus(c)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                          c.isActive
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {c.isActive ? "ACTIVE" : "DISABLED"}
                      </button>

                      <button
                        onClick={() => deleteCoupon(c._id)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
                        title="Delete Coupon"
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
      </div>
    </div>
  );
}
