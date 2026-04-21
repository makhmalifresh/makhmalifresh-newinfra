import React from 'react';
import { motion } from 'framer-motion';

/**
 * A reusable component to display and animate a decorative background SVG.
 * It makes the SVG float up and down gently.
 *
 * @param {object} props
 * @param {string} props.src - The path to the SVG file in your `public/` folder (e.g., '/my-icon.svg').
 * @param {string} props.className - Tailwind CSS classes for positioning, size, and opacity (e.g., 'w-48 top-10 left-20 opacity-5').
 * @param {number} props.duration - The speed of the floating animation (a higher number is slower).
 * @param {number} props.delay - The delay before the SVG fades in.
 */
const BackgroundSvgAnimator = ({ src, className, duration = 10, delay = 0 }) => {
  return (
    // This outer div handles the initial fade-in and positioning.
    <motion.div
      className={`absolute z-0 select-none ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay: delay, ease: 'easeOut' }}
    >
      {/* This inner div handles the continuous floating animation. */}
      <motion.img
        src={src}
        alt="" // Decorative images have an empty alt attribute
        className="w-full h-full"
        animate={{ y: [0, -20, 0] }} // The floating effect
        transition={{
          duration: duration,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
};

export default BackgroundSvgAnimator;