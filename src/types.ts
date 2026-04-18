import { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  regularPrice: number;
  salePrice: number;
  categories: string[];
  featured: boolean;
  banner: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface AppSettings {
  whatsappNumber: string;
  email: string;
  location: string;
  facebookPage: string;
  paymentNumber: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  reviewText: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface CartItem extends Product {
  quantity: number;
}
