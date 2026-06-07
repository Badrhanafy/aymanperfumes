import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';

export default function CartSidebar() {
  const {
    items, totalItems, totalPrice,
    isSidebarOpen, closeSidebar,
    removeItem, updateQuantity,
  } = useCart();

  const overlayRef = useRef(null);

  // Trap focus & close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeSidebar();
    };
    if (isSidebarOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen, closeSidebar]);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        ref={overlayRef}
        onClick={closeSidebar}
        aria-hidden="true"
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] transition-all duration-500
          ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
      />

      {/* ── Drawer ── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 z-[70] h-full w-full max-w-[420px] bg-white shadow-[−24px_0_60px_rgba(0,0,0,0.08)]
          flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-6 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <h2 className="text-xs uppercase tracking-[0.3em] font-semibold text-black">
              Shopping Cart
            </h2>
            {totalItems > 0 && (
              <span className="bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeSidebar}
            aria-label="Close cart"
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 gap-5">
              {/* Empty bag icon */}
              <svg className="w-14 h-14 text-neutral-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <div>
                <p className="text-sm font-serif text-black mb-1">Your cart is empty</p>
                <p className="text-[11px] uppercase tracking-widest text-neutral-400">
                  Discover our collection
                </p>
              </div>
              <button
                onClick={closeSidebar}
                className="mt-4 px-7 py-3 border border-black text-[11px] uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300"
              >
                Shop Now
              </button>
            </div>
          ) : (
            items.map(item => {
              const unitPrice = parseFloat(item.price.replace(/[^0-9.]/g, ''));
              return (
                <div key={item.id} className="flex gap-4 group">
                  {/* Thumbnail */}
                  <Link to={`/product/${item.slug}`} onClick={closeSidebar}
                    className="flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden bg-neutral-100">
                    <img src={item.img} alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-0.5">{item.note}</p>
                      <Link to={`/product/${item.slug}`} onClick={closeSidebar}
                        className="text-sm font-serif text-black hover:text-neutral-600 transition-colors truncate block">
                        {item.name}
                      </Link>
                      <p className="text-xs text-neutral-500 font-light mt-1">{item.price} each</p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Qty stepper */}
                      <div className="flex items-center border border-neutral-200 rounded-full overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-black hover:bg-neutral-100 transition-colors text-sm"
                          aria-label="Decrease quantity"
                        >−</button>
                        <span className="w-7 text-center text-xs font-medium text-black">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-black hover:bg-neutral-100 transition-colors text-sm"
                          aria-label="Increase quantity"
                        >+</button>
                      </div>

                      {/* Line total + remove */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-black">
                          ${(unitPrice * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item"
                          className="text-neutral-300 hover:text-black transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-neutral-100 px-7 py-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">Subtotal</span>
              <span className="text-base font-serif text-black">${totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-neutral-400 leading-relaxed">
              Shipping &amp; taxes calculated at checkout.
            </p>
            <Link
              to="/cart"
              onClick={closeSidebar}
              className="block w-full bg-black text-white text-[11px] uppercase tracking-[0.25em] font-medium py-4 text-center hover:bg-neutral-900 transition-colors"
            >
              View Full Cart
            </Link>
            <button
              onClick={closeSidebar}
              className="block w-full border border-neutral-200 text-[11px] uppercase tracking-[0.25em] text-black py-3.5 text-center hover:border-black transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
