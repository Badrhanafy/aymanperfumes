import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import logoSvg from '../public/logos/png/logobrandblack.png';
import { PRODUCTS } from './Home';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

/* ── helper: get initials from a name string ── */
function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

/* ══════════════════════════════════════════════
   USER DROPDOWN (shown when logged in)
══════════════════════════════════════════════ */
function UserDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const handleKey   = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown',   handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown',   handleKey);
    };
  }, []);

  const avatarInitials = initials(user.name);

  return (
    <div ref={ref} className="relative">
      {/* ── Avatar trigger ── */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Account menu"
        className={`group flex items-center gap-2.5 transition-opacity hover:opacity-80 ${open ? 'opacity-80' : ''}`}
      >
        {/* Initials circle */}
        <span className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-black text-[10px] md:text-xs font-medium flex items-center justify-center flex-shrink-0 select-none" style={{ color: '#C9A84C' }}>
          {avatarInitials || '?'}
        </span>
        {/* Name truncated – hidden on very small screens */}
        <span className="hidden lg:block text-[10px] uppercase tracking-widest font-medium text-black max-w-[100px] truncate">
          {user.name?.split(' ')[0]}
        </span>
        {/* Chevron */}
        <svg
          className={`w-3 h-3 text-black/50 transition-transform duration-300 hidden sm:block ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Dropdown panel ── */}
      <div
        className={`absolute right-0 top-full mt-3 w-64 bg-white border border-neutral-200/70 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden
          transition-all duration-300 origin-top-right z-[80]
          ${open ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}`}
      >
        {/* User info header */}
        <div className="px-5 py-5 border-b border-neutral-100 bg-neutral-50/60">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-black text-sm font-medium flex items-center justify-center flex-shrink-0" style={{ color: '#C9A84C' }}>
              {avatarInitials || '?'}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-serif text-black truncate leading-tight">{user.name}</p>
              <p className="text-[10px] text-neutral-400 font-light truncate mt-0.5">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <nav className="py-2">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-5 py-3 text-[11px] uppercase tracking-widest text-neutral-600 hover:text-black hover:bg-neutral-50 transition-all"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>

          <Link
            to="/cart"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-5 py-3 text-[11px] uppercase tracking-widest text-neutral-600 hover:text-black hover:bg-neutral-50 transition-all"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            My Cart
          </Link>

          <Link
            to="/our-story"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-5 py-3 text-[11px] uppercase tracking-widest text-neutral-600 hover:text-black hover:bg-neutral-50 transition-all"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Our Story
          </Link>
        </nav>

        {/* Divider + Logout */}
        <div className="border-t border-neutral-100 py-2">
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            className="flex items-center gap-3 w-full px-5 py-3 text-[11px] uppercase tracking-widest text-neutral-400 hover:text-black hover:bg-neutral-50 transition-all group"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════ */
export default function Navbar() {
  const [scrolled, setScrolled]       = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { totalItems, toggleSidebar } = useCart();
  const { user, loading, logout }     = useAuth();
  const navigate                      = useNavigate();

  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/perfumes')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setProducts(data);
      })
      .catch(err => {
        console.error('Navbar failed to fetch perfumes from API, using fallback:', err);
        setProducts(PRODUCTS);
      });
  }, []);

  const filteredProducts = searchQuery.trim() === ''
    ? []
    : products.filter(product => {
        const nameMatch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const note = product.brand?.name || product.note || '';
        const noteMatch = note.toLowerCase().includes(searchQuery.toLowerCase());
        return nameMatch || noteMatch;
      });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className={`fixed w-full z-50 top-0 transition-all duration-500 ${scrolled ? 'bg-white/85 backdrop-blur-2xl border-b border-neutral-200/40 shadow-sm' : 'bg-white border-b border-neutral-100'}`}>
      <div className="w-full relative px-6 md:px-12 py-4 md:py-6 h-[72px] md:h-[88px] flex items-center justify-center">

        <div className="w-full grid grid-cols-3 items-center relative">

          {/* ── Left: Nav links ── */}
          <div className="flex items-center justify-start z-10">
            <div className="hidden md:flex space-x-6 md:space-x-8 text-[10px] lg:text-xs uppercase tracking-widest font-medium text-black">
              <Link to="/" className="hover:opacity-75 transition-opacity">Collections</Link>
              <Link to="/our-story" className="hover:opacity-75 transition-opacity">Our Story</Link>

              {/* Auth-gated link */}
              {!loading && !user && (
                <Link to="/login" className="hover:opacity-75 transition-opacity">
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu placeholder */}
            <div className="md:hidden flex items-center text-black">
              <button className="text-[10px] uppercase tracking-widest border-b border-black/30 pb-0.5">Menu</button>
            </div>
          </div>

          {/* ── Center: Logo ── */}
          <Link
            to="/"
            className="flex items-center justify-center z-20"
            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
          >
            <img
              src={logoSvg}
              alt="L'ESSENCE"
              className="h-16 sm:h-24 md:h-24 w-auto object-contain mix-blend-multiply opacity-80"
            />
          </Link>

          {/* ── Right: Search + Cart + User ── */}
          <div className="flex items-center justify-end z-10 text-black">
            <div className="relative flex items-center w-full justify-end min-h-[40px]">

              {/* Default state */}
              <div className={`flex items-center space-x-5 md:space-x-7 transition-all duration-500 ${isSearchOpen ? 'opacity-0 scale-95 pointer-events-none absolute right-0' : 'opacity-100 scale-100'}`}>

                {/* Search */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="text-[10px] md:text-xs uppercase tracking-widest border-b border-black pb-0.5 hover:opacity-70 transition-opacity"
                >
                  Search
                </button>

                {/* Cart */}
                <button
                  onClick={toggleSidebar}
                  className="relative cursor-pointer group flex items-center"
                  aria-label="Open cart"
                >
                  <span className="text-[10px] md:text-xs uppercase tracking-widest hover:opacity-70 transition-opacity">Cart</span>
                  <span className={`absolute -top-2 -right-3 bg-black text-white text-[9px] md:text-[10px] w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${totalItems > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
                    {totalItems}
                  </span>
                </button>

                {/* ── Auth area ── */}
                {loading ? (
                  /* Skeleton pulse while auth check is in-flight */
                  <div className="w-7 h-7 rounded-full bg-neutral-200 animate-pulse" aria-hidden="true" />
                ) : user ? (
                  /* Logged-in → avatar dropdown */
                  <UserDropdown user={user} onLogout={handleLogout} />
                ) : (
                  /* Guest (mobile only – desktop Sign In is in the left nav) */
                  <Link
                    to="/login"
                    className="md:hidden text-[10px] uppercase tracking-widest hover:opacity-70 transition-opacity"
                  >
                    Sign In
                  </Link>
                )}
              </div>

              {/* Search input */}
              <div className={`flex items-center gap-4 w-full max-w-[200px] md:max-w-md border-b border-black/20 pb-1 transition-all duration-500 ${isSearchOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none absolute right-0'}`}>
                <svg className="w-4 h-4 text-black/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                  onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                  className="text-[9px] md:text-[10px] uppercase tracking-widest text-black/60 hover:text-black transition-colors whitespace-nowrap ml-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* Search results dropdown */}
          <div className={`absolute top-full left-0 mt-2 w-full bg-white border border-neutral-200/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-500 z-50 ${searchQuery.trim() !== '' ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'}`}>
            <div className="max-h-[50vh] overflow-y-auto p-6 md:p-8">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredProducts.map(product => {
                    const slugify = (text) => text.toString().toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^\w\-]+/g, '')
                      .replace(/\-\-+/g, '-')
                      .replace(/^-+/, '')
                      .replace(/-+$/, '');

                    const pSlug = product.slug || (product.name ? slugify(product.name) : '');
                    const pImg = product.img || (product.image ? (product.image.startsWith('http') ? product.image : `http://localhost:8000/storage/${product.image}`) : '/lemale.jpg');
                    const pNote = product.brand?.name || product.note || 'Fragrance';
                    
                    let pPrice = product.price;
                    if (typeof pPrice === 'number') {
                      pPrice = `$${pPrice}`;
                    } else if (typeof pPrice === 'string' && !pPrice.startsWith('$')) {
                      pPrice = `$${pPrice}`;
                    }

                    return (
                      <Link
                        key={product.id}
                        to={`/product/${pSlug}`}
                        onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 transition-all group border border-transparent hover:border-neutral-200/60"
                      >
                        <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                          <img src={pImg} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        </div>
                        <div>
                          <h4 className="text-xs md:text-sm font-serif text-black hover:text-neutral-700">{product.name}</h4>
                          <p className="text-[9px] uppercase tracking-widest text-neutral-400">{pNote}</p>
                          <p className="text-[10px] text-neutral-600 mt-0.5">{pPrice}</p>
                        </div>
                      </Link>
                    );
                  })}
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