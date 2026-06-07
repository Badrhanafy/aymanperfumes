import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems]           = useState([]);          // { id, name, price, note, img, quantity }
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar  = useCallback(() => setSidebarOpen(true),  []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen(v => !v), []);

  const addItem = useCallback((product, qty = 1) => {
    const slugify = (text) => text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');

    const id = product.id;
    const slug = product.slug || (product.name ? slugify(product.name) : '');
    const name = product.name;
    
    let img = product.img;
    if (!img && product.image) {
      img = product.image.startsWith('http') 
        ? product.image 
        : `http://localhost:8000/storage/${product.image}`;
    }
    if (!img) img = './lemale.jpg';

    const note = product.brand?.name || product.note || 'Fragrance';

    let price = product.price;
    if (typeof price === 'number') {
      price = `$${price}`;
    } else if (typeof price === 'string' && !price.startsWith('$')) {
      price = `$${price}`;
    }

    const normalizedProduct = { id, slug, name, price, img, note };

    setItems(prev => {
      const exists = prev.find(i => i.id === id);
      if (exists) {
        return prev.map(i =>
          i.id === id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { ...normalizedProduct, quantity: qty }];
    });
    setSidebarOpen(true);
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id, qty) => {
    if (qty < 1) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

  const totalPrice = items.reduce((acc, i) => {
    const price = parseFloat(i.price.replace(/[^0-9.]/g, ''));
    return acc + price * i.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      items, totalItems, totalPrice,
      isSidebarOpen, openSidebar, closeSidebar, toggleSidebar,
      addItem, removeItem, updateQuantity, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
