// front-user/src/componets/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  UserOutlined, 
  ShoppingCartOutlined, 
  PhoneOutlined, 
  SearchOutlined, 
  MenuOutlined, 
  CloseOutlined, 
  DownOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  MinusOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import UserDropdown from './UserDropdown';
import CheckoutModal from './CheckoutModal';

const Navbar = ({ cartItems, onRemove, onUpdateQty, user, onLoginClick, onLogout, onNavigate, onCartUpdate, onSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const profileRef = useRef(null);

  // Debug cart items - log when cart changes
  useEffect(() => {
    const totalItems = cartItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    console.log('🛒 Navbar - Cart updated:', cartItems?.length || 0, 'items, total qty:', totalItems);
  }, [cartItems]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate total items for the badge
  const totalItems = cartItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  const subtotal = cartItems?.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 0)), 0) || 0;

  const handleCheckoutSuccess = (order) => {
    if (onCartUpdate) {
      onCartUpdate([]);
    }
    alert(`Order #${order.id} created successfully!`);
    setIsCartOpen(false);
    if (user && onNavigate) {
      onNavigate('orders');
    }
  };

  // Checkout button handler - show login if not logged in
  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    if (!user) {
      onLoginClick();
    } else {
      setIsCheckoutOpen(true);
    }
  };

  // Function to scroll to products section
  const scrollToProducts = () => {
    console.log('🛒 Shop Now clicked - scrolling to products');
    
    if (onNavigate) {
      onNavigate('home');
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

  // ✅ Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log('🔍 Searching for:', searchTerm);
      
      // Navigate to home page first
      if (onNavigate) {
        onNavigate('home');
      }
      
      // Pass search term to parent component
      if (onSearch) {
        onSearch(searchTerm);
      }
      
      // Scroll to products section
      setTimeout(() => {
        const productsSection = document.getElementById('products-section');
        if (productsSection) {
          productsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 200);
    }
  };

  return (
    <>
      <nav className="w-full font-sans shadow-md sticky top-0 z-50 bg-white">
        {/* Top Bar (Green) */}
        <div className="bg-[#004d2c] text-white py-2 px-4 md:px-12 flex justify-between items-center text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <PhoneOutlined /> 
            <span>+8551234567890</span>
          </div>
          <div className="hidden md:block text-center">
            Get 50% Off on Selected Items | 
            <button 
              onClick={scrollToProducts} 
              className="underline font-semibold ml-1 hover:text-green-200"
            >
              Shop Now
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center hover:opacity-80 transition-opacity">
              Eng <DownOutlined className="ml-1 text-[10px]" />
            </button>
            <button className="flex items-center hover:opacity-80 transition-opacity">
              Location <DownOutlined className="ml-1 text-[10px]" />
            </button>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="py-4 px-4 md:px-12 flex items-center justify-between border-b border-gray-100 relative">
          {/* Left Side - Logo */}
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-xl text-[#004d2c] hover:bg-gray-100 p-1 rounded-md transition-colors" 
              onClick={() => setIsMenuOpen(true)}
            >
              <MenuOutlined />
            </button>
            
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img 
                src="https://static.vecteezy.com/system/resources/previews/043/355/301/original/shopping-logo-illustration-new-and-modern-shopping-logo-vector.jpg" 
                alt="Logo" 
                className="w-8 h-8 rounded-md object-cover" 
              />
              <span className="text-[#004d2c] text-2xl font-bold tracking-tighter">E.Shop</span>
            </div>
          </div>

          {/* Desktop Links - CENTERED */}
          <div className="hidden lg:flex items-center justify-center gap-8 text-gray-800 font-medium flex-1">
            {/* Shop Now - Scroll to products */}
            <button 
              onClick={scrollToProducts}
              className="hover:text-[#004d2c] transition-colors font-semibold cursor-pointer"
            >
              Shop Now
            </button>
            
            {/* Deals - Navigate to deals page */}
            <button 
              onClick={() => {
                if (onNavigate) {
                  onNavigate('deals');
                }
              }}
              className="hover:text-[#004d2c] transition-colors cursor-pointer"
            >
              Deals
            </button>
            
            {/* What's New - Navigate to whatsnew page */}
            <button 
              onClick={() => {
                if (onNavigate) {
                  onNavigate('whatsnew');
                }
              }}
              className="hover:text-[#004d2c] transition-colors cursor-pointer"
            >
              What's New
            </button>
            
            {/* Delivery - Navigate to delivery page */}
            <button 
              onClick={() => {
                if (onNavigate) {
                  onNavigate('delivery');
                }
              }}
              className="hover:text-[#004d2c] transition-colors cursor-pointer"
            >
              Delivery
            </button>
          </div>

          {/* Icons Area - Right side */}
          <div className="flex items-center gap-6">
            {/* Search Bar - with form submit */}
            <form onSubmit={handleSearch} className="hidden md:block relative">
              <input 
                type="text" 
                placeholder="Search Product..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-100 rounded-full py-2 px-4 w-60 text-sm outline-none focus:ring-1 focus:ring-green-800 transition-all pr-10"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-[#004d2c]">
                <SearchOutlined />
              </button>
            </form>
            
            {/* Account Button with User Dropdown */}
            <div className="relative" ref={profileRef}>
              <div 
                className="flex items-center gap-2 cursor-pointer font-bold transition-colors hover:text-green-800"
                onClick={() => {
                  if (user) {
                    setIsProfileOpen(!isProfileOpen);
                  } else {
                    onLoginClick();
                  }
                }}
              >
                <UserOutlined className="text-xl" />
                <span className="text-sm hidden sm:block">
                  {user ? (user.full_name?.split(' ')[0] || user.email?.split('@')[0]) : 'Account'}
                </span>
              </div>
              
              {/* User Dropdown Component */}
              {isProfileOpen && user && (
                <UserDropdown 
                  user={user} 
                  onLogout={onLogout} 
                  onNavigate={onNavigate}
                  onClose={() => setIsProfileOpen(false)} 
                />
              )}
            </div>

            {/* Cart Toggle - with badge */}
            <div 
              className="flex items-center gap-2 cursor-pointer group font-bold relative" 
              onClick={() => setIsCartOpen(!isCartOpen)}
            >
              <div className="relative cart-icon">
                <ShoppingCartOutlined className="text-2xl transition-colors group-hover:text-[#004d2c]" />
                {totalItems > 0 && (
                  <span className="cart-badge absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1 shadow-md border-2 border-white">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <span className="text-sm hidden sm:block">Cart</span>
            </div>
          </div>

          {/* Cart Dropdown */}
          {isCartOpen && (
            <div className="absolute top-full right-4 mt-4 w-[400px] bg-white shadow-2xl rounded-[2.5rem] border border-gray-100 z-[100] p-8 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 tracking-tight">
                  Shopping Cart ({totalItems})
                </h3>
                <CloseOutlined 
                  className="cursor-pointer hover:text-red-500 transition-colors text-lg" 
                  onClick={(e) => { e.stopPropagation(); setIsCartOpen(false); }} 
                />
              </div>

              <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {!cartItems || cartItems.length === 0 ? (
                  <div className="py-10 text-center text-gray-400">
                    <ShoppingCartOutlined className="text-5xl mb-2 opacity-20" />
                    <p>Your cart is empty</p>
                    <p className="text-xs mt-1">Add some products to get started!</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 mb-6 items-center group border-b border-gray-100 pb-4 last:border-0">
                      <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform" 
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-bold text-gray-800 truncate pr-2">{item.name}</h4>
                            {item.size && (
                              <p className="text-[10px] text-gray-400 mt-0.5">Size: {item.size}</p>
                            )}
                          </div>
                          <DeleteOutlined 
                            className="text-gray-300 hover:text-red-500 cursor-pointer transition-colors" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              onRemove(item.id); 
                            }}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                onUpdateQty(item.id, -1); 
                              }} 
                              className="hover:text-green-800 transition-colors"
                            >
                              <MinusOutlined className="text-[10px]"/>
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                onUpdateQty(item.id, 1); 
                              }} 
                              className="hover:text-green-800 transition-colors"
                            >
                              <PlusOutlined className="text-[10px]"/>
                            </button>
                          </div>
                          <span className="font-bold text-[#004d2c] tracking-tighter">
                            ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cartItems && cartItems.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="text-2xl font-bold text-[#004d2c]">${subtotal.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={handleCheckoutClick}
                    className="w-full bg-[#004d2c] text-white py-4 rounded-2xl text-lg font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-green-900/20 active:scale-95"
                  >
                    <ShoppingOutlined />  Checkout Now
                  </button>
                </div>
              )}
              
              {/* Login reminder for guest users */}
              {!user && cartItems && cartItems.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl text-center">
                  <p className="text-xs text-blue-600">
                    👋 <button onClick={onLoginClick} className="font-semibold underline">Sign in</button> to save your cart for next time!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Drawer */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsMenuOpen(false)} 
            />
            <div className="fixed top-0 left-0 bottom-0 w-3/4 max-w-xs bg-white shadow-2xl flex flex-col p-6 transition-transform animate-in slide-in-from-left duration-300">
              <div className="flex justify-between items-center mb-8 border-b pb-4">
                <span className="text-[#004d2c] text-xl font-bold">E.Shop</span>
                <CloseOutlined className="text-xl cursor-pointer" onClick={() => setIsMenuOpen(false)} />
              </div>
              
              {user && (
                <div className="mb-6 p-3 bg-gray-50 rounded-xl">
                  <p className="font-semibold text-gray-800">{user.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              )}
              
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search Product..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-100 rounded-full py-2 px-4 text-sm outline-none focus:ring-1 focus:ring-green-800 pr-10"
                  />
                  <button type="submit" className="absolute right-3 top-2.5 text-gray-400">
                    <SearchOutlined />
                  </button>
                </div>
              </form>
              
              {/* Mobile Menu Links */}
              <div className="flex flex-col gap-6 font-medium text-lg text-gray-700">
                {/* Categories - Scroll to products */}
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    scrollToProducts();
                  }}
                  className="text-left hover:text-green-600 transition-colors cursor-pointer"
                >
                  Categories
                </button>
                
                {/* Shop Now - Scroll to products */}
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    scrollToProducts();
                  }}
                  className="text-left hover:text-green-600 transition-colors cursor-pointer"
                >
                  Shop Now
                </button>
                
                {/* Deals - Navigate to deals page */}
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (onNavigate) {
                      onNavigate('deals');
                    }
                  }}
                  className="text-left hover:text-green-600 transition-colors cursor-pointer"
                >
                  Deals
                </button>
                
                {/* What's New - Navigate to whatsnew page */}
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (onNavigate) {
                      onNavigate('whatsnew');
                    }
                  }}
                  className="text-left hover:text-green-600 transition-colors cursor-pointer"
                >
                  What's New
                </button>
                
                {/* Delivery - Navigate to delivery page */}
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (onNavigate) {
                      onNavigate('delivery');
                    }
                  }}
                  className="text-left hover:text-green-600 transition-colors cursor-pointer"
                >
                  Delivery
                </button>
                
                {!user && (
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLoginClick();
                    }}
                    className="text-left text-green-600 font-semibold cursor-pointer"
                  >
                    Sign In / Register
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 10px;
          }
          .cart-badge {
            animation: bounce 0.5s ease;
          }
          @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }
        `}</style>
      </nav>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems || []}
        totalAmount={subtotal}
        onCheckoutSuccess={handleCheckoutSuccess}
        user={user}
        onLoginClick={onLoginClick}
      />
    </>
  );
};

export default Navbar;