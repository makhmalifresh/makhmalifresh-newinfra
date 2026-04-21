// src/pages/LoginPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { SignIn } from "@clerk/clerk-react";
import { Truck, Award, Check } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#faf7f7] via-white to-[#f5f0f0] flex items-center justify-center overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] bg-[#800020]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-150px] right-[-150px] w-[450px] h-[450px] bg-red-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* LEFT SIDE – Brand Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <h1
              className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-clash)" }}
            >
              Welcome Back to{" "}
              <span className="text-[#800020]">Makhmali Fresh</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-md mx-auto md:mx-0">
              Sign in to continue your premium meat experience and manage your
              fresh deliveries effortlessly.
            </p>

            {/* Highlights / features */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-gray-100">
                <Check className="w-5 h-5 text-[#800020]" />
                <span className="text-sm font-medium text-gray-700">
                  100% Fresh
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-gray-100">
                <Truck className="w-5 h-5 text-[#800020]" />
                <span className="text-sm font-medium text-gray-700">
                  Same-Day Delivery
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-gray-100">
                <Award className="w-5 h-5 text-[#800020]" />
                <span className="text-sm font-medium text-gray-700">
                  Certified Quality
                </span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE – Clerk Login */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            
              {/* --- Clerk SignIn Component --- */}
              <SignIn path="/login" routing="path" signUpUrl="/signup" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
