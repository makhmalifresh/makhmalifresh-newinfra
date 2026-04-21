import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * A component that protects routes meant only for authenticated admins.
 * It checks for the presence of an 'admin_token' in localStorage.
 *
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The child components to render if the user is authenticated.
 * @returns {React.ReactNode} Either the child components or a redirect to the login page.
 */
const AdminProtectedRoute = ({ children }) => {
  // 1. Retrieve the admin authentication token from local storage.
  const token = localStorage.getItem('admin_token');

  // 2. Check if the token exists.
  //    If it doesn't, the user is not authenticated.
  if (!token) {
    // 3. Redirect the user to the admin login page.
    //    The 'replace' prop is used to replace the current entry in the
    //    history stack, which prevents the user from getting stuck in a
    //    redirect loop when they press the back button.
    return <Navigate to="/admin/login" replace />;
  }

  // 4. If the token exists, the user is authenticated.
  //    Render the child components passed into this protector.
  //    In App.jsx, this will be the <AdminLayout />, which contains the dashboard.
  return children;
};

export default AdminProtectedRoute;