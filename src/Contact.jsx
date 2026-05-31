import React, { useState } from 'react';

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && message) {
      setIsSubmitted(true);
      // Reset form after 5 seconds to allow sending another message
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
        setMessage('');
      }, 5000);
    }
  };

  return (
    <section className="py-20 md:py-32 bg-[#0A0A0A] text-white relative overflow-hidden">
      
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neutral-800/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-neutral-900/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-4xl">
        
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-white/20"></div>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-neutral-400 font-medium">Bespoke Inquiries</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif font-light tracking-tight mb-4 text-white">
            Connect with an Artisan
          </h2>
          <p className="text-neutral-400 font-light max-w-lg text-sm md:text-base">
            Whether you seek a custom fragrance profile or have questions about our collections, our connoisseurs are at your service.
          </p>
        </div>

        {/* Dynamic Form Area in Glass Pane */}
        <div className="relative min-h-[300px] bg-neutral-900/40 backdrop-blur-2xl border border-neutral-800/80 rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
          
          {/* Success Alert (Glassmorphism) */}
          <div 
            className={`absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/90 backdrop-blur-xl rounded-3xl transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-20
              ${isSubmitted ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-8 invisible'}
            `}
          >
            <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center mb-6 shadow-xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-serif mb-2 text-white">Message Received</h3>
            <p className="text-neutral-400 font-light text-center">
              An artisan will respond to your inquiry shortly.
            </p>
          </div>

          {/* Contact Form */}
          <form 
            onSubmit={handleSubmit} 
            className={`flex flex-col gap-8 transition-all duration-700 ease-in-out relative z-10
              ${isSubmitted ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}
            `}
          >
            <div className="flex flex-col relative group">
              <input 
                type="email" 
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="w-full bg-transparent border-b border-white/20 py-3 text-white outline-none focus:border-white transition-colors peer"
              />
              <label 
                htmlFor="email" 
                className="absolute left-0 top-3 text-neutral-400 text-sm md:text-base transition-all duration-300 pointer-events-none peer-focus:-top-4 peer-focus:text-xs peer-focus:text-white peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-white"
              >
                Your Email Address
              </label>
            </div>

            <div className="flex flex-col relative group">
              <textarea 
                id="message"
                required
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder=" "
                className="w-full bg-transparent border-b border-white/20 py-3 text-white outline-none focus:border-white transition-colors peer resize-none"
              ></textarea>
              <label 
                htmlFor="message" 
                className="absolute left-0 top-3 text-neutral-400 text-sm md:text-base transition-all duration-300 pointer-events-none peer-focus:-top-4 peer-focus:text-xs peer-focus:text-white peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-white"
              >
                Your Inquiry
              </label>
            </div>

            <button 
              type="submit" 
              className="self-start px-10 py-4 bg-white text-black font-medium text-xs md:text-sm uppercase tracking-widest hover:bg-neutral-200 transition-colors rounded-full mt-4"
            >
              Send Message
            </button>
          </form>

        </div>
      </div>
    </section>
  );
}
