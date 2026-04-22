import React, { useState } from 'react';
import InfoModal from '../shared/InfoModal'; // Ensure this path is correct

// A small component for the partner logos for a cleaner look
const PartnerLogos = () => (
  <div className="flex items-center justify-center md:justify-start gap-6 mt-4">
    <img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" className="h-6 opacity-70" />
    <img src="https://borzodelivery.com/img/global/logo.svg" alt="Borzo" className="h-4 opacity-70" />
  </div>
);

export default function Footer() {
  const [modalContent, setModalContent] = useState(null); // 'refund', 'terms', or 'contact'

  const openModal = (type) => setModalContent(type);
  const closeModal = () => setModalContent(null);

  const getModalData = () => {
    // This function remains the same, providing content to the modal
    switch (modalContent) {
      case 'refund': return { title: 'Refund Policy', content: content };
      case 'terms': return { title: 'Terms of Service', content: content };
      case 'contact': return { title: 'Contact Us', content: content };
      default: return { title: '', content: null };
    }
  };

  // (Self-contained modal data for brevity, can be moved to a separate file)
  const modalData = {
    refund: {
      title: 'Refund Policy',
      content: (
        <>
          <h4 className="font-semibold mb-2">Last updated: October 19, 2025</h4>

          <p className="mb-3">
            Due to the highly perishable nature of our meat products, we do not accept returns under any
            circumstances. All sales are considered final once an order has been delivered.
          </p>

          <p className="mb-3">
            Your satisfaction is important to us. If there is an issue with your order, you must contact our
            support team within <strong>6 hours of delivery</strong>.
          </p>

          <p className="mb-2">Refunds or credits will only be considered under the following conditions:</p>
          <ul className="list-disc list-inside mb-3 space-y-1">
            <li>The product arrived damaged or spoiled.</li>
            <li>You received the wrong item or incorrect quantity.</li>
          </ul>

          <p className="mb-3">
            Because our products are perishable meat items, <strong>we do not offer replacements or
              exchanges</strong>. Instead, eligible issues may be resolved through a refund or partial credit at
            our discretion.
          </p>

          <p className="mb-3">
            To help us process your claim efficiently, please provide clear photographic evidence of the
            issue, including packaging and product condition.
          </p>

          <ul className="list-disc list-inside mb-4 space-y-1">
            <li>Approved refunds are issued to the original payment method within 5–7 business days.</li>
            <li>Orders that are not reported within the 6-hour window are considered accepted and ineligible for review.</li>
            <li>We are not responsible for delays or spoilage due to an incorrect delivery address or failure to collect the package promptly.</li>
          </ul>

          <p>
            By placing an order, you acknowledge and agree to these terms.
          </p>
        </>

      ),
    },
    terms: {
      title: 'Terms of Service',
      content: (
        <>
          <p>By using our website and placing an order, you agree to the following terms and conditions.</p>

          <h4 className="font-semibold">1. Orders</h4>
          <p>All orders are subject to availability. We reserve the right to refuse or cancel an order for any reason, including limitations on quantities, inaccuracies, or errors in product or pricing information.</p>
          <p>Once an order is confirmed, changes or cancellations may not be possible. Please review your order carefully before checkout.</p>

          <h4 className="font-semibold">2. Pricing and Payment</h4>
          <p>All prices are listed in INR. We accept payments via Razorpay (including UPI and credit/debit cards). Prices are subject to change without notice.</p>
          <p>Your order will not be processed until payment is successfully completed. In case of payment failure, the order will be automatically cancelled.</p>

          <h4 className="font-semibold">3. Delivery</h4>
          <p>Our delivery partner, Borzo aim to deliver your order within the estimated timeframe. However, we are not liable for delays caused by traffic, weather, strikes, or operational issues.</p>
          <p>The customer is responsible for providing accurate delivery details. We are not responsible for failed or delayed deliveries due to incorrect addresses or unavailability at the time of delivery.</p>

          <h4 className="font-semibold">4. Product Quality and Handling</h4>
          <p>Our products are highly perishable. Customers must ensure timely collection and proper storage after delivery.</p>
          <p>We are not responsible for spoilage resulting from delayed receipt, improper refrigeration, or mishandling by the customer.</p>

          <h4 className="font-semibold">5. No Return or Replacement Policy</h4>
          <p>Due to the perishable nature of our meat products, we do not accept returns, replacements, or exchanges. All sales are final.</p>
          <p>If you receive a damaged, spoiled, or incorrect item, you must contact us within 6 hours of delivery and provide photographic evidence. Refunds or credits may be issued at our discretion.</p>

          <h4 className="font-semibold">6. User Conduct</h4>
          <p>You agree not to use our website for any unlawful, abusive, or unauthorized activity. Fraudulent orders or misuse may result in cancellation and legal action.</p>

          <h4 className="font-semibold">7. Limitation of Liability</h4>
          <p>We are not liable for indirect, incidental, or consequential damages arising from the use of our services or products.</p>
          <p>This includes spoilage due to customer negligence, delays beyond our control, and third-party delivery issues.</p>

          <h4 className="font-semibold">8. Privacy and Data Use</h4>
          <p>Your personal details are collected and used in accordance with our Privacy Policy. By placing an order, you consent to the processing of your information for communication, delivery, and payment purposes.</p>

          <h4 className="font-semibold">9. Third-Party Services</h4>
          <p>We rely on third-party providers for payment processing and delivery. We are not responsible for errors, delays, or issues caused by these external partners.</p>

          <h4 className="font-semibold">10. Cancellation by Us</h4>
          <p>We reserve the right to cancel any order due to stock issues, incorrect pricing, operational concerns, or suspected fraudulent activity. In such cases, refunds will be processed to the original payment method.</p>

          <h4 className="font-semibold">11. Changes to Terms</h4>
          <p>We may update these Terms of Service at any time without prior notice. Continued use of the website constitutes acceptance of the revised terms.</p>

          <h4 className="font-semibold">12. Contact</h4>
          <p>For any concerns or queries regarding your order or these terms, please reach out to our support team.</p>
        </>


      ),
    },
    contact: {
      title: 'Contact Us',
      content: (
        <>
          <p className="mb-3">
            We're here to help! For any questions, concerns, or feedback, please reach out to us through the following channels:
          </p>

          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Customer Support Email:</strong> makhmalifresh@gmail.com
            </li>
            <li>
              <strong>Phone (Mon-Sun, 9 AM - 7 PM):</strong> +91 89591 11989
            </li>
            <li>
              <strong>Address:</strong> New Makhmali Mutton & Chicken Centre, Opp Makhmali Talav, LBS Road, Thane West - 400601.
            </li>
          </ul>
        </>

      ),
    },
  };

  const currentModal = modalContent ? modalData[modalContent] : { title: '', content: null };

  return (
    <>
      <InfoModal isOpen={!!modalContent} onClose={closeModal} title={currentModal.title}>
        {currentModal.content}
      </InfoModal>

      <footer className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-left">

            {/* Column 1: Brand & Mission */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <img src="/logo.png" alt="Al-Makhmali Logo" className="h-55 w-55 object-contain mb-2" />
              {/* <p className="text-gray-500">
                Delivering the finest, freshest cuts from local farms directly to your kitchen.
              </p> */}
            </div>

            {/* Column 2: Store Timings */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-bold text-lg text-gray-800 mb-4" style={{ fontFamily: 'var(--font-clash)' }}>
                Store Hours
              </h3>
              <ul className="space-y-2 text-gray-500">
                <li>
                  <strong>Monday – Sunday</strong>
                  <div>
                    <p>Morning: 8:00 AM – 2:00 PM</p>
                    <p>Evening: 5:00 PM – 8:00 PM</p>
                  </div>
                </li>
              </ul>


            </div>

            {/* Column 3: Quick Links */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-bold text-lg text-gray-800 mb-4" style={{ fontFamily: 'var(--font-clash)' }}>
                Customer Service
              </h3>
              <ul className="space-y-2 text-gray-500">
                <li><button onClick={() => openModal('refund')} className="hover:text-red-700 transition-colors">Refund Policy</button></li>
                <li><button onClick={() => openModal('terms')} className="hover:text-red-700 transition-colors">Terms of Service</button></li>
                <li><button onClick={() => openModal('contact')} className="hover:text-red-700 transition-colors">Contact Us</button></li>
              </ul>
            </div>

            {/* Column 4: Partners */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-bold text-lg text-gray-800 mb-4" style={{ fontFamily: 'var(--font-clash)' }}>
                Trusted Partners
              </h3>
              <p className="text-gray-500">Secure payments and reliable delivery.</p>
              <PartnerLogos />
            </div>

          </div>

          <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} Makhmali. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}