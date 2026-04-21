import React, { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';
import Marquee from "react-fast-marquee";
import api from '../../api';

export default function OfferMarquee() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const fetchActiveOffers = async () => {
      try {
        const { data } = await api.get('/offers/active');
        setOffers(data);
      } catch (error) {
        console.error("Failed to fetch active offers for marquee:", error);
      }
    };
    fetchActiveOffers();
  }, []);

  if (offers.length === 0) {
    return null;
  }

  return (
    // --- THIS IS THE DEFINITIVE FIX ---
    // 1. This outer container acts as the "clipping mask".
    //    - `h-12` gives it a fixed height.
    //    - `overflow-hidden` is the crucial part that hides any overflow.
    //    - `flex items-center` ensures the content inside is vertically centered.
    <div className="w-100% h-12 bg-red-900 text-white overflow-hidden flex items-center no-scrollbar">
      
      {/* 2. The Marquee component now lives inside this safe container. */}
      <Marquee
        pauseOnHover={true}
        speed={75}
        autoFill={true}
        gradient={true}
        gradientColor={"#82181a"}
        gradientWidth={50}
        className='overflow-hidden'
        
      >
        {offers.map((offer, index) => (
          <div key={index} className="flex items-center mx-8">
            <Megaphone size={16} className="mr-3 flex-shrink-0" />
            <span className="text-sm font-semibold">
              {offer.name}: <span className="font-normal opacity-80">{offer.description}</span> - Use Code:
              <span className="font-bold bg-white/20 px-2 py-1 rounded-md ml-2">{offer.coupon_code}</span>
            </span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}