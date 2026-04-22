import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';

export default function ColdStartLoader({ children }) {
  const [isWaking, setIsWaking] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const loadingMessages = [
    "Selecting the finest cuts...",
    "Sharpening the knives...",
    "Wrapping your order with care...",
    "Chilling to perfection...",
    "Loading onto the delivery bike...",
    "Fresh meat heading your way!",
  ];

  // Rotate messages every 3 seconds while loading
  useEffect(() => {
    if (!isWaking) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isWaking]);

  useEffect(() => {
    let timer;
    const checkHealth = async () => {
      try {
        // Show elaborate loader only if it takes more than 1 second
        timer = setTimeout(() => {
          setIsWaking(true);
        }, 1000);

        await api.get('/health');
        clearTimeout(timer);
        setIsWaking(false);
        setIsReady(true);
      } catch (err) {
        setTimeout(checkHealth, 3000);
      }
    };
    checkHealth();
    return () => clearTimeout(timer);
  }, []);

  // Elaborate loader for cold starts
  if (isWaking) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAFAFA] overflow-hidden">
        {/* Subtle, elegant ambient background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-50/50 via-transparent to-transparent opacity-80" />

        <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6">
          
          {/* Logo with smooth breathing animation */}
          <motion.div
            animate={{ 
              scale: [1, 1.03, 1],
              opacity: [0.85, 1, 0.85] 
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-32 h-32 md:w-40 md:h-40 mb-8"
          >
            <img 
              src="/logo.png" // Make sure to place your logo.png in your public folder
              alt="Makhmali Fresh Logo" 
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </motion.div>

          {/* Smooth Text Transitions */}
          <div className="h-10 flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
              <motion.h2
                key={messageIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-lg md:text-xl font-medium text-gray-800 text-center font-clash tracking-wide"
              >
                {loadingMessages[messageIndex]}
              </motion.h2>
            </AnimatePresence>
          </div>

          {/* Tagline */}
          <p className="mt-2 text-xs md:text-sm text-gray-400 uppercase tracking-widest font-semibold">
            The Art of Butchery. Delivered.
          </p>

          {/* Sleek indeterminate progress line */}
          <div className="mt-10 w-48 h-[2px] bg-gray-200 rounded-full overflow-hidden relative">
            <motion.div
              className="absolute top-0 left-0 h-full bg-[#800020] w-1/3 rounded-full"
              animate={{ 
                x: ["-100%", "300%"] 
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Initial fast loader (before 1s timeout)
  if (!isReady) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAFAFA]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-red-100 border-t-[#800020] rounded-full"
        />
      </div>
    );
  }

  return <>{children}</>;
}