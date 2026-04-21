import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useUser, useAuth } from "@clerk/clerk-react"; // Import useAuth
import axios from 'axios';

// Import all components, helpers, and constants
import api from '../../api';
import { currency } from '../../lib/utils';
// We no longer need the tracking-specific constants here
import OfferMarquee from '../shared/offerMarque';
import Navbar from './Navbar';
import Footer from './Footer';
import CartPanel from '../cart/CartPanel';
import CheckoutModal from '../checkout/CheckoutModal';
// The TrackOrderModal and its related constants are no longer needed.

export default function MainLayout() {
  const { user } = useUser();
  const { getToken } = useAuth(); // Get the function to fetch the JWT

  // --- APP STATE IS NOW MUCH SIMPLER ---
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  // All old tracking states (trackModalOpen, backendOrderId, courier, etc.) are REMOVED.

  const [address, setAddress] = useState({ name: "", phone: "", line1: "", area: "", city: "", pincode: "" });
  // Default to 'razorpay' since COD is removed
  const [payMethod, setPayMethod] = useState("razorpay");

  // --- Checkout flow state ---
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [platformFee, setPlatformFee] = useState(0);
  const [surgeFee, setSurgeFee] = useState(0);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

// --- NEW: State for managing saved addresses ---
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true); // For the "Save this address" checkbox
  const [chosenPartner, setChosenPartner] = useState("");
  const [deliveryMode, setDeliveryMode] = useState("");
  

  
  // This effect now handles setting the auth token and fetching initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [statusRes, platformFeeRes, surgeFeeRes, deliveryModeRes] = await Promise.all([
          api.get('/settings/store-status'),
          api.get('/settings/platform-fee'),
          api.get('/settings/surge-fee'),
          api.get('/settings/delivery-mode')
        ]);
        setIsStoreOpen(statusRes.data.setting_value === 'true');
        setPlatformFee(parseInt(platformFeeRes.data.setting_value, 10) || 0);
        setSurgeFee(parseInt(surgeFeeRes.data.setting_value, 10) || 0);
        setDeliveryMode(deliveryModeRes.data.setting_value);

      } catch (error) {
        console.error("Could not fetch initial store data.", error);
        setIsStoreOpen(false);
        setPlatformFee(0);
        setSurgeFee(0);
        setDeliveryMode('manual'); // <--- Add this safe fallback
      }
    };
    fetchInitialData();
  }, []);

  // --- DERIVED STATE ---
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const grandTotal = subtotal + platformFee + surgeFee + deliveryFee - discountAmount;

  // All polling functions (startPolling, stopPolling, etc.) are REMOVED.

  // --- CART & CHECKOUT HANDLERS ---

  const handleCalculateFee = useCallback(async (currentAddress) => {
    if (currentAddress.line1 && currentAddress.city && currentAddress.pincode && currentAddress.pincode.length === 6) {
      setIsCalculatingFee(true);
      try {
        const response = await api.post('/borzo/calculate-fee', { address: currentAddress, items: cart });
        setDeliveryFee(response.data.delivery_fee);
        setChosenPartner(response.data.chosen_partner);
      } catch (error) {
        toast.error("Could not calculate delivery fee for this address.");
        setDeliveryFee(0);
      } finally {
        setIsCalculatingFee(false);
      }
    }
  }, [cart]); // Empty dependency array means this function is created once

  // This function is also stable and doesn't need useCallback, but it's good practice
  const handleApplyCoupon = useCallback(async (couponCode, successCallback) => {
    try {
      const response = await api.post('/cart/validate-coupon', { coupon_code: couponCode, subtotal });
      setDiscountAmount(response.data.discount_amount);
      setAppliedCoupon(couponCode.toUpperCase());
       if (successCallback) successCallback();
    } catch (error) {
      toast.error(error.response?.data?.error || "Invalid or expired coupon.");
      setDiscountAmount(0);
      setAppliedCoupon(null);
    }
  }, [subtotal]); // Re-create only if subtotal changes

  const addToCart = (product, variant) => {
    if (!user) {
      toast.error("Please log in to add items to your cart.");
      return;
    }
    
    // If no variant is passed (legacy support), use the first one or defaults
    const selectedVariant = variant || (product.variants && product.variants[0]) || { id: 'default', weight: product.weight, price: product.price };
    
    // Create a unique ID for the cart item: ProductID + VariantID
    const uniqueCartItemId = `${product.id}-${selectedVariant.id}`;

    setCart(prev => {
      const existingItem = prev.find(item => item.cartItemId === uniqueCartItemId);
      
      if (existingItem) {
        return prev.map(item => 
          item.cartItemId === uniqueCartItemId 
            ? { ...item, qty: item.qty + 1 } 
            : item
        );
      }
      
      // Add new item with variant details
      return [...prev, {
        cartItemId: uniqueCartItemId, // Crucial for tracking
        id: product.id,
        name: product.name,
        img: product.img,
        cut: product.cut,
        // Use variant specific details
        variantId: selectedVariant.id,
        weight: selectedVariant.weight,
        price: selectedVariant.price,
        qty: 1
      }];
    });
    setCartOpen(true);
    toast.success(`${product.name} (${selectedVariant.weight}g) added!`);
  };

  const updateQty = (cartItemId, delta) => {
    setCart(prev => prev.map(i => (i.cartItemId === cartItemId ? { ...i, qty: Math.max(0, i.qty + delta) } : i)).filter(item => item.qty > 0));
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

// --- UPDATED: handleOpenCheckout ---
  const handleOpenCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    // Reset checkout state
    setDeliveryFee(0);
    setDiscountAmount(0);
    setAppliedCoupon(null);
    setSaveAddress(true); // Default to saving the address
    
    // Fetch addresses for the dropdown
    setIsLoadingAddresses(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("User not authenticated");
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const { data } = await api.get('/addresses');
      setSavedAddresses(data || []);
    } catch (error) {
      console.error("Failed to fetch saved addresses:", error);
      setSavedAddresses([]); // Ensure it's an array even on failure
    } finally {
      setIsLoadingAddresses(false);
    }

    setCartOpen(false);
    setCheckoutOpen(true);
  };


  // --- SIMPLIFIED CHECKOUT HANDLER (NO COD) ---<=
  const handleCheckout = async () => {
    
    if (!isStoreOpen) {
      toast.error("The store is currently closed and not accepting new orders.");
      return;
    }
    // Check 2: Is the address complete?
    if (!address.name || !address.phone || !address.line1 || !address.city || !address.pincode) {
      toast.error("Please fill in all required shipping address fields.");
      return;
    }
    // Check 3: Is the cart empty?
    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    // Check 4: Is the delivery fee still being calculated?
    if (isCalculatingFee) {
      toast.warn("Please wait, we are still calculating your delivery fee.");
      return;
    }
    // Check 5: (YOUR REQUEST) Has a valid delivery fee been calculated?
    if (deliveryFee < 0) {
      handleCalculateFee(address)
      toast.error("We are calculating your delivery fee. Please try again");
      return;
    }

    const orderPayload = {
      cart, address, payMethod: 'razorpay', // Hardcoded as razorpay
      subtotal, platform_fee: platformFee, delivery_fee: deliveryFee,
      surge_fee: surgeFee, discount_amount: discountAmount, grand_total: grandTotal, chosen_partner: chosenPartner
    };

    // console.log(orderPayload);
    // console.log(deliveryMode)


    const item = orderPayload.cart;
    const Matter = item.map((i) => `${i.qty}x ${i.name}${i.weight ? ` (${i.weight}g)` : ""}`).join(", ");
    const FullAddress = `${orderPayload.address.line1} ${orderPayload.address.area}`;
    const City = `${orderPayload.address.city} ${orderPayload.address.pincode}`;
    const SubTotal = `${orderPayload.subtotal}`;
    const SurgeFee = `${orderPayload.surge_fee}`;
    const DeliveryFee = `${orderPayload.delivery_fee}`;
    const PlatformFee = `${orderPayload.platform_fee}`;
    const DiscountAmount = `${orderPayload.discount_amount}`;
    const GrandTotal = `${orderPayload.grand_total}`;

    

    try {
      toast.info("Proceeding to secure payment...");
      const { data: razorpayData } = await api.post('/payment/create-order', { grandTotal });
      const options = {
        key: razorpayData.keyId,
        amount: razorpayData.amount,
        currency: "INR",
        name: "MakhmaliFresh",
        description: `Premium Meats Order for ${orderPayload.address.name}`,
        order_id: razorpayData.orderId,
        notes:{
          // delivery_mode: deliveryMode,
          partner: chosenPartner,
          name: orderPayload.address.name,
          matter: Matter,
          address: FullAddress,
          city_pin: City,
          sub_total: SubTotal,
          surge_fee: SurgeFee,
          platform_fee: PlatformFee,
          delivery_fee: DeliveryFee,
          discount_amount: DiscountAmount,
          grand_total: GrandTotal,
        },
        handler: async function (response) {
          try {
            // --- 1. GET THE AUTH TOKEN JUST-IN-TIME ---
            // This guarantees we have the token before making protected calls.
            const token = await getToken();
            if (!token) {
              toast.error("Authentication session timed out. Please log in again.");
              return;
            }
            // Manually set the auth header for this block of API calls
            const secureApi = axios.create({
              baseURL: api.defaults.baseURL,
              headers: { 'Authorization': `Bearer ${token}` }
            });

            if (saveAddress) {
                try {
                  await secureApi.post('/addresses', {
                    customer_name: address.name,
                    phone: address.phone,
                    address_line1: address.line1,
                    area: address.area,
                    city: address.city,
                    pincode: address.pincode,
                  });
                  // Don't even need to toast, just save it silently
                } catch (saveError) {
                  // This is a non-critical error, so we just log it
                  // and continue with the checkout process.
                  console.warn("Could not save address:", saveError);
                }
              }

            // --- 2. VERIFY PAYMENT (Public) ---
            await secureApi.post('/order/finalize-payment', {
              paymentResponse: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              orderPayload: orderPayload
            });

            // --- 3. CREATE INTERNAL ORDER (Now using the secure client) ---
            // const orderRes = await secureApi.post('/cart/checkout', {
            //   ...orderPayload,
            //   payMethod: 'razorpay'
            // });
            // const createdBackendOrderId = orderRes.data?.id;
            // if (!createdBackendOrderId) throw new Error("Order ID missing from backend");

            // // --- 4. CREATE BORZO DELIVERY (Now using the secure client) ---
            // const borzoRes = await secureApi.post("/borzo/create-order", {
            //   orderId: createdBackendOrderId,
            //   address,
            //   items: cart,
            // });

            setCheckoutOpen(false);
            toast.success("Payment successful! Your order has been placed. Check 'Orders' for details.");
            setCart([]);

          } catch (error) {
            toast.error(error.response?.data.erorr || "Payment verification failed, contact support for refund");
            console.error("Verification Error:", error);
          }
        },
        prefill: {
          name: address.name,
          email: user?.primaryEmailAddress?.emailAddress || "",
          contact: address.phone,
        },
        theme: { color: "#800020" } // Updated to your brand's red
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (e) {
      const serverMsg = e?.response?.data?.error || "An unexpected error occurred.";
      toast.error(`Checkout failed: ${serverMsg}`);
      console.error("Checkout error:", e);
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 font-sans">
      <ToastContainer position="top-center" theme="dark" autoClose={1000} />
      <OfferMarquee />

      {/* Navbar no longer needs the onTrackClick prop */}
      <Navbar onCartClick={() => setCartOpen(true)} cartItemCount={cartItemCount} />

      <CartPanel
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQty={updateQty}
        onRemoveItem={removeFromCart}
        subtotal={subtotal}
        onCheckout={handleOpenCheckout}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        // Totals
        subtotal={subtotal}
        platformFee={platformFee}
        surgeFee={surgeFee}
        deliveryFee={deliveryFee}
        discountAmount={discountAmount}
        grandTotal={grandTotal}
        isCalculatingFee={isCalculatingFee}
        // Address
        address={address}
        onAddressChange={setAddress} // setAddress is inherently stable
        onAddressBlur={handleCalculateFee} // This is now a stable useCallback
        // Address Props
        savedAddresses={savedAddresses}
        isLoadingAddresses={isLoadingAddresses}
        saveAddress={saveAddress}
        setSaveAddress={setSaveAddress} // --- THE MISSING PROP IS NOW PASSED ---
        // Payment
        payMethod={payMethod}
        onPayMethodChange={setPayMethod}
        // Coupon
        onApplyCoupon={handleApplyCoupon} // This is now a stable useCallback
        appliedCoupon={appliedCoupon}
        // Store
        isStoreOpen={isStoreOpen}
        // Actions
        onSubmit={handleCheckout}
      />

      {/* TrackOrderModal is REMOVED */}

      {/* Outlet context is simplified */}
      <Outlet context={{
        cart,
        addToCart,
        updateQty
      }} />

      <Footer />
    </div>
  );
}