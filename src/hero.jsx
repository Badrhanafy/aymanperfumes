import React, { useEffect, useState } from 'react';
import womanimage from '../public/man.png';
const Hero = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative mt-0 h-screen sm:h-[100svh] w-full overflow-hidden bg-black">
      
      {/* Black and White Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[70%] h-full bg-gradient-to-l from-white via-neutral-100 to-transparent opacity-95" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-gradient-to-tr from-black to-transparent opacity-50" />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-neutral-800 blur-[100px] opacity-40" />
      </div>

      {/* Black and White Woman Image - Fading Effect */}
      <div className="absolute mt-0 right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 opacity-20 md:opacity-100">
        <img 
          src={womanimage}
          alt="Woman smelling perfume"
          className="w-full h-full object-cover object-[75%_center] grayscale brightness-90 md:mask-image-none"
          style={{
            maskImage: 'linear-gradient(to left, black 0%, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to left, black 0%, black 60%, transparent 100%)'
          }}
        />

      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-6 md:px-8 lg:px-12 h-full flex items-center pt-20 md:pt-32 pb-12 md:py-0">
        <div className="max-w-3xl w-full mt-0 md:mt-0">
          
         

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-4 md:mb-6 leading-none md:leading-tight">
            REEH 
            <span className="block font-bold text-neutral-300 mt-1 md:mt-1">AL JANOUB</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-2xl text-gray-500 font-light mb-6 md:mb-8 max-w-xl">
            A timeless collection of contrasts.
          </p>

          {/* Description */}
          <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-md mb-8 md:mb-10">
            Pure essence for the modern purist.
          </p>

          {/* CTA Buttons - Black & White Theme */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-10 md:mb-12">
            <button className="px-8 py-4 bg-white text-black hover:bg-gray-200 transition-all duration-300 text-xs md:text-sm uppercase tracking-wider font-medium w-full sm:w-auto text-center">
              Discover Collection
            </button>
            <button className="px-8 py-4 border border-white text-white hover:bg-white hover:text-black transition-all duration-300 text-xs md:text-sm uppercase tracking-wider font-medium w-full sm:w-auto text-center">
              Watch Film
            </button>
          </div>

          {/* Stats in Theme Colors */}
          <div className="flex flex-wrap gap-6 md:gap-12 pt-6 md:pt-8 border-t border-white/10">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">12</div>
              <div className="text-[10px] md:text-xs uppercase tracking-wider text-neutral-400 mt-1">Fragrances</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">100%</div>
              <div className="text-[10px] md:text-xs uppercase tracking-wider text-neutral-400 mt-1">Natural</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">24/7</div>
              <div className="text-[10px] md:text-xs uppercase tracking-wider text-neutral-400 mt-1">Support</div>
            </div>
          </div>
        </div>
      </div>

      

      {/* Minimalist Side Elements */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden xl:block">
        <div className="flex flex-col gap-4">
          <div className="w-px h-64 bg-gray-300 mx-auto" />
     
        </div>
      </div>
    </section>
  );
};

export default Hero;