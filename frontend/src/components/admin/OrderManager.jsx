import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ExternalLink,
  User,
  Phone,
  MapPin,
  Clock,
  Truck,
  AlertTriangle,
  X,
  Filter,
  Search,
  Calendar,
  IndianRupee,
  ChevronDown,
  CheckCircle,
  Clock as ClockIcon,
  Loader
} from "lucide-react";
import api from "../../api";
import OrderDetailsModal from "./OrderDetailsModal";

// Manual Booking Modal Component
const ManualBookingModal = ({ order, isOpen, onClose, onResolve }) => {
  const [partnerName, setPartnerName] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!partnerName) {
      toast.warn("Delivery Partner Name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/admin/orders/${order.id}/manual-book`, {
        partner_name: partnerName,
        tracking_url: trackingUrl
      });
      toast.success("Order updated successfully!");
      onResolve();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          // Changed width to w-[95%] for mobile safety and max-w-md for desktop constraint
          className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-md overflow-hidden border border-gray-200"
        >
          <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-yellow-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                <Truck className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-900">Manual Fulfillment</h3>
                <p className="text-sm text-amber-700">Order #{order.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-amber-600 hover:bg-amber-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5 md:space-y-6">
            <p className="text-sm text-gray-600 leading-relaxed">
              Enter the details below to mark this order as <strong className="text-amber-600">Booked</strong> and notify the customer.
            </p>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Delivery Partner Name *</label>
              <input
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="e.g. Borzo, Porter, Uber..."
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Tracking Link (Optional)</label>
              <input
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://tracking.example.com/..."
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 md:py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm md:text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Confirm & Update
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Status Badge Component
const StatusBadge = ({ status, partner }) => {
  const getStatusConfig = (status) => {
    const statusMap = {
      pending: { color: "bg-red-50 text-red-800 border-red-200", icon: ClockIcon, label: "Pending" },
      processing: { color: "bg-blue-50 text-blue-800 border-blue-200", icon: Truck, label: "Booked" },
      delivered: { color: "bg-green-50 text-green-800 border-green-200", icon: CheckCircle, label: "Delivered" },
      failed: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: AlertTriangle, label: "Failed" }
    };
    return statusMap[status?.toLowerCase()] || statusMap.pending;
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <div className="flex flex-col gap-1 items-end lg:items-start">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] md:text-xs font-bold uppercase tracking-wide ${config.color}`}>
        <IconComponent size={12} strokeWidth={2.5} />
        {config.label}
      </span>
      {partner && (
        <span className="text-[10px] md:text-xs text-gray-500 font-medium truncate max-w-[100px] md:max-w-[120px]">
          via {partner}
        </span>
      )}
    </div>
  );
};

// Main Component
export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToResolve, setOrderToResolve] = useState(null);

  const statusOptions = [
    { value: "all", label: "All Orders", count: 0 },
    { value: "pending", label: "Pending", count: 0 },
    { value: "processing", label: "Booked", count: 0 },
    { value: "delivered", label: "Delivered", count: 0 },
    { value: "failed", label: "Failed", count: 0 }
  ];

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/admin/orders');
      setOrders(data);
    } catch (error) {
      toast.error("Failed to fetch orders.");
      console.error("Fetch orders error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update status counts and apply filters
  useEffect(() => {
    if (orders.length === 0) {
      setFilteredOrders([]);
      return;
    }

    const counts = { all: orders.length };
    orders.forEach(order => {
      const status = order.delivery_status?.toLowerCase() || 'pending';
      counts[status] = (counts[status] || 0) + 1;
    });

    statusOptions.forEach(option => {
      option.count = counts[option.value] || 0;
    });

    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter(order =>
        order.delivery_status?.toLowerCase() === statusFilter
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toString().includes(query) ||
        order.customer_name?.toLowerCase().includes(query) ||
        order.phone?.includes(query) ||
        order.partner?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchQuery]);

  const getTotalRevenue = () => {
    return filteredOrders.reduce((total, order) => total + (order.grand_total || 0), 0);
  };

  return (
    <>
      <OrderDetailsModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />

      <ManualBookingModal
        isOpen={!!orderToResolve}
        onClose={() => setOrderToResolve(null)}
        order={orderToResolve}
        onResolve={fetchOrders}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 md:space-y-6 max-w-[100vw] overflow-x-hidden"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-900 to-black rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-xl md:text-3xl font-bold mb-1">Order Management</h1>
              <p className="text-gray-400 text-xs md:text-base">Manage and track all customer orders</p>
            </div>

            {/* Stats Grid - Responsive adjustment: 2 cols on mobile, flex row on desktop */}
            <div className="grid grid-cols-2 lg:flex lg:items-center gap-4 lg:gap-8 text-sm border-t border-gray-800 lg:border-0 pt-4 lg:pt-0">
              <div className="text-left lg:text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">{filteredOrders.length}</p>
                <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">Total Orders</p>
              </div>

              {/* Divider hidden on mobile, visible on desktop */}
              <div className="hidden lg:block w-px h-10 bg-gray-700"></div>

              <div className="text-left lg:text-center">
                <p className="text-2xl md:text-3xl font-bold text-white flex items-center lg:justify-center gap-0.5">
                  <IndianRupee size={20} className="mt-1" />
                  {getTotalRevenue().toLocaleString('en-IN')}
                </p>
                <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            {/* Search Input - Full width on mobile */}
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#800020] focus:border-[#800020] outline-none transition-all text-sm md:text-base placeholder:text-gray-400"
              />
            </div>

            {/* Status Filter Dropdown - Full width on mobile */}
            <div className="relative w-full md:w-auto">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all w-full md:min-w-[180px] justify-between bg-white"
              >
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-gray-500" />
                  <span className="font-medium text-gray-700 text-sm md:text-base truncate">
                    {statusOptions.find(opt => opt.value === statusFilter)?.label}
                  </span>
                </div>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-full md:w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden"
                  >
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setStatusFilter(option.value);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-50 last:border-0 ${statusFilter === option.value ? 'bg-[#800020] text-white' : 'text-gray-700'
                          }`}
                      >
                        <span className="text-sm font-medium">{option.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${statusFilter === option.value ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
                          }`}>
                          {option.count}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Orders Display Area */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 md:h-96">
              <Loader size={32} className="animate-spin text-[#800020] mb-4" />
              <p className="text-gray-500 font-medium animate-pulse">Syncing orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 md:h-96 p-6 text-center">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <Package className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No orders found</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'New orders will appear here automatically'
                }
              </p>
            </div>
          ) : (
            <>
              {/* --- Desktop Table View (Hidden on Mobile) --- */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Order Details</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-600 text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((order) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50/80 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                              <Package className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">#{order.id}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {new Date(order.created_at).toLocaleDateString("en-IN", {
                                  day: "numeric", month: "short", year: "numeric"
                                })}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-gray-900">{order.customer_name || "N/A"}</p>
                            <p className="text-xs text-gray-500">{order.phone || "N/A"}</p>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                            <IndianRupee size={14} />
                            {order.grand_total?.toLocaleString('en-IN') || "0"}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.delivery_status} partner={order.partner} />
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Resolve button */}
                            {(order.delivery_status === "pending" || order.delivery_status === "failed") && (
                              <button
                                onClick={() => setOrderToResolve(order)}
                                className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors border border-amber-200"
                              >
                                Resolve
                              </button>
                            )}

                            {/* Track button */}
                            {order.tracking_url && (
                              <a
                                href={order.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors border border-blue-200"
                              >
                                Track
                              </a>
                            )}

                            {/* Edit button — ONLY when placed */}
                            {order.delivery_status !== "pending" && (
                              <button
                                onClick={() => setOrderToResolve(order)}
                                className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors border border-amber-200"
                              >
                                Edit
                              </button>
                            )}

                            {/* Details */}
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="px-4 py-1.5 bg-[#800020] text-white hover:bg-[#600018] rounded-lg text-xs font-bold transition-colors shadow-sm"
                            >
                              Details
                            </button>
                          </div>

                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* --- Mobile Card View (Hidden on Desktop) --- */}
              <div className="lg:hidden divide-y divide-gray-100 bg-gray-50/30">
                {filteredOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-white"
                  >
                    {/* Top Row: ID & Status */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-100 p-1.5 rounded text-gray-600">
                          <Package size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-base">Order #{order.id}</p>
                          <p className="text-[10px] text-gray-400 font-medium uppercase">
                            {new Date(order.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={order.delivery_status} partner={order.partner} />
                    </div>

                    {/* Middle Row: Details Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-1">Customer</p>
                        <div className="flex items-center gap-1.5 text-gray-900 font-semibold text-sm">
                          <User size={12} className="text-[#800020]" />
                          {order.customer_name}
                        </div>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-1">Amount</p>
                        <div className="flex items-center gap-0.5 text-gray-900 font-bold text-sm">
                          <IndianRupee size={12} className="text-[#800020]" />
                          {order.grand_total?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

  {/* Resolve or Track */}
  {(order.delivery_status === "pending" || order.delivery_status === "failed") ? (
    <button
      onClick={() => setOrderToResolve(order)}
      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-bold active:scale-95 transition-transform"
    >
      <Truck size={14} />
      Resolve
    </button>
  ) : order.tracking_url ? (
    <a
      href={order.tracking_url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-bold active:scale-95 transition-transform"
    >
      <ExternalLink size={14} />
      Track
    </a>
  ) : (
    <div className="hidden sm:block" />   // spacer only on desktop
  )}

  {/* Edit button — only when NOT pending/failed */}
  {order.delivery_status !== "pending" && order.delivery_status !== "failed" && (
    <button
      onClick={() => setOrderToResolve(order)}
      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-bold active:scale-95 transition-transform"
    >
      Edit
    </button>
  )}

  {/* View Details */}
  <button
    onClick={() => setSelectedOrder(order)}
    className={`flex items-center justify-center gap-2 px-4 py-2.5 bg-[#800020] text-white rounded-lg text-sm font-bold shadow-md active:scale-95 transition-transform 
      ${(order.delivery_status !== "pending" && order.delivery_status !== "failed" && !order.tracking_url)
        ? "sm:col-span-2"
        : ""}`}
  >
    View Details
  </button>
</div>

                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}