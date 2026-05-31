import { Link } from 'react-router-dom';
import Hero from './hero';
import Reviews from './Reviews';
import Contact from './Contact';

export const PRODUCTS = [
  { 
    id: 1, 
    name: "Velvet Oud", 
    price: "$120", 
    note: "Woody", 
    img: "./lemale.jpg"
  },
  { 
    id: 2, 
    name: "Azure Coast", 
    price: "$95", 
    note: "Fresh", 
    img: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200&auto=format&fit=crop"
  },
  { 
    id: 3, 
    name: "Silk Jasmine", 
    price: "$110", 
    note: "Floral", 
    img: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=1200&auto=format&fit=crop"
  },
];

export default function ProductGrid() {
  return (
    <>
      <div className="relative w-full pt-[72px] md:pt-[88px] bg-white pb-16 md:pb-24 overflow-hidden">
        {/* Global Background Elements for the Product Grid Area */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[120vh] right-0 w-[60%] h-1/2 bg-gradient-to-l from-neutral-200/20 via-neutral-100/10 to-transparent" />
          <div className="absolute top-[140vh] left-1/4 w-[600px] h-[600px] rounded-full bg-white blur-[150px] opacity-80" />
        </div>
        <img src="./banner.png" className="w-full h-auto block m-0 p-0 border-none" alt="L'Essence Banner" />
         
        
        <div className="container mx-auto px-4 md:px-6 mt-16 md:mt-24 relative z-10">
          
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-6 sm:gap-0 mb-10 md:mb-16">
            <div>
              <h3 className="text-3xl md:text-4xl font-serif text-black">
                The Collection
              </h3>

              <p className="text-neutral-500 mt-2">
                Curated scents for the modern soul.
              </p>
            </div>

            <button className="text-xs uppercase tracking-widest border-b border-black text-black pb-1 hover:opacity-70 transition">
              View All
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-12">
            {PRODUCTS.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-white/40 backdrop-blur-xl rounded-2xl mb-6 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  
                  <img
                    src={product.img}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    onError={(e) => {
                      const fallbackImages = [
                        "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1200&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1588405748880-12d1d2a59b75?q=80&w=1200&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1200&auto=format&fit=crop"
                      ];

                      e.currentTarget.src =
                        fallbackImages[product.id - 1];
                    }}
                  />

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition duration-500" />

                  <div className="absolute bottom-0 left-0 w-full p-4 sm:p-5 md:p-2 bg-gradient-to-t from-black via-black/80 to-transparent">
                    <p className="text-white/90 text-[8px] md:text-[10px] uppercase tracking-[0.25em]">
                      {product.note}
                    </p>

                    <h4 className="text-sm sm:text-lg md:text-2xl font-serif text-white">
                      {product.name}
                    </h4>

                    <p className="text-neutral-200 mt-1 text-[10px] sm:text-xs md:text-base opacity-90">
                      {product.price}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Reviews />
      <Contact />
    </>
  );
}