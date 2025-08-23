'use client';

import { Product } from '@/lib/products';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check if product has a valid image
  const hasValidImage = product.image && product.image.trim() !== '' && !imageError;

  return (
    <div className="group relative backdrop-blur-xl bg-white/20 border border-white/30 p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 hover:bg-white/25 shadow-black/20 hover:shadow-black/30">
      <div className="relative overflow-hidden mb-4 shadow-lg shadow-black/20">
        {hasValidImage ? (
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-[#7C805A]/20 to-[#6A7150]/20 flex items-center justify-center">
            <div className="text-center text-[#7C805A] opacity-60">
              <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-light">No Image</p>
            </div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {product.featured && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#7C805A] to-[#6A7150] text-white shadow-lg">
              Featured
            </span>
          )}
          {product.bestseller && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#7C805A] to-[#6A7150] text-white shadow-lg">
              Bestseller
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-light text-[#7C805A] mb-1 group-hover:text-[#6A7150] transition-colors drop-shadow-sm">
            {product.name}
          </h3>
          <p className="text-[#7C805A] text-sm line-clamp-2 font-light drop-shadow-sm">
            {product.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-light bg-gradient-to-r from-[#7C805A] to-[#6A7150] bg-clip-text text-transparent drop-shadow-sm">
            ${product.price}
          </span>
          <span className="text-sm text-[#7C805A] bg-white/20 px-2 py-1 font-light shadow-md shadow-black/20">
            {product.category}
          </span>
        </div>
        
        <button
          onClick={() => onAddToCart(product)}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#7C805A] to-[#6A7150] hover:from-[#6A7150] hover:to-[#5A6140] text-white font-light transition-all duration-200 transform hover:shadow-xl shadow-lg shadow-black/30 hover:shadow-black/40"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}