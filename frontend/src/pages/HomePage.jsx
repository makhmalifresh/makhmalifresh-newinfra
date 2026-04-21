  import React, { useEffect, useMemo, useState } from "react";
  import { useOutletContext } from "react-router-dom";
  import { useUser } from "@clerk/clerk-react";
  import { motion } from "framer-motion";
  import { Search, Truck, Leaf, Award, ShoppingCart } from "lucide-react";
  import BackgroundSvgAnimator from "../components/shared/BackgroundSvgAnimator";

  // Your proven, working imports are preserved
  import api from "../api";
  import { MOCK_PRODUCTS } from "../constants";
  import ProductCard from "../components/products/ProductCard";

  import HeroCarousel from "../components/shared/HeroCarousels";
  import PartnerLogos from "../components/shared/PartnerLogos";
  import TestimonialCarousel from "../components/shared/TestimonialsCarousels";

  // The new UI components are kept for the visual design
  const SectionDivider = () => (
    <div className="text-center">
      <svg width="80" height="20" viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
        <path d="M0 10 H35 L50 18 L65 10 H100" stroke="rgba(128, 0, 32)" strokeWidth="2" />
        <circle cx="50" cy="8" r="3" fill="rgba(128, 0, 32)" />
      </svg>
    </div>
  );

  const Feature = ({ icon, title, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="text-center p-8"
    >
      <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-red-900 border-2 border-slate-50/30 text-slate-50">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-bold text-red-900" style={{ fontFamily: 'var(--font-clash)' }}>{title}</h3>
      <p className="mt-2 text-red-800">{children}</p>
    </motion.div>
  );

  export default function HomePage() {
    // --- LOGIC TRANSPLANTED FROM YOUR WORKING VERSION ---

    // CORRECTED: Now receiving all necessary props from MainLayout for the new ProductCard
    const { cart, addToCart, updateQty } = useOutletContext();
    const { user } = useUser();

    // Your original, working state management
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");

    // Your original, working data fetching logic
    useEffect(() => {
      const loadProducts = async () => {
        setLoadingProducts(true);
        try {
          const res = await api.get("/products");
          setProducts(res.data && res.data.length ? res.data : MOCK_PRODUCTS);
        } catch (e) {
          console.warn("Products fetch failed — using mock", e);
          setProducts(MOCK_PRODUCTS);
        } finally {
          setLoadingProducts(false);
        }
      };
      loadProducts();
    }, []);

    // Your original categories and robust filtering logic
    const categories = ["All", "Chicken", "Goat", "Lamb"];
    const filteredProducts = useMemo(() => {
      return products.filter(p =>
        (category === "All" || (p.tags || []).includes(category)) &&
        (p.name.toLowerCase().includes(query.toLowerCase()) || (p.cut || "").toLowerCase().includes(query.toLowerCase()))
      );
    }, [products, category, query]);

    // The helper function required by the new ProductCard
    const getCartQty = (productId) => {
      const item = cart.find(p => p.id === productId);
      return item ? item.qty : 0;
    };

    return (
      // --- THE NEW, PREMIUM UI STRUCTURE ---
      <div className="bg-slate-50 text-white overflow-x-hidden">
        {/* --- HERO SECTION --- */}


  <div className="bg-slate-50 min-h-auto flex items-center justify-center py-7 md:py-8 overflow-x-hidden">
    {/* Trust Badges Bar */}
    

    {/* --- HERO SECTION --- */}
    <section className="relative w-full mt-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
          {/* Text Content - Comes first on mobile */}
          <div className="w-full lg:w-1/2 text-center lg:text-left order-2 lg:order-1">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.2 }} 
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight hidden md:block"
              style={{ fontFamily: 'var(--font-clash)' }}
            >
              The Art of Butchery.<br />
              <span className="text-red-900 block mt-2">Delivered.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.4 }} 
              className="mt-6 text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed hidden md:block"
            >
              Experience the pinnacle of taste and quality. From our master butchers to your kitchen in minutes.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.6 }} 
              className="mt-3 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button 
                onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })} 
                className="bg-red-900 text-white font-semibold text-base px-8 py-4 rounded-full shadow-lg shadow-red-900/30 hover:bg-[#600018] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#800020] focus:ring-opacity-50"
              >
                Shop The Collection
              </button>
              
              {/* {user && (
                <button
                  onClick={openTrackModal}
                  className="bg-gray-800 text-white font-semibold text-base px-8 py-4 rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-opacity-50"
                >
                  Track Your Order
                </button>
              )} */}
            </motion.div>
          </div>

          {/* Image Content - Comes after text on mobile */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 1, delay: 0.5 }} 
            className="w-full lg:w-1/2 flex justify-center order-1 lg:order-2"
          >
            <div className="relative w-full max-w-lg">
              <div className="absolute"></div>
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
                      <HeroCarousel />
                </div>
              {/* Floating Review Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, delay: 1 }} 
                className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg hidden md:block"
              >
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900">4.9/5</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">From 2000+ reviews</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>


      <div className=" bg-slate-50 py-2 mt-10 hidden md:block">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-600">100% Fresh</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-600">Fast Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-red-100 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-600">Hand-Cut</span>
          </div>
        </div>
      </div>
    </div>
    </section>
  </div>




        {/* --- PRODUCTS SECTION --- */}
        <section id="products" className="relative overflow-hidden py-5 bg-gradient-to-b from-slate-50 to-slate-100/10">
          {/* <section id="products" className="relative overflow-hidden py-20 bg-gradient-to-b from-red-600 to-red-500"> */}


          <BackgroundSvgAnimator src="/vectors/back4.png" className="w-30 top-20 right-[-1rem] opacity-5" duration={12} delay={0.5} />
          <BackgroundSvgAnimator src="/vectors/back5.png" className="w-15 bottom-10 right-[-1rem] opacity-5" duration={15} delay={1} />
          <BackgroundSvgAnimator src="/vectors/back5.png" className="w-10 top-1/3 right-[11%] opacity-5" duration={13} delay={0.8} />
          <BackgroundSvgAnimator src="/vectors/rotatedback.png" className="w-20 bottom-30 left opacity-5" duration={10} delay={1.5} />
          {/* <BackgroundSvgAnimator src="/back3_big.png" className="w-56 top-1/4 left-[5%] opacity-5" duration={13} delay={0.8} /> */}



          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-4">
              <span><h2 className="text-5xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-clash)' }}>Our Curated  </h2>
              <h2 className="text-5xl font-bold text-red-900" style={{ fontFamily: 'var(--font-clash)' }}>Collection  </h2></span>

              {/* <h2 className="text-red-900">Collection</h2> */}
            </motion.div>
            <SectionDivider />

            {/* Search bar is now wired to your working 'query' state */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="max-w-2xl mx-auto my-12">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search for your favourite cuts..."
                  className="w-full bg-slate-50 text-slate-900 placeholder-red-800 border-2 border-red-900 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                />
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-6 w-6 text-red-900" />
              </div>
            </motion.div>

            {/* Filter buttons are now wired to your working 'category' state */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }} className="flex flex-wrap justify-center gap-3 my-12">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 border-2 ${category === c
                    ? 'bg-white text-red-800 shadow-md'
                    : 'bg-red-900 text-white border-slate-100/80 hover:bg-white hover:text-red-800'
                    }`}
                >
                  {c}
                </button>
              ))}
            </motion.div>

            {/* The product grid now maps over your working 'filteredProducts' variable */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {loadingProducts ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-red-900/50 p-4 animate-pulse"><div className="w-full h-56 bg-red-700/50 rounded-lg"></div><div className="h-6 bg-red-700/50 rounded mt-4 w-3/4"></div><div className="h-4 bg-red-700/50 rounded mt-2 w-1/2"></div></div>
                ))
              ) : (
                filteredProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={addToCart}
                    onUpdateQty={updateQty}
                    cartQty={getCartQty(p.id)}
                  />
                ))
              )}
            </div>

            {/* --- WHY CHOOSE US SECTION --- */}
            <section className="py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-3 gap-8">
                  <Feature icon={<Leaf size={32} />} title="Farm-Fresh">Sourced from local farms with the highest standards.</Feature>
                  <Feature icon={<Truck size={32} />} title="Rapid Delivery">Hyper-fast delivery ensures your meat arrives fresh.</Feature>
                  <Feature icon={<Award size={32} />} title="Master Butchers">Our commitment to quality is unwavering and guaranteed.</Feature>
                </div>
              </div>
            </section>



            {/* Your original "Please log in" message is preserved for non-users */}
            {!user && (
              <div className="mt-16 p-8 text-center bg-slate-50 rounded-2xl border border-slate-700">
                <ShoppingCart className="mx-auto h-12 w-12 text-slate-500" />
                <h3 className="mt-4 text-xl font-bold text-slate-900">Ready to Order?</h3>
                <p className="mt-2 text-slate-700">Please log in to add items to your cart and place an order.</p>
              </div>
            )}

            <TestimonialCarousel/>
            <PartnerLogos/>


          </div>
        </section>
      </div>
    );
  };