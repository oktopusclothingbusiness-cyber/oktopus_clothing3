"use client";

import React, { useState, useEffect } from "react";
import { Palette, RefreshCw, DollarSign, Send } from "lucide-react";

interface CustomDesign {
  _id: string;
  userName: string;
  userEmail: string;
  garmentType: string;
  garmentColor: string;
  printArea: "Front" | "Back" | "Chest" | "Both Sides";
  artworkUrl: string;
  status: "pending" | "quoted" | "approved" | "rejected";
  quotePrice?: number;
  instructions?: string;
  createdAt: string;
}

export default function MobileCustomDesignsManager() {
  const [designs, setDesigns] = useState<CustomDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesign, setSelectedDesign] = useState<CustomDesign | null>(null);
  const [quotePrice, setQuotePrice] = useState<number | "">(899);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/custom-designs", {
        headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setDesigns(list);
        if (list.length > 0 && !selectedDesign) {
          setSelectedDesign(list[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch custom designs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const updateDesignQuote = async (status: "quoted" | "approved" | "rejected") => {
    if (!selectedDesign) return;
    try {
      const res = await fetch(`/api/custom-designs/${selectedDesign._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-App-Secret": "okto_mobile_sec_2026_prod",
        },
        body: JSON.stringify({
          status,
          quotePrice: Number(quotePrice),
        }),
      });

      if (res.ok) {
        setDesigns((prev) =>
          prev.map((d) =>
            d._id === selectedDesign._id ? { ...d, status, quotePrice: Number(quotePrice) } : d
          )
        );
        setSelectedDesign({ ...selectedDesign, status, quotePrice: Number(quotePrice) });
      }
    } catch (err) {
      console.error("Failed to update design status", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161616] p-5 rounded-2xl border border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Custom T-Shirt Design Submissions Review</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Review user-uploaded artwork from the mobile app Custom Studio, inspect print areas, and send price quotes.
          </p>
        </div>

        <button
          onClick={fetchDesigns}
          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 flex items-center space-x-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Design List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-3">
              Database Submissions ({designs.length})
            </h3>

            {loading ? (
              <div className="py-8 text-center text-xs text-zinc-500">Loading artwork queue...</div>
            ) : designs.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">No custom submissions in database.</div>
            ) : (
              <div className="space-y-2.5">
                {designs.map((d) => {
                  const isSelected = selectedDesign?._id === d._id;
                  return (
                    <div
                      key={d._id}
                      onClick={() => setSelectedDesign(d)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-zinc-800 border-white shadow-md"
                          : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={d.artworkUrl} alt="Artwork" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{d.userName}</h4>
                          <span className="text-[10px] text-zinc-400">
                            {d.garmentType} ({d.printArea})
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                          d.status === "approved"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : d.status === "quoted"
                            ? "bg-white/20 text-white border-white/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: High-Res Artwork Inspector & Quote Generator */}
        <div className="lg:col-span-7">
          {selectedDesign ? (
            <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-6 space-y-6 sticky top-20">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    High-Res Artwork Inspector
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Submitted by {selectedDesign.userName}
                  </h3>
                </div>

                <span className="text-xs font-mono text-zinc-400">
                  {new Date(selectedDesign.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>

              {/* High Res Mockup Box */}
              <div className="w-full h-64 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedDesign.artworkUrl}
                  alt="Custom Artwork"
                  className="max-h-full object-contain drop-shadow-2xl"
                />
                <div className="absolute bottom-3 left-3 bg-black/80 px-2.5 py-1 rounded-md text-[10px] font-mono text-white border border-zinc-700">
                  Print Area: {selectedDesign.printArea} | Color: {selectedDesign.garmentColor}
                </div>
              </div>

              {/* Quote Generator */}
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-white" />
                  <span>Send Custom Price Quote to User</span>
                </h4>

                <div className="flex space-x-3">
                  <input
                    type="number"
                    placeholder="Enter Quote Amount (₹)"
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(Number(e.target.value))}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white"
                  />

                  <button
                    onClick={() => updateDesignQuote("quoted")}
                    className="px-4 py-2 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Quote</span>
                  </button>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => updateDesignQuote("approved")}
                    className="flex-1 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold rounded-xl transition"
                  >
                    Approve for Printing
                  </button>
                  <button
                    onClick={() => updateDesignQuote("rejected")}
                    className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-xs font-bold rounded-xl transition"
                  >
                    Reject Submission
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-12 text-center text-xs text-zinc-500">
              Select artwork from queue to inspect.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
