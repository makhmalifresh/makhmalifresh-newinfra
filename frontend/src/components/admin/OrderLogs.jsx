import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  Package,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageCircle,
  CreditCard,
  Truck,
  Save,
  ExternalLink,
  Copy,
  MapPin,
  ShoppingCart,
  IndianRupee,
  Database,
  WifiOff,
  Layers,
  Download,
  Eye,
  AlertTriangle,
  Phone,
  Home,
  DollarSign,
  FileText,
  ShoppingBag,
} from "lucide-react";
import api from "../../api";

const EVENT_COLORS = {
  payment_verified: {
    bg: "bg-green-100",
    text: "text-green-800",
    icon: CreditCard,
    label: "Payment Verified",
  },
  order_saved: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    icon: Save,
    label: "Order Saved to DB",
  },
  delivery_success: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    icon: Truck,
    label: "Delivery Success",
  },
  delivery_failed: {
    bg: "bg-red-100",
    text: "text-red-800",
    icon: XCircle,
    label: "Delivery Failed",
  },
  prealert_whatsapp_sent: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    icon: MessageCircle,
    label: "Pre-alert WhatsApp",
  },
  delivery_whatsapp_success: {
    bg: "bg-teal-100",
    text: "text-teal-800",
    icon: CheckCircle,
    label: "Delivery WhatsApp",
  },
  delivery_whatsapp_failed: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    icon: AlertCircle,
    label: "WhatsApp Failed",
  },
  before_pre_alert: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    icon: AlertCircle,
    label: "Pre-alert Started",
  },
  order_insert_begin: {
    bg: "bg-indigo-100",
    text: "text-indigo-800",
    icon: Package,
    label: "Order Insert Begin",
  },
  delivery_mode_resolved: {
    bg: "bg-cyan-100",
    text: "text-cyan-800",
    icon: Truck,
    label: "Delivery Mode",
  },
  delivery_attempt: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    icon: Truck,
    label: "Delivery Attempt",
  },
  finalize_payment_responded: {
    bg: "bg-green-100",
    text: "text-green-800",
    icon: CreditCard,
    label: "Payment Response",
  },
  delivery_mark_pending: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    icon: Clock,
    label: "Delivery Pending",
  },
  delivery_mark_pending_whatsapp_ok: {
    bg: "bg-teal-100",
    text: "text-teal-800",
    icon: CheckCircle,
    label: "Pending WhatsApp OK",
  },
};

const OrderLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recovery"); // recovery, orders, payments, users
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPaymentId, setFilterPaymentId] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [filterEvent, setFilterEvent] = useState("");
  const [timeRange, setTimeRange] = useState("all");
  const [viewingPaymentId, setViewingPaymentId] = useState("");
  const [filterOrderId, setFilterOrderId] = useState(""); // NEW: filter by order
  const [viewingOrderId, setViewingOrderId] = useState(""); // NEW: when clicking "View Details" from User tab

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/order-logs");
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Grouping logic (unchanged, just wrapped in useMemo)
  const { paymentGroups, orderGroups, userGroups } = useMemo(() => {
    const paymentGroupsMap = {};
    const orderGroupsMap = {};
    const userGroupsMap = {};

    logs.forEach((entry) => {
      // PRIMARY GROUPING: BY PAYMENT ID
      if (entry.razorpay_payment_id) {
        const paymentId = entry.razorpay_payment_id;

        if (!paymentGroupsMap[paymentId]) {
          paymentGroupsMap[paymentId] = {
            type: "payment",
            paymentId,
            userId: entry.user_id,
            orderId: entry.order_id || null,
            entries: [],
            hasOrderSaved: false,
            hasBeforePreAlert: false,
            status: "unknown",
            earliestTs: entry.ts,
            latestTs: entry.ts,
          };
        }

        paymentGroupsMap[paymentId].entries.push(entry);

        if (entry.event === "order_saved") {
          paymentGroupsMap[paymentId].hasOrderSaved = true;
          paymentGroupsMap[paymentId].orderId = entry.order_id;
        }

        if (entry.event === "before_pre_alert") {
          paymentGroupsMap[paymentId].hasBeforePreAlert = true;
          paymentGroupsMap[paymentId].customerInfo = {
            name: entry.address?.name || "N/A",
            phone: entry.address?.phone || "N/A",
            address: {
              line1: entry.address?.line1 || "",
              area: entry.address?.area || "",
              city: entry.address?.city || "",
              pincode: entry.address?.pincode || "",
            },
          };
          paymentGroupsMap[paymentId].cartItems = entry.cart || [];
          paymentGroupsMap[paymentId].grandTotal = entry.grand_total || 0;
          paymentGroupsMap[paymentId].cartSize = entry.cart?.length || 0;
        }

        paymentGroupsMap[paymentId].earliestTs = Math.min(
          paymentGroupsMap[paymentId].earliestTs,
          entry.ts
        );
        paymentGroupsMap[paymentId].latestTs = Math.max(
          paymentGroupsMap[paymentId].latestTs,
          entry.ts
        );

        if (entry.event === "delivery_success") {
          paymentGroupsMap[paymentId].status = "delivered";
          paymentGroupsMap[paymentId].deliveryInfo = {
            partner: entry.partner,
            tracking_url: entry.tracking_url,
            delivery_task_id: entry.delivery_task_id,
          };
        } else if (
          entry.event === "order_saved" &&
          paymentGroupsMap[paymentId].status === "unknown"
        ) {
          paymentGroupsMap[paymentId].status = "saved";
        } else if (
          entry.event === "payment_verified" &&
          paymentGroupsMap[paymentId].status === "unknown"
        ) {
          paymentGroupsMap[paymentId].status = "payment_verified";
        } else if (entry.event === "delivery_mark_pending") {
          paymentGroupsMap[paymentId].status = "pending_manual";
        }
      }

      // SECONDARY: BY ORDER ID
      if (entry.order_id) {
        const orderId = entry.order_id;
        if (!orderGroupsMap[orderId]) {
          orderGroupsMap[orderId] = {
            type: "order",
            orderId,
            userId: entry.user_id,
            paymentIds: new Set(),
            entries: [],
            hasOrderSaved: false,
          };
        }
        orderGroupsMap[orderId].entries.push(entry);
        if (entry.razorpay_payment_id) {
          orderGroupsMap[orderId].paymentIds.add(entry.razorpay_payment_id);
        }
        if (entry.event === "order_saved") {
          orderGroupsMap[orderId].hasOrderSaved = true;
        }
      }

      // TERTIARY: BY USER ID
      if (entry.user_id) {
        const userId = entry.user_id;
        if (!userGroupsMap[userId]) {
          userGroupsMap[userId] = {
            type: "user",
            userId,
            paymentIds: new Set(),
            orderIds: new Set(),
            entries: [],
          };
        }
        userGroupsMap[userId].entries.push(entry);
        if (entry.razorpay_payment_id) {
          userGroupsMap[userId].paymentIds.add(entry.razorpay_payment_id);
        }
        if (entry.order_id) {
          userGroupsMap[userId].orderIds.add(entry.order_id);
        }
      }
    });

    // Sort entries inside each group
    Object.values(paymentGroupsMap).forEach((group) => {
      group.entries.sort((a, b) => a.ts - b.ts);
    });

    Object.values(orderGroupsMap).forEach((group) => {
      group.entries.sort((a, b) => a.ts - b.ts);
    });

    Object.values(userGroupsMap).forEach((group) => {
      group.entries.sort((a, b) => a.ts - b.ts);
    });

    return {
      paymentGroups: paymentGroupsMap,
      orderGroups: orderGroupsMap,
      userGroups: userGroupsMap,
    };
  }, [logs]);

  const recoveryNeededPayments = useMemo(() => {
    return Object.values(paymentGroups).filter(
      (group) =>
        group.entries.some((e) => e.event === "payment_verified") &&
        !group.entries.some((e) => e.event === "order_saved")
    );
  }, [paymentGroups]);

  // Decide which groups to show based on tab + filters
  const activeGroups = useMemo(() => {
    let groups = [];

    if (activeTab === "recovery") {
      groups = recoveryNeededPayments;
    } else if (activeTab === "orders") {
      groups = Object.values(orderGroups);
    } else if (activeTab === "payments") {
      groups = Object.values(paymentGroups);
    } else if (activeTab === "users") {
      groups = Object.values(userGroups);
    }

    return groups
      .filter((group) => {
        // Order ID filter (works across all group types)
        if (filterOrderId) {
          const filterIdStr = String(filterOrderId).trim();
          if (group.type === "order") {
            if (String(group.orderId) !== filterIdStr) return false;
          } else if (group.type === "payment") {
            if (!group.orderId || String(group.orderId) !== filterIdStr)
              return false;
          } else if (group.type === "user") {
            if (
              !group.orderIds ||
              !Array.from(group.orderIds).some(
                (id) => String(id) === filterIdStr
              )
            ) {
              return false;
            }
          }
        }

        // Payment ID filter
        if (filterPaymentId) {
          if (group.type === "payment") {
            if (!group.paymentId.includes(filterPaymentId)) return false;
          } else if (group.paymentIds) {
            if (
              Array.from(group.paymentIds).every(
                (pId) => !pId.includes(filterPaymentId)
              )
            )
              return false;
          } else if (group.paymentId) {
            if (!group.paymentId.includes(filterPaymentId)) return false;
          }
        }

        // User ID filter
        if (filterUserId) {
          if (
            !group.userId
              ?.toLowerCase()
              .includes(filterUserId.toLowerCase())
          ) {
            return false;
          }
        }

        // Event filter
        if (
          filterEvent &&
          !group.entries.some((e) => e.event === filterEvent)
        ) {
          return false;
        }

        // Search term across JSON + customer info + address
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const hasEntryMatch = group.entries.some((entry) =>
            JSON.stringify(entry).toLowerCase().includes(searchLower)
          );
          const hasCustomerMatch =
            group.customerInfo?.name
              ?.toLowerCase()
              .includes(searchLower) ||
            group.customerInfo?.phone?.includes(searchTerm);
          const hasAddressMatch =
            group.customerInfo?.address?.line1
              ?.toLowerCase()
              .includes(searchLower) ||
            group.customerInfo?.address?.area
              ?.toLowerCase()
              .includes(searchLower);

          if (
            !hasEntryMatch &&
            !hasCustomerMatch &&
            !hasAddressMatch
          ) {
            return false;
          }
        }

        // Time range filter
        if (timeRange !== "all" && group.entries.length > 0) {
          const latestTs =
            group.latestTs ||
            group.entries[group.entries.length - 1]?.ts;
          if (!latestTs) return true;

          const age = Date.now() - latestTs;
          switch (timeRange) {
            case "1h":
              return age <= 3600000;
            case "24h":
              return age <= 86400000;
            case "7d":
              return age <= 604800000;
            default:
              return true;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const aLatest =
          a.latestTs || a.entries[a.entries.length - 1]?.ts || 0;
        const bLatest =
          b.latestTs || b.entries[b.entries.length - 1]?.ts || 0;
        return bLatest - aLatest;
      });
  }, [
    paymentGroups,
    orderGroups,
    userGroups,
    recoveryNeededPayments,
    activeTab,
    filterPaymentId,
    filterUserId,
    filterEvent,
    searchTerm,
    timeRange,
    filterOrderId,
  ]);

  // When clicking "view payment" we auto-jump to payments tab + filter
  useEffect(() => {
    if (viewingPaymentId) {
      setActiveTab("payments");
      setFilterPaymentId(viewingPaymentId);
      setViewingPaymentId("");
    }
  }, [viewingPaymentId]);

  // When clicking "view order" from User Activity, jump to Orders tab + focus that order
  useEffect(() => {
    if (viewingOrderId) {
      setActiveTab("orders");
      setFilterOrderId(String(viewingOrderId));
      setViewingOrderId("");
    }
  }, [viewingOrderId]);

  const toggleGroup = (groupId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleLog = (logId) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const getEventConfig = (event) => {
    return (
      EVENT_COLORS[event] || {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: AlertCircle,
        label: event,
      }
    );
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-100 text-emerald-800";
      case "saved":
        return "bg-blue-100 text-blue-800";
      case "payment_verified":
        return "bg-green-100 text-green-800";
      case "pending_manual":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "saved":
        return "In Database";
      case "payment_verified":
        return "Payment Done";
      case "pending_manual":
        return "Manual Delivery";
      default:
        return "Unknown";
    }
  };

  const downloadGroupData = (group) => {
    const dataStr = JSON.stringify(group, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      group.type
    }_${group.type === "payment"
      ? group.paymentId
      : group.type === "order"
      ? group.orderId
      : group.userId
    }_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800020] mx-auto" />
          <p className="mt-4 text-gray-600 text-sm md:text-base">
            Loading order logs...
          </p>
        </div>
      </div>
    );
  }

  const totalPayments = Object.keys(paymentGroups).length;
  const totalOrders = Object.keys(orderGroups).length;
  const totalUsers = Object.keys(userGroups).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Order Recovery & Logs
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-2xl">
                Critical backup system for database failures — track payments
                and manually recover lost orders. Every payment and order is
                safely logged here.
              </p>
            </div>
            <button
              onClick={fetchLogs}
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm w-full sm:w-auto"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh Logs
            </button>
          </div>

          {/* Emergency Stats (responsive grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div
              className={`rounded-xl p-3 sm:p-4 border shadow-sm ${
                recoveryNeededPayments.length > 0
                  ? "bg-red-50 border-red-200"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    ⚠️ Recovery Needed
                  </p>
                  <p
                    className={`text-xl sm:text-2xl font-bold ${
                      recoveryNeededPayments.length > 0
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {recoveryNeededPayments.length}
                  </p>
                </div>
                <AlertTriangle
                  className={
                    recoveryNeededPayments.length > 0
                      ? "text-red-600"
                      : "text-gray-400"
                  }
                  size={22}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Total Payments
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {totalPayments}
                  </p>
                </div>
                <CreditCard className="text-[#800020]" size={22} />
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Database Orders
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {totalOrders}
                  </p>
                </div>
                <Database className="text-[#800020]" size={22} />
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Active Users
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {totalUsers}
                  </p>
                </div>
                <User className="text-[#800020]" size={22} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("recovery")}
              className={`px-3 sm:px-4 py-2.5 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "recovery"
                  ? "border-[#800020] text-[#800020]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} />
                Recovery Needed ({recoveryNeededPayments.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-3 sm:px-4 py-2.5 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "payments"
                  ? "border-[#800020] text-[#800020]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard size={14} />
                All Payments ({totalPayments})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-3 sm:px-4 py-2.5 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "orders"
                  ? "border-[#800020] text-[#800020]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Package size={14} />
                Database Orders ({totalOrders})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3 sm:px-4 py-2.5 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "users"
                  ? "border-[#800020] text-[#800020]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <User size={14} />
                User Activity ({totalUsers})
              </div>
            </button>
          </div>

          {/* DB Failure Alert */}
          {recoveryNeededPayments.length > 0 && (
            <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <WifiOff
                  className="text-red-600 mt-1 flex-shrink-0"
                  size={24}
                />
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="font-bold text-red-800 text-base sm:text-lg">
                      ⚠️ DATABASE FAILURE DETECTED
                    </h3>
                    <span className="px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-full bg-red-100 text-red-800 animate-pulse self-start sm:self-auto">
                      {recoveryNeededPayments.length} ORDERS LOST
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-red-700">
                    {recoveryNeededPayments.length} payments were processed
                    but never saved to database. Customer & cart details are
                    preserved below for{" "}
                    <strong className="underline">MANUAL RECOVERY</strong>.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] sm:text-xs rounded">
                      🔴 DB connection lost after payment
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] sm:text-xs rounded">
                      📝 Use logs to recreate order
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] sm:text-xs rounded">
                      💰 Payment IDs for verification
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={18} className="text-gray-600" />
              <h2 className="font-semibold text-gray-800 text-sm sm:text-base">
                Search & Filter
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {/* Search customer / address */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search customer, phone, address..."
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] text-xs sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Payment ID */}
              <input
                type="text"
                placeholder="Payment ID"
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] text-xs sm:text-sm"
                value={filterPaymentId}
                onChange={(e) => setFilterPaymentId(e.target.value)}
              />

              {/* User ID */}
              <input
                type="text"
                placeholder="User ID"
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] text-xs sm:text-sm"
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
              />

              {/* Order ID (new, helps View Details focus) */}
              <input
                type="text"
                placeholder="Order ID"
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] text-xs sm:text-sm"
                value={filterOrderId}
                onChange={(e) => setFilterOrderId(e.target.value)}
              />

              {/* Event filter */}
              <select
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] text-xs sm:text-sm"
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
              >
                <option value="">All Events</option>
                {Object.entries(EVENT_COLORS).map(
                  ([event, config]) => (
                    <option key={event} value={event}>
                      {config.label}
                    </option>
                  )
                )}
              </select>

              {/* Time range */}
              <select
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] text-xs sm:text-sm"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>

              {/* Clear filters */}
              {(filterPaymentId ||
                filterUserId ||
                filterEvent ||
                searchTerm ||
                filterOrderId ||
                timeRange !== "all") && (
                <button
                  onClick={() => {
                    setFilterPaymentId("");
                    setFilterUserId("");
                    setFilterEvent("");
                    setSearchTerm("");
                    setFilterOrderId("");
                    setTimeRange("all");
                  }}
                  className="px-3 py-2.5 text-gray-600 hover:text-gray-800 transition-colors text-xs sm:text-sm text-left sm:text-center"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Groups */}
        <div className="space-y-4">
          {activeGroups.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 text-center">
              <Package
                className="mx-auto text-gray-400 mb-3 sm:mb-4"
                size={40}
              />
              <h3 className="text-sm sm:text-lg font-semibold text-gray-700 mb-1">
                No{" "}
                {activeTab === "recovery"
                  ? "recovery needed"
                  : activeTab}{" "}
                found
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Try adjusting your filters or refresh the logs.
              </p>
            </div>
          ) : (
            activeGroups.map((group) => {
              const groupKey =
                group.type === "payment"
                  ? group.paymentId
                  : group.type === "order"
                  ? group.orderId
                  : group.userId;

              return (
                <PaymentGroup
                  key={`${group.type}-${groupKey}`}
                  group={group}
                  isExpanded={expandedGroups.has(groupKey)}
                  onToggle={() => toggleGroup(groupKey)}
                  expandedLogs={expandedLogs}
                  onToggleLog={toggleLog}
                  onDownload={() => downloadGroupData(group)}
                  onViewPayment={setViewingPaymentId}
                  onViewOrder={setViewingOrderId}
                  isRecoveryTab={activeTab === "recovery"}
                  getEventConfig={getEventConfig}
                  copyToClipboard={copyToClipboard}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                />
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">
                Showing {activeGroups.length} of{" "}
                {activeTab === "recovery"
                  ? recoveryNeededPayments.length
                  : activeTab === "payments"
                  ? totalPayments
                  : activeTab === "orders"
                  ? totalOrders
                  : totalUsers}{" "}
                {activeTab === "recovery"
                  ? "recovery items"
                  : activeTab}
              </p>
              {recoveryNeededPayments.length > 0 && (
                <p className="text-[11px] sm:text-xs text-red-600 font-semibold mt-1">
                  ⚠️ {recoveryNeededPayments.length} orders need manual
                  database recovery.
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <button
                onClick={() => {
                  const allData =
                    activeTab === "recovery"
                      ? recoveryNeededPayments
                      : activeTab === "payments"
                      ? paymentGroups
                      : activeTab === "orders"
                      ? orderGroups
                      : userGroups;
                  const dataStr = JSON.stringify(allData, null, 2);
                  const dataBlob = new Blob([dataStr], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `${activeTab}_backup_${Date.now()}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800"
              >
                <Download size={14} />
                Export {activeTab === "recovery" ? "Recovery" : activeTab} as
                JSON
              </button>
              <p className="text-[10px] sm:text-xs text-gray-400 max-w-xs">
                {activeTab === "recovery"
                  ? "Export for manual order recreation when database fails."
                  : "Logs update continuously. Export for backup and analysis."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentGroup = ({
  group,
  isExpanded,
  onToggle,
  expandedLogs,
  onToggleLog,
  onDownload,
  onViewPayment,
  onViewOrder,
  isRecoveryTab,
  getEventConfig,
  copyToClipboard,
  getStatusColor,
  getStatusLabel,
}) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const headerId =
    group.type === "payment"
      ? group.paymentId
      : group.type === "order"
      ? group.orderId
      : group.userId;

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
        isRecoveryTab ? "border-2 border-red-300 bg-red-50/40" : "border-gray-200"
      }`}
    >
      {/* Header */}
      <div
        className={`p-4 sm:p-5 border-b ${
          isRecoveryTab ? "border-red-200 bg-red-50/60" : "border-gray-200"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className={`p-2.5 sm:p-3 rounded-lg flex-shrink-0 ${
                group.type === "payment"
                  ? "bg-[#800020]/10"
                  : group.type === "order"
                  ? "bg-blue-100"
                  : "bg-purple-100"
              }`}
            >
              {group.type === "payment" ? (
                <CreditCard className="text-[#800020]" size={22} />
              ) : group.type === "order" ? (
                <Package className="text-blue-600" size={22} />
              ) : (
                <User className="text-purple-600" size={22} />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">
                  {group.type === "payment"
                    ? `${String(group.paymentId).slice(0, 20)}${
                        String(group.paymentId).length > 20 ? "..." : ""
                      }`
                    : group.type === "order"
                    ? `Order #${group.orderId}`
                    : `User: ${group.userId}`}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {group.status && (
                    <span
                      className={`px-2.5 py-1 text-[10px] sm:text-xs font-semibold rounded-full ${getStatusColor(
                        group.status
                      )}`}
                    >
                      {getStatusLabel(group.status)}
                    </span>
                  )}
                  {isRecoveryTab && (
                    <span className="px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-full bg-red-100 text-red-800 animate-pulse">
                      ⚠️ DATABASE FAILED
                    </span>
                  )}
                  {group.hasBeforePreAlert && group.type === "payment" && (
                    <span className="px-2.5 py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      ✅ Customer Data Available
                    </span>
                  )}
                  {!group.hasOrderSaved &&
                    group.type === "payment" &&
                    !isRecoveryTab && (
                      <span className="px-2.5 py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        ⚠️ No DB Entry
                      </span>
                    )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-gray-600">
                {group.userId && (
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    <span className="font-mono break-all">
                      {group.userId}
                    </span>
                  </span>
                )}
                {group.type === "order" && (
                  <span className="flex items-center gap-1">
                    <CreditCard size={12} />
                    {group.paymentIds?.size || 0} payments
                  </span>
                )}
                {group.type === "payment" && group.orderId && (
                  <span className="flex items-center gap-1">
                    <Package size={12} />
                    Order: #{group.orderId}
                  </span>
                )}
                {group.entries.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDateTime(group.entries[0]?.ts)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Layers size={12} />
                  {group.entries.length} events
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={onDownload}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="Download as JSON"
            >
              <Download size={16} />
            </button>
            <button
              onClick={onToggle}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm ${
                isRecoveryTab
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#800020] hover:bg-[#600018]"
              } text-white rounded-lg transition-colors`}
            >
              {isExpanded ? "Collapse" : "Expand"}
              <ChevronRight
                className={`transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
                size={14}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="divide-y divide-gray-200">
          {/* Customer & recovery details for payment groups */}
          {group.type === "payment" && group.customerInfo && (
            <div
              className={`p-4 sm:p-6 ${
                isRecoveryTab
                  ? "bg-red-50 border-b border-red-200"
                  : "bg-blue-50 border-b border-blue-100"
              }`}
            >
              <div className="flex flex-col gap-3 mb-4 sm:mb-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                    {isRecoveryTab ? (
                      <AlertTriangle
                        size={18}
                        className="text-red-600"
                      />
                    ) : (
                      <FileText size={18} className="text-blue-600" />
                    )}
                    {isRecoveryTab
                      ? "🚨 MANUAL RECOVERY REQUIRED 🚨"
                      : "Customer Order Details"}
                  </h4>
                  {isRecoveryTab && (
                    <span className="px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-full bg-red-100 text-red-800">
                      PAYMENT DONE — ORDER LOST IN DB
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Customer Info */}
                <div
                  className={`rounded-lg border p-4 sm:p-5 ${
                    isRecoveryTab
                      ? "bg-white border-red-200 shadow-sm"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2 text-sm">
                    <User size={16} />
                    Customer Information
                  </h5>
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <User
                        size={14}
                        className="text-gray-400 flex-shrink-0"
                      />
                      <div>
                        <p className="font-bold text-gray-900 break-words">
                          {group.customerInfo.name}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Full Name
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone
                        size={14}
                        className="text-gray-400 flex-shrink-0"
                      />
                      <div>
                        <p className="font-bold text-gray-900 break-all">
                          {group.customerInfo.phone}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Contact Number
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Home
                        size={14}
                        className="text-gray-400 mt-1 flex-shrink-0"
                      />
                      <div>
                        <p className="font-bold text-gray-900 text-xs sm:text-sm">
                          Delivery Address
                        </p>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1 space-y-1 break-words">
                          <p>{group.customerInfo.address.line1}</p>
                          <p>{group.customerInfo.address.area}</p>
                          <p>
                            {group.customerInfo.address.city} -{" "}
                            {group.customerInfo.address.pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div
                  className={`rounded-lg border p-4 sm:p-5 ${
                    isRecoveryTab
                      ? "bg-white border-red-200 shadow-sm"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2 text-sm">
                    <ShoppingBag size={16} />
                    Order Items ({group.cartItems?.length || 0})
                  </h5>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {group.cartItems &&
                    group.cartItems.length > 0 ? (
                      <>
                        {group.cartItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                          >
                            <div className="flex-1 mr-2">
                              <p className="font-medium text-gray-900 text-xs sm:text-sm break-words">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {item.cut || "Regular"} • {item.weight}
                                g
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900 text-xs sm:text-sm">
                                ₹{item.price}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                Qty: {item.qty || 1}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="font-medium">
                              Subtotal
                            </span>
                            <span>
                              ₹
                              {group.cartItems.reduce(
                                (sum, item) =>
                                  sum +
                                  ((parseInt(item.price) || 0) *
                                    (item.qty || 1)),
                                0
                              )}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs sm:text-sm text-gray-500 italic">
                        Cart items not available.
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment & Recovery */}
                <div
                  className={`rounded-lg border p-4 sm:p-5 ${
                    isRecoveryTab
                      ? "bg-white border-red-200 shadow-sm"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2 text-sm">
                    <DollarSign size={16} />
                    Payment & Recovery
                  </h5>
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div>
                      <p className="text-[11px] text-gray-500 mb-1">
                        Payment ID
                      </p>
                      <div className="flex items-center gap-2">
                        <code
                          className="text-[11px] sm:text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate"
                          title={group.paymentId}
                        >
                          {group.paymentId}
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(group.paymentId)
                          }
                          className="text-[11px] sm:text-xs text-[#800020] hover:text-[#600018]"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200 space-y-1">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">
                          Items Total
                        </span>
                        <span className="font-medium">
                          ₹
                          {group.cartItems?.reduce((sum, item) => {
                            return (
                              sum +
                              ((parseInt(item.price) || 0) *
                                (item.qty || 1))
                            );
                          }, 0) || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">
                          Delivery Fee
                        </span>
                        <span className="font-medium">₹30</span>
                      </div>
                      {group.grandTotal > 0 && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                          <span className="font-bold text-gray-900 text-xs sm:text-sm">
                            Total Paid
                          </span>
                          <span
                            className={`font-bold text-base sm:text-lg ${
                              isRecoveryTab
                                ? "text-red-600"
                                : "text-[#800020]"
                            }`}
                          >
                            ₹{group.grandTotal}
                          </span>
                        </div>
                      )}
                    </div>

                    {isRecoveryTab && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-xs sm:text-sm font-bold text-red-800 mb-1">
                          ⚡ Recovery Instructions:
                        </p>
                        <ul className="text-[11px] sm:text-xs text-red-700 space-y-1">
                          <li>
                            1. Verify payment in Razorpay dashboard.
                          </li>
                          <li>
                            2. Create manual order in admin panel.
                          </li>
                          <li>
                            3. Use same amount: ₹{group.grandTotal}.
                          </li>
                          <li>
                            4. Mark payment as manually processed.
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order summary for order-type groups */}
          {group.type === "order" && (
            <div className="p-4 sm:p-6 bg-blue-50 border-b border-blue-100">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
                <Package size={18} />
                Database Order Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
                  <h5 className="font-medium text-gray-700 mb-3 text-sm">
                    Order Status
                  </h5>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Order ID</span>
                      <span className="font-medium">
                        #{group.orderId}
                      </span>
                    </div>
                    {group.userId && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">User ID</span>
                        <span className="font-mono text-[11px] sm:text-xs break-all max-w-[60%] text-right">
                          {group.userId}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        Payment Count
                      </span>
                      <span>{group.paymentIds?.size || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Event Count</span>
                      <span>{group.entries.length}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
                  <h5 className="font-medium text-gray-700 mb-3 text-sm">
                    Associated Payments
                  </h5>
                  <div className="space-y-2">
                    {group.paymentIds &&
                    Array.from(group.paymentIds).length > 0 ? (
                      Array.from(group.paymentIds)
                        .slice(0, 3)
                        .map((paymentId) => (
                          <div
                            key={paymentId}
                            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                          >
                            <code
                              className="text-[11px] sm:text-xs text-gray-700 truncate flex-1"
                              title={paymentId}
                            >
                              {paymentId.substring(0, 25)}...
                            </code>
                            <button
                              onClick={() =>
                                onViewPayment &&
                                onViewPayment(paymentId)
                              }
                              className="text-[11px] sm:text-xs text-[#800020] hover:text-[#600018] ml-2 whitespace-nowrap"
                            >
                              View Payment
                            </button>
                          </div>
                        ))
                    ) : (
                      <p className="text-xs sm:text-sm text-gray-500 italic">
                        No payment IDs found.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User activity summary */}
          {group.type === "user" && (
            <div className="p-4 sm:p-6 bg-purple-50 border-b border-purple-100">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
                <User size={18} />
                User Activity Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
                  <h5 className="font-medium text-gray-700 mb-3 text-sm">
                    User Statistics
                  </h5>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">User ID</span>
                      <code className="text-[11px] sm:text-xs break-all max-w-[60%] text-right">
                        {group.userId}
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        Total Orders
                      </span>
                      <span>{group.orderIds?.size || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        Total Payments
                      </span>
                      <span>{group.paymentIds?.size || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        Event Count
                      </span>
                      <span>{group.entries.length}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
                  <h5 className="font-medium text-gray-700 mb-3 text-sm">
                    Recent Orders
                  </h5>
                  <div className="space-y-2">
                    {group.orderIds &&
                    Array.from(group.orderIds).length > 0 ? (
                      Array.from(group.orderIds)
                        .slice(0, 5)
                        .map((orderId) => (
                          <div
                            key={orderId}
                            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                          >
                            <span className="text-xs sm:text-sm font-medium">
                              Order #{orderId}
                            </span>
                            <button
                              className="text-[11px] sm:text-xs text-[#800020] hover:text-[#600018] inline-flex items-center gap-1"
                              onClick={(e) => {
                                e.preventDefault();
                                if (onViewOrder) {
                                  onViewOrder(orderId);
                                }
                              }}
                            >
                              View Details
                              <Eye size={12} />
                            </button>
                          </div>
                        ))
                    ) : (
                      <p className="text-xs sm:text-sm text-gray-500 italic">
                        No orders found.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="p-4 sm:p-6">
            <h4 className="font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base">
              <Clock size={18} />
              Event Timeline
            </h4>

            <div className="relative">
              {/* vertical line */}
              <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

              <div className="space-y-4 sm:space-y-6">
                {group.entries.map((entry, index) => {
                  const eventConfig = getEventConfig(entry.event);
                  const Icon = eventConfig.icon;
                  const logId = `${headerId}-${index}`;
                  const isLogExpanded = expandedLogs.has(logId);

                  return (
                    <div
                      key={index}
                      className="relative pl-12 sm:pl-16"
                    >
                      {/* timeline dot */}
                      <div
                        className={`absolute left-3 sm:left-5 w-3 h-3 rounded-full border-4 border-white ${
                          eventConfig.bg.replace("100", "500")
                        } z-10`}
                      />

                      {/* card */}
                      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
                        <div className="p-3 sm:p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2 rounded-lg flex-shrink-0 ${eventConfig.bg}`}
                              >
                                <Icon
                                  size={18}
                                  className={eventConfig.text}
                                />
                              </div>
                              <div className="space-y-1">
                                <span
                                  className={`font-semibold text-sm sm:text-base ${eventConfig.text}`}
                                >
                                  {eventConfig.label}
                                </span>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-gray-500">
                                  <span className="inline-flex items-center gap-1">
                                    <Clock size={12} />
                                    {formatTime(entry.ts)}
                                  </span>
                                  <span className="hidden sm:inline mx-1">
                                    •
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <span className="font-mono text-[10px] sm:text-[11px] bg-gray-100 px-2 py-0.5 rounded">
                                      {entry.event}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 self-end md:self-auto">
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    JSON.stringify(entry, null, 2)
                                  )
                                }
                                className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-200"
                                title="Copy JSON"
                              >
                                <Copy size={14} />
                              </button>
                              <button
                                onClick={() => onToggleLog(logId)}
                                className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-200"
                              >
                                <ChevronRight
                                  size={14}
                                  className={`transition-transform ${
                                    isLogExpanded ? "rotate-90" : ""
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          {/* Quick info row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-[11px] sm:text-xs">
                            {entry.razorpay_payment_id && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">
                                  Payment:
                                </span>
                                <code
                                  className="text-[10px] sm:text-[11px] bg-gray-100 px-2 py-1 rounded truncate"
                                  title={entry.razorpay_payment_id}
                                >
                                  {entry.razorpay_payment_id.substring(
                                    0,
                                    20
                                  )}
                                  ...
                                </code>
                              </div>
                            )}
                            {entry.order_id && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">
                                  Order ID:
                                </span>
                                <span className="font-medium text-blue-600">
                                  #{entry.order_id}
                                </span>
                              </div>
                            )}
                            {entry.partner && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">
                                  Partner:
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] sm:text-xs font-medium">
                                  {entry.partner}
                                </span>
                              </div>
                            )}
                            {entry.tracking_url && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">
                                  Tracking:
                                </span>
                                <a
                                  href={entry.tracking_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[#800020] hover:text-[#600018] text-[10px] sm:text-xs"
                                >
                                  View
                                  <ExternalLink size={12} />
                                </a>
                              </div>
                            )}
                            {entry.grand_total && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">
                                  Amount:
                                </span>
                                <span className="font-medium text-green-700">
                                  ₹{entry.grand_total}
                                </span>
                              </div>
                            )}
                            {entry.cart_size && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">
                                  Items:
                                </span>
                                <span className="font-medium">
                                  {entry.cart_size}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Full JSON */}
                          {isLogExpanded && (
                            <div className="mt-3 sm:mt-4 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs sm:text-sm font-medium text-gray-700">
                                  Raw Event Data
                                </span>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      JSON.stringify(entry, null, 2)
                                    )
                                  }
                                  className="text-[11px] sm:text-xs text-[#800020] hover:text-[#600018]"
                                >
                                  Copy JSON
                                </button>
                              </div>
                              <pre className="text-[10px] sm:text-xs bg-gray-900 text-gray-100 p-3 sm:p-4 rounded-lg overflow-x-auto max-h-80">
                                {JSON.stringify(entry, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderLogs;