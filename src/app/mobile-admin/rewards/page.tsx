"use client";

import React, { useState, useEffect } from "react";
import { Coins, Plus, Trash2, RefreshCw } from "lucide-react";

interface Reward {
  _id: string;
  name: string;
  imageUrl?: string;
  coinsRequired: number;
  sizes?: string[];
  stock: number;
}

export default function MobileRewardsManager() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [coinsRequired, setCoinsRequired] = useState<number>(500);
  const [stock, setStock] = useState<number>(20);
  const [saving, setSaving] = useState(false);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rewards", {
        headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" },
      });
      if (res.ok) {
        const data = await res.json();
        setRewards(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch rewards", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !coinsRequired) return;

    try {
      setSaving(true);
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-App-Secret": "okto_mobile_sec_2026_prod",
        },
        body: JSON.stringify({
          name,
          imageUrl:
            imageUrl ||
            "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&auto=format&fit=crop&q=80",
          coinsRequired: Number(coinsRequired),
          stock: Number(stock),
          sizes: ["Free Size"],
        }),
      });

      if (res.ok) {
        setName("");
        setImageUrl("");
        fetchRewards();
      }
    } catch (err) {
      console.error("Failed to create reward", err);
    } finally {
      setSaving(false);
    }
  };

  const deleteReward = async (id: string) => {
    try {
      const res = await fetch(`/api/rewards/${id}`, {
        method: "DELETE",
        headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" },
      });
      if (res.ok) {
        setRewards((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete reward", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161616] p-5 rounded-2xl border border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Oktocoins Rewards Catalog Manager</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Control redeemable clothing items in the mobile app rewards store and audit user coin balances.
          </p>
        </div>

        <button
          onClick={fetchRewards}
          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 flex items-center space-x-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Add Reward Item Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleCreateReward}
            className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 space-y-4 sticky top-20"
          >
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-zinc-800 pb-3">
              <Plus className="w-4 h-4 text-white" />
              <span>Add Redeemable Reward Item</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Reward Item Title</label>
                <input
                  type="text"
                  placeholder="e.g. Limited Edition Oktopus Cap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Coins Required</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={coinsRequired}
                    onChange={(e) => setCoinsRequired(Number(e.target.value))}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Reward Stock</label>
                  <input
                    type="number"
                    placeholder="20"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

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
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl shadow-lg transition"
            >
              {saving ? "Publishing Reward..." : "Publish Reward Item"}
            </button>
          </form>
        </div>

        {/* Right: Existing Rewards List */}
        <div className="lg:col-span-7">
          <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-3">
              Database Reward Items ({rewards.length})
            </h3>

            {loading ? (
              <div className="py-8 text-center text-xs text-zinc-500">Loading rewards from database...</div>
            ) : rewards.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">No reward items found in database.</div>
            ) : (
              <div className="space-y-3">
                {rewards.map((reward) => (
                  <div
                    key={reward._id}
                    className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 group hover:border-zinc-600 transition"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden shrink-0 relative border border-zinc-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            reward.imageUrl ||
                            "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&auto=format&fit=crop&q=80"
                          }
                          alt={reward.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{reward.name}</h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-xs font-black text-white flex items-center">
                            <Coins className="w-3.5 h-3.5 mr-1 text-zinc-400" />
                            {reward.coinsRequired} OKTOCOINS
                          </span>
                          <span className="text-[10px] text-zinc-400">Stock: {reward.stock}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteReward(reward._id)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
                      title="Delete Reward"
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
