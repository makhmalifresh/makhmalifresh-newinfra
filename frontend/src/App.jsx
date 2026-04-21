import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn } from "@clerk/clerk-react";

// --- Layouts ---
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';

// --- Customer Pages ---
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import MyOrdersPage from './pages/MyOrdersPage';

// --- Admin Pages ---
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import StoreSettings from './components/admin/StoreSettings';
import CouponManager from './components/admin/CouponManager';
import ProductManager from './components/admin/ProductManager';
import OfferManager from './components/admin/OfferManager';
import OrderManager from './components/admin/OrderManager';
import OrderLogs from './components/admin/OrderLogs';
import RazorpayLogs from './components/admin/RazorpayLogs';

export default function App() {
  return (
    <Routes>
      {/* ===========================================
        === CUSTOMER AUTH & PUBLIC-FACING ROUTES ===
        ===========================================
      */}

      {/* Standalone pages for Clerk authentication */}
      <Route path="/login/*" element={<LoginPage />} />
      <Route path="/signup/*" element={<SignUpPage />} />

      {/* --- THIS IS THE CRITICAL FIX ---
        We change the greedy `path="/*"` to the specific `path="/"`.
        This route group now only handles the root path and its children.
      */}
      <Route path="/" element={<MainLayout />}>
        {/* Renders at / */}
        <Route index element={<HomePage />} />

        {/* Renders at /my-orders */}
        <Route
          path="my-ordered"
          element={
            <SignedIn>
              <MyOrdersPage />
            </SignedIn>
          }
        />
        {/* You can add more customer pages here, like:
        <Route path="about" element={<AboutPage />} /> 
        */}
      </Route>

      {/* ===========================================
        === ADMIN-ONLY ROUTES ===
        ===========================================
      */}

      {/* The standalone public login page for the admin */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* This route is now a SIBLING of the "/" route.
        It will no longer conflict. It correctly handles all /admin/* paths.
      */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboardPage />}>
          <Route index element={<StoreSettings />} />
          <Route path="orders" element={<OrderManager />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="coupons" element={<CouponManager />} />
          <Route path="offers" element={<OfferManager />} />
          <Route path="logs" element={<OrderLogs />} />
          <Route path="razorpay" element={<RazorpayLogs/>} />
        </Route>

        {/* This redirect ensures that /admin always goes to /admin/dashboard */}
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

    </Routes>
  );
}