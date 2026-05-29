import React, { useEffect } from 'react';
import logoSvg from '../public/logos/png/logo2.png';
import mano from '../public/man2.jpg';

export default function OurStory() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#fdfbf7] min-h-screen pt-[72px] md:pt-[88px]">
      
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=2000&auto=format&fit=crop" 
          alt="Our Story Hero" 
          className="w-full h-full object-cover scale-110 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-[#4a3610]/30 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <div className="w-24 h-24 md:w-32 md:h-32 mb-8 animate-fade-in-up">
            <img src={logoSvg} alt="L'ESSENCE" className="w-full h-full object-contain brightness-0 invert opacity-90" />
          </div>
          <h1 className="text-4xl md:text-7xl font-serif text-white tracking-tight mb-4 animate-fade-in-up delay-100">
            A Legacy of Scent
          </h1>
          <p className="text-white/80 text-xs md:text-sm uppercase tracking-[0.4em] font-light animate-fade-in-up delay-200">
            Est. 1994 — Grasse, France
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-8 h-[1px] bg-[#4a3610]"></div>
              <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#9c711c] font-medium">The Beginning</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-[#4a3610] leading-tight">
              Where tradition meets <br/> modern alchemy.
            </h2>
            <p className="text-[#4a3610]/70 text-base md:text-lg font-light leading-relaxed">
              Born in the golden fields of Grasse, L'ESSENCE began as a small family atelier dedicated to the art of extraction. For nearly three decades, we have honored the heritage of classical perfumery while embracing the bold spirit of the contemporary world.
            </p>
            <p className="text-[#4a3610]/70 text-base md:text-lg font-light leading-relaxed">
              Our journey is one of obsession—an obsession with quality, with emotion, and with the invisible threads that connect a scent to a memory.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={mano} 
                alt="Perfume Ingredients" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-[#f4bc05] rounded-2xl -z-10 opacity-20"></div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="bg-[#4a3610] py-20 md:py-32 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-[#f4bc05]/5 -skew-x-12 translate-x-1/4"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
          <h3 className="text-2xl md:text-3xl font-serif mb-16 opacity-90">Our Core Philosophy</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <div className="space-y-4">
              <span className="text-4xl font-serif text-[#f4bc05]">01</span>
              <h4 className="text-lg uppercase tracking-widest font-medium">Purity</h4>
              <p className="text-white/60 font-light text-sm leading-relaxed">
                We source only the finest raw materials, from the petals of jasmine to the resins of ancient oud trees.
              </p>
            </div>
            <div className="space-y-4">
              <span className="text-4xl font-serif text-[#f4bc05]">02</span>
              <h4 className="text-lg uppercase tracking-widest font-medium">Craft</h4>
              <p className="text-white/60 font-light text-sm leading-relaxed">
                Every bottle is hand-poured and inspected by our master perfumers to ensure uncompromised excellence.
              </p>
            </div>
            <div className="space-y-4">
              <span className="text-4xl font-serif text-[#f4bc05]">03</span>
              <h4 className="text-lg uppercase tracking-widest font-medium">Soul</h4>
              <p className="text-white/60 font-light text-sm leading-relaxed">
                We don't just create perfumes; we create experiences that resonate with the deepest parts of the human soul.
              </p>
            </div>
          </div>
        </div>
      </section>

  

      {/* Quote Section */}
      <section className="py-20 md:py-32 bg-[#f4bc05]/10 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <svg className="w-12 h-12 text-[#9c711c]/20 mx-auto mb-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <blockquote className="text-2xl md:text-4xl font-serif text-[#4a3610] leading-snug mb-8">
            "A perfume is more than just a scent; it is a signature that speaks when you are silent."
          </blockquote>
          <cite className="text-xs uppercase tracking-[0.3em] text-[#9c711c] font-medium not-italic">— Master Perfumer, L'ESSENCE</cite>
        </div>
      </section>

    </div>
  );
}
