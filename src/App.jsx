import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './CartContext';
import Navbar from './Navbar';
import Home from './Home';
import ProductDetails from './ProductDetails';
import Footer from './Footer';
import OurStory from './OurStory';
import Cart from './Cart';
import CartSidebar from './CartSidebar';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="bg-perfume-cream min-h-screen font-sans selection:bg-perfume-gold selection:text-white flex flex-col">
          <Navbar />
          <CartSidebar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/our-story" element={<OurStory />} />
              <Route path="/cart" element={<Cart />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;