import React, { useRef, useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';

interface FeaturedProductsSliderProps {
  products: Product[];
}

const FeaturedProductsSlider: React.FC<FeaturedProductsSliderProps> = ({ products }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused || isUserInteracting) return;

    let animationFrameId: number;
    const scrollSpeed = 0.5; // Pixels per frame (lower = slower)

    const scroll = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += scrollSpeed;
        
        // Loop back to start if we reach the end
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, isUserInteracting, products.length]);

  const handleInteractionStart = () => {
    setIsUserInteracting(true);
    setIsPaused(true);
  };

  const handleInteractionEnd = () => {
    // We add a small delay before resuming auto-scroll after user interaction
    setTimeout(() => {
      setIsUserInteracting(false);
      setIsPaused(false);
    }, 3000);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-black text-gray-900 dark:text-slate-100">Featured Products</h2>
      </div>
      <div 
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => !isUserInteracting && setIsPaused(false)}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 cursor-grab active:cursor-grabbing select-none"
        style={{ scrollBehavior: isUserInteracting ? 'smooth' : 'auto' }}
      >
        {products.map((product) => (
          <div key={product.id} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProductsSlider;
