import { Link } from 'react-router-dom';
import logoSvg from '../public/logos/png/logo2.png';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200/50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
          
          {/* Brand Column */}
          <div className="flex flex-col space-y-6">
            <Link to="/" className="w-fit">
              <img src={logoSvg} alt="L'ESSENCE" className="h-12 w-auto object-contain mix-blend-multiply opacity-80" />
            </Link>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-xs font-light">
              Crafting timeless scents that capture the essence of luxury and emotion. Each bottle is a journey, each note a memory.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="w-8 h-8 rounded-full border border-neutral-200 hover:bg-black hover:text-white transition-all text-black hover:border-black flex items-center justify-center">
                <i className="fab fa-instagram text-xs"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-neutral-200 hover:bg-black hover:text-white transition-all text-black hover:border-black flex items-center justify-center">
                <i className="fab fa-facebook-f text-xs"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-neutral-200 hover:bg-black hover:text-white transition-all text-black hover:border-black flex items-center justify-center">
                <i className="fab fa-whatsapp text-xs"></i>
              </a>
            </div>
          </div>

          {/* Collections Column */}
          <div className="flex flex-col space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-black">Collections</h4>
            <ul className="flex flex-col space-y-4">
              <li><Link to="/" className="text-neutral-600 hover:text-black text-sm transition-colors font-light">The Signature Series</Link></li>
              <li><Link to="/" className="text-neutral-600 hover:text-black text-sm transition-colors font-light">Oriental Nights</Link></li>
              <li><Link to="/" className="text-neutral-600 hover:text-black text-sm transition-colors font-light">Floral Essence</Link></li>
              <li><Link to="/" className="text-neutral-600 hover:text-black text-sm transition-colors font-light">Limited Editions</Link></li>
            </ul>
          </div>
 
          {/* Customer Care Column */}
          <div className="flex flex-col space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-black">Customer Care</h4>
            <ul className="flex flex-col space-y-4">
              <li><Link to="/" className="text-neutral-600 hover:text-black text-sm transition-colors font-light">Shipping Policy</Link></li>
              <li><Link to="/" className="text-neutral-600 hover:text-black text-sm transition-colors font-light">Return & Exchange</Link></li>
              <li><Link to="/" className="text-neutral-600 hover:text-black text-sm transition-colors font-light">FAQs</Link></li>
              <li><Link to="/" className="text-neutral-600 hover:text-black text-sm transition-colors font-light">Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="flex flex-col space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-black">Newsletter</h4>
            <p className="text-neutral-500 text-sm font-light leading-relaxed">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-transparent border-b border-neutral-200 pb-2 text-sm outline-none focus:border-black transition-colors text-black placeholder-neutral-400"
              />
              <button className="absolute right-0 bottom-2 text-[10px] uppercase tracking-widest text-black hover:text-neutral-500 transition-colors">
                Join
              </button>
            </div>
          </div>
 
        </div>
 
        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-neutral-200/40 space-y-4 md:space-y-0">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400">
            © {new Date().getFullYear()} L'ESSENCE PERFUMERY. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center space-x-8 text-[10px] uppercase tracking-widest text-neutral-400">
            <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
