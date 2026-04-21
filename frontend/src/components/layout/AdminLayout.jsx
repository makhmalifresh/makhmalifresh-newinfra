import React, { useState, useEffect, Fragment } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Settings, 
  Tag, 
  LogOut, 
  Package, 
  ShieldCheck, 
  Menu, 
  X, 
  Megaphone,
  ChevronRight,
  Home,
  BarChart3,
  Logs,
  IndianRupee
} from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, motion } from 'framer-motion';

/* ------------------ Navigation Links ------------------ */

const NavigationLinks = () => {
  const getNavLinkClasses = ({ isActive }) =>
    `relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 group 
     ${isActive
        ? 'bg-gradient-to-r from-[#800020] via-[#c72c5c] to-[#1a0008] text-white shadow-[0_0_25px_rgba(128,0,32,0.55)] border border-white/10 scale-[1.01]'
        : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 hover:translate-x-1'
     }`;

  return (
    <nav className="flex-1 flex flex-col gap-1.5 px-3 py-5 overflow-y-auto">
      <NavLink to="/admin/dashboard" end className={getNavLinkClasses}>
        <div className="p-1.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
          <Settings className="h-4 w-4" />
        </div>
        <span>Store Settings</span>
        <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="absolute inset-y-1 left-1 w-[2px] bg-white/60 rounded-full opacity-0 group-hover:opacity-100" />
      </NavLink>
      
      <NavLink to="/admin/dashboard/coupons" className={getNavLinkClasses}>
        <div className="p-1.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
          <Tag className="h-4 w-4" />
        </div>
        <span>Coupons</span>
        <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
      </NavLink>
      
      <NavLink to="/admin/dashboard/products" className={getNavLinkClasses}>
        <div className="p-1.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
          <Package className="h-4 w-4" />
        </div>
        <span>Products</span>
        <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
      </NavLink>
      
      <NavLink to="/admin/dashboard/offers" className={getNavLinkClasses}>
        <div className="p-1.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
          <Megaphone className="h-4 w-4" />
        </div>
        <span>Offers</span>
        <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
      </NavLink>

      <NavLink to="/admin/dashboard/razorpay" className={getNavLinkClasses}>
        <div className="p-1.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
          <IndianRupee className="h-4 w-4" />
        </div>
        <span>Payment</span>
        <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
      </NavLink>

      <NavLink to="/admin/dashboard/orders" className={getNavLinkClasses}>
        <div className="p-1.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
          <BarChart3 className="h-4 w-4" />
        </div>
        <span>Orders</span>
        <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
      </NavLink>

      <NavLink to="/admin/dashboard/logs" className={getNavLinkClasses}>
        <div className="p-1.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
          <Logs className="h-4 w-4" />
        </div>
        <span>Logs</span>
        <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
      </NavLink>
    </nav>
  );
};

/* ------------------ Breadcrumb ------------------ */

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6">
      <Link
        to="/admin/dashboard"
        className="flex items-center gap-1 hover:text-[#800020] transition-colors"
      >
        <Home size={14} />
        <span>Dashboard</span>
      </Link>
      {pathnames.slice(2).map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 3).join('/')}`;
        const isLast = index === pathnames.slice(2).length - 1;
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');

        return (
          <Fragment key={routeTo}>
            <ChevronRight size={14} className="text-gray-400" />
            {isLast ? (
              <span className="text-[#800020] font-semibold truncate max-w-[140px] sm:max-w-none">
                {formattedName}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-[#800020] transition-colors truncate max-w-[140px] sm:max-w-none"
              >
                {formattedName}
              </Link>
            )}
          </Fragment>
        );
      })}
    </div>
  );
};

/* ------------------ Desktop Sidebar ------------------ */

const DesktopSidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:flex flex-col 
                 border-r border-white/10 
                 bg-gradient-to-b from-black/80 via-[#140008]/90 to-black/95 
                 backdrop-blur-2xl shadow-[0_0_35px_rgba(0,0,0,0.65)]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="relative">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#ff2a6f] via-[#800020] to-black flex items-center justify-center shadow-[0_0_25px_rgba(255,42,111,0.7)]">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-black shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
        </div>
        <div className="flex flex-col">
          <h2
            className="text-lg font-bold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-clash, system-ui)' }}
          >
            Admin Portal
          </h2>
          <p className="text-[11px] text-gray-400">Management & Analytics</p>
        </div>
      </div>

      {/* Navigation (scrollable) */}
      <div className="flex-1 overflow-hidden">
        <NavigationLinks />
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-4 border-t border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#800020] via-[#ff2a6f] to-black flex items-center justify-center">
            <span className="text-xs font-bold text-white">S</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Shoaib Qureshi</p>
            <p className="text-[11px] text-gray-400 truncate">Administrator</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold 
                     text-gray-200 transition-all
                     bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/40"
        >
          <div className="p-1.5 rounded-lg bg-black/40">
            <LogOut className="h-4 w-4" />
          </div>
          Logout
          <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
        </button>
      </div>
    </motion.aside>
  );
};

/* ------------------ Mobile Header & Sidebar ------------------ */

const MobileHeaderAndSidebar = ({ isMobileMenuOpen, setMobileMenuOpen }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile Header */}
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 
                   backdrop-blur-xl px-4 sm:px-6 shadow-sm lg:hidden sticky top-0 z-20"
      >
        <div className="flex items-center gap-3">
          <button
            className="rounded-xl p-2 text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#800020] via-[#ff2a6f] to-black flex items-center justify-center shadow-md">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h2
                className="text-base font-bold text-gray-900 leading-tight"
                style={{ fontFamily: 'var(--font-clash, system-ui)' }}
              >
                Admin
              </h2>
              <p className="text-[11px] text-gray-500">Dashboard</p>
            </div>
          </Link>
        </div>

        <div className="hidden xs:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium text-gray-500">Online</span>
        </div>
      </motion.header>

      {/* Mobile Sidebar / Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 230 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[82%] flex-col 
                         border-r border-white/10 
                         bg-gradient-to-b from-black/85 via-[#1a000b] to-black/95 
                         backdrop-blur-2xl shadow-2xl lg:hidden"
            >
              {/* Drawer Header */}
              <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#800020] via-[#ff2a6f] to-black flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2
                      className="text-base font-bold text-white tracking-tight"
                      style={{ fontFamily: 'var(--font-clash, system-ui)' }}
                    >
                      Admin Menu
                    </h2>
                    <p className="text-[11px] text-gray-400">Navigation</p>
                  </div>
                </div>
                <button
                  className="rounded-xl p-2 text-gray-300 hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav */}
              <div className="flex-1 overflow-hidden">
                <NavigationLinks />
              </div>

              {/* Drawer Footer */}
              <div className="px-4 pb-5 pt-3 border-t border-white/10 bg-black/40 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-[#800020] to-black flex items-center justify-center">
                    <span className="text-xs font-bold text-white">S</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">Shoaib Qureshi</p>
                    <p className="text-[11px] text-gray-400 truncate">Administrator</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold 
                             text-gray-100 transition-all
                             bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/40"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

/* ------------------ Main Layout ------------------ */

export default function AdminLayout() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-gray-900">
      {/* Toasts */}
      <ToastContainer 
        position="top-center" 
        theme="light" 
        autoClose={3000}
        toastClassName="rounded-xl font-medium shadow-lg"
        progressClassName="bg-gradient-to-r from-[#800020] via-[#ff2a6f] to-black"
      />

      {/* Glass Sidebar (Desktop) */}
      <DesktopSidebar />

      {/* Main content area shifted for sidebar on large screens */}
      <div className="lg:pl-72">
        {/* Mobile header & drawer */}
        <MobileHeaderAndSidebar
          isMobileMenuOpen={isMobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main content */}
        <main className="min-h-screen px-4 py-5 sm:px-6 md:px-8 md:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <Breadcrumb />

            {/* Animated page content container (Outlet) */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="rounded-2xl"
            >
              <Outlet />
            </motion.div>

            {/* Footer */}
            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-10 text-center text-[11px] sm:text-xs text-gray-500"
            >
              <p>
                © {new Date().getFullYear()} Admin Portal • v2.0 • 
                <span className="ml-1 text-[#800020] font-semibold">Secure Access</span>
              </p>
            </motion.footer>
          </div>
        </main>
      </div>
    </div>
  );
}
