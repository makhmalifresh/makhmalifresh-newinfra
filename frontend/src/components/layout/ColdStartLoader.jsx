import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function ColdStartLoader({ children }) {
  const [isWaking, setIsWaking] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let timer;
    const checkHealth = async () => {
      try {
        // If it takes more than 1 second, it's a cold start. We show the loader.
        timer = setTimeout(() => {
          setIsWaking(true);
        }, 1000);

        await api.get('/health');
        
        // Backend responded
        clearTimeout(timer);
        setIsWaking(false);
        setIsReady(true);
      } catch (err) {
        // If error, server might be waking up (502 or 503 from Render)
        setTimeout(checkHealth, 3000); // retry every 3s
      }
    };

    checkHealth();

    return () => clearTimeout(timer);
  }, []);

  if (isWaking) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 text-white backdrop-blur-sm transition-all duration-500">
        <div className="flex flex-col items-center p-8 bg-zinc-900 border border-zinc-700/50 rounded-2xl shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]">
          <div className="mb-6 relative w-16 h-16">
            <div className="absolute inset-0 border-t-2 border-white rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-r-2 border-zinc-400 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Waking up server...</h2>
          <p className="mt-3 text-sm text-zinc-500 text-center max-w-[250px]">
            The backend is hosted on a free tier and sleeps upon inactivity. Please give it 30-50 secs to warm up. 
          </p>
        </div>
      </div>
    );
  }

  // Once ready or not waking yet (we allow children to render while the 1-second timer ticks)
  // Actually, preventing children from mounting until backend is ready is safer for API calls.
  if (!isReady) {
    // If not ready but not showing loader yet (first < 1s), we can just return null or skeleton
    return (
       <div className="w-screen h-screen flex items-center justify-center bg-zinc-950">
       </div>
    )
  }

  return <>{children}</>;
}
