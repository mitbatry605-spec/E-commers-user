import React, { useState, useEffect } from 'react';
import { StarFilled, MinusOutlined, PlusOutlined, LeftOutlined, HeartOutlined, HeartFilled,CarOutlined,HomeOutlined  } from '@ant-design/icons';

// Small Product Card Component for Similar Items
const SimilarProductCard = ({ item, onProductClick, onToggleFavorite, isFavorite }) => (
  <div 
    onClick={() => onProductClick(item)} 
    className="group cursor-pointer flex flex-col h-full transition-transform hover:scale-105 duration-300"
  >
    <div className="relative bg-[#f5f6f6] rounded-xl aspect-square flex items-center justify-center overflow-hidden mb-3">
      <button 
        className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all z-10"
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

    <div className="flex justify-between items-start mb-0.5">
      <h3 className="font-bold text-gray-900 text-sm truncate pr-2">
        {item.name}
      </h3>
      <div className="font-bold text-gray-900 text-sm">
        <sup className="text-[9px] mr-0.5">$</sup>
        {item.price.toFixed(2)}
      </div>
    </div>
    
    <p className="text-[11px] text-gray-500 mb-1.5 line-clamp-1">
      {item.description}
    </p>
    
    {item.category && (
      <span className="inline-block px-2 py-0.5 bg-gray-100 rounded-full text-[9px] text-gray-500 mb-1 w-fit">
        {item.category}
      </span>
    )}
    
    <div className="flex items-center gap-0.5 mb-3">
      {[...Array(5)].map((_, i) => (
        <StarFilled key={i} className="text-green-700 text-[9px]" />
      ))}
      <span className="text-[10px] text-gray-400 font-medium ml-1">
        (121)
      </span>
    </div>
  </div>
);

const ProductDetail = ({ product, onBack, onAddToCart, onProductClick }) => {
  const [quantity, setQuantity] = useState(1);
  const [productData, setProductData] = useState(product);
  const [loading, setLoading] = useState(false);
  const [stock, setStock] = useState(product?.stock || 12);
  const [similarItems, setSimilarItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [availableSizes, setAvailableSizes] = useState([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [availableColors, setAvailableColors] = useState([]);

  // Color mapping for display
  const colorMap = {
    'Black': '#1a1a1a',
    'White': '#ffffff',
    'Red': '#f44336',
    'Blue': '#2196F3',
    'Green': '#4CAF50',
    'Gold': '#FFD700',
    'Silver': '#C0C0C0',
    'Gray': '#808080',
    'Brown': '#8B4513',
    'Pink': '#ff69b4',
    'Purple': '#9c27b0',
    'Yellow': '#ffeb3b',
    'Orange': '#ff9800',
    'Navy': '#000080',
    'Beige': '#f5f5dc'
  };

  // Predefined color list for fallback
  const defaultColors = ['#e07a5f', '#3d405b', '#81b29a', '#f2cc8f', '#222'];

  // API base URL
  const API_BASE_URL = 'http://localhost:8000/api';

  // Load favorites and fetch products
  useEffect(() => {
    loadFavorites();
    fetchAllProducts();
  }, []);

  // Fetch all products from API or localStorage
  const fetchAllProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        setAllProducts(data);
      } else {
        setAllProducts(getLocalProducts());
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts(getLocalProducts());
    }
  };

  // Fetch latest product data from backend
  useEffect(() => {
    if (product?.id) {
      fetchProductDetails();
      addToRecentlyViewed(product);
    }
  }, [product?.id]);

  // Update available sizes and colors when productData changes
  useEffect(() => {
    if (productData?.size) {
      const sizes = productData.size.split(',').map(s => s.trim());
      setAvailableSizes(sizes);
      if (sizes.length > 0 && !selectedSize) {
        setSelectedSize(sizes[0]);
      }
    }
    
    // Parse colors from product data
    if (productData?.color) {
      const colors = productData.color.split(',').map(c => c.trim());
      setAvailableColors(colors);
      if (colors.length > 0 && !selectedColor) {
        setSelectedColor(colors[0]);
      }
    }
  }, [productData]);

  // Filter similar items when product data or all products change
  useEffect(() => {
    if (productData?.category && allProducts.length > 0) {
      filterSimilarItemsByCategory();
    }
  }, [productData, allProducts]);

  const filterSimilarItemsByCategory = () => {
    const sameCategoryProducts = allProducts.filter(
      item => item.category === productData.category && item.id !== productData.id
    );
    
    let similar = [];
    if (sameCategoryProducts.length > 0) {
      similar = sameCategoryProducts;
    } else {
      similar = allProducts.filter(item => item.id !== productData.id);
    }
    
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      const favs = JSON.parse(savedFavorites);
      const favsNotInSimilar = favs.filter(
        fav => !similar.some(s => s.id === fav.id) && fav.id !== productData.id
      );
      similar = [...favsNotInSimilar, ...similar];
    }
    
    const uniqueSimilar = [...new Map(similar.map(item => [item.id, item])).values()];
    setSimilarItems(uniqueSimilar.slice(0, 8));
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const getLocalProducts = () => [
    { id: 1, name: "Wireless Earbuds, IPX8", price: 89.00, description: "Organic Cotton", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=400", stock: 50, category: "Earbuds", rating: 4.5, size: "S,M,L,XL", color: "White,Black" },
    { id: 2, name: "AirPods Max", price: 559.00, description: "High-fidelity audio", image: "https://images.unsplash.com/photo-1613040819284-8356bb05c924?q=80&w=400", stock: 25, category: "Headphones", rating: 4.8, size: "One Size", color: "Silver,Black,Blue" },
    { id: 3, name: "Bose BT Earphones", price: 289.00, description: "Premium sound", image: "https://images.unsplash.com/photo-1546435770-a3e426ff472b?q=80&w=400", stock: 15, category: "Earbuds", rating: 4.3, size: "S,M,L", color: "Black" },
    { id: 4, name: "VIVEFOX Headphones", price: 39.00, description: "Wired Stereo Headsets", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=400", stock: 100, category: "Headphones", rating: 4.0, size: "One Size", color: "Red,Black,Blue" },
    { id: 101, name: "Gaming Headphone Pro", price: 239, description: "7.1 Surround Sound", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=400", category: "Gaming", rating: 4.7, size: "M,L,XL", color: "Black,Red" },
    { id: 102, name: "Nike Air Max Shoes", price: 79.99, description: "Running shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400", category: "shoes", rating: 4.7, size: "7,8,9,10,11", color: "Black,White,Red" },
    { id: 103, name: "HomePod mini", price: 59, description: "5 Colors Available", image: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?q=80&w=400", category: "Audio", rating: 4.4, size: "One Size", color: "White,Black,Orange,Blue,Yellow" },
    { id: 104, name: "Laptop sleeve MacBook", price: 59, description: "Organic Cotton", image: "https://images.unsplash.com/photo-1544333346-64e4fe18eda7?q=80&w=400", category: "Accessories", rating: 4.2, size: "13 inch,15 inch,16 inch", color: "Gray,Black,Pink" },
  ];

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products/${product.id}`);
      if (response.ok) {
        const data = await response.json();
        setProductData(data);
        setStock(data.stock);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToRecentlyViewed = (product) => {
    const saved = localStorage.getItem('recentlyViewed');
    let recentlyViewed = saved ? JSON.parse(saved) : [];
    const exists = recentlyViewed.some(item => item.id === product.id);
    
    let newRecentlyViewed;
    if (exists) {
      newRecentlyViewed = [product, ...recentlyViewed.filter(item => item.id !== product.id)];
    } else {
      newRecentlyViewed = [product, ...recentlyViewed];
    }
    
    const updatedRecentlyViewed = newRecentlyViewed.slice(0, 8);
    localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecentlyViewed));
    window.dispatchEvent(new Event('recentlyViewedUpdated'));
  };

  const toggleFavorite = (item) => {
    const isFavorite = favorites.some(fav => fav.id === item.id);
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter(fav => fav.id !== item.id);
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      
      const newSimilarItems = similarItems.filter(similar => similar.id !== item.id);
      setSimilarItems(newSimilarItems);
      localStorage.setItem('similarItems', JSON.stringify(newSimilarItems));
    } else {
      newFavorites = [item, ...favorites];
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      
      const exists = similarItems.some(similar => similar.id === item.id);
      if (!exists) {
        const newSimilarItems = [item, ...similarItems];
        const updatedSimilarItems = newSimilarItems.slice(0, 8);
        setSimilarItems(updatedSimilarItems);
        localStorage.setItem('similarItems', JSON.stringify(updatedSimilarItems));
      }
    }
    
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const isFavorite = (itemId) => {
    return favorites.some(fav => fav.id === itemId);
  };

  const handleSimilarProductClick = (similarProduct) => {
    addToRecentlyViewed(similarProduct);
    setProductData(similarProduct);
    setStock(similarProduct.stock || 12);
    setQuantity(1);
    // Reset selected size and color for new product
    if (similarProduct.size) {
      const sizes = similarProduct.size.split(',').map(s => s.trim());
      setAvailableSizes(sizes);
      setSelectedSize(sizes[0]);
    }
    if (similarProduct.color) {
      const colors = similarProduct.color.split(',').map(c => c.trim());
      setAvailableColors(colors);
      setSelectedColor(colors[0]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onProductClick) {
      onProductClick(similarProduct);
    }
  };

  const handleAddToCart = () => {
    onAddToCart({ ...productData, quantity, size: selectedSize, color: selectedColor });
  };

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto font-sans">
        <div className="flex justify-center items-center h-96">
          <div className="text-gray-500">Loading product details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto font-sans">
      
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-black mb-4 transition-colors text-sm">
        <LeftOutlined className="text-xl" /> Back
      </button>

      {/* Main Product Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
        
        {/* Left Side: Image Section */}
        <div className="flex flex-col gap-4">
          {/* Main Image */}
          <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-square shadow-sm">
            <img 
              src={productData?.image} 
              alt={productData?.name} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
            />
          </div>
          
          {/* Size Selection - Dynamic from product data */}
          {availableSizes.length > 0 && availableSizes[0] !== 'One Size' && (
            <div className="mt-2">
              <h4 className="text-sm font-bold mb-3">Select Size</h4>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-10 rounded-lg border-2 text-sm font-semibold transition-all ${
                      selectedSize === size
                        ? 'border-green-700 bg-green-700 text-white'
                        : 'border-gray-300 hover:border-green-500 text-gray-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                Size guide → 
                <span className="underline cursor-pointer ml-1">How to measure</span>
              </p>
            </div>
          )}
          
          {/* One Size indicator */}
          {availableSizes.length === 1 && availableSizes[0] === 'One Size' && (
            <div className="mt-2">
              <h4 className="text-sm font-bold mb-3">Size</h4>
              <div className="inline-block px-4 py-2 bg-gray-100 rounded-lg text-sm">
                One Size (Fits All)
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Product Info Section */}
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{productData?.name}</h1>
          <p className="text-gray-500 text-sm mb-3 leading-relaxed">
            {productData?.description}
          </p>
          
          {productData?.category && (
            <div className="mb-3">
              <span className="inline-block px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                Category: {productData.category}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-1 mb-4 text-green-700 text-xs">
            {[...Array(5)].map((_, i) => (
              <StarFilled key={i} />
            ))}
            <span className="text-gray-400 ml-2">({productData?.reviews_count || 121} reviews)</span>
          </div>

          <hr className="mb-4" />

          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">${productData?.price?.toFixed(2) || '0.00'}</span>
              <span className="text-gray-400 text-sm">or ${((productData?.price || 0) / 12).toFixed(2)}/month</span>
            </div>
            <p className="text-gray-400 text-[10px] mt-1 italic">12 months special financing</p>
          </div>

          <hr className="mb-4" />

          <div className="mb-4">
            <div className={`text-sm font-semibold ${stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stock > 0 ? `✓ In Stock (${stock} items available)` : '✗ Out of Stock'}
            </div>
          </div>

          {/* Color Selection - Dynamic from product data */}
          {availableColors.length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-bold mb-2">Choose a Color</h4>
              <div className="flex flex-wrap gap-3">
                {availableColors.map((color, index) => {
                  const colorHex = colorMap[color] || defaultColors[index % defaultColors.length];
                  const isSelected = selectedColor === color;
                  return (
                    <div 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className="flex flex-col items-center gap-1 cursor-pointer group"
                    >
                      <div 
                        className={`w-10 h-10 rounded-full cursor-pointer transition-all ${
                          isSelected 
                            ? 'ring-2 ring-offset-2 ring-green-700 scale-110' 
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: colorHex, border: color === 'White' ? '1px solid #ddd' : 'none' }}
                      />
                      <span className={`text-[10px] ${isSelected ? 'text-green-700 font-semibold' : 'text-gray-500'}`}>
                        {color}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-full">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                  disabled={stock === 0}
                  className="hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MinusOutlined className="text-xs"/>
                </button>
                <span className="font-bold text-sm w-4 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => Math.min(stock, q + 1))} 
                  disabled={quantity >= stock}
                  className="hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusOutlined className="text-xs"/>
                </button>
              </div>
              <div className="text-[11px]">
                {stock <= 5 && stock > 0 && (
                  <>
                    <p className="font-bold text-orange-600">Only {stock} items Left!</p>
                    <p className="text-gray-400">Don't miss it</p>
                  </>
                )}
                {stock === 0 && (
                  <p className="font-bold text-red-600">Out of Stock</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                disabled={stock === 0}
                className={`flex-1 text-white py-2.5 rounded-full text-sm font-bold transition-all shadow-md ${
                  stock > 0 
                    ? 'bg-[#004d2c] hover:bg-green-900' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Buy Now
              </button>
              <button 
                onClick={handleAddToCart}
                disabled={stock === 0}
                className={`flex-1 border-2 py-2.5 rounded-full text-sm font-bold transition-all ${
                  stock > 0 
                    ? 'border-[#004d2c] text-[#004d2c] hover:bg-green-50' 
                    : 'border-gray-300 text-gray-400 cursor-not-allowed'
                }`}
              >
                Add to Cart
              </button>
            </div>
          </div>

          {/* Delivery Info Boxes */}
          <div className="mt-6 border rounded-xl p-4 flex flex-col gap-3 text-xs">
            <div className="flex items-start gap-3">
              <span className="text-lg"><CarOutlined /></span>
              <div>
                <h4 className="font-bold">Free Delivery</h4>
                <p className="text-gray-500 underline cursor-pointer">Check Availability</p>
              </div>
            </div>
            <hr />
            <div className="flex items-start gap-3">
              <span className="text-lg"><HomeOutlined /></span>
              <div>
                <h4 className="font-bold">Return Delivery</h4>
                <p className="text-gray-500">Free 30 days returns. <span className="underline cursor-pointer">Details</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Items Section */}
      {similarItems.length > 0 && (
        <div className="border-t pt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Similar Items You Might Like ({similarItems.length})
              {productData?.category && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  from {productData.category}
                </span>
              )}
            </h2>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xs text-green-600 hover:underline"
            >
              Scroll to top ↑
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarItems.slice(0, 4).map(item => (
              <SimilarProductCard 
                key={item.id} 
                item={item} 
                onProductClick={handleSimilarProductClick}
                onToggleFavorite={toggleFavorite}
                isFavorite={isFavorite(item.id)}
              />
            ))}
          </div>
          
          {similarItems.length > 4 && (
            <div className="text-center mt-6">
              <button 
                onClick={() => console.log('Show more similar items')}
                className="px-6 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors"
              >
                View More ({similarItems.length - 4} more)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetail;