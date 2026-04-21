"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, ShoppingCart, Check } from "lucide-react";
import { currency } from "../../lib/utils";
import ProductVariantModal from "./ProductVariantModal";


export default function ProductCard({
  product,
  onAddToCart,
  onUpdateQty,
  cartQty = 0,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if this product has multiple options
  const hasVariants = product.variants && product.variants.length > 1;

  // Determine the price to display
  // If multiple variants, show "From [Lowest Price]"
  const displayPrice = hasVariants 
    ? `From ${currency(Math.min(...product.variants.map(v => parseInt(v.price))))}` 
    : currency(product.variants?.[0]?.price || product.price);

  // Wrapper to handle adding to cart + the visual success feedback
  const handleAddClick = (productToAdd, variant) => {
    onAddToCart(productToAdd, variant);
    setIsAdding(true);
  };

  // The main click handler for the button
  const handleMainAction = () => {
    if (hasVariants) {
        // Open modal for selection
        setIsModalOpen(true);
    } else {
        // Add directly (use first variant or fallback defaults)
        const variant = product.variants?.[0] || { weight: product.weight, price: product.price, id: 'default' };
        handleAddClick(product, variant);
    }
  };

  useEffect(() => {
    if (isAdding) {
      const timer = setTimeout(() => setIsAdding(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [isAdding]);

  const handleImageError = (e) => {
    e.currentTarget.src = `https://placehold.co/600x400/f0e9e2/333333?text=${encodeURIComponent(
      product.name
    )}`;
  };

  return (
    <>
      {/* The Modal is rendered here but hidden until isModalOpen is true */}
      <ProductVariantModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         product={product} 
         onSelect={handleAddClick} 
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        {/* Image */}
        <div className="relative overflow-hidden">
          <motion.img
            src={product.img}
            alt={product.name}
            onError={handleImageError}
            className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
            whileHover={{ scale: 1.05 }}
          />
          {product.tags?.[0] && (
            <div className="absolute top-3 left-3 bg-red-900 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
              {product.tags[0]}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex-grow">
            <h3
              className="text-lg font-bold text-gray-900 leading-tight"
              style={{ fontFamily: "var(--font-clash)" }}
            >
              {product.name}
            </h3>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-600 font-medium">
                {/* If variants exist, show count, otherwise show specific weight */}
                {hasVariants ? `${product.variants.length} Options` : (product.weight ? `${product.weight} gm` : "")}
              </p>
              <p className="text-xl font-bold text-red-900">
                {displayPrice}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-4 mb-3 border-t border-gray-100" />

          {/* Add to Cart / Quantity Controls */}
          {/* We only show +/- controls if it's a single-variant product that is already in cart.
              For multi-variant products, we always show the 'Select Options' button. */}
          {cartQty > 0 && !hasVariants ? (
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-200">
                <button
                  // Note: For single items, we construct the ID manually to match MainLayout logic
                  onClick={() => onUpdateQty(`${product.id}-v1`, -1)}
                  className="p-1 rounded-full hover:bg-gray-200 transition"
                >
                  <Minus size={16} className="text-gray-700" />
                </button>
                <span className="font-bold text-lg w-6 text-center text-red-900">
                  {cartQty}
                </span>
                <button
                  onClick={() => onUpdateQty(`${product.id}-v1`, 1)}
                  className="p-1 rounded-full hover:bg-gray-200 transition"
                >
                  <Plus size={16} className="text-gray-700" />
                </button>
              </div>

              <button
                onClick={() => onUpdateQty(`${product.id}-v1`, -cartQty)}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleMainAction}
              disabled={isAdding}
              className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-full transition-all duration-300 ${
                isAdding
                  ? "bg-green-600 text-white"
                  : "bg-red-900 text-white hover:bg-[#600018]"
              } shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#800020]/60`}
            >
              {isAdding ? (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-1"
                >
                  Added <Check size={18} />
                </motion.span>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  {hasVariants ? "Select Options" : "Add to Cart"}
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </>
  );
}