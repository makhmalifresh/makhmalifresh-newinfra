import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Minus, CreditCard } from 'lucide-react';
import { currency } from '../../lib/utils';

export default function CartPanel({ isOpen, onClose, cart, onUpdateQty, onRemoveItem, onCheckout, subtotal }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col font-sans"
          >
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h3 className="text-2xl font-bold text-neutral-800">Your Cart</h3>
              <button className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors" onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 text-center p-6">
                <ShoppingCart size={56} className="mb-5 opacity-20" />
                <p className="font-semibold text-xl text-neutral-700">Your cart is empty</p>
                <p className="mt-1">Looks like you haven't added anything yet.</p>
                <button
                  onClick={() => {
                    onClose(); // close modal first
                    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="mt-8 px-6 py-3 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  {cart.map(item => (
                    // Use cartItemId as the key for React performance
                    <motion.div layout key={item.cartItemId} className="flex items-start gap-4">
                      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={item.img}
                          onError={(e) => { e.currentTarget.src = `https://placehold.co/128x128/E2E8F0/4A5568?text=${encodeURIComponent(item.name)}`; }}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg text-neutral-800">{item.name}</p>
                        <p className="text-sm text-neutral-500 mb-1">{item.cut}</p>
                        {/* Display weight if available */}
                        {item.weight && <p className="text-xs text-neutral-400 mb-2 font-medium">{item.weight}g</p>}
                        
                        <div className="flex items-center gap-4 mt-2">
                          {/* FIX: Use item.cartItemId for updates */}
                          <button 
                            onClick={() => onUpdateQty(item.cartItemId, -1)} 
                            className="p-1.5 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors disabled:opacity-50"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-md font-semibold w-8 text-center">{item.qty}</span>
                          {/* FIX: Use item.cartItemId for updates */}
                          <button 
                            onClick={() => onUpdateQty(item.cartItemId, 1)} 
                            className="p-1.5 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right flex flex-col justify-between h-full">
                        <p className="font-bold text-lg text-neutral-900">{currency(item.price * item.qty)}</p>
                        {/* FIX: Use item.cartItemId for removal */}
                        <button 
                          onClick={() => onRemoveItem(item.cartItemId)} 
                          className="mt-auto text-sm text-red-500 hover:text-red-700 transition-colors font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-6 border-t border-neutral-200 bg-neutral-50">
                  <div className="flex items-baseline justify-between mb-4">
                    <p className="text-neutral-600 font-medium">Subtotal</p>
                    <p className="font-bold text-2xl text-neutral-900">{currency(subtotal)}</p>
                  </div>
                  <button onClick={onCheckout} className="w-full flex items-center justify-center gap-2.5 px-4 py-4 rounded-xl bg-red-700 text-white font-bold text-lg hover:bg-red-600 transition-transform hover:scale-[1.02] shadow-lg hover:shadow-blue-300">
                    <CreditCard size={20} /> Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}