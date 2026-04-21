import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Loader2, CheckCircle, ChevronDown, MapPin, CreditCard, Tag } from 'lucide-react';
import { currency } from '../../lib/utils';
import confetti from 'canvas-confetti';

const PaymentOption = ({ value, label, description, currentSelection, setSelection }) => {
  const isSelected = value === currentSelection;
  return (
    <button
      onClick={() => setSelection(value)}
      className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-200 flex items-start gap-4 group ${
        isSelected
          ? 'bg-slate-50 border-red-800 shadow-md ring-2 ring-red-800/20'
          : 'bg-white border-gray-200 hover:border-slate-400/50 hover:bg-slate-50/50'
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
          isSelected ? 'bg-red-800 border-red-800' : 'border-gray-300 group-hover:border-gray-400'
        }`}
      >
        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
      </div>
      <div className="flex-1">
        <p
          className={`font-semibold text-base mb-1 ${
            isSelected ? 'text-gray-900' : 'text-gray-700'
          }`}
        >
          {label}
        </p>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </button>
  );
};

export default function CheckoutModal({
  isOpen,
  onClose,
  subtotal,
  platformFee,
  surgeFee,
  deliveryFee,
  discountAmount,
  grandTotal,
  isCalculatingFee,
  address,
  onAddressChange,
  onAddressBlur,
  payMethod,
  onPayMethodChange,
  onApplyCoupon,
  appliedCoupon,
  isStoreOpen,
  onSubmit,
  savedAddresses = [],
  isLoadingAddresses,
  saveAddress,
  setSaveAddress,
}) {
  const [couponCode, setCouponCode] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('new');

  // ✅ Prevent background scroll when modal open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => (document.body.style.overflow = '');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (selectedAddressId === 'new') {
      onAddressChange((prev) => ({
        ...prev,
        line1: '',
        area: '',
        city: '',
        pincode: '',
      }));
      setSaveAddress(true);
    } else {
      const selected = savedAddresses.find(
        (a) => a.id === parseInt(selectedAddressId)
      );
      if (selected) {
        const newAddress = {
          name: selected.customer_name,
          phone: selected.phone,
          line1: selected.address_line1,
          area: selected.area,
          city: selected.city,
          pincode: selected.pincode,
        };
        onAddressChange(newAddress);
        onAddressBlur(newAddress);
        setSaveAddress(false);
      }
    }
  }, [selectedAddressId, isOpen]);

  const handleAddressBlur = () => {
    if (selectedAddressId === 'new') onAddressBlur(address);
  };

  const triggerConfetti = () => {
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.3, 0.7), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleApplyClick = () => {
    if (couponCode.trim()) {
      onApplyCoupon(couponCode.trim(), triggerConfetti);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0, scale: 0.98 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white w-full max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '95vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white flex-shrink-0">
            <div>
              <h3
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: 'var(--font-clash)' }}
              >
                Checkout
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Complete your delivery and payment details
              </p>
            </div>
            <button
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-200"
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-grow p-6 md:p-8 pb-4 overflow-y-auto flex flex-col lg:flex-row gap-8">
            {/* Left Column */}
            <div className="w-full lg:w-1/2 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-red-800" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Delivery Address
                  </h4>
                  <p className="text-sm text-gray-500">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              {/* Saved Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Saved Address
                </label>
                <div className="relative">
                  <select
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    disabled={isLoadingAddresses}
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3.5 appearance-none focus:ring-2 focus:ring-red-700 focus:border-red-700 transition-all pr-12 text-gray-700"
                  >
                    <option value="new">+ Add New Address</option>
                    {savedAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.customer_name} • {addr.name} • {addr.address_line1.substring(0, 25)}...
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    {isLoadingAddresses ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </div>
                </div>
              </div>

              {selectedAddressId === 'new' && (
                <>
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 bg-white text-sm text-gray-500">
                        Or enter new address
                      </span>
                    </div>
                  </div>

                  {/* Address Form */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Full Name
                        </label>
                        <input
                          value={address.name}
                          onChange={(e) =>
                            onAddressChange((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-red-700 focus:border-red-700 transition-all"
                          disabled={selectedAddressId !== 'new'}
                        />
                      </div>

                      {/* ✅ Digit-only Phone */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={10}
                          value={address.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            onAddressChange((prev) => ({
                              ...prev,
                              phone: value,
                            }));
                          }}
                          className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-red-700 focus:border-red-700 transition-all"
                          disabled={selectedAddressId !== 'new'}
                        />
                      </div>
                    </div>

                    {[
                      { label: 'Address Line (Flat, Building)', key: 'line1' },
                      { label: 'Area / Locality', key: 'area' },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          {field.label}
                        </label>
                        <input
                          value={address[field.key]}
                          onChange={(e) =>
                            onAddressChange((prev) => ({
                              ...prev,
                              [field.key]: e.target.value,
                            }))
                          }
                          onBlur={handleAddressBlur}
                          className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-red-700 focus:border-red-700 transition-all"
                        />
                      </div>
                    ))}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          City
                        </label>
                        <input
                          value={address.city}
                          onChange={(e) =>
                            onAddressChange((prev) => ({
                              ...prev,
                              city: e.target.value,
                            }))
                          }
                          onBlur={handleAddressBlur}
                          className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-red-700 focus:border-red-700 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Pincode
                        </label>
                        <input
                          value={address.pincode}
                          onChange={(e) =>
                            onAddressChange((prev) => ({
                              ...prev,
                              pincode: e.target.value,
                            }))
                          }
                          onBlur={handleAddressBlur}
                          className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-red-700 focus:border-red-700 transition-all"
                        />
                      </div>
                    </div>

                    {/* Save Address */}
                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="saveAddressCheck"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="h-4 w-4 text-red-700 rounded border-gray-300 focus:ring-red-600"
                      />
                      <label
                        htmlFor="saveAddressCheck"
                        className="text-sm font-medium text-gray-700"
                      >
                        Save this address for future orders
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column */}
            <div className="w-full lg:w-1/2 space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {currency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Platform Fee</span>
                    <span className="font-medium text-gray-900">
                      {currency(platformFee) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Surge Fee</span>
                    <span className="font-medium text-gray-900">
                      {currency(surgeFee) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Delivery Fee</span>
                    {isCalculatingFee ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    ) : (
                      <span className="font-medium text-gray-900">
                        {currency(deliveryFee)}
                      </span>
                    )}
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center py-2 text-green-600">
                      <span className="font-medium">
                        Discount ({appliedCoupon})
                      </span>
                      <span className="font-medium">
                        - {currency(discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-gray-900">
                        Grand Total
                      </span>
                      <span className="font-bold text-lg text-gray-900">
                        {currency(grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Tag className="w-4 h-4 text-gray-600" />
                  </div>
                  <label className="text-sm font-medium text-gray-700">
                    Apply Coupon Code
                  </label>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    placeholder="Enter coupon code"
                    className="flex-1 bg-white border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-red-700 focus:border-red-700 transition-all"
                  />
                  <button
                    onClick={handleApplyClick}
                    className="px-6 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-900 transition-all duration-200 whitespace-nowrap"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <CreditCard className="w-4 h-4 text-gray-600" />
                  </div>
                  <label className="text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                </div>
                <PaymentOption
                  value="razorpay"
                  label="Pay with Razorpay"
                  description="Secure payment via card, UPI, netbanking, and more"
                  currentSelection={payMethod}
                  setSelection={onPayMethodChange}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-white flex-shrink-0">
            {!isStoreOpen ? (
              <div className="flex items-center justify-center gap-3 text-sm text-red-800 font-semibold p-4 bg-red-50 rounded-xl border border-red-200">
                <Info size={18} />
                <p>
                  The store is currently offline and not accepting new orders.
                </p>
              </div>
            ) : (
              <button
                onClick={onSubmit}
                disabled={isCalculatingFee || !isStoreOpen}
                className="w-full py-4 text-lg rounded-xl bg-red-800 text-white font-bold hover:bg-red-900 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.99] shadow-lg shadow-red-800/25 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
              >
                {payMethod === 'cod'
                  ? `Place Order (${currency(grandTotal)})`
                  : `Proceed to Payment (${currency(grandTotal)})`}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
