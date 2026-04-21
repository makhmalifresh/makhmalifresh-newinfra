import React from 'react';
import Marquee from 'react-fast-marquee';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

// The testimonial data you provided, structured for easy use.
const testimonials = [
  {
    quote: "MakhmaliFresh mutton is truly makhmali! So soft, tender, and full of flavour — my mutton curry turned out restaurant-style. Can’t imagine buying meat from anywhere else!",
    title: "Mutton is truly makhmali!",
    name: "Aarav Khan",
    location: "Mumbai"
  },
  {
    quote: "Juicy inside, perfectly cut, and super fresh. Loved the clean packaging and fast delivery by MakhmaliFresh.",
    title: "Best chicken drumsticks ever!",
    name: "Priya Sharma",
    location: "Thane"
  },
  {
    quote: "Cooked butter chicken and everyone loved it — no smell, no hassle, just pure freshness.",
    title: "Boneless chicken was next-level!",
    name: "Rohit Mehta",
    location: "Mulund"
  },
  {
    quote: "Trimmed neatly, no extra fat, and packed hygienically. My family could actually taste the difference. Great job, MakhmaliFresh!",
    title: "Lamb curry cuts were perfect!",
    name: "Meera Desai",
    location: "Kalwa"
  },
  {
    quote: "The mutton I ordered was juicy, clean, and absolutely delicious. MakhmaliFresh really lives up to its name!",
    title: "Freshness guaranteed every time.",
    name: "Sameer Ali",
    location: "Mumbra"
  },
  {
    quote: "The chicken was soft, easy to cook, and super tasty. Delivery was quick and well-packed.",
    title: "MakhmaliFresh tops them all.",
    name: "Anjali Rao",
    location: "Thane West"
  }
];

// A small sub-component for a single testimonial card for cleaner code.
const TestimonialCard = ({ quote, title, name, location }) => (
  <div className="bg-white rounded-2xl shadow-lg p-8 mx-4 my-4 w-96 flex flex-col hover-lift">
    <div className="flex mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" />
      ))}
    </div>
    <h4 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-clash)' }}>
      {title}
    </h4>
    <p className="text-gray-600 italic flex-grow">"{quote}"</p>
    <p className="mt-6 font-semibold text-gray-800">— {name}, <span className="text-gray-500 font-normal">{location}</span></p>
  </div>
);


export default function TestimonialCarousel() {
  return (
    <section className="py-30 bg-slate-100/10">
      <div className="max-w-7xl mx-auto text-center mb-12 px-4">
        <motion.h2 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold text-red-900" 
          style={{ fontFamily: 'var(--font-clash)' }}
        >
          What Our Customers Say
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-4 text-lg text-red-800"
        >
          Freshness and quality, delivered with a smile.
        </motion.p>
      </div>
      
      <Marquee
        pauseOnHover={true}
        speed={15}
        autoFill={true}
        gradient={true}
        gradientColor={"#f6f8f919"}
        gradientWidth={50}
        className='overflow-hidden'
      >
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} {...testimonial} />
        ))}
      </Marquee>
    </section>
  );
}