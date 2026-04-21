import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingCart, Trash2 } from "lucide-react";
import { currency } from "../../lib/utils";

export default function ProductVariantModal({
  isOpen,
  onClose,
  product,
  onSelect,
  cartItems = [],
  onUpdateQty,
}) {
  // 🔧 Always call hooks – never before an early return
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onClose]);

  // If there's no product, nothing to show
  if (!product) return null;

  // Fallback for older products
  const variants =
    product.variants && product.variants.length > 0
      ? product.variants
      : [{ id: "default", weight: product.weight, price: product.price }];

  // Get cart quantity for each variant
  const getVariantQuantity = (variant) => {
    const variantKey = variant.id || variant.weight;
    const item = cartItems.find(
      (item) =>
        item.id === product.id &&
        (item.variantId === variantKey || item.weight === variant.weight)
    );
    return item ? item.qty : 0;
  };

  // Get variant ID for cart operations (matches MainLayout's addToCart)
  const getVariantId = (variant) => {
    const rawKey = (variant.id || variant.weight || "").toString();
    const cleanedKey = rawKey.replace(/\s/g, "");
    return `${product.id}-${cleanedKey}`;
  };

  const handleImageError = (e) => {
    e.currentTarget.src = `https://placehold.co/600x400/f0e9e2/333333?text=${encodeURIComponent(
      product.name
    )}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 xs:p-3 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          {/* GLASS BACKDROP */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* MODAL CARD */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="relative bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* HEADER */}
            <div className="flex items-start justify-between p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Product Image */}
                <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                  <img
                    src={product.img}
                    alt={product.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="min-w-0 flex-1">
                  <h3
                    className="font-bold text-lg sm:text-xl text-gray-900 truncate"
                    style={{ fontFamily: "var(--font-clash)" }}
                  >
                    {product.name}
                  </h3>
                  {product.cut && (
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {product.cut}
                    </p>
                  )}
                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full bg-red-50 text-red-900 text-xs font-medium border border-red-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="flex-shrink-0 ml-3 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-all hover:scale-105"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Available Weights
                  </p>
                  <p className="text-xs text-gray-500">
                    {variants.length} option
                    {variants.length > 1 ? "s" : ""}
                  </p>
                </div>

                <div className="space-y-3">
                  {variants.map((variant, idx) => {
                    const quantity = getVariantQuantity(variant);
                    const variantId = getVariantId(variant);

                    return (
                      <motion.div
                        key={variantId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          quantity > 0
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/50"
                        } group`}
                      >
                        {/* Variant Info */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-900 text-lg group-hover:text-red-900">
                              {variant.weight}
                            </span>
                            {quantity > 0 && (
                              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                {quantity} in cart
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-red-700 text-lg">
                            {currency(variant.price)}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                          {quantity > 0 && onUpdateQty ? (
                            <>
                              {/* Remove All Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateQty(variantId, -quantity);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all active:scale-95 text-sm font-semibold shadow-sm"
                              >
                                <Trash2 size={16} />
                                Remove All
                              </button>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 bg-white rounded-xl px-3 py-2 border border-gray-300 shadow-sm">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onUpdateQty(variantId, -1);
                                    }}
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all active:scale-95"
                                  >
                                    <Minus size={16} />
                                  </button>

                                  <span className="font-bold text-lg min-w-[30px] text-center text-gray-900">
                                    {quantity}
                                  </span>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onUpdateQty(variantId, 1);
                                    }}
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all active:scale-95"
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelect(product, variant);
                              }}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-800 text-white rounded-xl font-semibold hover:bg-red-900 transition-all active:scale-95 shadow-sm"
                            >
                              <ShoppingCart size={16} />
                              Add to Cart
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="border-t border-gray-100 bg-gray-50 p-4">
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
