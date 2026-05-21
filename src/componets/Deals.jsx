// front-user/src/componets/Deals.jsx
import React, { useState, useEffect } from 'react';
import { StarFilled, HeartOutlined, HeartFilled, TagOutlined, ClockCircleOutlined, FireOutlined } from '@ant-design/icons';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});

  const API_BASE_URL = 'http://localhost:8000/api';

  // Flash sale end time (24 hours from now)
  const flashSaleEndTime = new Date();
  flashSaleEndTime.setHours(flashSaleEndTime.getHours() + 24);

  useEffect(() => {
    fetchDeals();
    loadFavorites();
    
    // Timer countdown
    const timer = setInterval(() => {
      const now = new Date();
      const diff = flashSaleEndTime - now;
      
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (3600000)) / (1000 * 60));
        const seconds = Math.floor((diff % (60000)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        // Apply discount to products for deals
        const dealsData = data.slice(0, 8).map(product => ({
          ...product,
          originalPrice: product.price,
          price: (product.price * 0.7).toFixed(2), // 30% off
          discount: 30,
          sold: Math.floor(Math.random() * 50) + 10
        }));
        setDeals(dealsData);
      } else {
        setDeals(getDefaultDeals());
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
      setDeals(getDefaultDeals());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultDeals = () => [
    { id: 1, name: "Wireless Headphones", price: 69.99, originalPrice: 129.99, discount: 46, image: "https://images.unsplash.com/photo-1613040819284-8356bb05c924?q=80&w=400", sold: 245, rating: 4.8 },
    { id: 2, name: "Smart Watch Pro", price: 89.99, originalPrice: 199.99, discount: 55, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400", sold: 189, rating: 4.7 },
    { id: 3, name: "Noise Cancelling Earbuds", price: 49.99, originalPrice: 99.99, discount: 50, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=400", sold: 432, rating: 4.6 },
    { id: 4, name: "Gaming Keyboard RGB", price: 39.99, originalPrice: 79.99, discount: 50, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=400", sold: 156, rating: 4.5 },
    { id: 5, name: "Wireless Mouse", price: 19.99, originalPrice: 49.99, discount: 60, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=400", sold: 567, rating: 4.4 },
    { id: 6, name: "Laptop Backpack", price: 29.99, originalPrice: 69.99, discount: 57, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400", sold: 234, rating: 4.6 },
    { id: 7, name: "Phone Stand", price: 9.99, originalPrice: 24.99, discount: 60, image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?q=80&w=400", sold: 789, rating: 4.3 },
    { id: 8, name: "USB-C Hub", price: 24.99, originalPrice: 59.99, discount: 58, image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=400", sold: 123, rating: 4.5 },
  ];

  const loadFavorites = () => {
    const saved = localStorage.getItem('favorites');
    if (saved) setFavorites(JSON.parse(saved));
  };

  const toggleFavorite = (product, e) => {
    e.stopPropagation();
    const isFavorite = favorites.some(fav => fav.id === product.id);
    
    if (isFavorite) {
      const newFavorites = favorites.filter(fav => fav.id !== product.id);
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    } else {
      const newFavorites = [product, ...favorites];
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    }
    
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const isFavorite = (productId) => favorites.some(fav => fav.id === productId);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading deals...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      {/* Flash Sale Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-8 mb-10 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <div className="flex items-center gap-2 mb-2">
              <FireOutlined className="text-3xl" />
              <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">FLASH SALE</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Limited Time Offers</h1>
            <p className="text-orange-100">Up to 60% off on selected items</p>
          </div>
          <div className="text-center">
            <p className="text-sm mb-2">Hurry up! Sale ends in:</p>
            <div className="flex gap-3">
              <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                <div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="text-xs">Hours</div>
              </div>
              <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                <div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="text-xs">Mins</div>
              </div>
              <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                <div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="text-xs">Secs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Today's Best Deals</h2>
          <button className="text-[#004d2c] text-sm font-semibold hover:underline">View All →</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((product) => (
            <div key={product.id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              {/* Image Container */}
              <div className="relative bg-[#f5f6f6] aspect-square flex items-center justify-center overflow-hidden">
                <button 
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all z-10"
                  onClick={(e) => toggleFavorite(product, e)}
                >
                  {isFavorite(product.id) ? (
                    <HeartFilled className="text-red-500" />
                  ) : (
                    <HeartOutlined className="hover:text-red-500" />
                  )}
                </button>
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  -{product.discount}%
                </div>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">{product.name}</h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-bold text-red-600">${product.price}</span>
                  <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                </div>
                
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <StarFilled key={i} className={`text-[10px] ${i < Math.floor(product.rating || 4) ? 'text-yellow-500' : 'text-gray-300'}`} />
                  ))}
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                  <span>🔥 {product.sold}+ sold</span>
                  <span>🚚 Free shipping</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (product.sold / 500) * 100)}%` }}></div>
                </div>
                
                <button className="w-full py-2 bg-red-500 text-white rounded-full text-sm font-semibold hover:bg-red-600 transition-all">
                  Shop Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coupon Section */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <TagOutlined className="text-2xl text-[#004d2c] mb-2 block" />
            <h3 className="text-xl font-bold text-gray-900">Get Extra 10% Off</h3>
            <p className="text-gray-500 text-sm">Use code: <span className="font-bold text-[#004d2c]">DEALS10</span> at checkout</p>
          </div>
          <button className="px-6 py-2 border-2 border-[#004d2c] text-[#004d2c] rounded-full font-semibold hover:bg-[#004d2c] hover:text-white transition">
            Copy Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default Deals;