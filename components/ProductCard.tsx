'use client';

import { Product } from '@/lib/products';
import { memo, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = original;
    };
  }, [onClose, onPrev, onNext]);

  const currentSrc = images[index] || images[0];

  return (
    <div className="fixed inset-0 z-[9999] bg-white/90" onClick={onClose}>
      <button
        type="button"
        aria-label="Close"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 w-11 h-11 rounded-full bg-[#7C805A]/20 hover:bg-[#7C805A]/30 text-[#7C805A] flex items-center justify-center z-10 cursor-pointer"
      >
        ✕
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-[#7C805A]/20 hover:bg-[#7C805A]/30 text-[#7C805A] rounded-full w-12 h-12 flex items-center justify-center z-10 cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-[#7C805A]/20 hover:bg-[#7C805A]/30 text-[#7C805A] rounded-full w-12 h-12 flex items-center justify-center z-10 cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      <div className="absolute inset-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <Image src={currentSrc || '/images/placeholder.png'} alt="Full image" fill className="object-contain" priority />
      </div>
    </div>
  );
}

function DescriptionModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = original;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-light text-[#7C805A] mb-2">
                  {product.name}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-xl sm:text-2xl font-light bg-gradient-to-r from-[#7C805A] to-[#6A7150] bg-clip-text text-transparent">
                    ${product.price}
                  </span>
                  <span className="text-sm text-[#7C805A] bg-[#F5E6D3]/50 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="ml-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            
            <div className="prose prose-gray max-w-none">
              <p className="text-[#7C805A] leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCardComponent({ product, onAddToCart }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrls = useMemo(() => (product.image || '')
    .split(',')
    .map(url => url.trim())
    .filter(url => url.length > 0), [product.image]);
  const hasMultipleImages = imageUrls.length > 1;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Ensure single image shows immediately
  useEffect(() => {
    if (imageUrls.length === 1) {
      setImageLoaded(true);
    }
  }, [imageUrls.length]);

  const goPrev = () => {
    if (imageUrls.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  const goNext = () => {
    if (imageUrls.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
  };

  useEffect(() => { setMounted(true); }, []);

  // Check if product has a valid image
  const hasValidImage = product.image && product.image.trim() !== '' && !imageError;

  return (
    <>
    <div className="group relative backdrop-blur-xl bg-white/20 border border-white/30 p-3 xs:p-4 sm:p-6 shadow-lg sm:shadow-2xl hover:shadow-xl sm:hover:shadow-3xl transition-all duration-300 hover:scale-105 hover:bg-white/25 shadow-black/20 hover:shadow-black/30 rounded-lg sm:rounded-xl">
      <div className="relative overflow-hidden mb-3 sm:mb-4 shadow-md sm:shadow-lg shadow-black/20 rounded-lg">
        {hasValidImage ? (
          <>
            <div className={`relative w-full h-48 xs:h-56 sm:h-64 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <Image
                src={imageUrls[currentIndex] || imageUrls[0] || '/images/placeholder.png'}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                onLoadingComplete={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                priority={false}
              />
            </div>
            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#7C805A] rounded-full w-10 h-10 flex items-center justify-center shadow-lg z-10"
                  aria-label="Previous image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#7C805A] rounded-full w-10 h-10 flex items-center justify-center shadow-lg z-10"
                  aria-label="Next image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                  {imageUrls.map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-[#7C805A]' : 'bg-white/80'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-48 xs:h-56 sm:h-64 bg-gradient-to-br from-[#7C805A]/20 to-[#6A7150]/20 flex items-center justify-center rounded-lg">
            <div className="text-center text-[#7C805A] opacity-60">
              <svg className="w-12 xs:w-14 sm:w-16 h-12 xs:h-14 sm:h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <p className="text-xs sm:text-sm font-light">No Image</p>
            </div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1 sm:gap-2">
          {product.featured && (
            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#7C805A] to-[#6A7150] text-white shadow-sm sm:shadow-lg">
              Featured
            </span>
          )}
          {product.bestseller && (
            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#7C805A] to-[#6A7150] text-white shadow-sm sm:shadow-lg">
              Bestseller
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        <div>
          <h3 className="text-lg xs:text-xl font-light text-[#7C805A] mb-1 group-hover:text-[#6A7150] transition-colors drop-shadow-sm line-clamp-2">
            {product.name}
          </h3>
          <div className="text-[#7C805A] text-xs sm:text-sm font-light drop-shadow-sm">
            <p className="line-clamp-2 mb-1">
              {product.description}
            </p>
            {product.description && product.description.length > 80 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsDescriptionModalOpen(true); }}
                className="text-[#7C805A] hover:text-[#6A7150] underline text-xs font-medium transition-colors"
              >
                Read More
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xl xs:text-2xl font-light bg-gradient-to-r from-[#7C805A] to-[#6A7150] bg-clip-text text-transparent drop-shadow-sm">
            ${product.price}
          </span>
          <span className="text-xs sm:text-sm text-[#7C805A] bg-white/20 px-1.5 sm:px-2 py-0.5 sm:py-1 font-light shadow-sm sm:shadow-md shadow-black/20 rounded">
            {product.category}
          </span>
        </div>
        
        <button
          onClick={() => onAddToCart(product)}
          className="w-full py-2.5 xs:py-3 px-3 xs:px-4 bg-gradient-to-r from-[#7C805A] to-[#6A7150] hover:from-[#6A7150] hover:to-[#5A6140] text-white text-sm xs:text-base font-light transition-all duration-200 transform hover:shadow-lg sm:hover:shadow-xl shadow-md sm:shadow-lg shadow-black/30 hover:shadow-black/40 rounded-lg"
        >
          Add to Cart
        </button>
      </div>
    </div>

    {mounted && isLightboxOpen && hasValidImage && createPortal(
      <Lightbox
        images={imageUrls}
        index={currentIndex}
        onClose={() => setIsLightboxOpen(false)}
        onPrev={goPrev}
        onNext={goNext}
      />,
      document.body
    )}

    {mounted && isDescriptionModalOpen && createPortal(
      <DescriptionModal
        product={product}
        onClose={() => setIsDescriptionModalOpen(false)}
      />,
      document.body
    )}
    </>
  );
}

const ProductCard = memo(ProductCardComponent);
export default ProductCard;