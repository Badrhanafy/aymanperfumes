import React from 'react';

const REVIEWS = [
  { 
    id: 1, 
    name: "Eleanor V.", 
    role: "Verified Buyer",
    text: "The Velvet Oud is a masterpiece. It lingers perfectly throughout the evening without overwhelming the senses. A true signature scent.", 
    rating: 5 
  },
  { 
    id: 2, 
    name: "Julian R.", 
    role: "Fragrance Connoisseur",
    text: "A truly sophisticated collection. Azure Coast transports me instantly to a summer breeze on the Riviera. The craftsmanship is undeniable.", 
    rating: 5 
  },
  { 
    id: 3, 
    name: "Sophie M.", 
    role: "Verified Buyer",
    text: "Minimalist, elegant, and timeless. The packaging alone is a work of art, but the scent itself is unforgettable. Highly recommended.", 
    rating: 5 
  },
];

const StarIcon = () => (
  <svg className="w-3 h-3 md:w-4 md:h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const QuoteIcon = () => (
  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#eed516ca] backdrop-blur-md border border-black/5 shadow-sm flex items-center justify-center mb-4 md:mb-6">
    <svg className="w-4 h-4 md:w-5 md:h-5 text-black/60" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  </div>
);

export default function Reviews() {
  return (
    <section className="py-20 md:py-32 bg-[#fefce8] relative overflow-hidden">
      
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#c09f29]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#eebf16]/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-24">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-[#4a3610]"></div>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#9c711c] font-medium">Testimonials</span>
            <div className="w-8 h-[1px] bg-[#4a3610]"></div>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#4a3610] tracking-tight">
            Voices of Elegance
          </h2>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {REVIEWS.map((review) => (
            <div 
              key={review.id} 
              className="group p-8 md:p-10 rounded-2xl bg-white/50 backdrop-blur-2xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/70 transition-all duration-500 flex flex-col"
            >
              
              {/* Glassmorphism Quote Icon */}
              <QuoteIcon />

              <p className="text-[#4a3610]/80 font-light text-sm md:text-base leading-relaxed mb-8 flex-grow">
                "{review.text}"
              </p>

              <div className="flex items-end justify-between mt-auto">
                <div>
                <div className="relative">
                  <div className="relative z-10">
                    <h4 className="font-serif text-[#4a3610] text-lg px-2">{review.name}</h4>
                  </div>
                  {/* Scratched Artboard SVG */}
                  <svg className="absolute inset-0 w-full h-full -rotate-1 opacity-90 scale-x-110 scale-y-110" viewBox="0 0 100 30" preserveAspectRatio="none">
                    {/* The Artboard Surface */}
                    <path 
                      d="M2,3 L98,2 L97,27 L3,28 Z" 
                      fill="#f4bc05" 
                    />
                    {/* Horizontal Scratches */}
                    <path d="M10,8 L30,8 M45,12 L65,12 M75,6 L92,6" stroke="#4a3610" strokeWidth="0.5" opacity="0.2" />
                    <path d="M15,22 L40,22 M55,20 L85,20" stroke="#4a3610" strokeWidth="0.5" opacity="0.2" />
                    {/* Vertical Distress Marks */}
                    <path d="M8,5 L6,15 M92,10 L94,22" stroke="#4a3610" strokeWidth="0.3" opacity="0.15" />
                    {/* Rough Edge Detail */}
                    <path d="M2,15 L0,17 M98,12 L100,10" stroke="#4a3610" strokeWidth="0.8" opacity="0.3" />
                  </svg>
                </div>
                  <p className="text-[10px] uppercase tracking-wider text-[#9c711c] mt-1">{review.role}</p>
                </div>
                
                <div className="flex gap-1 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/80">
                  {[...Array(review.rating)].map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
