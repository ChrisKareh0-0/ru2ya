'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CartManager, CartItem } from '@/lib/cart';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Lebanon'
  });
  const router = useRouter();

  useEffect(() => {
    const cartManager = new CartManager();
    const items = cartManager.getItems();
    if (items.length === 0) {
      router.push('/');
      return;
    }
    setCartItems(items);
    setLoading(false);
  }, [router]);

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create order data
      const orderData = {
        customerInfo: formData,
        items: cartItems,
        totalAmount: totalPrice
      };

      // Send order to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        // Clear cart
        const cartManager = new CartManager();
        cartManager.clear();
        
        setOrderPlaced(true);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to place order'}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error: Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !orderPlaced) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#7C805A]"></div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-white">
        <Header cartItems={[]} onCartToggle={() => {}} />
        <main className="pt-20 pb-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="text-6xl mb-6">✅</div>
              <h1 className="text-4xl font-light text-[#7C805A] mb-6 font-elegant">
                Order Confirmed!
              </h1>
              <p className="text-xl text-[#7C805A] mb-8 font-light">
                Thank you for your order. We'll contact you soon to confirm delivery details.
              </p>
              <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl shadow-black/20">
                <h3 className="text-2xl font-light text-[#7C805A] mb-4 font-elegant">Order Summary</h3>
                <div className="text-left space-y-2 mb-4">
                  <p className="text-[#7C805A] font-light">
                    <span className="font-medium">Payment Method:</span> Cash on Delivery
                  </p>
                  <p className="text-[#7C805A] font-light">
                    <span className="font-medium">Total Amount:</span> ${totalPrice.toFixed(2)}
                  </p>
                </div>
                <p className="text-sm text-[#7C805A] opacity-80">
                  You will receive a confirmation email shortly.
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="mt-8 px-8 py-4 bg-[#7C805A] hover:bg-[#6A7150] text-[#F5E6D3] rounded-xl transition-all duration-200 font-light shadow-lg shadow-black/30"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header cartItems={cartItems} onCartToggle={() => {}} />
      
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-light text-center text-[#7C805A] mb-12 font-elegant">
            Checkout
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Order Summary */}
            <div className="lg:order-2">
              <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl shadow-black/20">
                <h3 className="text-2xl font-light text-[#7C805A] mb-6 font-elegant">Order Summary</h3>
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-4 p-3 bg-white/10 rounded-xl">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="text-[#7C805A] font-light">{item.product.name}</h4>
                        <p className="text-sm text-[#7C805A] opacity-80">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-[#7C805A] font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between text-xl font-light text-[#7C805A]">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="lg:order-1">
              <form onSubmit={handleSubmit} className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl shadow-black/20">
                <h3 className="text-2xl font-light text-[#7C805A] mb-6 font-elegant">Shipping Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[#7C805A] font-light mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/30 border border-white/40 rounded-xl text-[#7C805A] font-light focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-[#7C805A] font-light mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/30 border border-white/40 rounded-xl text-[#7C805A] font-light focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[#7C805A] font-light mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/30 border border-white/40 rounded-xl text-[#7C805A] font-light focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-[#7C805A] font-light mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/30 border border-white/40 rounded-xl text-[#7C805A] font-light focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-[#7C805A] font-light mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/30 border border-white/40 rounded-xl text-[#7C805A] font-light focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-[#7C805A] font-light mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/30 border border-white/40 rounded-xl text-[#7C805A] font-light focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-[#7C805A] font-light mb-2">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/30 border border-white/40 rounded-xl text-[#7C805A] font-light focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-[#7C805A] font-light mb-2">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/30 border border-white/40 rounded-xl text-[#7C805A] font-light focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6 p-4 bg-white/10 rounded-xl border border-white/20">
                  <h4 className="text-lg font-light text-[#7C805A] mb-2">Payment Method</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-[#7C805A] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-[#7C805A] font-light">Cash on Delivery</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#7C805A] hover:bg-[#6A7150] text-[#F5E6D3] rounded-xl transition-all duration-200 font-light shadow-lg shadow-black/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing Order...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
