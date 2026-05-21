// front-user/src/componets/product.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  HeartOutlined, 
  HeartFilled,
  StarFilled, 
  DownOutlined,
  FilterOutlined,
  CloseOutlined
} from '@ant-design/icons';

const Products = ({ onAddToCart, onProductClick, onShowLoginModal, searchTerm = '', onSearchTermChange }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [similarItems, setSimilarItems] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  
  // Filter states
  const [selectedType, setSelectedType] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  
  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null);
  let hoverTimeout = null;
  
  // Refs for dropdowns
  const typeDropdownRef = useRef(null);
  const priceDropdownRef = useRef(null);
  const ratingDropdownRef = useRef(null);
  const colorDropdownRef = useRef(null);
  const materialDropdownRef = useRef(null);
  const filtersPanelRef = useRef(null);
  
  // Available filter options from API
  const [availableTypes, setAvailableTypes] = useState(['All', 'Clothes', 'shoes', 'Gaming', 'Audio', 'Accessories']);
  const [availableColors, setAvailableColors] = useState(['All', 'Black', 'White', 'Silver', 'Red', 'Blue', 'Green', 'Gold']);
  const [availableMaterials, setAvailableMaterials] = useState(['All', 'Plastic', 'Metal', 'Cotton', 'Leather', 'Silicone', 'Aluminum']);

  const priceRanges = [
    { label: 'All', min: 0, max: Infinity },
    { label: 'Under $50', min: 0, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $200', min: 100, max: 200 },
    { label: '$200 - $300', min: 200, max: 300 },
    { label: '$300+', min: 300, max: Infinity }
  ];
  const ratings = [0, 1, 2, 3, 4, 4.5];

  // API base URL
  const API_BASE_URL = 'http://localhost:8000/api';

  // Sync with global search term from navbar
  useEffect(() => {
    if (searchTerm !== undefined && searchTerm !== '') {
      setLocalSearchTerm(searchTerm);
    }
  }, [searchTerm]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    if (onSearchTermChange) {
      onSearchTermChange(value);
    }
  };

  // Handle add to cart - allows guests
  const handleAddToCartClick = (product, e) => {
    e.stopPropagation();
    console.log('🛒 Add to cart clicked:', product.name);
    onAddToCart(product);
  };

  // Add to recently viewed
  const addToRecentlyViewed = (product) => {
    const saved = localStorage.getItem('recentlyViewed');
    let recent = saved ? JSON.parse(saved) : [];
    const exists = recent.some(item => item.id === product.id);
    if (exists) {
      recent = [product, ...recent.filter(item => item.id !== product.id)];
    } else {
      recent = [product, ...recent];
    }
    const updatedRecent = recent.slice(0, 8);
    localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecent));
    setRecentlyViewed(updatedRecent);
  };

  // Handle product click with recently viewed
  const handleProductClickInternal = (product) => {
    addToRecentlyViewed(product);
    onProductClick(product);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleMouseEnter = (dropdownName) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setOpenDropdown(dropdownName);
  };

  const handleMouseLeave = () => {
    hoverTimeout = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
  };

  const handleClick = (dropdownName) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        if (openDropdown === 'type') setOpenDropdown(null);
      }
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(event.target)) {
        if (openDropdown === 'price') setOpenDropdown(null);
      }
      if (ratingDropdownRef.current && !ratingDropdownRef.current.contains(event.target)) {
        if (openDropdown === 'rating') setOpenDropdown(null);
      }
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target)) {
        if (openDropdown === 'color') setOpenDropdown(null);
      }
      if (materialDropdownRef.current && !materialDropdownRef.current.contains(event.target)) {
        if (openDropdown === 'material') setOpenDropdown(null);
      }
      if (filtersPanelRef.current && !filtersPanelRef.current.contains(event.target)) {
        const filterButton = document.getElementById('filterButton');
        if (filterButton && !filterButton.contains(event.target)) {
          setShowFilters(false);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const loadFavorites = () => {
    const saved = localStorage.getItem('favorites');
    if (saved) setFavorites(JSON.parse(saved));
  };

  const loadSimilarItems = () => {
    const saved = localStorage.getItem('similarItems');
    if (saved) setSimilarItems(JSON.parse(saved));
  };

  const loadRecentlyViewed = () => {
    const saved = localStorage.getItem('recentlyViewed');
    if (saved) setRecentlyViewed(JSON.parse(saved));
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/products`;
      const params = new URLSearchParams();
      
      if (selectedType !== 'All') {
        params.append('category', selectedType);
      }
      if (selectedColor !== 'All') {
        params.append('color', selectedColor);
      }
      if (selectedMaterial !== 'All') {
        params.append('material', selectedMaterial);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
      setError(null);
      
      const categories = ['All', ...new Set(data.map(p => p.category).filter(Boolean))];
      const colors = ['All', ...new Set(data.map(p => p.color).filter(Boolean))];
      const materials = ['All', ...new Set(data.map(p => p.material).filter(Boolean))];
      
      setAvailableTypes(categories);
      setAvailableColors(colors);
      setAvailableMaterials(materials);
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setProducts(getLocalProducts());
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...products];

    // Apply search filter
    if (localSearchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(localSearchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'All') {
      result = result.filter(p => p.category === selectedType);
    }

    const range = priceRanges.find(r => r.label === priceRange);
    if (range && priceRange !== 'All') {
      result = result.filter(p => p.price >= range.min && p.price <= range.max);
    }

    if (minRating > 0) {
      result = result.filter(p => (p.rating || 0) >= minRating);
    }

    if (selectedColor !== 'All') {
      result = result.filter(p => p.color === selectedColor);
    }

    if (selectedMaterial !== 'All') {
      result = result.filter(p => p.material === selectedMaterial);
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  };

  const toggleFavorite = (product, e) => {
    e.stopPropagation();
    const isFavorite = favorites.some(fav => fav.id === product.id);
    
    if (isFavorite) {
      const newFavorites = favorites.filter(fav => fav.id !== product.id);
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      
      const newSimilarItems = similarItems.filter(item => item.id !== product.id);
      setSimilarItems(newSimilarItems);
      localStorage.setItem('similarItems', JSON.stringify(newSimilarItems));
    } else {
      const newFavorites = [product, ...favorites];
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      
      const exists = similarItems.some(item => item.id === product.id);
      if (!exists) {
        const newSimilarItems = [product, ...similarItems];
        const updatedSimilarItems = newSimilarItems.slice(0, 8);
        setSimilarItems(updatedSimilarItems);
        localStorage.setItem('similarItems', JSON.stringify(updatedSimilarItems));
      }
    }
    
    window.dispatchEvent(new Event('favoritesUpdated'));
    window.dispatchEvent(new Event('storage'));
  };

  const isFavorite = (productId) => favorites.some(fav => fav.id === productId);

  const clearAllFilters = () => {
    setSelectedType('All');
    setPriceRange('All');
    setMinRating(0);
    setSelectedColor('All');
    setSelectedMaterial('All');
    setSortBy('default');
    setLocalSearchTerm('');
    if (onSearchTermChange) {
      onSearchTermChange('');
    }
    fetchProducts();
  };

  const getRatingLabel = (rating) => {
    if (rating === 0) return 'All Ratings';
    if (rating === 4.5) return '4.5★ & above';
    return `${rating}★ & above`;
  };

  const getLocalProducts = () => [
    { id: 1, name: "Wireless Earbuds, IPX8", price: 89.00, description: "Organic Cotton, fairtrade certified", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=400", stock: 50, category: "Audio", rating: 4.5, color: "White", material: "Cotton" },
    { id: 2, name: "AirPods Max", price: 559.00, description: "A perfect balance of high-fidelity audio", image: "https://images.unsplash.com/photo-1613040819284-8356bb05c924?q=80&w=400", stock: 25, category: "Audio", rating: 4.8, color: "Silver", material: "Aluminum" },
    { id: 3, name: "Bose BT Earphones", price: 289.00, description: "Premium sound quality", image: "https://images.unsplash.com/photo-1546435770-a3e426ff472b?q=80&w=400", stock: 15, category: "Audio", rating: 4.3, color: "Black", material: "Plastic" },
    { id: 4, name: "VIVEFOX Headphones", price: 39.00, description: "Wired Stereo Headsets With Mic", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=400", stock: 100, category: "Audio", rating: 4.0, color: "Red", material: "Plastic" },
  ];

  const getTypeCount = (type) => {
    if (type === 'All') return products.length;
    return products.filter(p => p.category === type).length;
  };

  const getColorCount = (color) => {
    if (color === 'All') return products.length;
    return products.filter(p => p.color === color).length;
  };

  const getMaterialCount = (material) => {
    if (material === 'All') return products.length;
    return products.filter(p => p.material === material).length;
  };

  useEffect(() => {
    loadFavorites();
    loadSimilarItems();
    loadRecentlyViewed();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedType, selectedColor, selectedMaterial]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, selectedType, priceRange, minRating, selectedColor, selectedMaterial, sortBy, localSearchTerm]);

  if (loading) {
    return (
      <div id="products-section" className="px-4 md:px-8 py-6 bg-white font-sans">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div id="products-section" className="px-4 md:px-8 py-6 bg-white font-sans">
      
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products by name or description..."
          value={localSearchTerm}
          onChange={handleSearchChange}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-green-500"
        />
      </div>

      {/* Filter Bar Section */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {/* Type Dropdown */}
          <div 
            className="relative" 
            ref={typeDropdownRef}
            onMouseEnter={() => handleMouseEnter('type')}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              onClick={() => handleClick('type')}
              className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-200 transition-all"
            >
              Type: {selectedType !== 'All' ? selectedType : 'Type'} 
              <DownOutlined className="text-[9px] text-gray-500" />
            </button>
            {openDropdown === 'type' && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[150px] max-h-60 overflow-y-auto">
                {availableTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => { setSelectedType(type); setOpenDropdown(null); }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-100 flex justify-between items-center ${selectedType === type ? 'bg-green-50 text-green-700' : ''}`}
                  >
                    <span>{type}</span>
                    <span className="text-gray-400">({getTypeCount(type)})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Dropdown */}
          <div 
            className="relative" 
            ref={priceDropdownRef}
            onMouseEnter={() => handleMouseEnter('price')}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              onClick={() => handleClick('price')}
              className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-200 transition-all"
            >
              {priceRange !== 'All' ? priceRange : 'Price'} 
              <DownOutlined className="text-[9px] text-gray-500" />
            </button>
            {openDropdown === 'price' && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[140px]">
                {priceRanges.map(range => (
                  <button
                    key={range.label}
                    onClick={() => { setPriceRange(range.label); setOpenDropdown(null); }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-100 ${priceRange === range.label ? 'bg-green-50 text-green-700' : ''}`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rating Dropdown */}
          <div 
            className="relative" 
            ref={ratingDropdownRef}
            onMouseEnter={() => handleMouseEnter('rating')}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              onClick={() => handleClick('rating')}
              className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-200 transition-all"
            >
              {minRating > 0 ? getRatingLabel(minRating) : 'Review'} 
              <DownOutlined className="text-[9px] text-gray-500" />
            </button>
            {openDropdown === 'rating' && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[150px]">
                {ratings.map(rating => (
                  <button
                    key={rating}
                    onClick={() => { setMinRating(rating); setOpenDropdown(null); }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-100 flex items-center gap-1 ${minRating === rating ? 'bg-green-50 text-green-700' : ''}`}
                  >
                    {rating === 0 ? 'All Ratings' : `${rating}★ & above`}
                    {rating > 0 && <StarFilled className="text-[10px] text-yellow-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Color Dropdown */}
          <div 
            className="relative" 
            ref={colorDropdownRef}
            onMouseEnter={() => handleMouseEnter('color')}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              onClick={() => handleClick('color')}
              className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-200 transition-all"
            >
              {selectedColor !== 'All' ? selectedColor : 'Color'} 
              <DownOutlined className="text-[9px] text-gray-500" />
            </button>
            {openDropdown === 'color' && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[140px] max-h-60 overflow-y-auto">
                {availableColors.map(color => (
                  <button
                    key={color}
                    onClick={() => { setSelectedColor(color); setOpenDropdown(null); }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-100 flex justify-between items-center ${selectedColor === color ? 'bg-green-50 text-green-700' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      {color !== 'All' && (
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.toLowerCase() }}></div>
                      )}
                      <span>{color}</span>
                    </div>
                    <span className="text-gray-400">({getColorCount(color)})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Material Dropdown */}
          <div 
            className="relative" 
            ref={materialDropdownRef}
            onMouseEnter={() => handleMouseEnter('material')}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              onClick={() => handleClick('material')}
              className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-200 transition-all"
            >
              {selectedMaterial !== 'All' ? selectedMaterial : 'Material'} 
              <DownOutlined className="text-[9px] text-gray-500" />
            </button>
            {openDropdown === 'material' && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[140px] max-h-60 overflow-y-auto">
                {availableMaterials.map(material => (
                  <button
                    key={material}
                    onClick={() => { setSelectedMaterial(material); setOpenDropdown(null); }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-100 flex justify-between items-center ${selectedMaterial === material ? 'bg-green-50 text-green-700' : ''}`}
                  >
                    <span>{material}</span>
                    <span className="text-gray-400">({getMaterialCount(material)})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button 
            id="filterButton"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${showFilters ? 'bg-green-700 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <FilterOutlined className="text-[10px]" /> Filters
          </button>
        </div>
        
        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-full text-xs font-semibold cursor-pointer bg-white appearance-none pr-6"
          >
            <option value="default">Sort by: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="rating">Rating: High to Low</option>
          </select>
          <DownOutlined className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedType !== 'All' || priceRange !== 'All' || minRating > 0 || selectedColor !== 'All' || selectedMaterial !== 'All' || sortBy !== 'default' || localSearchTerm) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-gray-500">Active filters:</span>
          {localSearchTerm && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center gap-1">
              Search: {localSearchTerm}
              <button onClick={() => { setLocalSearchTerm(''); if (onSearchTermChange) onSearchTermChange(''); }}><CloseOutlined className="text-[8px]" /></button>
            </span>
          )}
          {selectedType !== 'All' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center gap-1">
              Type: {selectedType}
              <button onClick={() => { setSelectedType('All'); }}><CloseOutlined className="text-[8px]" /></button>
            </span>
          )}
          {priceRange !== 'All' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center gap-1">
              Price: {priceRange}
              <button onClick={() => setPriceRange('All')}><CloseOutlined className="text-[8px]" /></button>
            </span>
          )}
          {minRating > 0 && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center gap-1">
              Rating: {minRating}★+
              <button onClick={() => setMinRating(0)}><CloseOutlined className="text-[8px]" /></button>
            </span>
          )}
          {selectedColor !== 'All' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColor.toLowerCase() }}></div>
              Color: {selectedColor}
              <button onClick={() => { setSelectedColor('All'); }}><CloseOutlined className="text-[8px]" /></button>
            </span>
          )}
          {selectedMaterial !== 'All' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center gap-1">
              Material: {selectedMaterial}
              <button onClick={() => { setSelectedMaterial('All'); }}><CloseOutlined className="text-[8px]" /></button>
            </span>
          )}
          <button onClick={clearAllFilters} className="px-2 py-1 text-red-600 text-xs hover:underline">
            Clear all
          </button>
        </div>
      )}

      {/* Expanded Filters Panel */}
      {showFilters && (
        <div ref={filtersPanelRef} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h4 className="text-sm font-bold mb-2 flex items-center gap-1">🏷️ Type</h4>
              <div className="flex flex-wrap gap-2">
                {availableTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => { setSelectedType(type); }}
                    className={`px-3 py-1 rounded-full text-xs ${selectedType === type ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {type} ({getTypeCount(type)})
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-bold mb-2 flex items-center gap-1">💰 Price Range</h4>
              <div className="flex flex-wrap gap-2">
                {priceRanges.map(range => (
                  <button
                    key={range.label}
                    onClick={() => setPriceRange(range.label)}
                    className={`px-3 py-1 rounded-full text-xs ${priceRange === range.label ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-bold mb-2 flex items-center gap-1">⭐ Rating</h4>
              <div className="flex flex-wrap gap-2">
                {ratings.map(rating => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${minRating === rating ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {rating === 0 ? 'All' : `${rating}+`}
                    {rating > 0 && <StarFilled className="text-[8px]" />}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-bold mb-2 flex items-center gap-1">🎨 Color</h4>
              <div className="flex flex-wrap gap-2">
                {availableColors.slice(0, 8).map(color => (
                  <button
                    key={color}
                    onClick={() => { setSelectedColor(color); }}
                    className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${selectedColor === color ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {color !== 'All' && (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.toLowerCase() }}></div>
                    )}
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <h4 className="text-sm font-bold mb-2 flex items-center gap-1">🧵 Material</h4>
              <div className="flex flex-wrap gap-2">
                {availableMaterials.map(material => (
                  <button
                    key={material}
                    onClick={() => { setSelectedMaterial(material); }}
                    className={`px-3 py-1 rounded-full text-xs ${selectedMaterial === material ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {material} ({getMaterialCount(material)})
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-end justify-end">
              <button onClick={clearAllFilters} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Heading */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Our Products
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({filteredProducts.length} products)
          </span>
        </h2>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your criteria.</p>
          <button onClick={clearAllFilters} className="mt-2 text-green-600 underline">Clear all filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="group cursor-pointer flex flex-col h-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              onClick={() => handleProductClickInternal(product)}
            >
              {/* Image Container */}
              <div className="relative bg-[#f5f6f6] aspect-square flex items-center justify-center overflow-hidden">
                <button 
                  className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all z-10"
                  onClick={(e) => toggleFavorite(product, e)}
                >
                  {isFavorite(product.id) ? (
                    <HeartFilled className="text-sm text-red-500" />
                  ) : (
                    <HeartOutlined className="text-sm hover:text-red-500" />
                  )}
                </button>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>

              {/* Product Details */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900 text-sm truncate pr-2">
                    {product.name}
                  </h3>
                  <div className="font-bold text-[#004d2c] text-sm">
                    ${product.price.toFixed(2)}
                  </div>
                </div>
                
                <p className="text-gray-500 text-xs mb-2 line-clamp-2">
                  {product.description}
                </p>
                
                {/* Product Specifications */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {product.color && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-600">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: product.color.toLowerCase() }}></div>
                      {product.color}
                    </span>
                  )}
                  {product.material && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-600">
                      {product.material}
                    </span>
                  )}
                  {product.category && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-600">
                      {product.category}
                    </span>
                  )}
                </div>
                
                {/* Stock indicator */}
                {product.stock && product.stock < 10 && product.stock > 0 && (
                  <p className="text-[10px] text-orange-600 mb-2">
                    Only {product.stock} left!
                  </p>
                )}
                
                {/* Star Rating */}
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <StarFilled key={i} className={`text-[10px] ${i < Math.floor(product.rating || 4) ? 'text-yellow-500' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-[10px] text-gray-400 ml-1">
                    ({product.reviews_count || product.reviews || Math.floor(Math.random() * 200) + 50})
                  </span>
                </div>

                {/* ✅ Original Add to Cart Button Style - Kept as is */}
                <button 
                  onClick={(e) => handleAddToCartClick(product, e)}
                  disabled={product.stock === 0}
                  className={`mt-auto w-fit px-4 py-1.5 border-[1.5px] rounded-full text-xs font-bold transition-all active:scale-95 ${
                    product.stock === 0 
                      ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                      : 'border-gray-900 hover:bg-gray-900 hover:text-white'
                  }`}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Similar Items Section */}
      {similarItems.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Similar Items You Might Like ({similarItems.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarItems.slice(0, 4).map((item) => (
              <div 
                key={item.id} 
                className="group cursor-pointer flex flex-col h-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                onClick={() => handleProductClickInternal(item)}
              >
                <div className="relative bg-[#f5f6f6] aspect-square flex items-center justify-center overflow-hidden">
                  <button 
                    className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all z-10"
                    onClick={(e) => toggleFavorite(item, e)}
                  >
                    {isFavorite(item.id) ? (
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
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 text-sm truncate pr-2">{item.name}</h3>
                    <div className="font-bold text-[#004d2c] text-sm">${item.price?.toFixed(2)}</div>
                  </div>
                  <p className="text-gray-500 text-xs mb-2 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <StarFilled key={i} className={`text-[10px] ${i < Math.floor(item.rating || 4) ? 'text-yellow-500' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <button 
                    onClick={(e) => handleAddToCartClick(item, e)}
                    className="mt-auto w-fit px-4 py-1.5 border-[1.5px] border-gray-900 rounded-full text-xs font-bold hover:bg-gray-900 hover:text-white transition-all active:scale-95"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed Section */}
   
      {error && (
        <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded text-xs">
          Note: Using local data. Backend API is not available at {API_BASE_URL}
        </div>
      )}
    </div>
  );
};

export default Products;