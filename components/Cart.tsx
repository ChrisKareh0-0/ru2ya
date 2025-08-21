'use client';

import { useState, useEffect } from 'react';
import { CartItem } from '@/lib/cart';
import { useRouter } from 'next/navigation';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
}

export default function Cart({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemoveItem,
  onClearCart 
}: CartProps) {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = () => {
    console.log('Checkout button clicked!');
    console.log('Navigating to checkout page...');
    onClose();
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with fade-in animation */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out"
        onClick={onClose} 
      />
      
      {/* Cart panel with slide-in animation */}
      <div 
        className={`absolute right-0 top-0 h-full w-full max-w-md transform transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full backdrop-blur-xl bg-white/20 border-l border-white/30 shadow-3xl shadow-black/40">
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <h2 className="text-2xl font-light text-white drop-shadow-md">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-200 shadow-lg hover:shadow-xl shadow-black/20 hover:shadow-black/30"
            >
              <svg
                className="w-6 h-6 text-white drop-shadow-sm"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <svg
                  className="w-16 h-16 text-white mb-4 drop-shadow-md"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
                  />
                </svg>
                <p className="text-white text-lg font-light drop-shadow-sm">Your cart is empty</p>
                <p className="text-white text-sm mt-2 font-light drop-shadow-sm">Add some products to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.product.id}
                    className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-xl p-4 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-200"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      animation: `slideInRight 0.5s ease-out ${index * 100}ms both`
                    }}
                  >
                    <div className="flex gap-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg shadow-md shadow-black/20"
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-light mb-1 drop-shadow-sm">{item.product.name}</h3>
                        <p className="text-white text-sm mb-2 font-light drop-shadow-sm">${item.product.price}</p>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-white/20 border border-white/30 rounded-lg shadow-md shadow-black/20">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 text-white hover:bg-white/20 rounded-l-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="px-3 py-1 text-white min-w-[2rem] text-center font-light">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 text-white hover:bg-white/20 rounded-r-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                              </svg>
                            </button>
                          </div>
                          
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1 text-red-300 hover:text-red-200 transition-colors drop-shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-white font-semibold">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 border-t border-white/20">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold text-white">Total:</span>
                <span className="text-2xl font-bold text-white">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={handleCheckout}
                  className="w-full py-3 px-4 bg-[#7C805A] hover:bg-[#6A7150] text-white font-medium rounded-xl transition-all duration-200 transform hover:shadow-lg shadow-lg shadow-black/30"
                >
                  Checkout
                </button>
                
                <button
                  onClick={onClearCart}
                  className="w-full py-3 px-4 bg-red-600/20 text-white border border-red-500/30 rounded-xl hover:bg-red-600/30 transition-all duration-200"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}