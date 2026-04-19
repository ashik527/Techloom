import React from 'react';
import { ShoppingCart, MessageCircle, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/utils';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const message = `Hello Tech Loom! I am interested in ${product.title} (Price: ${formatPrice(product.salePrice)}). Can you help me?`;
    window.open(`https://wa.me/8801783229765?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product);
    navigate('/checkout');
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-slate-800">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {product.categories.slice(0, 1).map(cat => (
              <span key={cat} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-3 py-1 rounded-full border border-white/50 dark:border-slate-700 shadow-sm">
                {cat}
              </span>
            ))}
          </div>
          {product.featured && (
            <div className="absolute top-3 right-3">
              <div className="bg-amber-400 p-1.5 rounded-full shadow-sm">
                <Star className="w-3 h-3 text-white fill-current" />
              </div>
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-2 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {product.title}
          </h3>
          <div className="flex items-center justify-between mb-5">
            <div className="flex flex-col">
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{formatPrice(product.salePrice)}</span>
              {product.regularPrice > product.salePrice && (
                <span className="text-[10px] text-gray-400 dark:text-slate-500 line-through font-bold">{formatPrice(product.regularPrice)}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-current" />
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400">{product.rating}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleBuyNow}
              className="col-span-2 bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Buy Now
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                addToCart(product);
              }}
              className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-700 dark:text-slate-200 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Add
            </button>
            <button
              onClick={handleWhatsApp}
              className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
