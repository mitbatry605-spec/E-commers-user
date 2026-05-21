// front-user/src/componets/AppExtras.jsx
import React, { useState, useEffect } from 'react';
import { StarFilled, HeartOutlined, HeartFilled, DeleteOutlined } from '@ant-design/icons';

// --- Reusable Small Card Component (Same style as Products.jsx) ---
const ProductSmallCard = ({ item, onAddToCart, onProductClick, onToggleFavorite, isFavorite, showDeleteButton, onRemove }) => (
  <div 
    onClick={() => onProductClick(item)} 
    className="group cursor-pointer flex flex-col h-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 relative"
  >
    {/* ✅ Delete Button - Keep for Recently Viewed (showDeleteButton = true) */}
    {showDeleteButton && (
      <button 
        className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-500 hover:text-white transition-all z-20"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item);
        }}
      >
        <DeleteOutlined className="text-sm" />
      </button>
    )}
    
    {/* Image Container */}
    <div className="relative bg-[#f5f6f6] aspect-square flex items-center justify-center overflow-hidden">
      <button 
        className="absolute top-3 left-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all z-10"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(item);
        }}
      >
        {isFavorite ? (
          <HeartFilled className="text-sm text-red-500" />
        ) : (
          <HeartOutlined className="text-sm hover:text-red-500" />
        )}
      </button>
      <img 
        src={item.image} 
        alt={item.name} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
      />
    </div>

    {/* Product Details */}
    <div className="p-4">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-bold text-gray-900 text-sm truncate pr-2">
          {item.name}
        </h3>
        <div className="font-bold text-[#004d2c] text-sm">
          ${item.price.toFixed(2)}
        </div>
      </div>
      
      <p className="text-gray-500 text-xs mb-2 line-clamp-2">
        {item.description}
      </p>
      
      {/* Product Specifications */}
      <div className="flex flex-wrap gap-1 mb-2">
        {item.color && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-600">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color.toLowerCase() }}></div>
            {item.color}
          </span>
        )}
        {item.material && (
          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-600">
            {item.material}
          </span>
        )}
        {item.category && (
          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-600">
            {item.category}
          </span>
        )}
      </div>
      
      {/* Stock indicator */}
      {item.stock && item.stock < 10 && item.stock > 0 && (
        <p className="text-[10px] text-orange-600 mb-2">
          Only {item.stock} left!
        </p>
      )}
      
      {/* Star Rating */}
      <div className="flex items-center gap-0.5 mb-3">
        {[...Array(5)].map((_, i) => (
          <StarFilled key={i} className={`text-[10px] ${i < Math.floor(item.rating || 4) ? 'text-yellow-500' : 'text-gray-300'}`} />
        ))}
        <span className="text-[10px] text-gray-400 ml-1">
          ({item.reviews_count || item.reviews || 121})
        </span>
      </div>

      {/* Add to Cart Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart(item);
        }}
        className="mt-auto w-fit px-4 py-1.5 border-[1.5px] border-gray-900 rounded-full text-xs font-bold hover:bg-gray-900 hover:text-white transition-all active:scale-95"
      >
        Add to Cart
      </button>
    </div>
  </div>
);

// --- Main Export Component ---
const AppExtras = ({ onAddToCart, onProductClick }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Load data from localStorage when component mounts
  useEffect(() => {
    loadRecentlyViewed();
    loadFavorites();
  }, []);

  // Listen for storage events from other components
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'recentlyViewed') {
        loadRecentlyViewed();
      }
      if (e.key === 'favorites') {
        loadFavorites();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for real-time updates within the same tab
    window.addEventListener('favoritesUpdated', () => {
      loadFavorites();
    });

    // Listen for recently viewed updates
    window.addEventListener('recentlyViewedUpdated', () => {
      loadRecentlyViewed();
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favoritesUpdated', () => {});
      window.removeEventListener('recentlyViewedUpdated', () => {});
    };
  }, []);

  // Load recently viewed from localStorage
  const loadRecentlyViewed = () => {
    const saved = localStorage.getItem('recentlyViewed');
    if (saved) {
      setRecentlyViewed(JSON.parse(saved));
    } else {
      setRecentlyViewed([]);
    }
  };

  // Load favorites from localStorage
  const loadFavorites = () => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    } else {
      setFavorites([]);
    }
  };

  // Remove item from recently viewed
  const removeFromRecentlyViewed = (item) => {
    const newRecentlyViewed = recentlyViewed.filter(viewed => viewed.id !== item.id);
    setRecentlyViewed(newRecentlyViewed);
    localStorage.setItem('recentlyViewed', JSON.stringify(newRecentlyViewed));
    
    // Dispatch event for real-time update
    window.dispatchEvent(new Event('recentlyViewedUpdated'));
  };

  // Toggle favorite (heart button)
  const toggleFavorite = (item) => {
    const isFavorite = favorites.some(fav => fav.id === item.id);
    let newFavorites;
    
    if (isFavorite) {
      // Remove from favorites
      newFavorites = favorites.filter(fav => fav.id !== item.id);
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    } else {
      // Add to favorites
      newFavorites = [item, ...favorites];
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    }
    
    // Dispatch custom event for real-time update
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  // Add to recently viewed when product is clicked
  const handleProductClick = (product) => {
    // Check if already in recently viewed
    const exists = recentlyViewed.some(viewed => viewed.id === product.id);
    
    let newRecentlyViewed;
    if (exists) {
      // Move to front if exists
      newRecentlyViewed = [
        product,
        ...recentlyViewed.filter(viewed => viewed.id !== product.id)
      ];
    } else {
      // Add new item to front
      newRecentlyViewed = [product, ...recentlyViewed];
    }
    
    // Keep only first 8 items
    const updatedRecentlyViewed = newRecentlyViewed.slice(0, 8);
    setRecentlyViewed(updatedRecentlyViewed);
    localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecentlyViewed));
    
    // Dispatch event for real-time update
    window.dispatchEvent(new Event('recentlyViewedUpdated'));
    
    // Call parent handler
    onProductClick(product);
  };

  // Check if an item is favorite
  const isFavorite = (itemId) => {
    return favorites.some(fav => fav.id === itemId);
  };

  return (
    <div className="px-4 md:px-8 py-8 border-t mt-12 bg-white font-sans">
      
      {/* Recently Viewed Section - Same style as Products with Delete Button */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Recently Viewed ({recentlyViewed.length})
        </h2>
        {recentlyViewed.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No recently viewed items. Click on products to see them here!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewed.map(item => (
              <ProductSmallCard 
                key={item.id} 
                item={item} 
                onAddToCart={onAddToCart} 
                onProductClick={handleProductClick}
                onToggleFavorite={toggleFavorite}
                isFavorite={isFavorite(item.id)}
                showDeleteButton={true}  // ✅ Keep delete button for recently viewed
                onRemove={removeFromRecentlyViewed}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppExtras;