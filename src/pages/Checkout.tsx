import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { formatPrice, generateOrderId } from '../utils/utils';
import { Copy, Check, MessageCircle, ArrowLeft, Wallet, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { AppSettings } from '../types';

const Checkout: React.FC = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    transactionId: '',
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as AppSettings);
      }
    });
    return unsubscribe;
  }, []);

  const adminNumber = settings?.paymentNumber || '01945220851';

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <button
          onClick={() => navigate('/products')}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold"
        >
          Go to Shop
        </button>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(adminNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = generateOrderId();
    const productNames = cart.map(item => `${item.title} (x${item.quantity})`).join(', ');
    const whatsapp = settings?.whatsappNumber?.replace(/\D/g, '') || '8801838192595';
    
    const message = `*New Order from Tech Loom*
--------------------------
*Order ID:* ${orderId}
*Product:* ${productNames}
*Total Price:* ${formatPrice(totalPrice)}
*Customer Name:* ${formData.name}
*Customer Number:* ${formData.number}
*Payment Method:* ${paymentMethod}
*Transaction ID:* ${formData.transactionId}
--------------------------
Please confirm my order. Thank you!`;

    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
    clearCart();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 transition-colors">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold mb-8 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Summary & Payment */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Order Summary</h2>
            <div className="space-y-4 mb-8">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-slate-200 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">Quantity: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-slate-200 shrink-0">
                    {formatPrice(item.salePrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 dark:shadow-black/20">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              Payment Instructions
            </h3>
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                <p className="text-white/70 text-sm font-medium mb-2">Send Money to this number:</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black">{adminNumber}</span>
                  <button
                    onClick={handleCopy}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <p className="text-sm font-medium">Select your preferred payment method below.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <p className="text-sm font-medium">Send <span className="font-black">{formatPrice(totalPrice)}</span> to the number above.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <p className="text-sm font-medium">Copy the Transaction ID and fill the form.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-200 dark:border-slate-800 shadow-sm h-fit transition-colors">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8">Complete Your Order</h2>
          
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setPaymentMethod('bKash')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold border-2 transition-all ${
                paymentMethod === 'bKash'
                  ? 'bg-pink-50 dark:bg-pink-950/20 border-pink-500 text-pink-600 dark:text-pink-400'
                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              bKash
            </button>
            <button
              onClick={() => setPaymentMethod('Nagad')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold border-2 transition-all ${
                paymentMethod === 'Nagad'
                  ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              Nagad
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 ml-1">Your Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-200 dark:focus:border-indigo-800 transition-all font-medium placeholder:text-gray-300 dark:placeholder:text-slate-600"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 ml-1">Your Phone Number</label>
              <input
                required
                type="tel"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-200 dark:focus:border-indigo-800 transition-all font-medium placeholder:text-gray-300 dark:placeholder:text-slate-600"
                placeholder="Enter your number"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 ml-1">Transaction ID</label>
              <input
                required
                type="text"
                value={formData.transactionId}
                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-200 dark:focus:border-indigo-800 transition-all font-medium placeholder:text-gray-300 dark:placeholder:text-slate-600"
                placeholder="Enter TxID"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 dark:shadow-black/30 active:scale-[0.98] mt-8"
            >
              <MessageCircle className="w-6 h-6" />
              Confirm via WhatsApp
            </button>
            <p className="text-center text-xs text-gray-400 dark:text-slate-500 font-medium">
              By clicking confirm, you will be redirected to WhatsApp to complete your order.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
