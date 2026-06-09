import React, { useState } from "react";
import {
  IndianRupee,
  TrendingUp,
  Calendar,
  Search,
  Image as ImageIcon,
  ExternalLink,
  ChevronDown,
  X,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react";

interface OnlineCollectionsProps {
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  onPrintOrder: (order: any) => void;
}

export default function OnlineCollections({
  orders,
  setOrders,
  onPrintOrder
}: OnlineCollectionsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  // Helper function to calculate collection statistics
  const getCollectionsStats = () => {
    const now = new Date();
    // Start of today (local time)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Start of yesterday (local time)
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
    const yesterdayEnd = todayStart;
    
    // Start of this month (local time)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let today = 0;
    let yesterday = 0;
    let thisMonth = 0;
    let total = 0;

    orders.forEach((order) => {
      const isOnline = ["upi", "card", "netbanking"].includes(order.paymentMethod);
      const isNotCancelled = order.paymentStatus !== "cancelled";

      if (isOnline && isNotCancelled) {
        const orderTime = new Date(order.date).getTime();
        const amount = order.total || 0;

        total += amount;

        if (orderTime >= todayStart) {
          today += amount;
        } else if (orderTime >= yesterdayStart && orderTime < yesterdayEnd) {
          yesterday += amount;
        }

        if (orderTime >= monthStart) {
          thisMonth += amount;
        }
      }
    });

    return { today, yesterday, thisMonth, total };
  };

  const stats = getCollectionsStats();

  // Filter orders to only online transactions (UPI, Card, Netbanking)
  const onlineOrders = orders.filter((order) => {
    const isOnline = ["upi", "card", "netbanking"].includes(order.paymentMethod);
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    return isOnline && matchesSearch;
  });

  // Handle status update
  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: newStatus } : o))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          💳 Online Collections Ledger
        </h3>
        <p className="text-xs text-rose-200/50 mt-1">
          Monitor incoming online transactions, analyze collections over time, and verify uploaded payment receipts.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Today's Collection",
            value: stats.today,
            color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
            icon: TrendingUp,
          },
          {
            label: "Yesterday's Collection",
            value: stats.yesterday,
            color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400",
            icon: Calendar,
          },
          {
            label: "This Month",
            value: stats.thisMonth,
            color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
            icon: Calendar,
          },
          {
            label: "Total Collection",
            value: stats.total,
            color: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400",
            icon: IndianRupee,
          },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${item.color} border rounded-2xl p-4 flex flex-col justify-between h-28 shadow-lg backdrop-blur-md relative overflow-hidden`}
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                <Icon size={72} />
              </div>
              <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">
                {item.label}
              </span>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white leading-none">
                  ₹{item.value.toLocaleString("en-IN")}
                </span>
                <span className="text-[9px] text-white/40 mt-1 font-medium">
                  Verified Online Sales
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by ID, name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 transition-colors"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-white/30" />
        </div>
        <div className="text-[10px] text-white/40 uppercase tracking-widest font-black">
          Showing {onlineOrders.length} online orders
        </div>
      </div>

      {/* Ledger Table */}
      {onlineOrders.length === 0 ? (
        <div className="py-16 text-center text-white/30 space-y-2 border border-dashed border-white/10 rounded-2xl">
          <AlertCircle size={48} className="mx-auto opacity-20" />
          <p className="font-bold text-sm">No online transactions found</p>
          <p className="text-xs">Incoming UPI or card orders will show up here automatically.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase font-black tracking-widest text-[9px]">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Receipt Screenshot</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {onlineOrders.map((o) => (
                <tr key={o.id} className="hover:bg-white/2 text-white/80 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">{o.id}</td>
                  <td className="py-4 px-4">
                    <span className="block font-bold text-white uppercase">{o.customerName}</span>
                    <span className="text-[10px] text-white/40">{o.customerPhone}</span>
                  </td>
                  <td className="py-4 px-4 text-white/60">
                    {new Date(o.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    •{" "}
                    {new Date(o.date).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-4 px-4 font-bold text-amber-400 uppercase tracking-wider">
                    {o.paymentMethod}
                  </td>
                  <td className="py-4 px-4">
                    {o.paymentReceipt ? (
                      <div className="flex items-center gap-2">
                        <div
                          onClick={() => setSelectedReceipt(o.paymentReceipt)}
                          className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 cursor-pointer bg-black/40 hover:border-amber-400 transition-all group flex items-center justify-center"
                          title="Click to view full screenshot"
                        >
                          <img
                            src={o.paymentReceipt}
                            alt="Receipt Preview"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <ExternalLink size={12} className="text-white" />
                          </div>
                        </div>
                        <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                          Attached
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-white/30 italic">No receipt uploaded</span>
                    )}
                  </td>
                  <td className="py-4 px-4 font-black text-white text-sm">₹{o.total}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        o.paymentStatus === "paid"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : o.paymentStatus === "cancelled"
                          ? "bg-red-500/10 border-red-500/30 text-red-400"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end items-center gap-1.5">
                      <div className="relative">
                        <select
                          value={o.paymentStatus}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="appearance-none bg-white/5 border border-white/10 rounded-lg pl-2 pr-5 py-1 text-[9px] font-bold uppercase text-white hover:bg-white/10 focus:outline-none cursor-pointer"
                        >
                          <option value="pending" className="bg-rose-950 text-white">Pending</option>
                          <option value="preparing" className="bg-rose-950 text-white">Preparing</option>
                          <option value="paid" className="bg-rose-950 text-white">Paid</option>
                          <option value="cancelled" className="bg-rose-950 text-white">Cancelled</option>
                        </select>
                        <ChevronDown size={10} className="absolute right-1.5 top-2 text-white/40 pointer-events-none" />
                      </div>
                      <button
                        onClick={() => onPrintOrder(o)}
                        className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg transition-all cursor-pointer"
                        title="Print Invoice"
                      >
                        <Printer size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Full-Screen Receipt Preview Lightbox */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="relative max-w-2xl w-full flex flex-col items-center gap-4">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="bg-rose-950/20 border border-white/10 rounded-3xl p-4 overflow-hidden max-h-[80vh] flex items-center justify-center">
              <img
                src={selectedReceipt}
                alt="Full Payment Receipt"
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              />
            </div>
            <div className="flex gap-4">
              <a
                href={selectedReceipt}
                download="payment-receipt.png"
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-rose-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-1.5"
              >
                Download Receipt Image
              </a>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 border border-white/20 hover:bg-white/5 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
