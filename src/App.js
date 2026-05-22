// front-user/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './componets/Navbar';
import HeroSection from './componets/Herosection';
import Products from './componets/product';
import ProductDetail from './componets/ProductDetail';
import AppExtras from './componets/AppExtras';
import AuthModal from './componets/AuthModal';
import PaymentResult from './componets/PaymentResult';
import PaymentReturn from './componets/PaymentReturn';

import PersonalDetails from './componets/Profile/PersonalDetails';
import AddressBook from './componets/Profile/AddressBook';
import Orders from './componets/Profile/Orders';
import ChangePassword from './componets/Profile/ChangePassword';
import Notification from './componets/Profile/Notification';
import Delivery from './componets/Delivery';
import WhatsNew from './componets/WhatsNew';
import Deals from './componets/Deals';

function HomePage({ onAddToCart, onProductClick, onShowLoginModal, searchTerm, onSearchTermChange }) {
  return (
    <>
      <HeroSection />
      <Products 
        onAddToCart={onAddToCart} 
        onProductClick={onProductClick}
        onShowLoginModal={onShowLoginModal}
        searchTerm={searchTerm}
        onSearchTermChange={onSearchTermChange}
      />
      <AppExtras 
        onAddToCart={onAddToCart} 
        onProductClick={onProductClick}
        onShowLoginModal={onShowLoginModal}
      />
    </>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
const API_BASE_URL = 'https://backendtest-2-fsm9.onrender.com';
  const fetchUserCart = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/cart/`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 User cart loaded:', data.length, 'items');
        setCartItems(data);
        localStorage.setItem('cart', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching user cart:', error);
    }
  };

  const fetchGuestCart = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/`, {
        headers: { 
          'X-Session-Id': sessionId,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Guest cart loaded:', data.length, 'items');
        setCartItems(data);
        localStorage.setItem('cart', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching guest cart:', error);
    }
  };

  // Initialize session ID and load cart on mount
  useEffect(() => {
    let id = localStorage.getItem('sessionId');
    if (!id) {
      id = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('sessionId', id);
    }
    setSessionId(id);
    console.log('🆔 Session ID initialized:', id);

    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        fetchUserCart();
      } catch (e) {
        console.error('Error parsing user:', e);
        fetchGuestCart(id);
      }
    } else {
      fetchGuestCart(id);
    }
    setLoading(false);
  }, []);

  // Handle search from navbar
  const handleSearch = (term) => {
    console.log('🔍 Global search:', term);
    setGlobalSearchTerm(term);
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setSelectedProduct(null);
    }
  };

  // Handle search term change from Products component
  const handleSearchTermChange = (term) => {
    setGlobalSearchTerm(term);
  };

  // Add to cart
  const handleAddToCart = async (product) => {
    const quantity = product.quantity || 1;
    const token = localStorage.getItem('access_token');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentSessionId = sessionId || localStorage.getItem('sessionId');
    
    console.log('🛒 Adding to cart:', product.name);
    
    const cartItem = {
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: quantity,
      image: product.image,
      size: product.size || 'M',
      session_id: currentSessionId,
      user_id: currentUser.id || null
    };

    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-Session-Id': currentSessionId
      };
      
      if (token && currentUser.id) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(cartItem)
      });
      
      if (response.ok) {
        const newItem = await response.json();
        console.log('✅ Item added successfully:', newItem);
        
        setCartItems(prevItems => {
          const existingIndex = prevItems.findIndex(
            item => item.product_id === product.id
          );
          
          if (existingIndex !== -1) {
            const updatedItems = [...prevItems];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + quantity
            };
            return updatedItems;
          } else {
            return [...prevItems, newItem];
          }
        });
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        alert(`Failed to add to cart: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    const token = localStorage.getItem('access_token');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentSessionId = sessionId || localStorage.getItem('sessionId');
    
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    
    try {
      const headers = { 
        'X-Session-Id': currentSessionId,
        'Content-Type': 'application/json'
      };
      if (token && currentUser.id) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
        method: 'DELETE',
        headers: headers
      });
      
      if (!response.ok) {
        console.error('Failed to remove from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const handleUpdateQty = async (itemId, delta) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;
    
    const newQuantity = Math.max(1, item.quantity + delta);
    
    setCartItems(prevItems => 
      prevItems.map(i => 
        i.id === itemId ? { ...i, quantity: newQuantity } : i
      )
    );
    
    const token = localStorage.getItem('access_token');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentSessionId = sessionId || localStorage.getItem('sessionId');
    
    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-Session-Id': currentSessionId
      };
      if (token && currentUser.id) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      await fetch(`${API_BASE_URL}/cart/${itemId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ quantity: newQuantity })
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleLoginSuccess = async (userData) => {
    console.log('🔐 User logged in:', userData.email);
    
    const guestCart = [...cartItems];
    console.log('📦 Guest cart before login:', guestCart.length, 'items');
    
    setUser(userData);
    const token = localStorage.getItem('access_token');
    const currentSessionId = sessionId || localStorage.getItem('sessionId');
    
    if (guestCart.length > 0 && token) {
      console.log('🔄 Merging guest cart with user cart...');
      for (const item of guestCart) {
        try {
          await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'X-Session-Id': currentSessionId
            },
            body: JSON.stringify({
              product_id: item.product_id || item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              size: item.size || 'M',
              user_id: userData.id
            })
          });
        } catch (error) {
          console.error('Error merging item:', error);
        }
      }
    }
    
    await fetchUserCart();
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    console.log('🚪 User logging out');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    setCartItems([]);
    localStorage.removeItem('cart');
    const currentSessionId = sessionId || localStorage.getItem('sessionId');
    if (currentSessionId) fetchGuestCart(currentSessionId);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setCurrentPage('home');
  };
  
  const handleNavigate = (page) => {
    console.log('🔍 Navigating to:', page);
    setCurrentPage(page);
    setSelectedProduct(null);
    setGlobalSearchTerm(''); // Clear search when navigating
    navigate('/');
  };
  
  // Function to scroll to products section
  const scrollToProducts = () => {
    console.log('🛒 Scroll to products called');
    
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setSelectedProduct(null);
    }
    
    setTimeout(() => {
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 200);
  };
  
  const handleCartUpdate = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };
  
  const handleCheckoutSuccess = (order) => {
    console.log('✅ Checkout success, clearing cart');
    setCartItems([]);
    localStorage.removeItem('cart');
    alert(`✅ Order #${order.id} created successfully!`);
    navigate('/');
  };
  
  const handleStartShopping = () => {
    setCurrentPage('home');
    setSelectedProduct(null);
    setGlobalSearchTerm('');
    setTimeout(() => {
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  const renderProfilePage = () => {
    switch(currentPage) {
      case 'personal': return <PersonalDetails user={user} onUpdate={setUser} />;
      case 'address': return <AddressBook />;
      case 'orders': return <Orders onStartShopping={handleStartShopping} />;
      case 'password': return <ChangePassword />;
      case 'notification': return <Notification />;
      case 'delivery': return <Delivery />;
      case 'whatsnew': return <WhatsNew />;
      case 'deals': return <Deals />;  
      default: return null;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        cartItems={cartItems}
        user={user}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onRemove={handleRemoveFromCart}
        onUpdateQty={handleUpdateQty}
        onNavigate={handleNavigate}
        onCartUpdate={handleCartUpdate}
        onScrollToProducts={scrollToProducts}
        onSearch={handleSearch}
      />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {currentPage !== 'home' && renderProfilePage()}
        {currentPage === 'home' && selectedProduct && (
          <ProductDetail 
            product={selectedProduct} 
            onBack={() => setSelectedProduct(null)} 
            onAddToCart={handleAddToCart}
            onProductClick={handleProductClick}
          />
        )}
        {currentPage === 'home' && !selectedProduct && (
          <HomePage 
            onAddToCart={handleAddToCart} 
            onProductClick={handleProductClick}
            onShowLoginModal={() => setIsAuthModalOpen(true)}
            searchTerm={globalSearchTerm}
            onSearchTermChange={handleSearchTermChange}
          />
        )}
      </main>

      <footer className="mt-20 py-10 border-t bg-gray-50 text-center text-gray-400 text-xs">
        © 2026 E.Shop. Professional E-Commerce Layout.
      </footer>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/payment-result" element={<PaymentResult />} />
        <Route path="/payment-return" element={<PaymentReturn />} />
      </Routes>
    </Router>
  );
}

export default App;