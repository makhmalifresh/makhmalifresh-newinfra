import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { ShoppingCart, Package } from 'lucide-react';

export default function Navbar({ onCartClick, cartItemCount }) {
  const { isSignedIn } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);

  // This effect adds a background to the navbar when the user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      // Set the scrolled state if the user scrolls more than 10 pixels
      setIsScrolled(window.scrollY > 10);
    };
    // Add the scroll listener when the component mounts
    window.addEventListener('scroll', handleScroll);
    // Remove the listener when the component unmounts to prevent memory leaks
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 
        ${isScrolled
          ? 'bg-slate-50/10 backdrop-blur-lg'
          : 'bg-slate-100/10 backdrop-blur-lg'
        }`
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="p-2">
            {/* Logo SVG */}
            <img
              src="/logo.png"
              alt="Al-Makhmali Logo"
              className="h-35 w-35 object-contain"
            />
          </div>
          {/* <div className="font-black text-2xl text-white tracking-tighter" style={{fontFamily: 'var(--font-clash)'}}>
            M a k h m a l i
          </div> */}
        </Link>

        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>



              <a
                href="https://tawk.to/chat/68f1732fb37ea9194db2011f/1j7nijt6f" target='_blank'
                className="relative text-sm font-semibold text-red-800 transition-colors hover:text-red-900 after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[#800020] after:transition-all after:duration-300 hover:after:w-full"
              >
                Support
              </a>

              {/* NEW: Link to My Orders page */}
              <Link
                to="/my-ordered"
                className="relative text-sm font-semibold text-red-800 transition-colors hover:text-red-900 after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[#800020] after:transition-all after:duration-300 hover:after:w-full"
              >
                Orders
              </Link>

              {/* <div className="h-6 w-px bg-gray-300"></div> */}

              <button
                className="relative p-2 rounded-full text-white hover:bg-gray-300/50 transition-colors"
                onClick={onCartClick}
                aria-label="Open Cart"
              >
                <ShoppingCart className="w-6 h-6 text-red-800" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>

                )}
              </button>

              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <Link to="/login" className="px-5 py-2.5 bg-red-700 text-white font-semibold rounded-full shadow-sm hover:bg-red-600 transition-colors text-sm">
              Login / Sign Up
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}