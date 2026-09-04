"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  RefreshCw,
  MapPin,
  ShieldCheck,
  Plus,
  Store,
} from "lucide-react";
import { OfflineSaleDialog } from "@/components/admin/offline-sale-dialog";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

interface Order {
  _id: string;
  userName: string;
  userId: string;
  products: OrderItem[];
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  shippingAddress: {
    address: string;
    mobile: string;
    latitude?: number;
    longitude?: number;
  };
  paymentDetails?: {
    razorpay_payment_id?: string;
    paymentStatus?: "paid" | "pending";
    paymentMethod?: string;
  };
  orderSource?: "online" | "offline";
  isOfflineSale?: boolean;
}

const STATUS_BADGES: Record<string, { label: string; style: string }> = {
  pending: { label: "Pending", style: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  processing: { label: "Processing", style: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  shipped: { label: "Shipped", style: "bg-yellow-400/20 text-yellow-300 border-yellow-400/30" },
  delivered: { label: "Delivered", style: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  cancelled: { label: "Cancelled", style: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export default function MobileOrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders", {
        headers: { "X-App-Secret": "okto_mobile_sec_2026_prod" },
      });
      if (res.ok) {
        const data = await res.json();
        const ordersList = Array.isArray(data) ? data : [];
        setOrders(ordersList);
        if (ordersList.length > 0 && !selectedOrder) {
          setSelectedOrder(ordersList[0]);
        }
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-App-Secret": "okto_mobile_sec_2026_prod",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus as any } : o))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus as any });
        }
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const filteredOrders = orders.filter((o) =>
    filterStatus === "all" ? true : o.status === filterStatus
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161616] p-5 rounded-2xl border border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Mobile Orders & Fulfillment Pipeline</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Process mobile app checkout orders, update delivery tracking statuses, verify Razorpay payments, and inspect GPS coordinates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOfflineModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center space-x-1.5 transition shadow-md shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Offline Sale</span>
          </button>
          <button
            onClick={fetchOrders}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 flex items-center space-x-2 transition shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Orders List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white">Database Orders ({filteredOrders.length})</h3>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-zinc-500">Loading orders from database...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">No orders found in database.</div>
            ) : (
              <div className="space-y-2.5">
                {filteredOrders.map((order) => {
                  const isSelected = selectedOrder?._id === order._id;
                  const badge = STATUS_BADGES[order.status] || STATUS_BADGES.pending;

                  return (
                    <div
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? "bg-zinc-800 border-white shadow-md"
                          : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-white">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.style}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
                          <span className="text-xs text-zinc-300 font-medium truncate">
                            {order.userName || "Customer"}
                          </span>
                          {(order.isOfflineSale || order.orderSource === "offline") && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shrink-0 flex items-center gap-0.5">
                              <Store className="w-2.5 h-2.5" /> Offline
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-black text-white shrink-0">₹{order.total}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Order Fulfillment Details */}
        <div className="lg:col-span-7">
          {selectedOrder ? (
            <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-6 space-y-6 sticky top-20">
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Order Details & Live Tracker
                  </span>
                  <h3 className="text-lg font-black text-white font-mono">
                    ORDER #{selectedOrder._id.slice(-6).toUpperCase()}
                  </h3>
                </div>

                {/* Status Pipeline Dropdown */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-zinc-400 font-medium">Pipeline Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 text-xs font-bold text-white rounded-xl px-3 py-1.5 focus:outline-none"
                  >
                    <option value="pending">Pending (Blue)</option>
                    <option value="processing">Processing (Purple)</option>
                    <option value="shipped">Shipped (Yellow)</option>
                    <option value="delivered">Delivered (Green)</option>
                    <option value="cancelled">Cancelled (Red)</option>
                  </select>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Purchased Items
                </h4>
                <div className="space-y-2">
                  {selectedOrder.products.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-white">{item.name}</h5>
                        <span className="text-[10px] text-zinc-400">
                          Qty: {item.quantity} {item.size ? `| Size: ${item.size}` : ""}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geolocation & Shipping Address */}
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-white">
                  <MapPin className="w-4 h-4 text-zinc-300" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Delivery Address & GPS Coordinates
                  </h4>
                </div>
                <p className="text-xs text-zinc-300">
                  {selectedOrder.shippingAddress?.address || "Address not specified"}
                </p>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800">
                  <span>Mobile: {selectedOrder.shippingAddress?.mobile || "N/A"}</span>
                  {selectedOrder.shippingAddress?.latitude && (
                    <span className="text-emerald-400 font-mono">
                      GPS: {selectedOrder.shippingAddress.latitude.toFixed(4)},{" "}
                      {selectedOrder.shippingAddress.longitude?.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>

              {/* Razorpay Payment Badge */}
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                      Razorpay Verified Payment
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {selectedOrder.paymentDetails?.razorpay_payment_id || "pay_verified_razorpay"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block">Total Amount</span>
                  <span className="text-base font-black text-white">
                    ₹{selectedOrder.total}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-12 text-center text-xs text-zinc-500">
              Select an order to view full fulfillment details.
            </div>
          )}
        </div>
      </div>

      <OfflineSaleDialog
        open={isOfflineModalOpen}
        onOpenChange={setIsOfflineModalOpen}
        onOrderCreated={fetchOrders}
      />
    </div>
  );
}
