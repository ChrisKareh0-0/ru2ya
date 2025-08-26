'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import Cart from '@/components/Cart';
import Footer from '@/components/Footer';
import { CartManager, CartItem } from '@/lib/cart';
import { Product } from '@/lib/products';

export default function HomePage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartManager] = useState(() => new CartManager());
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [animateLogo, setAnimateLogo] = useState(false);
  const [animateSections, setAnimateSections] = useState({
    gallery: false,
    featured: false,
    bestsellers: false
  });
  
  const router = useRouter();
  const galleryRef = useRef<HTMLElement>(null);
  const featuredRef = useRef<HTMLElement>(null);
  const bestsellersRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Add a small delay to make the animation more noticeable
    const timer = setTimeout(() => {
      setAnimateLogo(true);
    }, 300);
    
    setCartItems(cartManager.getItems());
    
    return () => clearTimeout(timer);
  }, [cartManager]);

  // Reset animation states on page load
  useEffect(() => {
    setAnimateSections({
      gallery: false,
      featured: false,
      bestsellers: false
    });
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    console.log('🔧 Setting up intersection observer...');
    
    // Add a small delay to ensure refs are properly set
    const timer = setTimeout(() => {
      const observerOptions = {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: '0px 0px -200px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        console.log('👁️ Intersection observer triggered with', entries.length, 'entries');
        entries.forEach((entry) => {
          console.log('📊 Entry:', entry.target.getAttribute('data-section'), 'isIntersecting:', entry.isIntersecting, 'ratio:', entry.intersectionRatio);
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section');
            console.log('🎬 Section visible:', sectionId, 'intersection ratio:', entry.intersectionRatio);
            if (sectionId) {
              // Trigger entrance animation when section comes into view
              setAnimateSections(prev => {
                console.log('🎭 Setting animation for:', sectionId, 'to true. Previous state:', prev);
                return {
                  ...prev,
                  [sectionId]: true
                };
              });
            }
          }
        });
      }, observerOptions);

      // Observe all sections
      if (galleryRef.current) {
        console.log('👁️ Observing gallery section:', galleryRef.current);
        observer.observe(galleryRef.current);
      } else {
        console.log('❌ Gallery ref is null!');
      }
      if (featuredRef.current) {
        console.log('👁️ Observing featured section');
        observer.observe(featuredRef.current);
      }
      if (bestsellersRef.current) {
        console.log('👁️ Observing bestsellers section');
        observer.observe(bestsellersRef.current);
      }

      return () => {
        console.log('🧹 Cleaning up intersection observer');
        observer.disconnect();
      };
    }, 100); // 100ms delay

    return () => clearTimeout(timer);
  }, []);

  // Scroll-based animation trigger (backup to intersection observer)
  useEffect(() => {
    const handleScroll = () => {
      if (galleryRef.current) {
        const rect = galleryRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible && !animateSections.gallery) {
          console.log('📜 Scroll detected gallery section, triggering animation');
          setAnimateSections(prev => ({
            ...prev,
            gallery: true
          }));
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [animateSections.gallery]);

  // Check if gallery is already visible on mount
  useEffect(() => {
    if (galleryRef.current) {
      const rect = galleryRef.current.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible && !animateSections.gallery) {
        console.log('🚀 Gallery section already visible on mount, triggering animation');
        setAnimateSections(prev => ({
          ...prev,
          gallery: true
        }));
      }
    }
  }, [animateSections.gallery]);

  // Debug animation state
  useEffect(() => {
    console.log('🎭 Current animation state:', animateSections);
  }, [animateSections]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching homepage data...');
        
        // Fetch featured products
        const featuredResponse = await fetch('/api/products?featured=true', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        const featuredData = await featuredResponse.json();
        console.log('⭐ Featured products fetched:', featuredData.length);
        setFeaturedProducts(featuredData);

        // Fetch bestsellers
        const bestsellerResponse = await fetch('/api/products?bestseller=true', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        const bestsellerData = await bestsellerResponse.json();
        console.log('🔥 Bestsellers fetched:', bestsellerData.length);
        setBestsellers(bestsellerData);

      } catch (error) {
        console.error('❌ Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#7C805A] mb-8"></div>
          <div className="space-y-4">
            <div className="loading-skeleton h-8 w-64 rounded"></div>
            <div className="loading-skeleton h-6 w-48 rounded"></div>
            <div className="loading-skeleton h-4 w-32 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        cartItems={cartItems} 
        onCartToggle={() => setIsCartOpen(!isCartOpen)} 
      />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className={`relative py-32 sm:py-40 md:py-56 px-4 min-h-[70vh] sm:min-h-[75vh] md:min-h-[60vh] overflow-visible transition-all duration-1000 ${
          animateLogo ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="container mx-auto text-center relative z-10">
            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-8xl font-light mb-8 sm:mb-12 font-elegant drop-shadow-2xl leading-[1.3] overflow-visible">
              <span style={{height: 'auto'}}
                className={`inline-block transition-all duration-1000 ease-out hero-title-animation ${
                  animateLogo 
                    ? 'translate-x-0 opacity-100' 
                    : '-translate-x-full opacity-0'
                }`}
              >
                ru
              </span>
              <span 
                className={`inline-block mx-0 md:mx-0 h-[2.0em] md:h-[1.5em] transition-all duration-1000 delay-700 ease-out hero-title-animation ${
                  animateLogo 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 scale-75'
                }`}
                style={{ 
                  fontSize: '1.0em',
                  lineHeight: '1',
                  verticalAlign: 'baseline',
                  display: 'inline-block',
                  margin: '0 -2px sm:0 -4px'
                }}
              >
                <span className="block transform -translate-y-[1.5rem] xs:-translate-y-[1.7rem] sm:-translate-y-[2.0rem] md:-translate-y-[0.2rem] text-5xl xs:text-6xl sm:text-7xl md:text-6xl leading-none">ء</span>
              </span>
              <span style={{height: 'auto'}}
                className={`inline-block transition-all duration-1000 delay-300 ease-out hero-title-animation ${
                  animateLogo 
                    ? 'translate-x-0 opacity-100' 
                    : 'translate-x-full opacity-0'
                }`}
              >
                ya
              </span>
            </h1>
            <p className={`text-lg xs:text-xl sm:text-2xl md:text-3xl text-[#7C805A] max-w-4xl mx-auto font-light drop-shadow-lg mb-10 sm:mb-16 px-2 transition-all duration-1000 delay-1000 ${
              animateLogo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              A Dream. A Vision. A Way Of Seeing The World.
            </p>
            <button
              onClick={() => router.push('/products')}
              className={`px-6 xs:px-8 sm:px-10 md:px-12 py-2.5 xs:py-3 md:py-4 bg-gradient-to-r from-[#7C805A] to-[#6A7150] hover:from-[#6A7150] hover:to-[#5A6140] text-white text-base xs:text-lg md:text-xl font-light rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-xl shadow-black/30 hover:shadow-black/40 focus-visible:outline-2 focus-visible:outline-[#7C805A] focus-visible:outline-offset-2 ${
                animateLogo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '1200ms' }}
            >
              Shop Now
            </button>
          </div>
        </section>

        {/* Gallery Collage Section - Simple Grid Layout */}
        <section 
          ref={galleryRef} 
          data-section="gallery" 
          className={`py-8 sm:py-12 md:py-20 px-4 relative mt-16 sm:mt-20 md:mt-40 transition-all duration-1000 overflow-hidden ${
            animateSections.gallery ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="container mx-auto">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-light text-[#7C805A] mb-3 sm:mb-4 md:mb-6 font-elegant drop-shadow-xl">
                Our Collection
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-[#7C805A] font-light max-w-3xl mx-auto drop-shadow-lg px-4">
                Experience the artistry and craftsmanship behind every piece
              </p>
            </div>
            
            {/* Main Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
              {/* Large Left Image */}
              <div 
                className={`sm:col-span-2 lg:col-span-8 h-[250px] xs:h-[280px] sm:h-[300px] md:h-[400px] lg:h-[500px] transition-all duration-1000 delay-200 animate-optimized ${
                  animateSections.gallery ? 'translate-x-0' : '-translate-x-full'
                }`}
                style={{
                  transform: animateSections.gallery ? 'translateX(0)' : 'translateX(-100%)'
                }}
              >
                <div className="relative h-full rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl md:shadow-2xl shadow-black/20 hover:shadow-xl sm:hover:shadow-2xl md:hover:shadow-3xl hover:shadow-black/30 transition-all duration-500 backdrop-blur-sm group hover-lift">
                  <img
                    src="/gallery/Ru2ya 1.JPG"
                    alt="Ru2ya Collection"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    width={800}
                    height={500}
                  />
                </div>
              </div>
              
              {/* Right Column - Two Stacked Images */}
              <div className="sm:col-span-2 lg:col-span-4 space-y-3 sm:space-y-4 md:space-y-6">
                {/* Top Right Image */}
                <div 
                  className={`h-[150px] xs:h-[160px] sm:h-[140px] md:h-[200px] lg:h-[240px] transition-all duration-1000 delay-400 animate-optimized ${
                    animateSections.gallery ? 'translate-x-0' : 'translate-x-full'
                  }`}
                  style={{
                    transform: animateSections.gallery ? 'translateX(0)' : 'translateX(100%)'
                  }}
                >
                  <div className="relative h-full rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl md:shadow-2xl shadow-black/20 hover:shadow-xl sm:hover:shadow-2xl md:hover:shadow-3xl hover:shadow-black/30 transition-all duration-500 backdrop-blur-sm group hover-lift">
                    <img
                      src="/gallery/kids gallery.png"
                      alt="Ru2ya Collection"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ objectPosition: 'center 60%' }}
                      loading="lazy"
                      width={400}
                      height={240}
                    />
                  </div>
                </div>
                
                {/* Bottom Right Image */}
                <div 
                  className={`h-[150px] xs:h-[160px] sm:h-[140px] md:h-[200px] lg:h-[240px] transition-all duration-1000 delay-600 animate-optimized ${
                    animateSections.gallery ? 'translate-x-0' : 'translate-x-full'
                  }`}
                  style={{
                    transform: animateSections.gallery ? 'translateX(0)' : 'translateX(100%)'
                  }}
                >
                  <div className="relative h-full rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl md:shadow-2xl shadow-black/20 hover:shadow-xl sm:hover:shadow-2xl md:hover:shadow-3xl hover:shadow-black/30 transition-all duration-500 backdrop-blur-sm group hover-lift">
                    <img
                      src="/gallery/Ru2ya 3.JPG"
                      alt="Ru2ya Collection"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      width={400}
                      height={240}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Row - Two Medium Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <div 
                className={`h-[200px] xs:h-[220px] sm:h-[250px] md:h-[300px] lg:h-[350px] transition-all duration-1000 delay-800 animate-optimized ${
                  animateSections.gallery ? 'translate-x-0' : '-translate-x-full'
                }`}
                style={{
                  transform: animateSections.gallery ? 'translateX(0)' : 'translateX(-100%)'
                }}
              >
                <div className="relative h-full rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl md:shadow-2xl shadow-black/20 hover:shadow-xl sm:hover:shadow-2xl md:hover:shadow-3xl hover:shadow-black/30 transition-all duration-500 backdrop-blur-sm group hover-lift">
                  <img
                    src="/gallery/Ru2ya 2.jpg"
                    alt="Ru2ya Collection"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ objectPosition: 'center 40%' }}
                    loading="lazy"
                    width={600}
                    height={350}
                  />
                </div>
              </div>
              
              <div 
                className={`h-[200px] xs:h-[220px] sm:h-[250px] md:h-[300px] lg:h-[350px] transition-all duration-1000 delay-1000 animate-optimized ${
                  animateSections.gallery ? 'translate-x-0' : 'translate-x-full'
                }`}
                style={{
                  transform: animateSections.gallery ? 'translateX(0)' : 'translateX(100%)'
                }}
              >
                <div className="relative h-full rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl md:shadow-2xl shadow-black/20 hover:shadow-xl sm:hover:shadow-2xl md:hover:shadow-3xl hover:shadow-black/30 transition-all duration-500 backdrop-blur-sm group hover-lift">
                  <img
                    src="/gallery/Ru2ya 5.JPG"
                    alt="Ru2ya Collection"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    width={600}
                    height={350}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bestsellers Section */}
        <section 
          ref={bestsellersRef} 
          data-section="bestsellers" 
          className={`py-8 sm:py-12 md:py-20 px-4 transition-all duration-1000 ${
            animateSections.bestsellers ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="container mx-auto">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-light text-[#7C805A] mb-3 sm:mb-4 md:mb-6 font-elegant drop-shadow-xl">
                Bestsellers
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-[#7C805A] font-light max-w-3xl mx-auto drop-shadow-lg px-4">
                Our most loved pieces by customers worldwide
              </p>
            </div>
            
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {bestsellers.map((product, index) => (
                <div
                  key={product.id}
                  className={`transition-all duration-700 animate-optimized hover-lift ${
                    animateSections.bestsellers 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-100 translate-y-0'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section 
          ref={featuredRef} 
          data-section="featured" 
          className={`py-8 sm:py-12 md:py-20 px-4 bg-gradient-to-br from-white to-[#F5E6D3]/30 transition-all duration-1000 ${
            animateSections.featured ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="container mx-auto">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-light text-[#7C805A] mb-3 sm:mb-4 md:mb-6 font-elegant drop-shadow-xl">
                Featured Products
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-[#7C805A] font-light max-w-3xl mx-auto drop-shadow-lg px-4">
                Handpicked selections that define our signature style
              </p>
            </div>
            
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {featuredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={`transition-all duration-700 animate-optimized hover-lift ${
                    animateSections.featured 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-100 translate-y-0'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        
      </main>

      <Footer />

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
