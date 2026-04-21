// src/pages/SignUpPage.jsx
import React from 'react';
import { SignUp } from '@clerk/clerk-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-clash)' }}>
            Create Account
          </h1>
          <p className="text-gray-600">Join our community of premium meat lovers</p>
        </div>

        <SignUp
          path="/signup"
          routing="path"
          signInUrl="/login"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-white shadow-sm border border-gray-200 rounded-xl p-6",
              header: "hidden",
              socialButtonsBlockButton: "border border-gray-300 rounded-lg hover:bg-gray-50",
              formFieldInput: "border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-900",
              formButtonPrimary: "bg-red-900 hover:bg-red-800 text-white rounded-lg py-3",
              footer: "hidden"
            }
          }}
        />

        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-red-900 hover:text-red-800 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}