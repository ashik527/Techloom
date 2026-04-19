import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Facebook, MessageCircle, Mail, MapPin, Store } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AppSettings } from '../types';

const Footer: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as AppSettings);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const isInsideAdmin = location.pathname.startsWith('/admin');
  if (isInsideAdmin && location.pathname !== '/admin') {
    return null;
  }

  return (
    <footer className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 pt-16 pb-8 px-4 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Brand */}
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Tech Loom</span>
          </Link>
          <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
            Your ultimate destination for premium digital products. Instant delivery, lifetime access, and 24/7 support.
          </p>
          <div className="flex items-center gap-4">
            {settings?.facebookPage && (
              <a href={settings.facebookPage} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-600 dark:hover:border-indigo-400 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {settings?.whatsappNumber && (
              <a href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-600 dark:hover:border-indigo-400 transition-all">
                <MessageCircle className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-6">Quick Links</h4>
          <ul className="space-y-4">
            <li><Link to="/" className="text-gray-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors">Home</Link></li>
            <li><Link to="/products" className="text-gray-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors">Products</Link></li>
            <li><Link to="/contact" className="text-gray-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors">Contact Us</Link></li>
            <li><Link to="/admin" className="text-gray-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors">Admin Panel</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-6">Categories</h4>
          <ul className="space-y-4">
            <li><Link to="/products?category=Streaming" className="text-gray-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors">Streaming</Link></li>
            <li><Link to="/products?category=Design" className="text-gray-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors">Design</Link></li>
            <li><Link to="/products?category=Gaming" className="text-gray-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors">Gaming</Link></li>
            <li><Link to="/products?category=Software" className="text-gray-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors">Software</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-6">Contact Info</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-gray-600 dark:text-slate-400 text-sm">{settings?.whatsappNumber || '+880 1783-229765'}</span>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-gray-600 dark:text-slate-400 text-sm">{settings?.email || 'support@plaxomart.com'}</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-gray-600 dark:text-slate-400 text-sm">{settings?.location || 'Dhaka, Bangladesh'}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-gray-200 dark:border-slate-800 text-center">
        <p className="text-gray-500 dark:text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Tech Loom. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
