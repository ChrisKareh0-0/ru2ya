'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/products';
import { CartManager, CartItem } from '@/lib/cart';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import Cart from '@/components/Cart';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cartManager] = useState(() => new CartManager());
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showBestsellersOnly, setShowBestsellersOnly] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, priceRange, sortBy, showFeaturedOnly, showBestsellersOnly]);

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showFilters && !target.closest('.filter-container')) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  const fetchProducts = async () => {
    try {
      console.log('🔍 Fetching products from /api/products...');
      const response = await fetch('/api/products', { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const allProducts = await response.json();
      console.log('✅ Products fetched:', allProducts.length, 'products');
      console.log('📦 Products:', allProducts);
      setProducts(allProducts);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    console.log('🔧 Filtering products...');
    console.log('🔍 Search term:', searchTerm);
    console.log('🏷️ Selected category:', selectedCategory);
    console.log('💰 Price range:', priceRange);
    console.log('⭐ Show featured only:', showFeaturedOnly);
    console.log('🔥 Show bestsellers only:', showBestsellersOnly);
    
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const productCategory = (product.category || '').toLowerCase().trim();
      const selected = (selectedCategory || '').toLowerCase().trim();
      const matchesCategory = selected === 'all' || productCategory === selected;
      let matchesPrice = true;
      if (priceRange) {
        switch (priceRange) {
          case '0-50':
            matchesPrice = product.price >= 0 && product.price <= 50;
            break;
          case '50-100':
            matchesPrice = product.price >= 50 && product.price <= 100;
            break;
          case '100-150':
            matchesPrice = product.price >= 100 && product.price <= 150;
            break;
          case '150+':
            matchesPrice = product.price >= 150;
            break;
          default:
            matchesPrice = true;
        }
      }
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    console.log('🔍 After basic filtering:', filtered.length, 'products');

    // Apply special filters
    if (showFeaturedOnly) {
      filtered = filtered.filter(product => product.featured);
      console.log('⭐ After featured filter:', filtered.length, 'products');
    }
    if (showBestsellersOnly) {
      filtered = filtered.filter(product => product.bestseller);
      console.log('🔥 After bestsellers filter:', filtered.length, 'products');
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });

    console.log('✅ Final filtered products:', filtered.length, 'products');
    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: Product) => {
    cartManager.addItem(product);
    setCartItems(cartManager.getItems());
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    cartManager.updateQuantity(productId, quantity);
    setCartItems(cartManager.getItems());
  };

  const handleRemoveItem = (productId: number) => {
    cartManager.removeItem(productId);
    setCartItems(cartManager.getItems());
  };

  const handleClearCart = () => {
    cartManager.clear();
    setCartItems([]);
  };

  const getUniqueCategories = () => {
    const categories = products.map(product => product.category);
    return ['all', ...Array.from(new Set(categories))];
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#7C805A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        cartItems={cartItems} 
        onCartToggle={() => setIsCartOpen(!isCartOpen)} 
      />
      
      <main className="relative pt-20">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-light mb-6 font-elegant drop-shadow-2xl drop-shadow-[#7C805A]/20">
              <span className="text-[#7C805A]">All Products</span>
            </h1>
            <p className="text-xl text-[#7C805A] max-w-3xl mx-auto font-light drop-shadow-lg mb-8">
              Explore our complete collection of premium products
            </p>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="px-4 mb-12">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8">
              {/* Search Bar */}
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 rounded-lg bg-white/80 border border-white/40 text-[#7C805A] placeholder-[#7C805A]/60 font-light focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent shadow-lg"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7C805A]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter Button */}
              <div className="relative">
                <button
                  onClick={toggleFilters}
                  className="px-6 py-3 bg-[#7C805A] text-white rounded-lg hover:bg-[#6A7150] transition-all duration-200 shadow-lg flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>

                {/* Filter Popup */}
                {showFilters && (
                  <div className="filter-container absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-10">
                    <div className="space-y-4">
                      {/* Category Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent"
                        >
                          <option value="all">All Categories</option>
                          <option value="women">Women</option>
                          <option value="men">Men</option>
                          <option value="kids">Kids</option>
                        </select>
                      </div>

                      {/* Price Range Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                        <select
                          value={priceRange}
                          onChange={(e) => setPriceRange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent"
                        >
                          <option value="">All Prices</option>
                          <option value="0-50">$0 - $50</option>
                          <option value="50-100">$50 - $100</option>
                          <option value="100-150">$100 - $150</option>
                          <option value="150+">$150+</option>
                        </select>
                      </div>

                      {/* Sort By */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent"
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="price-low">Price: Low to High</option>
                          <option value="price-high">Price: High to Low</option>
                          <option value="name">Name A-Z</option>
                        </select>
                      </div>

                      {/* Special Filters */}
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={showFeaturedOnly}
                            onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                            className="mr-2 h-4 w-4 text-[#7C805A] focus:ring-[#7C805A] border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Featured Only</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={showBestsellersOnly}
                            onChange={(e) => setShowBestsellersOnly(e.target.checked)}
                            className="mr-2 h-4 w-4 text-[#7C805A] focus:ring-[#7C805A] border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Bestsellers Only</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="px-4 pb-20">
          <div className="container mx-auto">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-light text-[#7C805A] mb-2 drop-shadow-lg">No products found</h3>
                <p className="text-[#7C805A] font-light drop-shadow-md">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </div>
  );
}
