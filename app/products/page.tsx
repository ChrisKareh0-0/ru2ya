'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product } from '@/lib/products';
import { CartManager, CartItem } from '@/lib/cart';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import dynamicImport from 'next/dynamic';
const Cart = dynamicImport(() => import('@/components/Cart'), { ssr: false });

export const dynamic = 'force-dynamic' as const;

function ProductsContent({
  cartManager,
  cartItems,
  setCartItems,
  isCartOpen,
  setIsCartOpen
}: {
  cartManager: CartManager;
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  isCartOpen: boolean;
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showBestsellersOnly, setShowBestsellersOnly] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  // Initialize category from URL param and listen for changes
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const normalized = categoryFromUrl ? categoryFromUrl.toLowerCase() : 'all';
    setSelectedCategory(normalized);
  }, [searchParams]);

  // Handle category change from filter dropdown
  const handleCategoryFilterChange = useCallback((newCategory: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newCategory === 'all') {
      params.delete('category');
    } else {
      params.set('category', newCategory);
    }
    
    const query = params.toString();
    router.push(`/products${query ? `?${query}` : ''}`);
  }, [searchParams, router]);

  const fetchProducts = useCallback(async () => {
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
  }, []);

  const filterAndSortProducts = useCallback(() => {
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
  }, [products, searchTerm, selectedCategory, priceRange, sortBy, showFeaturedOnly, showBestsellersOnly]);

  useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

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

  // Memory-optimized sorting
  const sortedProducts = useMemo(() => {
    if (!filteredProducts.length) return [];
    
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [filteredProducts, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#7C805A]"></div>
      </div>
    );
  }

  return (
      <main className="relative pt-16 xs:pt-18 sm:pt-20">
        {/* Hero Section */}
        <section className="py-12 xs:py-14 sm:py-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl font-light mb-4 sm:mb-6 font-elegant drop-shadow-2xl drop-shadow-[#7C805A]/20">
              <span className="text-[#7C805A]">All Products</span>
            </h1>
            <p className="text-base xs:text-lg sm:text-xl text-[#7C805A] max-w-3xl mx-auto font-light drop-shadow-lg mb-6 sm:mb-8 px-2">
              Explore our complete collection of premium products
            </p>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="px-4 mb-8 sm:mb-12">
          <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center mb-6 sm:mb-8">
              {/* Search Bar */}
              <div className="relative w-full max-w-sm sm:max-w-md">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 xs:px-4 py-2.5 xs:py-3 pl-10 xs:pl-12 text-sm xs:text-base rounded-lg bg-white/80 border border-white/40 text-[#7C805A] placeholder-[#7C805A]/60 font-light focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent shadow-md sm:shadow-lg"
                />
                <svg className="absolute left-3 xs:left-4 top-1/2 transform -translate-y-1/2 w-4 xs:w-5 h-4 xs:h-5 text-[#7C805A]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter Button */}
              <div className="relative">
                <button
                  onClick={toggleFilters}
                  className="px-4 xs:px-6 py-2.5 xs:py-3 text-sm xs:text-base bg-[#7C805A] text-white rounded-lg hover:bg-[#6A7150] transition-all duration-200 shadow-md sm:shadow-lg flex items-center gap-1.5 xs:gap-2"
                >
                  <svg className="w-4 xs:w-5 h-4 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>

                {/* Filter Popup */}
                {showFilters && (
                  <div className="filter-container absolute top-full left-0 sm:right-0 mt-2 w-72 xs:w-80 sm:w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 xs:p-4 z-10">
                    <div className="space-y-3 xs:space-y-4">
                      {/* Category Filter */}
                      <div>
                        <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">Category</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => handleCategoryFilterChange(e.target.value)}
                          className="w-full px-2.5 xs:px-3 py-1.5 xs:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent"
                        >
                          <option value="all">All Categories</option>
                          <option value="women">Women</option>
                          <option value="men">Men</option>
                          <option value="kids">Kids</option>
                        </select>
                      </div>

                      {/* Price Range Filter */}
                      <div>
                        <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">Price Range</label>
                        <select
                          value={priceRange}
                          onChange={(e) => setPriceRange(e.target.value)}
                          className="w-full px-2.5 xs:px-3 py-1.5 xs:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent"
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
                        <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">Sort By</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full px-2.5 xs:px-3 py-1.5 xs:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent"
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="price-low">Price: Low to High</option>
                          <option value="price-high">Price: High to Low</option>
                          <option value="name">Name A-Z</option>
                        </select>
                      </div>

                      {/* Special Filters */}
                      <div className="space-y-1.5 xs:space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={showFeaturedOnly}
                            onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                            className="mr-2 h-3.5 xs:h-4 w-3.5 xs:w-4 text-[#7C805A] focus:ring-[#7C805A] border-gray-300 rounded"
                          />
                          <span className="text-xs xs:text-sm text-gray-700">Featured Only</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={showBestsellersOnly}
                            onChange={(e) => setShowBestsellersOnly(e.target.checked)}
                            className="mr-2 h-3.5 xs:h-4 w-3.5 xs:w-4 text-[#7C805A] focus:ring-[#7C805A] border-gray-300 rounded"
                          />
                          <span className="text-xs xs:text-sm text-gray-700">Bestsellers Only</span>
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
        <section className="px-4 pb-16 sm:pb-20">
          <div className="container mx-auto">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 xs:py-20">
                <div className="text-4xl xs:text-5xl sm:text-6xl mb-3 xs:mb-4">🔍</div>
                <h3 className="text-xl xs:text-2xl font-light text-[#7C805A] mb-2 drop-shadow-lg">No products found</h3>
                <p className="text-sm xs:text-base text-[#7C805A] font-light drop-shadow-md px-4">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 xs:gap-6 sm:gap-8">
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
  );
}

export default function ProductsPage() {
  const [cartManager] = useState(() => new CartManager());
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header 
        cartItems={cartItems} 
        onCartToggle={() => setIsCartOpen(!isCartOpen)} 
      />
      <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-[#7C805A]">Loading...</div>}>
        <ProductsContent
          cartManager={cartManager}
          cartItems={cartItems}
          setCartItems={setCartItems}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
        />
      </Suspense>
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(productId: number, quantity: number) => {
          cartManager.updateQuantity(productId, quantity);
          setCartItems(cartManager.getItems());
        }}
        onRemoveItem={(productId: number) => {
          cartManager.removeItem(productId);
          setCartItems(cartManager.getItems());
        }}
        onClearCart={() => {
          cartManager.clear();
          setCartItems([]);
        }}
      />
    </div>
  );
}
