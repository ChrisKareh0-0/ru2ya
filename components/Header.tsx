'use client';

import { useState } from 'react';
import { CartItem } from '@/lib/cart';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  cartItems: CartItem[];
  onCartToggle: () => void;
}

export default function Header({ cartItems, onCartToggle }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/20 border-b border-white/20 shadow-2xl shadow-black/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button
              onClick={handleLogoClick}
              className="text-[120px] font-light bg-gradient-to-r from-[#7C805A] to-[#6A7150] bg-clip-text text-transparent font-elegant drop-shadow-lg leading-none flex items-center cursor-pointer hover:scale-105 transition-transform duration-200"
              style={{height: '94px', marginTop: '-25px'}}
            >
              ء‎
            </button>
            
            <nav className="hidden md:flex space-x-6">
              <button
                onClick={() => router.push('/')}
                className="text-[#7C805A] hover:text-[#6A7150] transition-colors font-light hover:drop-shadow-md cursor-pointer"
              >
                Home
              </button>
              <a href="/products" className="text-[#7C805A] hover:text-[#6A7150] transition-colors font-light hover:drop-shadow-md">
                Products
              </a>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onCartToggle}
              className="relative p-3 rounded-xl bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-200 group shadow-lg hover:shadow-xl shadow-black/20 hover:shadow-black/30"
            >
              <svg
                className="w-6 h-6 text-[#7C805A] group-hover:text-[#6A7150] transition-colors drop-shadow-sm"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-[#7C805A] to-[#6A7150] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-medium animate-pulse shadow-lg shadow-black/30">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 rounded-xl bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-200 shadow-lg hover:shadow-xl shadow-black/20 hover:shadow-black/30"
            >
              <svg
                className="w-6 h-6 text-[#7C805A] drop-shadow-sm"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-white/20 bg-white/10 rounded-xl backdrop-blur-xl shadow-xl shadow-black/20">
            <div className="space-y-3 p-4">
              <button
                onClick={() => {
                  router.push('/');
                  setIsMenuOpen(false);
                }}
                className="block text-[#7C805A] hover:text-[#6A7150] transition-colors py-2 font-light hover:drop-shadow-md px-3 rounded-lg hover:bg-white/10 cursor-pointer w-full text-left"
              >
                Home
              </button>
              <a
                href="/products"
                className="block text-[#7C805A] hover:text-[#6A7150] transition-colors py-2 font-light hover:drop-shadow-md px-3 rounded-lg hover:bg-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}