import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package } from "lucide-react";
import { currency } from "../../lib/utils";

export default function OrderDetailsModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const fullAddress = `${order.address_line1}, ${order.area}, ${order.city} - ${order.pincode}`;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden border border-gray-100"
          style={{ maxHeight: "90vh" }}
        >
          {/* --- HEADER --- */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h3
              className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight"
              style={{ fontFamily: "var(--font-clash)" }}
            >
              <span className="flex items-center gap-2">
                <Package size={20} className="text-[#800020]" />
                Order #{order.id}
              </span>
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:text-red-800 hover:bg-gray-100 transition"
            >
              <X size={22} />
            </button>
          </div>

          {/* --- CONTENT --- */}
          <div className="p-6 sm:p-8 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Customer & Address */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                  Customer & Address
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-1 border border-gray-100">
                  <p className="font-semibold text-gray-900 text-base">
                    {order.customer_name}
                  </p>
                  <p className="text-gray-600">{order.phone}</p>
                  <p className="text-gray-600 mt-2 leading-snug">
                    {fullAddress}
                  </p>
                </div>
              </div>

              {/* Financial Summary */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                  Financial Summary
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{currency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Platform Fee</span>
                    <span>{currency(order.platform_fee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery Fee</span>
                    <span>{currency(order.delivery_fee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Surge Fee</span>
                    <span>{currency(order.surge_fee)}</span>
                  </div>
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Discount</span>
                    <span>-{currency(order.discount_amount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-1">
                    <span>Grand Total</span>
                    <span>{currency(order.grand_total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Ordered */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                Items Ordered
              </h4>
              <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-200">
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className="py-3 px-4 flex justify-between items-center hover:bg-white transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.qty} × {item.name}
                      </p>
                      {item.weight && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.weight}g
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {currency(item.price * item.qty)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info (optional) */}
            {order.tracking_url && (
              <div className="mt-8">
                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#800020] text-white text-sm font-semibold px-6 py-3 rounded-full shadow-md hover:bg-black transition-all duration-300"
                >
                  Track Delivery
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
