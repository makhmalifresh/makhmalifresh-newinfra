import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

/**
 * A helper function to determine the title and description for the current admin page
 * based on the URL pathname. This is more scalable than using if/else statements.
 * @param {string} pathname - The current URL path from react-router.
 * @returns {{title: string, description: string}} An object with the page title and description.
 */
const getPageInfo = (pathname) => {
  switch (true) {
    case pathname.includes('/coupons'):
      return {
        title: 'Coupon Management',
        description: 'Create, view, and manage all discount codes for your store.'
      };
    case pathname.includes('/products'):
      return {
        title: '',
        description: ''
      };
      case pathname.includes('/offers'):
      return {
        title: 'Offer Management',
        description: 'Create, view, and manage all current offers for your store.'
      };
      case pathname.includes('/orders'):
      return {
        title: '',
        description: ''
      };
    default:
      return {
      };
  }
};

/**
 * The main container for the admin dashboard.
 * It renders a dynamic header and the appropriate management component
 * (e.g., StoreSettings, CouponManager) based on the current route.
 */
export default function AdminDashboardPage() {
  const location = useLocation();
  const { title, description } = getPageInfo(location.pathname);

  return (
    <div>
      {/* This new header provides better context for the admin. */}
      <div className="mb-8">
        <h1 
          className="text-4xl font-bold text-gray-800" 
          style={{ fontFamily: 'var(--font-clash)' }}
        >
          {title}
        </h1>
        <p className="mt-2 text-gray-500">
          {description}
        </p>
      </div>
      
      {/* The <Outlet> from react-router-dom will render the specific child
          component (StoreSettings, CouponManager, or ProductManager). */}
      <Outlet />
    </div>
  );
};