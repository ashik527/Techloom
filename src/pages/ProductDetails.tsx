import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { 
  ShoppingCart, 
  Zap, 
  MessageCircle, 
  Star, 
  ShieldCheck, 
  Clock, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { formatPrice, cn } from '../utils/utils';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const unsubscribeProduct = onSnapshot(doc(db, 'products', id), (docSnap) => {
      if (docSnap.exists()) {
        const productData = { id: docSnap.id, ...docSnap.data() } as Product;
        setProduct(productData);
        
        // Fetch related products
        const qRelated = query(
          collection(db, 'products'), 
          where('categories', 'array-contains-any', productData.categories),
          limit(5)
        );
        onSnapshot(qRelated, (snapshot) => {
          setRelatedProducts(snapshot.docs
            .map(d => ({ id: d.id, ...d.data() } as Product))
            .filter(p => p.id !== id)
            .slice(0, 4)
          );
        });
      } else {
        navigate('/products');
      }
      setLoading(false);
    });

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    });

    return () => {
      unsubscribeProduct();
      unsubscribeSettings();
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) return null;

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/checkout');
  };

  const handleWhatsAppChat = () => {
    const whatsappNumber = settings?.whatsappNumber?.replace(/\D/g, '') || '8801838192595';
    const message = `Hello PlaxoMart! I'm interested in: ${product.title}\nPrice: ${formatPrice(product.salePrice)}\nLink: ${window.location.href}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const features = [
    'Instant Digital Delivery',
    'Lifetime Access & Updates',
    'Commercial Usage Rights',
    '24/7 Premium Support',
    'High-Quality Assets',
    'Secure Payment Guarantee'
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Product Image */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-square rounded-[3rem] overflow-hidden bg-white shadow-xl shadow-gray-200/50 border border-gray-100"
          >
            <img 
              src={product.image} 
              alt={product.title} 
              className="w-full h-full object-cover"
            />
            {product.regularPrice > product.salePrice && (
              <div className="absolute top-8 left-8 bg-red-500 text-white px-6 py-2 rounded-full font-black text-sm shadow-lg shadow-red-500/20">
                SAVE {Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)}%
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="flex flex-wrap gap-2 mb-6">
              {product.categories.map(cat => (
                <span key={cat} className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                  {cat}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
              {product.title}
            </h1>

            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-gray-900 font-black">{product.rating}</span>
              </div>
              <div className="h-4 w-px bg-gray-200"></div>
              <span className="text-gray-500 font-bold">{product.reviewCount} Reviews</span>
              <div className="h-4 w-px bg-gray-200"></div>
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> In Stock
              </span>
            </div>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-5xl font-black text-indigo-600">{formatPrice(product.salePrice)}</span>
              {product.regularPrice > product.salePrice && (
                <span className="text-2xl text-gray-400 line-through font-bold">{formatPrice(product.regularPrice)}</span>
              )}
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-10 font-medium">
              {product.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-700 font-bold text-sm">
                  <div className="bg-emerald-50 text-emerald-600 p-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  {feature}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button 
                onClick={handleBuyNow}
                className="flex-1 bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-95"
              >
                <Zap className="w-6 h-6" /> Buy Now
              </button>
              <button 
                onClick={() => addToCart(product)}
                className="flex-1 bg-white text-gray-900 border-2 border-gray-100 py-5 rounded-[2rem] font-black text-lg hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <ShoppingCart className="w-6 h-6" /> Add to Cart
              </button>
            </div>

            <button 
              onClick={handleWhatsAppChat}
              className="w-full mt-4 bg-emerald-500 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95"
            >
              <MessageCircle className="w-6 h-6" /> Chat on WhatsApp
            </button>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="pt-20 border-t border-gray-100">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-black text-gray-900">Related Products</h2>
              <button 
                onClick={() => navigate('/products')}
                className="text-indigo-600 font-bold hover:underline"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
