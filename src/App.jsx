import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './CartContext';
import { AuthProvider } from './AuthContext';
import Navbar from './Navbar';
import Home from './Home';
import ProductDetails from './ProductDetails';
import Footer from './Footer';
import OurStory from './OurStory';
import Cart from './Cart';
import CartSidebar from './CartSidebar';
import Login from './Login';
import Signup from './Signup';
import ProtectedRoute from './admin/ProtectedRoute';
import AdminDashboard from './admin/AdminDashboard';

function MainLayout() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className={`${isAdminPath ? 'bg-neutral-950' : 'bg-perfume-cream'} min-h-screen font-sans selection:bg-[#C9A84C] selection:text-white flex flex-col`}>
      {!isAdminPath && <Navbar />}
      {!isAdminPath && <CartSidebar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/our-story" element={<OurStory />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {!isAdminPath && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <MainLayout />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;