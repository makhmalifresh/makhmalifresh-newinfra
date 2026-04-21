import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronRight, 
  CreditCard, 
  User, 
  Clock, 
  Mail,
  Phone,
  MapPin,
  Package,
  IndianRupee,
  Calendar,
  Download,
  Copy,
  ExternalLink,
  Banknote,
  Wallet,
  Smartphone,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpDown,
  FileText,
  TrendingUp,
  Shield,
  MoreVertical,
  X
} from "lucide-react";
import api from "../../api";

const PAYMENT_STATUS = {
  captured: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle, label: "Captured" },
  created: { bg: "bg-blue-100", text: "text-blue-800", icon: Clock, label: "Created" },
  authorized: { bg: "bg-yellow-100", text: "text-yellow-800", icon: AlertCircle, label: "Authorized" },
  failed: { bg: "bg-red-100", text: "text-red-800", icon: XCircle, label: "Failed" },
  refunded: { bg: "bg-purple-100", text: "text-purple-800", icon: CheckCircle, label: "Refunded" }
};

const PAYMENT_METHODS = {
  upi: { bg: "bg-blue-100", text: "text-blue-800", icon: Smartphone, label: "UPI" },
  netbanking: { bg: "bg-indigo-100", text: "text-indigo-800", icon: Banknote, label: "Net Banking" },
  card: { bg: "bg-rose-100", text: "text-rose-800", icon: CreditCard, label: "Card" },
  wallet: { bg: "bg-amber-100", text: "text-amber-800", icon: Wallet, label: "Wallet" },
  emi: { bg: "bg-cyan-100", text: "text-cyan-800", icon: CreditCard, label: "EMI" }
};

const RazorpayLogs = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPayments, setExpandedPayments] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPaymentId, setFilterPaymentId] = useState("");
  const [filterOrderId, setFilterOrderId] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterContact, setFilterContact] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [timeRange, setTimeRange] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // Mobile filter drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchRazorpayLogs();
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterOpen]);

  const fetchRazorpayLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/getrazorpay");
      const data = res.data.getOrderDetails;
      setPayments(data.items || []);
    } catch (err) {
      console.error("Failed to load Razorpay logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const processedPayments = useMemo(() => {
    return payments.map(payment => ({
      ...payment,
      // Convert amount from paise to rupees
      amountInRupees: payment.amount / 100,
      feeInRupees: payment.fee ? payment.fee / 100 : 0,
      taxInRupees: payment.tax ? payment.tax / 100 : 0,
      amountRefundedInRupees: payment.amount_refunded ? payment.amount_refunded / 100 : 0,
      // Parse notes JSON if it's a string
      notes: typeof payment.notes === 'string' ? JSON.parse(payment.notes) : payment.notes,
      // Format dates
      formattedDate: new Date(payment.created_at * 1000).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
  }, [payments]);

  const filteredPayments = useMemo(() => {
    let result = [...processedPayments];

    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(payment => 
        payment.id.toLowerCase().includes(term) ||
        payment.order_id?.toLowerCase().includes(term) ||
        payment.email.toLowerCase().includes(term) ||
        payment.contact.toLowerCase().includes(term) ||
        (payment.notes?.name && payment.notes.name.toLowerCase().includes(term)) ||
        (payment.notes?.address && payment.notes.address.toLowerCase().includes(term)) ||
        (payment.notes?.matter && payment.notes.matter.toLowerCase().includes(term))
      );
    }

    // Individual filters
    if (filterPaymentId) {
      result = result.filter(p => p.id.toLowerCase().includes(filterPaymentId.toLowerCase()));
    }
    if (filterOrderId) {
      result = result.filter(p => p.order_id?.toLowerCase().includes(filterOrderId.toLowerCase()));
    }
    if (filterEmail) {
      result = result.filter(p => p.email.toLowerCase().includes(filterEmail.toLowerCase()));
    }
    if (filterContact) {
      result = result.filter(p => p.contact.toLowerCase().includes(filterContact.toLowerCase()));
    }
    if (filterStatus) {
      result = result.filter(p => p.status === filterStatus);
    }
    if (filterMethod) {
      result = result.filter(p => p.method === filterMethod);
    }

    // Amount filters
    if (minAmount) {
      const min = parseFloat(minAmount) * 100; // Convert to paise
      result = result.filter(p => p.amount >= min);
    }
    if (maxAmount) {
      const max = parseFloat(maxAmount) * 100; // Convert to paise
      result = result.filter(p => p.amount <= max);
    }

    // Time range filter
    if (timeRange !== "all") {
      const now = Math.floor(Date.now() / 1000);
      let cutoff = now;
      
      switch(timeRange) {
        case "1h": cutoff -= 3600; break;
        case "24h": cutoff -= 86400; break;
        case "7d": cutoff -= 604800; break;
        case "30d": cutoff -= 2592000; break;
        default: break;
      }
      
      result = result.filter(p => p.created_at >= cutoff);
    }

    // Sorting
    result.sort((a, b) => {
      switch(sortBy) {
        case "latest":
          return b.created_at - a.created_at;
        case "oldest":
          return a.created_at - b.created_at;
        case "amount_high":
          return b.amount - a.amount;
        case "amount_low":
          return a.amount - b.amount;
        default:
          return b.created_at - a.created_at;
      }
    });

    return result;
  }, [
    processedPayments, 
    searchTerm, 
    filterPaymentId, 
    filterOrderId, 
    filterEmail, 
    filterContact, 
    filterStatus, 
    filterMethod, 
    timeRange, 
    sortBy, 
    minAmount, 
    maxAmount
  ]);

  const togglePayment = (paymentId) => {
    const newExpanded = new Set(expandedPayments);
    if (newExpanded.has(paymentId)) {
      newExpanded.delete(paymentId);
    } else {
      newExpanded.add(paymentId);
    }
    setExpandedPayments(newExpanded);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getStatusConfig = (status) => {
    return PAYMENT_STATUS[status] || { bg: "bg-gray-100", text: "text-gray-800", icon: AlertCircle, label: status };
  };

  const getMethodConfig = (method) => {
    return PAYMENT_METHODS[method] || { bg: "bg-gray-100", text: "text-gray-800", icon: CreditCard, label: method };
  };

  const getBankName = (code) => {
    const banks = {
      'ICIC': 'ICICI Bank',
      'HDFC': 'HDFC Bank',
      'SBIN': 'State Bank of India',
      'AXIS': 'Axis Bank',
      'UTIB': 'Axis Bank',
      'KKBK': 'Kotak Mahindra Bank',
      'YESB': 'Yes Bank',
      'INDB': 'IndusInd Bank',
      'BARB': 'Bank of Baroda',
      'CNRB': 'Canara Bank'
    };
    return banks[code] || code;
  };

  const downloadCSV = () => {
    const headers = [
      'Payment ID',
      'Order ID',
      'Amount (₹)',
      'Status',
      'Method',
      'Customer Name',
      'Email',
      'Contact',
      'Date',
      'Items',
      'Address',
      'Sub Total',
      'Delivery Fee',
      'Platform Fee',
      'Surge Fee',
      'Grand Total',
      'Razorpay Fee',
      'GST'
    ];

    const csvData = filteredPayments.map(payment => [
      payment.id,
      payment.order_id || 'N/A',
      payment.amountInRupees,
      payment.status,
      payment.method,
      payment.notes?.name || 'N/A',
      payment.email,
      payment.contact,
      payment.formattedDate,
      payment.notes?.matter || 'N/A',
      payment.notes?.address || 'N/A',
      payment.notes?.sub_total || '0',
      payment.notes?.delivery_fee || '0',
      payment.notes?.platform_fee || '0',
      payment.notes?.surge_fee || '0',
      payment.notes?.grand_total || '0',
      payment.feeInRupees,
      payment.taxInRupees
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `razorpay_payments_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const calculateStats = useMemo(() => {
    if (filteredPayments.length === 0) {
      return {
        totalAmount: 0,
        totalFee: 0,
        totalTax: 0,
        successCount: 0,
        failureCount: 0,
        averageAmount: 0
      };
    }

    const capturedPayments = filteredPayments.filter(p => p.status === 'captured');
    const totalAmount = capturedPayments.reduce((sum, p) => sum + p.amountInRupees, 0);
    const totalFee = capturedPayments.reduce((sum, p) => sum + p.feeInRupees, 0);
    const totalTax = capturedPayments.reduce((sum, p) => sum + p.taxInRupees, 0);

    return {
      totalAmount,
      totalFee,
      totalTax,
      successCount: capturedPayments.length,
      failureCount: filteredPayments.filter(p => p.status === 'failed').length,
      averageAmount: capturedPayments.length > 0 ? totalAmount / capturedPayments.length : 0
    };
  }, [filteredPayments]);

  // Shared Filters UI (used for desktop sidebar + mobile drawer)
  const renderFilters = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Filter size={20} className="text-gray-600" />
        <h2 className="font-bold text-gray-800 text-lg">Filters & Sort</h2>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Search size={16} className="inline mr-2" />
            Global Search
          </label>
          <input
            type="text"
            placeholder="Search across all fields..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Sorting */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ArrowUpDown size={16} className="inline mr-2" />
            Sort By
          </label>
          <select
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount_high">Amount (High to Low)</option>
            <option value="amount_low">Amount (Low to High)</option>
          </select>
        </div>

        {/* Payment ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CreditCard size={16} className="inline mr-2" />
            Payment ID
          </label>
          <input
            type="text"
            placeholder="Filter by payment ID..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
            value={filterPaymentId}
            onChange={(e) => setFilterPaymentId(e.target.value)}
          />
        </div>

        {/* Order ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Package size={16} className="inline mr-2" />
            Order ID
          </label>
          <input
            type="text"
            placeholder="Filter by order ID..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
            value={filterOrderId}
            onChange={(e) => setFilterOrderId(e.target.value)}
          />
        </div>

        {/* Customer Filters */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail size={16} className="inline mr-2" />
              Email
            </label>
            <input
              type="text"
              placeholder="Filter by email..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone size={16} className="inline mr-2" />
              Contact
            </label>
            <input
              type="text"
              placeholder="Filter by phone..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
              value={filterContact}
              onChange={(e) => setFilterContact(e.target.value)}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="captured">Captured</option>
            <option value="created">Created</option>
            <option value="authorized">Authorized</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Method Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <select
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
          >
            <option value="">All Methods</option>
            <option value="upi">UPI</option>
            <option value="netbanking">Net Banking</option>
            <option value="card">Card</option>
            <option value="wallet">Wallet</option>
            <option value="emi">EMI</option>
          </select>
        </div>

        {/* Amount Range */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            <IndianRupee size={16} className="inline mr-2" />
            Amount Range (₹)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              min="0"
            />
            <input
              type="number"
              placeholder="Max"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              min="0"
            />
          </div>
        </div>

        {/* Time Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock size={16} className="inline mr-2" />
            Time Range
          </label>
          <select
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(searchTerm || filterPaymentId || filterOrderId || filterEmail || filterContact || filterStatus || filterMethod || timeRange !== "all" || minAmount || maxAmount) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterPaymentId("");
              setFilterOrderId("");
              setFilterEmail("");
              setFilterContact("");
              setFilterStatus("");
              setFilterMethod("");
              setTimeRange("all");
              setMinAmount("");
              setMaxAmount("");
            }}
            className="w-full px-4 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800020] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Razorpay payment logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Razorpay Payment Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Real-time payment tracking, customer details, and transaction analytics
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={downloadCSV}
                className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
              >
                <Download size={16} />
                Export CSV
              </button>
              <button
                onClick={fetchRazorpayLogs}
                className="inline-flex items-center gap-2 bg-[#800020] text-white px-4 py-2.5 rounded-lg hover:bg-[#600018] transition-colors text-sm md:text-base"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{calculateStats.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <IndianRupee className="text-[#800020]" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Successful Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{calculateStats.successCount}</p>
                </div>
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Razorpay Fees</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{calculateStats.totalFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <CreditCard className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Average Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{calculateStats.averageAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="text-emerald-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters (Desktop / Large screens) */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-6">
              <div className="max-h-[calc(100vh-3rem)] overflow-y-auto pr-1">
                {renderFilters()}
              </div>
            </div>
          </div>

          {/* Right Panel - Payment List */}
          <div className="lg:col-span-3">
            {/* Summary Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900">
                    Showing {filteredPayments.length} of {payments.length} Payments
                  </h3>
                  <p className="text-sm text-gray-500">
                    Limited to latest 100 Orders only.
                  </p>
                  <p className="text-sm text-gray-500">
                    {calculateStats.successCount} successful • {calculateStats.failureCount} failed
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Net Revenue:{" "}
                    <span className="font-bold text-[#800020]">
                      ₹{calculateStats.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Payments List */}
            <div className="space-y-4">
              {filteredPayments.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <CreditCard className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No payments found</h3>
                  <p className="text-gray-500">Try adjusting your filters or refresh the data</p>
                </div>
              ) : (
                filteredPayments.map((payment) => {
                  const statusConfig = getStatusConfig(payment.status);
                  const methodConfig = getMethodConfig(payment.method);
                  const StatusIcon = statusConfig.icon;
                  const MethodIcon = methodConfig.icon;
                  const isExpanded = expandedPayments.has(payment.id);

                  return (
                    <div
                      key={payment.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Payment Header */}
                      <div className="p-4 md:p-6 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-bold text-gray-900 truncate max-w-full">
                                    {payment.id}
                                  </h3>
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.bg} ${statusConfig.text} whitespace-nowrap`}>
                                    <StatusIcon size={12} className="inline mr-1" />
                                    {statusConfig.label}
                                  </span>
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${methodConfig.bg} ${methodConfig.text} whitespace-nowrap`}>
                                    <MethodIcon size={12} className="inline mr-1" />
                                    {methodConfig.label}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                                  <span className="flex items-center gap-1 min-w-0">
                                    <Package size={14} />
                                    <span className="truncate max-w-[200px] sm:max-w-[260px]">
                                      {payment.order_id ? payment.order_id : 'No Order ID'}
                                    </span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {payment.formattedDate}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs text-gray-500">Amount</p>
                                <p className="text-lg font-bold text-gray-900 break-words">
                                  ₹{payment.amountInRupees}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Customer</p>
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[160px] sm:max-w-full">
                                  {payment.notes?.name || payment.email}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Contact</p>
                                <p className="text-sm font-medium text-gray-900 break-words">
                                  {payment.contact}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Items</p>
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[160px] sm:max-w-full">
                                  {payment.notes?.matter ? payment.notes.matter.split(',')[0] : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start">
                            <button
                              onClick={() => copyToClipboard(payment.id)}
                              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                              title="Copy Payment ID"
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              onClick={() => togglePayment(payment.id)}
                              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[#800020] text-white rounded-lg hover:bg-[#600018] transition-colors text-sm"
                            >
                              {isExpanded ? 'Less Details' : 'More Details'}
                              <ChevronRight 
                                className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                                size={16} 
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-gray-100">
                          <div className="p-4 md:p-6 space-y-6">
                            {/* Row 1: Customer & Order Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                  <User size={16} />
                                  Customer Information
                                </h4>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-xs text-gray-500">Name</p>
                                    <p className="text-sm font-medium text-gray-900 break-words">
                                      {payment.notes?.name || 'N/A'}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-xs text-gray-500">Email</p>
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {payment.email}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Contact</p>
                                      <p className="text-sm font-medium text-gray-900 break-words">
                                        {payment.contact}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                      <MapPin size={12} />
                                      Delivery Address
                                    </p>
                                    <p className="text-sm text-gray-900 mt-1 break-words">
                                      {payment.notes?.address || 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-600 break-words">
                                      {payment.notes?.city_pin || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                  <Package size={16} />
                                  Order Details
                                </h4>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-xs text-gray-500">Order Items</p>
                                    <p className="text-sm font-medium text-gray-900 break-words">
                                      {payment.notes?.matter || 'N/A'}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-xs text-gray-500">Order ID</p>
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {payment.order_id || 'N/A'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Payment ID</p>
                                      <div className="flex items-center gap-2">
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded truncate flex-1 break-all">
                                          {payment.id}
                                        </code>
                                        <button
                                          onClick={() => copyToClipboard(payment.id)}
                                          className="text-xs text-[#800020] hover:text-[#600018] whitespace-nowrap"
                                        >
                                          Copy
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Row 2: Payment Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                  <CreditCard size={16} />
                                  Payment Method
                                </h4>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-xs text-gray-500">Method</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <MethodIcon size={16} className={methodConfig.text} />
                                      <span className="text-sm font-medium text-gray-900">
                                        {methodConfig.label}
                                      </span>
                                    </div>
                                  </div>
                                  {payment.bank && (
                                    <div>
                                      <p className="text-xs text-gray-500">Bank</p>
                                      <p className="text-sm font-medium text-gray-900">
                                        {getBankName(payment.bank)}
                                      </p>
                                    </div>
                                  )}
                                  {payment.vpa && (
                                    <div>
                                      <p className="text-xs text-gray-500">VPA</p>
                                      <p className="text-sm font-medium text-gray-900 break-all">
                                        {payment.vpa}
                                      </p>
                                    </div>
                                  )}
                                  {payment.acquirer_data && (
                                    <div>
                                      <p className="text-xs text-gray-500">Transaction ID</p>
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {payment.acquirer_data.bank_transaction_id || 
                                         payment.acquirer_data.rrn || 
                                         payment.acquirer_data.upi_transaction_id || 
                                         'N/A'}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                  <IndianRupee size={16} />
                                  Amount Breakdown
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Sub Total</span>
                                    <span className="font-medium">₹{payment.notes?.sub_total || '0'};</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Delivery Fee</span>
                                    <span className="font-medium">₹{payment.notes?.delivery_fee || '0'}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Platform Fee</span>
                                    <span className="font-medium">₹{payment.notes?.platform_fee || '0'}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Surge Fee</span>
                                    <span className="font-medium">₹{payment.notes?.surge_fee || '0'}</span>
                                  </div>
                                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                                    <span className="font-bold text-gray-900">Grand Total</span>
                                    <span className="font-bold text-[#800020]">
                                      ₹{payment.notes?.grand_total || '0'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                  <Shield size={16} />
                                  Razorpay Fees
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Payment Amount</span>
                                    <span className="font-medium">₹{payment.amountInRupees}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Razorpay Fee</span>
                                    <span className="font-medium">₹{payment.feeInRupees}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">GST</span>
                                    <span className="font-medium">₹{payment.taxInRupees}</span>
                                  </div>
                                  {payment.amount_refunded > 0 && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Amount Refunded</span>
                                      <span className="font-medium">
                                        ₹{payment.amountRefundedInRupees}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                                    <span className="font-medium text-gray-900">Net Amount</span>
                                    <span className="font-medium text-green-600">
                                      ₹{(payment.amountInRupees - payment.feeInRupees).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Raw JSON Data */}
                            <div className="bg-gray-900 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-100 flex items-center gap-2">
                                  <FileText size={16} />
                                  Raw Payment Data
                                </h4>
                                <button
                                  onClick={() => copyToClipboard(JSON.stringify(payment, null, 2))}
                                  className="text-sm text-gray-300 hover:text-white"
                                >
                                  Copy JSON
                                </button>
                              </div>
                              <div className="rounded-md bg-black/40 p-2">
                                <pre className="text-xs text-gray-300 overflow-x-auto max-h-48 sm:max-h-60 md:max-h-72 break-words">
                                  {JSON.stringify(payment, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination/Footer */}
            {filteredPayments.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <p className="text-sm text-gray-500">
                    Showing {filteredPayments.length} of {payments.length} payments
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={downloadCSV}
                      className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      <Download size={14} />
                      Export CSV
                    </button>
                    <p className="text-xs text-gray-400">
                      Data refreshes automatically every 5 minutes
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Filters Button (Mobile only) */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="fixed bottom-6 right-6 z-30 lg:hidden inline-flex items-center gap-2 px-4 py-3 rounded-full shadow-lg bg-[#800020] text-white hover:bg-[#600018] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#800020]"
        >
          <Filter size={18} />
          <span className="text-sm font-medium">Filters</span>
        </button>

        {/* Mobile Filter Drawer with Overlay */}
        <div
          className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
            isFilterOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Dimmed background */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsFilterOpen(false)}
          />

          {/* Drawer panel */}
          <div
            className={`absolute inset-y-0 left-0 w-80 max-w-[85%] bg-white shadow-xl transform transition-transform duration-300 ease-out ${
              isFilterOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-700" />
                <span className="font-semibold text-gray-800">Filters & Sort</span>
              </div>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#800020]/30"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100vh-4rem)]">
              {renderFilters()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RazorpayLogs;
