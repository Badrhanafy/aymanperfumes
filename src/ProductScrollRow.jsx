import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { PRODUCTS } from './Home';

export default function ProductScrollRow() {
  const rowRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  /* ── drag-to-scroll ── */
  const onMouseDown = (e) => {
    setIsDown(true);
    setStartX(e.pageX - rowRef.current.offsetLeft);
    setScrollLeft(rowRef.current.scrollLeft);
    rowRef.current.style.cursor = 'grabbing';
  };
  const onMouseLeave = () => { setIsDown(false); rowRef.current.style.cursor = 'grab'; };
  const onMouseUp   = () => { setIsDown(false); rowRef.current.style.cursor = 'grab'; };
  const onMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - rowRef.current.offsetLeft;
    const walk = (x - startX) * 1.2;
    rowRef.current.scrollLeft = scrollLeft - walk;
  };

  /* ── scroll state ── */
  const updateScrollState = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  /* ── arrow navigation ── */
  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="px-4 md:px-12 mb-8 md:mb-12 flex items-end justify-between max-w-[1800px] mx-auto">
        <div>
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-[1px] bg-black" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-medium">
              Our Scents
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif text-black tracking-tight">
            The Collection
          </h2>
          <p className="text-neutral-500 mt-2 text-sm md:text-base font-light">
            Curated scents for the modern soul.
          </p>
        </div>

        {/* Arrow Controls */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300
              ${canScrollLeft
                ? 'border-black text-black hover:bg-black hover:text-white'
                : 'border-neutral-200 text-neutral-300 cursor-not-allowed'}`}
            aria-label="Scroll left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300
              ${canScrollRight
                ? 'border-black text-black hover:bg-black hover:text-white'
                : 'border-neutral-200 text-neutral-300 cursor-not-allowed'}`}
            aria-label="Scroll right"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable Row */}
      <div
        ref={rowRef}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onScroll={updateScrollState}
        className="flex gap-5 overflow-x-auto scroll-smooth px-4 md:px-12 pb-6"
        style={{
          cursor: 'grab',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Hide native scrollbar in WebKit */}
        <style>{`.product-scroll-row::-webkit-scrollbar { display: none; }`}</style>

        {PRODUCTS.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            draggable={false}
            className="group flex-shrink-0 w-[240px] sm:w-[280px] md:w-[320px] select-none"
          >
            {/* Card */}
            <div className="relative rounded-2xl overflow-hidden bg-neutral-100 shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-neutral-200/50 h-[360px] sm:h-[400px] md:h-[440px]
                            transition-all duration-500 group-hover:shadow-[0_16px_48px_rgb(0,0,0,0.1)] group-hover:-translate-y-1">

              {/* Image */}
              <img
                src={product.img}
                alt={product.name}
                loading="lazy"
                draggable={false}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-[1.04]"
                onError={(e) => {
                  const fallbacks = [
                    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1588405748880-12d1d2a59b75?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=800&auto=format&fit=crop',
                  ];
                  e.currentTarget.src = fallbacks[product.id - 1] ?? fallbacks[0];
                }}
              />

              {/* Note badge */}
              <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[10px] uppercase tracking-[0.2em] text-black font-medium px-3 py-1.5 rounded-full shadow-sm">
                {product.note}
              </span>

              {/* Bottom info overlay */}
              <div className="absolute bottom-0 left-0 w-full px-5 py-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent
                              translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-[9px] uppercase tracking-[0.25em] text-white/70 mb-1">{product.note}</p>
                <h4 className="text-lg md:text-xl font-serif text-white leading-tight">{product.name}</h4>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-neutral-300 font-light">{product.price}</p>
                  <span className="text-[10px] uppercase tracking-widest text-white/60 border-b border-white/30 pb-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    View →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* "View All" terminal card */}
        <Link
          to="/"
          draggable={false}
          className="group flex-shrink-0 w-[200px] sm:w-[220px] md:w-[260px] select-none flex"
        >
          <div className="flex-1 rounded-2xl border border-neutral-200 flex flex-col items-center justify-center gap-4 text-center px-8 h-[360px] sm:h-[400px] md:h-[440px]
                          transition-all duration-500 hover:bg-neutral-50 hover:border-neutral-300">
            <div className="w-12 h-12 rounded-full border border-black flex items-center justify-center transition-all duration-300 group-hover:bg-black group-hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-black font-medium">View All</p>
              <p className="text-[11px] text-neutral-500 mt-1 font-light">Full Collection</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Mobile swipe hint */}
      <p className="md:hidden text-center text-[10px] uppercase tracking-widest text-neutral-400 mt-2">
        Swipe to explore →
      </p>
    </section>
  );
}
