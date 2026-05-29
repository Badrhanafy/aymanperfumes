import { BrowserRouter as Router, Routes,Route } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './Home';
import ProductDetails from './ProductDetails';
import Footer from './Footer';
import OurStory from './OurStory';

function App() {
  return (
    <Router>
      <div className="bg-perfume-cream min-h-screen font-sans selection:bg-perfume-gold selection:text-white flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/our-story" element={<OurStory />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;