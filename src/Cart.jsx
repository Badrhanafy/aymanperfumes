import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';

export default function Cart() {
  const {
    items, totalItems, totalPrice,
    removeItem, updateQuantity, clearCart,
  } = useCart();

  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleWhatsAppCheckout = () => {
    const phoneNumber = '+212640952206';
    const lines = [
      '*🛒 Order Summary*',
      '─────────────────────',
      ...items.map(item => {
        const unit = parseFloat(item.price.replace(/[^0-9.]/g, ''));
        return `• *${item.name}* x${item.quantity} — $${(unit * item.quantity).toFixed(2)}`;
      }),
      '─────────────────────',
      `*Total: $${totalPrice.toFixed(2)}*`,
      '',
      'Please reply with your delivery details to confirm.',
    ];
    const message = encodeURIComponent(lines.join('\n'));
    window.open(`https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`, '_blank');
    setOrderPlaced(true);
    setTimeout(() => setOrderPlaced(false), 4000);
  };

  return (
    <div className="min-h-screen bg-white pt-[72px] md:pt-[88px]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12 py-12 md:py-20">

        {/* Page Header */}
        <div className="mb-12 md:mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-[1px] bg-black" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-medium">Your Selection</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h1 className="text-4xl md:text-6xl font-serif text-black tracking-tight">
              Shopping Cart
            </h1>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black transition-colors border-b border-neutral-200 hover:border-black pb-0.5 w-fit"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
            <svg className="w-20 h-20 text-neutral-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <div className="space-y-2">
              <p className="text-2xl font-serif text-black">Your cart is empty</p>
              <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-400">
                Discover a scent that speaks to you
              </p>
            </div>
            <Link
              to="/"
              className="mt-4 inline-block bg-black text-white text-[11px] uppercase tracking-[0.25em] px-10 py-4 hover:bg-neutral-900 transition-colors"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 items-start">

            {/* ── Cart Items ── */}
            <div className="lg:col-span-2 divide-y divide-neutral-100">
              {items.map(item => {
                const unitPrice = parseFloat(item.price.replace(/[^0-9.]/g, ''));
                return (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-5 py-8 group">

                    {/* Image */}
                    <Link to={`/product/${item.slug}`}
                      className="flex-shrink-0 w-full sm:w-28 h-40 sm:h-36 rounded-2xl overflow-hidden bg-neutral-100">
                      <img src={item.img} alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 mb-1">{item.note}</p>
                        <Link to={`/product/${item.slug}`}
                          className="text-lg md:text-xl font-serif text-black hover:text-neutral-600 transition-colors">
                          {item.name}
                        </Link>
                        <p className="text-sm text-neutral-500 font-light mt-1">{item.price} per bottle</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-5">
                        {/* Qty stepper */}
                        <div className="flex items-center border border-neutral-200 rounded-full overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-9 h-9 flex items-center justify-center text-black hover:bg-neutral-100 transition-colors"
                            aria-label="Decrease quantity"
                          >−</button>
                          <span className="w-8 text-center text-sm font-medium text-black">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center text-black hover:bg-neutral-100 transition-colors"
                            aria-label="Increase quantity"
                          >+</button>
                        </div>

                        {/* Price + Remove */}
                        <div className="flex items-center gap-5">
                          <span className="text-lg font-serif text-black">
                            ${(unitPrice * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            aria-label="Remove item"
                            className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black transition-colors border-b border-neutral-200 hover:border-black pb-0.5"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Order Summary ── */}
            <div className="lg:col-span-1">
              <div className="bg-neutral-50 rounded-3xl p-7 md:p-8 border border-neutral-200/50 sticky top-28">
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-8 h-px bg-black" />
                  <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-black">
                    Order Summary
                  </h3>
                </div>

                <div className="space-y-4 mb-6">
                  {items.map(item => {
                    const unit = parseFloat(item.price.replace(/[^0-9.]/g, ''));
                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-neutral-600 font-light truncate max-w-[60%]">
                          {item.name} <span className="text-neutral-400">×{item.quantity}</span>
                        </span>
                        <span className="text-black font-medium">${(unit * item.quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-5 border-t border-neutral-200/70 space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500 font-light">Subtotal</span>
                    <span className="text-black">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500 font-light">Shipping</span>
                    <span className="text-neutral-400 italic text-xs self-end">Calculated on order</span>
                  </div>
                  <div className="flex justify-between text-base font-serif pt-2">
                    <span className="text-black">Total</span>
                    <span className="text-black">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Success flash */}
                {orderPlaced && (
                  <div className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-600
                    bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-black flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Redirected to WhatsApp!
                  </div>
                )}

                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full bg-black text-white py-4 text-[11px] uppercase tracking-[0.25em] font-medium
                    flex items-center justify-center gap-3 hover:bg-neutral-900 transition-colors rounded-none mb-3"
                >
                  {/* WhatsApp icon */}
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  Order via WhatsApp
                </button>

                <Link
                  to="/"
                  className="block w-full border border-neutral-200 text-[11px] uppercase tracking-[0.25em]
                    text-black py-3.5 text-center hover:border-black transition-colors"
                >
                  Continue Shopping
                </Link>

                <p className="text-[10px] text-neutral-400 text-center mt-5 leading-relaxed">
                  Secure ordering · Free returns · Premium packaging
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
