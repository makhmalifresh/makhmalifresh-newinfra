import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const InfoModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 250 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '85vh' }}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-clash)' }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-8 overflow-y-auto">
            {/* The 'prose' class from Tailwind Typography provides beautiful default styling for text content */}
            <div className="prose prose-lg max-w-none">
              {children}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InfoModal;