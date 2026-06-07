import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS } from './Home';
import { useCart } from './CartContext';

export default function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    quantity: 1,
  });
  
  const [isClicked, setIsClicked] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);

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

  if (loading) {
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

  // Normalize properties
  const pImg = `http://localhost:8000/storage/${product.image}` ;
  const pNote = product.brand?.name || product.note || 'Fragrance';
  
  let pPrice = product.price;
  if (typeof pPrice === 'number') {
    pPrice = `$${pPrice}`;
  } else if (typeof pPrice === 'string' && !pPrice.startsWith('$')) {
    pPrice = `$${pPrice}`;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOrder = (e) => {
    e.preventDefault();
    
    // 1. Format the phone number (Ensure no +, spaces, or leading zeros if required by your region)
    const phoneNumber = "+212640952206"; 

    // 2. Clean the price string to ensure the math works
    const numericPrice = typeof pPrice === 'number' ? pPrice : parseFloat(pPrice.replace(/[^0-9.]/g, ''));
    const total = (numericPrice * formData.quantity).toFixed(2);
    
    // 3. Construct a clean, URL-friendly message
    const messageLines = [
      "*New Order Request* 🌟",
      "----------------------",
      `*Product:* ${product.name}`,
      `*Price:* ${pPrice}`,
      `*Quantity:* ${formData.quantity}`,
      `*Total:* $${total}`,
      "",
      "*Customer Details:*",
      `*Name:* ${formData.name}`,
      `*Phone:* ${formData.phone}`,
      `*Address:* ${formData.address}`
    ];

    const message = messageLines.join('\n');
    const encodedMessage = encodeURIComponent(message);
    
    // 4. Use the API endpoint for better cross-device compatibility
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
    
    setIsClicked(true);
    window.open(whatsappUrl, '_blank');
    
    setTimeout(() => {
      setIsClicked(false);
    }, 1500);
  };

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
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        </div>

        {/* Product Details & Form Section */}
        <div className="lg:col-span-7 flex flex-col justify-start lg:pt-8 lg:pb-32">
          <Link to="/" className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 hover:text-black mb-8 inline-flex items-center gap-3 transition-colors w-fit group">
            <span className="w-6 h-px bg-current group-hover:w-8 transition-all duration-300"></span>
            Back to Collection
          </Link>
          
          <div className="mb-10">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-black mb-4 tracking-tight leading-none">{product.name}</h1>
            <p className="text-2xl md:text-3xl text-neutral-800 font-light italic">{pPrice}</p>
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

          <div className="relative bg-neutral-50 rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-200/50">
            <div className="flex items-center gap-4 mb-10">
              <span className="w-8 h-px bg-black"></span>
              <h3 className="text-xl lg:text-2xl font-serif text-black">Reserve Your Bottle</h3>
            </div>
            
            <form onSubmit={handleOrder} className="space-y-8">
              {/* Full Name Input */}
              <div className="relative">
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="peer w-full bg-transparent border-b border-neutral-200 px-0 py-3 outline-none focus:border-black transition-colors text-black placeholder-transparent font-light"
                  placeholder="Full Name"
                />
                <label className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-[0.15em] text-neutral-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-neutral-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-black pointer-events-none">
                  Full Name
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Phone Input */}
                <div className="relative">
                  <input 
                    type="tel" 
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="peer w-full bg-transparent border-b border-neutral-200 px-0 py-3 outline-none focus:border-black transition-colors text-black placeholder-transparent font-light"
                    placeholder="Phone Number"
                  />
                  <label className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-[0.15em] text-neutral-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-neutral-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-black pointer-events-none">
                    Phone Number
                  </label>
                </div>
                {/* Quantity Input */}
                <div className="relative">
                  <input 
                    type="number" 
                    name="quantity"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="peer w-full bg-transparent border-b border-neutral-200 px-0 py-3 outline-none focus:border-black transition-colors text-black placeholder-transparent font-light"
                    placeholder="Quantity"
                  />
                  <label className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-[0.15em] text-neutral-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-neutral-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-black pointer-events-none">
                    Quantity
                  </label>
                </div>
              </div>

              {/* Address Input */}
              <div className="relative">
                <textarea 
                  name="address"
                  required
                  rows="2"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="peer w-full bg-transparent border-b border-neutral-200 px-0 py-3 outline-none focus:border-black transition-colors text-black resize-none placeholder-transparent font-light"
                  placeholder="Delivery Address"
                ></textarea>
                <label className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-[0.15em] text-neutral-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-neutral-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-black pointer-events-none">
                  Delivery Address
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className={`group relative w-full bg-black text-white py-5 overflow-hidden rounded-none mt-8 shadow-md transition-all duration-300 ${isClicked ? 'scale-[0.98] bg-neutral-900 shadow-sm' : 'hover:bg-neutral-900 hover:shadow-lg'}`}
              >
                <span className="relative z-10 uppercase tracking-[0.25em] text-xs font-medium flex items-center justify-center gap-3">
                  <svg 
                    className={`w-5 h-5 transition-all duration-700 ease-[cubic-bezier(0.87,0,0.13,1)] ${
                      isClicked 
                        ? 'opacity-0 -translate-x-12 scale-50 rotate-[-15deg]' 
                        : 'opacity-100 translate-x-0 scale-100 rotate-0'
                    }`}
                    fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  Confirm Order
                  <svg className={`w-4 h-4 transform transition-all duration-700 ease-[cubic-bezier(0.87,0,0.13,1)] ${isClicked ? 'translate-x-8 opacity-0 scale-50' : 'group-hover:translate-x-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </span>
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
