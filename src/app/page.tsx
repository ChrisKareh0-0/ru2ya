'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/products';
import { CartManager, CartItem } from '@/lib/cart';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import Cart from '@/components/Cart';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [cartManager] = useState(() => new CartManager());
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [allProductsRes, featuredRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/products?featured=true')
      ]);
      
      const allProducts = await allProductsRes.json();
      const featured = await featuredRes.json();
      
      setProducts(allProducts);
      setFeaturedProducts(featured);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    cartManager.addItem(product);
    setCartItems(cartManager.getItems());
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    cartManager.updateQuantity(productId, quantity);
    setCartItems(cartManager.getItems());
  };

  const handleRemoveItem = (productId: string) => {
    cartManager.removeItem(productId);
    setCartItems(cartManager.getItems());
  };

  const handleClearCart = () => {
    cartManager.clear();
    setCartItems([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] opacity-5"></div>
      
      <Header 
        cartItems={cartItems} 
        onCartToggle={() => setIsCartOpen(!isCartOpen)} 
      />
      
      <main className="relative">
        <section id="home" className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-6xl md:text-8xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                  ru2ya
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Discover premium products with style. Experience luxury shopping like never before.
              </p>
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-medium rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                Shop Now
              </button>
            </div>
          </div>
        </section>

        <section id="products" className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Featured Products
              </h2>
              <p className="text-gray-300 text-lg">
                Handpicked selections just for you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                All Products
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="py-20 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
                About ru2ya
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                ru2ya is more than just an ecommerce platform. We curate premium products 
                that enhance your lifestyle. Our commitment to quality and style ensures 
                that every purchase is an experience worth remembering.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Quality First</h3>
                  <p className="text-gray-300">Every product is carefully selected and tested for premium quality.</p>
                </div>
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Fast Delivery</h3>
                  <p className="text-gray-300">Lightning-fast shipping to get your products to you quickly.</p>
                </div>
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">24/7 Support</h3>
                  <p className="text-gray-300">Round-the-clock customer service for all your needs.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-20 px-4">
          <div className="container mx-auto">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
                Get in Touch
              </h2>
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8">
                <p className="text-gray-300 text-lg mb-8">
                  Have questions? We'd love to hear from you.
                </p>
                <div className="space-y-4">
                  <a href="mailto:hello@ru2ya.com" className="block text-purple-400 hover:text-purple-300 transition-colors">
                    hello@ru2ya.com
                  </a>
                  <p className="text-gray-400">
                    123 Commerce Street, Tech City, TC 12345
                  </p>
                  <p className="text-gray-400">
                    +1 (555) 123-4567
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative py-12 px-4 border-t border-white/10">
        <div className="container mx-auto text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            ru2ya
          </div>
          <p className="text-gray-400 mb-6">
            Premium products, exceptional experience.
          </p>
          <div className="flex justify-center space-x-6 text-gray-400">
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Support</a>
          </div>
          <p className="text-gray-500 text-sm mt-6">
            © 2024 ru2ya. All rights reserved.
          </p>
        </div>
      </footer>

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