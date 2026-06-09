import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PRODUCTS } from './Home';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Order states
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orderError, setOrderError] = useState(null);
  const [lastOrder, setLastOrder] = useState(null); // store last order details
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

  // Fetch product details
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);
    setOrderSuccess(null);
    setOrderError(null);
    setLastOrder(null);

    fetch(`http://localhost:8000/api/perfumes/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('API single product fetch failed:', err);
        const slugify = (text) => text.toString().toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');

        const fallback = PRODUCTS.find(p => p.slug === slug || slugify(p.name) === slug);
        if (fallback) {
          setProduct(fallback);
        } else {
          setError('Product not found');
        }
        setLoading(false);
      });
  }, [slug]);

  // Pre‑fill contact fields when user data becomes available
  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '');
      setCustomerEmail(user.email || '');
      setCustomerPhone(user.phone || '');
    }
  }, [user]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderSuccess(null);
    setOrderError(null);
    setLastOrder(null);

    if (!product || !product.id) {
      setOrderError('Product information is missing. Please refresh the page.');
      return;
    }

    if (quantity < 1) {
      setOrderError('Quantity must be at least 1');
      return;
    }

    if (product.stock !== undefined && quantity > product.stock) {
      setOrderError(`Only ${product.stock} items available in stock.`);
      return;
    }

    if (!customerName.trim()) {
      setOrderError('Please enter your full name.');
      return;
    }
    if (!customerEmail.trim()) {
      setOrderError('Please enter your email address.');
      return;
    }
    if (!customerPhone.trim()) {
      setOrderError('Please enter your phone number.');
      return;
    }
    if (!shippingAddress.trim()) {
      setOrderError('Please provide a shipping address.');
      return;
    }

    const payload = {
      items: [{ perfume_id: product.id, quantity }],
      shipping_address: shippingAddress.trim(),
      guest_name: customerName.trim(),
      guest_email: customerEmail.trim(),
      guest_phone: customerPhone.trim(),
    };

    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.message) {
          throw new Error(data.message);
        }
        throw new Error(data.message || 'Failed to place order');
      }

      // Store the complete order from response
      setLastOrder(data.order);
      setOrderSuccess(`Order #${data.order.id} placed successfully!`);

      // Reset form
      setQuantity(1);
      setShippingAddress('');
      // Keep customer fields for convenience

      // Refresh stock display
      if (product && product.stock !== undefined) {
        setProduct(prev => ({ ...prev, stock: prev.stock - quantity }));
      }

      // Optional auto-redirect after 5 seconds (user can still see summary)
      setTimeout(() => {
        navigate('/orders');
      }, 5000);
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-neutral-200 border-t-black rounded-full animate-spin"></div>
          <p className="text-xs uppercase tracking-widest text-neutral-400 font-light">Loading Fragrance...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-black mb-4">Product Not Found</h2>
          <Link to="/" className="text-xs uppercase tracking-widest border-b border-black text-black pb-1 hover:opacity-70 transition">Return to Home</Link>
        </div>
      </div>
    );
  }

  const pImg = `http://localhost:8000/storage/${product.image}`;
  const pNote = product.brand?.name || product.note || 'Fragrance';
  let pPrice = product.price;
  if (typeof pPrice === 'number') {
    pPrice = `$${pPrice}`;
  } else if (typeof pPrice === 'string' && !pPrice.startsWith('$')) {
    pPrice = `$${pPrice}`;
  }

  const numericPrice = typeof product.price === 'number'
    ? product.price
    : parseFloat(String(product.price).replace(/[^0-9.]/g, '') || 0);
  const total = (numericPrice * quantity).toFixed(2);
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const maxQuantity = product.stock !== undefined ? product.stock : 99;

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 relative">
        {/* Product Image Section - Sticky */}
        <div className="lg:col-span-5 h-[60vh] lg:h-[85vh] lg:sticky lg:top-28 rounded-2xl overflow-hidden shadow-none group">
          <img
            src={pImg}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute top-6 left-6 lg:top-8 lg:left-8">
            <span className="bg-black/90 backdrop-blur-md px-5 py-2.5 rounded-full text-[10px] lg:text-xs uppercase tracking-[0.2em] text-white font-medium shadow-sm">
              {pNote}
            </span>
          </div>
        </div>

        {/* Product Details & Order Section */}
        <div className="lg:col-span-7 flex flex-col justify-start lg:pt-8 lg:pb-32">
          <Link to="/" className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 hover:text-black mb-8 inline-flex items-center gap-3 transition-colors w-fit group">
            <span className="w-6 h-px bg-current group-hover:w-8 transition-all duration-300"></span>
            Back to Collection
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl md:text-6xl lg:text-5xl font-serif text-black mb-4 tracking-tight leading-none">{product.name}</h1>
            <p className="text-2xl md:text-3xl text-neutral-800 font-light italic">{pPrice}</p>
            {product.stock !== undefined && (
              <p className={`text-sm mt-2 ${product.stock <= 5 ? 'text-amber-600' : 'text-neutral-500'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </p>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            onClick={() => {
              addItem(product, 1);
              setAddedToCart(true);
              setTimeout(() => setAddedToCart(false), 2000);
            }}
            className={`mb-10 flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300
              ${addedToCart
                ? 'bg-neutral-900 text-white'
                : 'bg-black text-white hover:bg-neutral-800'}`}
          >
            {addedToCart ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Added to Cart
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add to Cart
              </>
            )}
          </button>

          <div className="mb-16 relative">
            <div className="absolute -left-6 top-0 w-1 h-full bg-black opacity-20 hidden md:block"></div>
            <p className="leading-relaxed text-base md:text-lg font-light text-black">
              {product.description || `Experience the exquisite blend of our finest ingredients. This signature fragrance offers a timeless aroma that perfectly balances elegance and sophistication. Let ${product.name} be your ultimate scent statement, crafted for those who appreciate the true art of perfumery.`}
            </p>
          </div>

          {/* Order Form */}
          <div className="relative bg-neutral-50 rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-200/50">
            <div className="flex items-center gap-4 mb-10">
              <span className="w-8 h-px bg-black"></span>
              <h3 className="text-xl lg:text-2xl font-serif text-black">Place Your Order</h3>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-8">
              {/* Name, email, phone fields */}
              <div className="relative">
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="peer w-full bg-transparent border-b border-neutral-200 px-0 py-3 outline-none focus:border-black transition-colors text-black placeholder-transparent"
                  placeholder="Full Name"
                />
                <label className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-[0.15em] text-neutral-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-neutral-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-black pointer-events-none">
                  Full Name *
                </label>
              </div>

              <div className="relative">
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="peer w-full bg-transparent border-b border-neutral-200 px-0 py-3 outline-none focus:border-black transition-colors text-black placeholder-transparent"
                  placeholder="Email Address"
                />
                <label className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-[0.15em] text-neutral-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-neutral-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-black pointer-events-none">
                  Email Address *
                </label>
              </div>

              <div className="relative">
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="peer w-full bg-transparent border-b border-neutral-200 px-0 py-3 outline-none focus:border-black transition-colors text-black placeholder-transparent"
                  placeholder="Phone Number"
                />
                <label className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-[0.15em] text-neutral-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-neutral-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-black pointer-events-none">
                  Phone Number *
                </label>
              </div>

              <div className="relative">
                <textarea
                  required
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="peer w-full bg-transparent border-b border-neutral-200 px-0 py-3 outline-none focus:border-black transition-colors text-black resize-none placeholder-transparent"
                  placeholder="Shipping Address"
                />
                <label className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-[0.15em] text-neutral-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-neutral-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-black pointer-events-none">
                  Shipping Address *
                </label>
              </div>

              {/* Quantity selector */}
              <div className="relative">
                <label className="block text-[10px] uppercase tracking-[0.15em] text-neutral-500 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center hover:border-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-2xl font-light w-12 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={quantity >= maxQuantity || isOutOfStock}
                    className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center hover:border-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                {isOutOfStock && (
                  <p className="text-red-500 text-xs mt-2">This product is currently out of stock</p>
                )}
              </div>

              {/* Total preview */}
              <div className="bg-white p-4 rounded-xl border border-neutral-200">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 text-sm">Total amount</span>
                  <span className="text-2xl font-serif">${total}</span>
                </div>
              </div>

              {/* Success/Error messages */}
              {orderSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm">
                  {orderSuccess}
                </div>
              )}
              {orderError && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm">
                  {orderError}
                </div>
              )}

              {/* Order summary card after success (matching response structure) */}
              {lastOrder && (
                <div className="border border-green-200 rounded-xl bg-green-50/30 p-4 space-y-2 text-sm">
                  <p className="font-medium text-green-800 mb-2">✅ Order Confirmation</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span className="text-neutral-600">Order ID:</span>
                    <span className="font-mono text-black">#{lastOrder.id}</span>
                    
                    <span className="text-neutral-600">Tracking Code:</span>
                    <span className="font-mono text-black">{lastOrder.tracking_code || 'N/A'}</span>
                    
                    <span className="text-neutral-600">Total:</span>
                    <span className="font-medium">${parseFloat(lastOrder.total_price).toFixed(2)}</span>
                    
                    <span className="text-neutral-600">Shipping to:</span>
                    <span className="text-black break-words">{lastOrder.shipping_address}</span>
                    
                    <span className="text-neutral-600">Status:</span>
                    <span className="capitalize">{lastOrder.status}</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2 pt-1 border-t border-green-200">
                    You will be redirected to your orders page in a few seconds.
                  </p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting || isOutOfStock}
                className={`group relative w-full bg-black text-white py-5 overflow-hidden rounded-none mt-4 shadow-md transition-all duration-300
                  ${(submitting || isOutOfStock) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-900 hover:shadow-lg'}
                  ${submitting ? 'scale-[0.98]' : ''}`}
              >
                <span className="relative z-10 uppercase tracking-[0.25em] text-xs font-medium flex items-center justify-center gap-3">
                  {submitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Place Order
                      <svg className="w-4 h-4 transform transition-all duration-700 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </>
                  )}
                </span>
              </button>

              <p className="text-[10px] text-neutral-400 text-center mt-4 tracking-wider">
                By placing an order, you agree to our terms and conditions
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}