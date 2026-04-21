import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const slideImages = [
  // The path to your specific "Combo Offers" image
  'hero/image.png',
  'hero/image1.png'
  
];

export default function HeroCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({
      delay: 5000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  ]);

  return (
    <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
      <div className="flex h-full w-full">
        {slideImages.map((src, index) => (
          // --- THIS IS THE NEW, CORRECTED SLIDE STRUCTURE ---
          <div className="relative flex-[0_0_100%] h-full bg-slate-100/10" key={index}>
      

            {/* 2. The Foreground Layer */}
            {/* This is your original image, perfectly clear and uncropped. */}
            <img
              src={src}
              alt={`Promotional slide ${index + 1}`}
              className="relative z-10 w-full h-full object-contain"
            />

          </div>
        ))}
      </div>
    </div>
  );
}