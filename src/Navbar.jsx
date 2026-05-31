import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logoSvg from '../public/logos/png/logo2.png';
import { PRODUCTS } from './Home';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = searchQuery.trim() === '' 
    ? [] 
    : PRODUCTS.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.note.toLowerCase().includes(searchQuery.toLowerCase())
      );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 top-0 transition-all duration-500 ${(scrolled) ? 'bg-white/85 backdrop-blur-2xl border-b border-neutral-200/40 shadow-sm' : 'bg-white border-b border-neutral-100'}`}>
      <div className="w-full relative px-6 md:px-12 py-4 md:py-6 h-[72px] md:h-[88px] flex items-center justify-center">
        
        <div className="w-full grid grid-cols-3 items-center relative">
          
          {/* Left Column: Links */}
          <div className="flex items-center justify-start z-10">
            <div className="hidden md:flex space-x-6 md:space-x-8 text-[10px] lg:text-xs uppercase tracking-widest font-medium text-black">
              <Link title="Collections" to="/" className="hover:opacity-75 transition-opacity">Collections</Link>
              <Link title="Our Story" to="/our-story" className="hover:opacity-75 transition-opacity">Our Story</Link>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center text-black">
              <button className="text-[10px] uppercase tracking-widest border-b border-black/30 pb-0.5">Menu</button>
            </div>
          </div>

          {/* Center Column: Logo */}
          <Link to="/" className="flex items-center justify-center z-20" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}>
            <img 
              src={logoSvg} 
              alt="L'ESSENCE" 
              className="h-16 sm:h-24 md:h-24 w-auto object-contain mix-blend-multiply opacity-80"
            />
          </Link>

          {/* Right Column: Search/Cart or Search Input */}
          <div className="flex items-center justify-end z-10 text-black">
            <div className="relative flex items-center w-full justify-end min-h-[40px]">
              
              {/* Default State: Search & Cart */}
              <div className={`flex items-center space-x-6 md:space-x-8 transition-all duration-500 ${isSearchOpen ? 'opacity-0 scale-95 pointer-events-none absolute right-0' : 'opacity-100 scale-100'}`}>
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="text-[10px] md:text-xs uppercase tracking-widest border-b border-black pb-0.5 hover:opacity-70 transition-opacity"
                >
                  Search
                </button>

                <div className="relative cursor-pointer group">
                  <span className="text-[10px] md:text-xs uppercase tracking-widest hover:opacity-70 transition-opacity">Cart</span>
                  <span className="absolute -top-2 -right-3 bg-black text-white text-[9px] md:text-[10px] w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center transition-transform group-hover:scale-110">0</span>
                </div>
              </div>

              {/* Active Search State: Input Field */}
              <div className={`flex items-center gap-4 w-full max-w-[200px] md:max-w-md border-b border-black/20 pb-1 transition-all duration-500 ${isSearchOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none absolute right-0'}`}>
                <svg className="w-4 h-4 text-black/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input 
                  type="text" 
                  placeholder="Search scents..." 
                  className="w-full bg-transparent outline-none text-sm md:text-lg font-light font-serif text-black/80 placeholder-black/40"
                  autoFocus={isSearchOpen}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="text-[9px] md:text-[10px] uppercase tracking-widest text-black/60 hover:text-black transition-colors whitespace-nowrap ml-2"
                >
                  Close
                </button>
              </div>

            </div>
          </div>

          {/* Search Results Dropdown (Scoped to the whole row) */}
          <div className={`absolute top-full left-0 mt-2 w-full bg-white border border-neutral-200/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-500 z-50 ${searchQuery.trim() !== '' ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'}`}>
             <div className="max-h-[50vh] overflow-y-auto p-6 md:p-8">
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredProducts.map(product => (
                      <Link 
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 transition-all group border border-transparent hover:border-neutral-200/60"
                      >
                        <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                          <img src={product.img} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        </div>
                        <div>
                          <h4 className="text-xs md:text-sm font-serif text-black hover:text-neutral-700">{product.name}</h4>
                          <p className="text-[9px] uppercase tracking-widest text-neutral-400">{product.note}</p>
                          <p className="text-[10px] text-neutral-600 mt-0.5">{product.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 md:py-16 text-center">
                     <p className="text-black/80 font-serif italic text-lg">No scents found for "{searchQuery}"</p>
                     <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mt-3 font-medium">Try searching for "Oud", "Coastal" or "Floral"</p>
                  </div>
                )}
             </div>
          </div>
        </div>

      </div>
    </nav>
  );
}