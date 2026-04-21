import React from 'react';
import Marquee from 'react-fast-marquee';
import { motion } from 'framer-motion';

// An array of placeholder logos. Replace these with your actual partner logo image files.
const partnerLogos = [
  'partners/image1.png',
  'partners/image2.png',
  'partners/image3.png',
  'partners/image4.png',
  'partners/image5.png',
  'partners/image6.png',
];

export default function PartnerLogos() {
  return (
    <section className="py-20 bg-slate-100/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold text-red-900"
            style={{ fontFamily: 'var(--font-clash)' }}
          >
            Our Trusted Partners                  </motion.h2>
        </motion.div>

        <Marquee
          pauseOnHover={true}
          speed={75}
          gradient={true}
          gradientColor={[255, 255, 255]} // Match your white background
          gradientWidth={100}
        >
          {partnerLogos.map((logo, index) => (
            <div key={index} className="mx-12">
              <img
                src={logo}
                alt={`Partner logo ${index + 1}`}
                className="h-30 object-contain transition-all duration-300"
              />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}