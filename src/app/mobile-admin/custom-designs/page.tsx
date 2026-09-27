"use client";

import React, { useState, useEffect } from "react";
import { Palette, RefreshCw, DollarSign, Send, Download, Shirt, FileImage } from "lucide-react";

interface CustomDesign {
  _id: string;
  userName: string;
  userEmail?: string;
  designUrl: string; // Raw graphic file
  mockupUrl?: string; // Composite t-shirt placement snapshot
  placement?: {
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    rotation?: number;
    scaleInches?: number;
    printArea?: { width: number; height: number };
  };
  tshirtColor?: string;
  colorName?: string;
  selectedView?: string;
  tshirtSize?: string;
  fabricQuality?: string;
  printArea?: { width: number; height: number } | string;
  notes?: string;
  status: "pending" | "quoted" | "approved" | "rejected" | "paid";
  price?: number;
  quotePrice?: number;
  createdAt: string;
}

export default function MobileCustomDesignsManager() {
  const [designs, setDesigns] = useState<CustomDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesign, setSelectedDesign] = useState<CustomDesign | null>(null);
  const [quotePrice, setQuotePrice] = useState<number | "">(899);
  const [activeInspectorView, setActiveInspectorView] = useState<"mockup" | "artwork">("mockup");

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
          if (list[0].price) {
            setQuotePrice(list[0].price);
          }
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
          price: Number(quotePrice),
        }),
      });

      if (res.ok) {
        setDesigns((prev) =>
          prev.map((d) =>
            d._id === selectedDesign._id ? { ...d, status, price: Number(quotePrice) } : d
          )
        );
        setSelectedDesign({ ...selectedDesign, status, price: Number(quotePrice) });
      }
    } catch (err) {
      console.error("Failed to update design status", err);
    }
  };

  const getPlacement = (design: CustomDesign) => {
    const p = design.placement || (design as any).transform || {};
    return {
      xPercent: p.xPercent ?? 50,
      yPercent: p.yPercent ?? 38,
      widthPercent: p.widthPercent ?? 50,
      rotation: p.rotation ?? 0,
      scaleInches: p.scaleInches ?? 9.5,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161616] p-5 rounded-2xl border border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Custom T-Shirt Design Submissions</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Review user-placed garment mockups, inspect original graphic files, and approve price quotes.
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
              Submissions ({designs.length})
            </h3>

            {loading ? (
              <div className="py-8 text-center text-xs text-zinc-500">Loading requests...</div>
            ) : designs.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">No custom submissions in database.</div>
            ) : (
              <div className="space-y-2.5">
                {designs.map((d) => {
                  const isSelected = selectedDesign?._id === d._id;
                  const placement = getPlacement(d);
                  const tshirt = d.tshirtColor;

                  return (
                    <div
                      key={d._id}
                      onClick={() => {
                        setSelectedDesign(d);
                        if (d.price) setQuotePrice(d.price);
                      }}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-zinc-800 border-white shadow-md"
                          : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {/* Garment Mockup Thumbnail */}
                        <div className="w-12 h-12 rounded-lg bg-zinc-950 overflow-hidden shrink-0 border border-zinc-700 relative flex items-center justify-center">
                          {d.mockupUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={d.mockupUrl} alt="Mockup" className="w-full h-full object-contain" />
                          ) : (
                            <div className="relative w-full h-full">
                              {tshirt && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={tshirt} alt="Tee" className="w-full h-full object-contain" />
                              )}
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={d.designUrl}
                                alt="Art"
                                className="absolute object-contain"
                                style={{
                                  left: `${placement.xPercent}%`,
                                  top: `${placement.yPercent}%`,
                                  width: `${placement.widthPercent}%`,
                                  transform: "translate(-50%, -50%)",
                                }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{d.userName}</h4>
                          <span className="text-[10px] text-zinc-400 block truncate">
                            {d.colorName || "Garment"} • {d.selectedView || "Front"} ({d.tshirtSize || "M"})
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {d.fabricQuality || "Regular"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border block mb-1 ${
                            d.status === "approved" || d.status === "paid"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : d.status === "quoted"
                              ? "bg-white/20 text-white border-white/30"
                              : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {d.status}
                        </span>
                        {d.price ? (
                          <span className="text-xs font-mono font-bold text-white">₹{d.price}</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: High-Res Inspector */}
        <div className="lg:col-span-7">
          {selectedDesign ? (
            <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-6 space-y-6 sticky top-20">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Custom Atelier Specification
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {selectedDesign.userName}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveInspectorView("mockup")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition flex items-center space-x-1.5 ${
                      activeInspectorView === "mockup"
                        ? "bg-white text-black border-white"
                        : "bg-zinc-900 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    <Shirt className="w-3.5 h-3.5" />
                    <span>T-Shirt Mockup</span>
                  </button>
                  <button
                    onClick={() => setActiveInspectorView("artwork")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition flex items-center space-x-1.5 ${
                      activeInspectorView === "artwork"
                        ? "bg-white text-black border-white"
                        : "bg-zinc-900 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    <FileImage className="w-3.5 h-3.5" />
                    <span>Raw Artwork</span>
                  </button>
                </div>
              </div>

              {/* View 1: T-Shirt Mockup */}
              {activeInspectorView === "mockup" ? (
                <div className="space-y-3">
                  <div className="w-full h-80 bg-zinc-950 border border-zinc-800 rounded-2xl p-3 flex items-center justify-center relative overflow-hidden">
                    {selectedDesign.mockupUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedDesign.mockupUrl}
                        alt="T-Shirt Mockup"
                        className="max-h-full object-contain"
                      />
                    ) : (
                      <div className="relative h-full w-full flex items-center justify-center">
                        {selectedDesign.tshirtColor && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={selectedDesign.tshirtColor}
                            alt="Garment"
                            className="max-h-full object-contain"
                          />
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedDesign.designUrl}
                          alt="Placed Art"
                          className="absolute object-contain drop-shadow-md"
                          style={{
                            left: `${getPlacement(selectedDesign).xPercent}%`,
                            top: `${getPlacement(selectedDesign).yPercent}%`,
                            width: `${getPlacement(selectedDesign).widthPercent}%`,
                            transform: `translate(-50%, -50%) rotate(${getPlacement(selectedDesign).rotation || 0}deg)`,
                          }}
                        />
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white">
                      <span className="bg-black/80 px-2 py-1 rounded border border-zinc-700">
                        {selectedDesign.colorName || "Garment"} • {selectedDesign.selectedView || "Front"}
                      </span>
                      <span className="bg-black/80 px-2 py-1 rounded border border-zinc-700 text-[#EAFF9F]">
                        X: {getPlacement(selectedDesign).xPercent}% | Y: {getPlacement(selectedDesign).yPercent}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block">Fabric Grade</span>
                      <span className="font-bold text-white">{selectedDesign.fabricQuality || "Regular"}</span>
                    </div>
                    <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block">Size</span>
                      <span className="font-bold font-mono text-white">{selectedDesign.tshirtSize || "M"}</span>
                    </div>
                    <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block">Print Scale</span>
                      <span className="font-bold font-mono text-[#EAFF9F]">
                        {typeof selectedDesign.printArea === "object" && selectedDesign.printArea
                          ? `${selectedDesign.printArea.width}" × ${selectedDesign.printArea.height}"`
                          : "Standard"}
                      </span>
                    </div>
                  </div>

                  {selectedDesign.notes && (
                    <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 text-xs">
                      <span className="text-[10px] text-zinc-500 uppercase block font-semibold mb-1">
                        Customer Placement Notes:
                      </span>
                      <p className="text-zinc-300 italic">&ldquo;{selectedDesign.notes}&rdquo;</p>
                    </div>
                  )}
                </div>
              ) : (
                /* View 2: Raw High-Res Artwork File */
                <div className="space-y-4">
                  <div className="w-full h-80 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex items-center justify-center relative overflow-hidden bg-[repeating-conic-gradient(#1a1a1a_0%_25%,#111111_0%_50%)] bg-[length:20px_20px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedDesign.designUrl}
                      alt="Raw Artwork Graphic"
                      className="max-h-full object-contain drop-shadow-2xl"
                    />
                  </div>

                  <a
                    href={selectedDesign.designUrl}
                    download={`customer-artwork-${selectedDesign._id}.png`}
                    className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl border border-zinc-700 transition flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Original Graphic File</span>
                  </a>
                </div>
              )}

              {/* Quote Generator */}
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-white" />
                  <span>Configure Price Quote</span>
                </h4>

                <div className="flex space-x-3">
                  <input
                    type="number"
                    placeholder="Enter Price (₹)"
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(Number(e.target.value))}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
                  />

                  <button
                    onClick={() => updateDesignQuote("approved")}
                    className="px-4 py-2 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Set & Approve</span>
                  </button>
                </div>

                <div className="flex space-x-2 pt-1">
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
                    Reject Request
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
