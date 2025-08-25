'use client';

import { useState, useEffect } from 'react';
import { CartItem } from '@/lib/cart';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  cartItems: CartItem[];
  onCartToggle: () => void;
}

interface CountdownData {
  title: string;
  targetDate: string;
  targetTime: string;
  isVisible: boolean;
}

export default function Header({ cartItems, onCartToggle }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [countdownData, setCountdownData] = useState<CountdownData>({
    title: 'Limited Time Offer',
    targetDate: '2024-12-31',
    targetTime: '23:59',
    isVisible: true
  });
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const router = useRouter();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch countdown data from admin API
  useEffect(() => {
    const fetchCountdownData = async () => {
      try {
        const response = await fetch('/api/admin/countdown');
        if (response.ok) {
          const data = await response.json();
          setCountdownData(data);
        }
      } catch (error) {
        console.log('Countdown data not available, using defaults');
      }
    };

    fetchCountdownData();
  }, []);

  // Countdown timer logic
  useEffect(() => {
    if (!countdownData.isVisible) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const targetDateTime = new Date(`${countdownData.targetDate}T${countdownData.targetTime}`).getTime();
      const difference = targetDateTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownData]);

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
              <div className="relative">
                <button
                  onClick={() => setIsCategoriesOpen(v => !v)}
                  className="text-[#7C805A] hover:text-[#6A7150] transition-colors font-light hover:drop-shadow-md flex items-center gap-1"
                >
                  Categories
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isCategoriesOpen && (
                  <div className="absolute mt-2 w-40 bg-white rounded-lg shadow-xl border border-white/30 backdrop-blur-xl z-20">
                    <a href="/products?category=kids" className="block px-4 py-2 text-[#7C805A] hover:bg-white/40">Kids</a>
                    <a href="/products?category=women" className="block px-4 py-2 text-[#7C805A] hover:bg-white/40">Women</a>
                    <a href="/products?category=men" className="block px-4 py-2 text-[#7C805A] hover:bg-white/40">Men</a>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Countdown Timer - Center of Navbar */}
          {countdownData.isVisible && (
            <div className="flex flex-col items-center justify-center absolute left-1/2 transform -translate-x-1/2 md:left-1/2 md:-translate-x-1/2 left-[40%] -translate-x-[40%]">
              <div className="text-center">
                <h3 className="text-xs md:text-sm font-light text-[#7C805A] mb-1 md:mb-2 drop-shadow-sm">
                  {countdownData.title}
                </h3>
                <div className="flex items-center space-x-1 md:space-x-3">
                  <div className="text-center">
                    <div className="text-sm md:text-lg font-bold text-[#7C805A] drop-shadow-md">
                      {timeLeft.days.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-[#7C805A]/70 font-light">Days</div>
                  </div>
                  <div className="text-[#7C805A] font-bold text-sm md:text-base">:</div>
                  <div className="text-center">
                    <div className="text-sm md:text-lg font-bold text-[#7C805A] drop-shadow-md">
                      {timeLeft.hours.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-[#7C805A]/70 font-light">Hours</div>
                  </div>
                  <div className="text-[#7C805A] font-bold text-sm md:text-base">:</div>
                  <div className="text-center">
                    <div className="text-sm md:text-lg font-bold text-[#7C805A] drop-shadow-md">
                      {timeLeft.minutes.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-[#7C805A]/70 font-light">Minutes</div>
                  </div>
                  <div className="text-[#7C805A] font-bold text-sm md:text-base">:</div>
                  <div className="text-center">
                    <div className="text-sm md:text-lg font-bold text-[#7C805A] drop-shadow-md">
                      {timeLeft.seconds.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-[#7C805A]/70 font-light">Seconds</div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              <div className="pt-2">
                <div className="px-3 py-2 text-xs uppercase tracking-wide text-[#7C805A]/70">Categories</div>
                <a href="/products?category=kids" className="block text-[#7C805A] hover:text-[#6A7150] transition-colors py-2 font-light px-3 rounded-lg hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>Kids</a>
                <a href="/products?category=women" className="block text-[#7C805A] hover:text-[#6A7150] transition-colors py-2 font-light px-3 rounded-lg hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>Women</a>
                <a href="/products?category=men" className="block text-[#7C805A] hover:text-[#6A7150] transition-colors py-2 font-light px-3 rounded-lg hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>Men</a>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}