// front-user/src/componets/WhatsNew.jsx
import React, { useState, useEffect } from 'react';
import { StarFilled, HeartOutlined, HeartFilled, FireOutlined, ClockCircleOutlined } from '@ant-design/icons';

const WhatsNew = () => {
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  const API_BASE_URL = 'http://localhost:8000/api';

  // Fetch new products (products created in last 30 days)
  const fetchNewProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        // Filter products that are new (you can add a 'is_new' field or filter by date)
        // For now, just show first 8 products as new arrivals
        const newItems = data.slice(0, 8).map(product => ({
          ...product,
          isNew: true
        }));
        setNewProducts(newItems);
      } else {
        setNewProducts(getDefaultNewProducts());
      }
    } catch (error) {
      console.error('Error fetching new products:', error);
      setNewProducts(getDefaultNewProducts());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultNewProducts = () => [
    { id: 1, name: "Summer Collection 2026", price: 89.00, description: "Limited edition summer wear", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=400", category: "Clothing", rating: 4.8, isNew: true },
    { id: 2, name: "Urban Streetwear", price: 129.00, description: "Modern street style", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400", category: "Fashion", rating: 4.9, isNew: true },
    { id: 3, name: "Wireless Headphones Pro", price: 199.00, description: "Noise cancellation", image: "https://images.unsplash.com/photo-1613040819284-8356bb05c924?q=80&w=400", category: "Audio", rating: 4.7, isNew: true },
    { id: 4, name: "Smart Watch Ultra", price: 299.00, description: "Fitness tracker", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400", category: "Electronics", rating: 4.6, isNew: true },
  ];

  useEffect(() => {
    fetchNewProducts();
    loadFavorites();
  }, []);

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
          <div className="text-gray-500">Loading new arrivals...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full mb-4">
          <FireOutlined className="text-lg" />
          <span className="text-sm font-semibold">HOT OFF THE PRESS</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">What's New</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Discover our latest arrivals and newest collections
        </p>
      </div>

      {/* New Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {newProducts.map((product) => (
          <div key={product.id} className="group cursor-pointer flex flex-col h-full bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
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
              {product.isNew && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  NEW
                </div>
              )}
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900 text-sm truncate pr-2">
                  {product.name}
                </h3>
                <div className="font-bold text-[#004d2c]">
                  ${product.price.toFixed(2)}
                </div>
              </div>
              
              <p className="text-gray-500 text-xs mb-2 line-clamp-2">
                {product.description}
              </p>
              
              {product.category && (
                <span className="inline-block px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-500 mb-2">
                  {product.category}
                </span>
              )}
              
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <StarFilled key={i} className={`text-[10px] ${i < Math.floor(product.rating || 4) ? 'text-yellow-500' : 'text-gray-300'}`} />
                ))}
                <span className="text-[10px] text-gray-400 ml-1">({product.rating})</span>
              </div>

              <button className="w-full py-2 border border-[#004d2c] text-[#004d2c] rounded-full text-xs font-semibold hover:bg-[#004d2c] hover:text-white transition-all">
                Shop Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Newsletter Section */}
   
    </div>
  );
};

export default WhatsNew;