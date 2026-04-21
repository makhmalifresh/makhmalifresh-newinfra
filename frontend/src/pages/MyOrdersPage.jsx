import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ExternalLink,
  Clock,
  Truck,
  CheckCircle,
  ChevronDown,
  MapPin,
  ShoppingBag,
  Calendar,
  IndianRupee,
  ArrowLeft,
  Phone,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { currency } from '../lib/utils';

const StatusBadge = ({ status, deliveryStatus, order }) => {
  // Enhanced status mapping for better clarity
  const statusConfig = {
    processing: {
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: CheckCircle,
      label: 'Confirmed'
    },
    delivered: {
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: CheckCircle,
      label: 'Delivered'
    }
  };

  // Use delivery_status if available, otherwise fall back to status
  const displayStatus = deliveryStatus || status;
  const config = statusConfig[displayStatus] || statusConfig.processing;
  const IconComponent = config.icon;

  return (
    <>
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.color} text-sm font-medium`}
      >
        <IconComponent size={14} />
        {config.label}
      </div>

      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-red-100 text-slate-800 border-red-200 text-sm font-medium"
      >
        <Truck size={14} />

        {order.tracking_url ? (
          <a
            href={order.tracking_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Track Delivery
          </a>
        ) : (
          <span>Dispatching soon</span>
        )}
      </div>
    </>


  );
};


const OrderCard = ({ order, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  // Construct shipping address from available fields
  const shippingAddress = [
    order.address_line1,
    order.area,
    order.city,
    order.pincode
  ].filter(Boolean).join(', ');

  const totalItems = order.items?.reduce((sum, item) => sum + (item.qty || 1), 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden mb-6"
    >
      {/* Header - Always Visible */}
      <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Order Icon with item count */}
            <div className="relative">
              <div className="p-3 bg-[#800020] rounded-xl">
                <Package className="text-white" size={20} />
              </div>
              {totalItems > 1 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-wrap">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar size={14} />
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <StatusBadge status={order.status} deliveryStatus={order.delivery_status} order={order} />
              </div>

              {/* Quick info row */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <ShoppingBag size={14} />
                  {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                </span>
                {order.customer_name && (
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {order.customer_name}
                  </span>
                )}
                {order.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={14} />
                    {order.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">Total Amount</p>
              <p className="text-xl font-bold text-gray-900 flex items-center gap-1">
                <IndianRupee size={18} />
                {order.grand_total}
              </p>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''
                  }`}
              />
            </button>
          </div>
        </div>

      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6 bg-gray-50">
              {/* Shipping & Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Shipping Address */}
                {shippingAddress && (
                  <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200">
                    <MapPin size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm mb-2">Shipping Address</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{shippingAddress}</p>
                    </div>
                  </div>
                )}

                {/* Customer Details */}
                <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200">
                  <User size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm mb-2">Customer Details</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      {order.customer_name && (
                        <p className="font-medium">{order.customer_name}</p>
                      )}
                      {order.phone && (
                        <p className="flex items-center gap-1">
                          <Phone size={12} />
                          {order.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900">Order Items ({order.items?.length || 0})</h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {order.items?.map((item, itemIndex) => (
                    <div key={itemIndex} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <Package size={20} className="text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500 mt-1">Quantity: {item.qty || 1}</p>
                          {item.price && (
                            <p className="text-sm text-gray-600 mt-1">
                              {currency(item.price)} each
                            </p>
                          )}
                        </div>
                      </div>
                      {item.price && (
                        <p className="font-semibold text-gray-900 text-lg">
                          {currency((item.price || 0) * (item.qty || 1))}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h4>
                <div className="space-y-3 max-w-md ml-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{currency(order.subtotal || order.grand_total)}</span>
                  </div>

                  {order.delivery_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-medium">{currency(order.delivery_fee)}</span>
                    </div>
                  )}

                  {order.platform_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Platform Fee</span>
                      <span className="font-medium">{currency(order.platform_fee)}</span>
                    </div>
                  )}

                  {order.surge_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service Fee</span>
                      <span className="font-medium">{currency(order.surge_fee)}</span>
                    </div>
                  )}

                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">-{currency(order.discount_amount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-3">
                    <span className="text-gray-900">Total Amount</span>
                    <span className="text-[#800020] flex items-center gap-1">
                      <IndianRupee size={16} />
                      {order.grand_total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-4">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 px-6 py-3 text-gray-700 font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  <ArrowLeft size={16} />
                  Continue Shopping
                </button>
                {order.tracking_url ? (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#800020] text-white font-semibold rounded-xl hover:bg-[#600018] transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Track Delivery
                    <ExternalLink size={16} />
                  </a>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 px-4 py-3 rounded-lg space-y-1">
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Your tracking link will appear here once a delivery partner is assigned.
                    </p>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LoadingSkeleton = () => {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((item) => (
        <div key={item} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="space-y-2 text-right">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex-1 text-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 mx-auto mt-2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/orders/my-orders');
        if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          console.error('API did not return an array for orders, setting to empty.');
          setOrders([]);
        }
      } catch (error) {
        console.error('Failed to fetch orders', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [getToken]);

  const totalSpent = orders.reduce((total, order) => total + (order.grand_total || 0), 0);
  const deliveredOrders = orders.filter(order => order.delivery_status === 'delivered').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-[#800020] rounded-2xl">
              <ShoppingBag className="text-white" size={24} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              My Orders
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
            Track and manage all your purchases in one place
          </p>
        </motion.div>

        {/* Stats Cards */}
        {!isLoading && orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
              <div className="text-2xl font-bold text-[#800020] mb-2">{orders.length}</div>
              <div className="text-sm text-gray-600 font-medium">Total Orders</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-1">
                <IndianRupee size={20} />
                {totalSpent}
              </div>
              <div className="text-sm text-gray-600 font-medium">Total Spent</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
              <div className="text-2xl font-bold text-emerald-600 mb-2">{deliveredOrders}</div>
              <div className="text-sm text-gray-600 font-medium">Delivered</div>
            </div>
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {isLoading ? (
            <LoadingSkeleton />
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No Orders Yet
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto leading-relaxed mb-6">
                Start shopping to see your order history here.
              </p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#800020] text-white font-semibold rounded-xl hover:bg-[#600018] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ShoppingBag size={16} />
                Start Shopping
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <OrderCard key={order.id} order={order} index={index} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Continue Shopping Button for non-empty state */}
        {!isLoading && orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12"
          >
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-2xl border border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowLeft size={18} />
              Continue Shopping
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}