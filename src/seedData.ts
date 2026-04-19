import { collection, getDocs, addDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const demoCategories = [
  { name: 'Streaming', icon: '📺' },
  { name: 'Gaming', icon: '🎮' },
  { name: 'Design', icon: '🎨' },
  { name: 'Software', icon: '💻' },
  { name: 'Education', icon: '📚' },
  { name: 'Social', icon: '📱' },
];

const demoProducts = [
  {
    title: 'Netflix Premium 1 Month',
    description: 'Ultra HD 4K streaming. 4 screens at a time. Private profile.',
    image: 'https://picsum.photos/seed/netflix/800/800',
    regularPrice: 1200,
    salePrice: 850,
    categories: ['Streaming'],
    featured: true,
    banner: true,
    rating: 4.9,
    reviewCount: 124,
  },
  {
    title: 'Spotify Premium 1 Year',
    description: 'Ad-free music, offline play, unlimited skips. High quality audio.',
    image: 'https://picsum.photos/seed/spotify/800/800',
    regularPrice: 2500,
    salePrice: 1800,
    categories: ['Streaming'],
    featured: true,
    banner: false,
    rating: 4.8,
    reviewCount: 89,
  },
  {
    title: 'Canva Pro Lifetime',
    description: 'Unlimited premium content, brand kit, magic resize, and more.',
    image: 'https://picsum.photos/seed/canva/800/800',
    regularPrice: 1500,
    salePrice: 999,
    categories: ['Design'],
    featured: false,
    banner: true,
    rating: 4.7,
    reviewCount: 256,
  },
  {
    title: 'Adobe Creative Cloud 1 Year',
    description: 'All Adobe apps including Photoshop, Illustrator, Premiere Pro.',
    image: 'https://picsum.photos/seed/adobe/800/800',
    regularPrice: 15000,
    salePrice: 12000,
    categories: ['Design', 'Software'],
    featured: true,
    banner: false,
    rating: 4.9,
    reviewCount: 45,
  },
  {
    title: 'PUBG Mobile 660 UC',
    description: 'Instant top-up for PUBG Mobile. Global region supported.',
    image: 'https://picsum.photos/seed/pubg/800/800',
    regularPrice: 950,
    salePrice: 820,
    categories: ['Gaming'],
    featured: false,
    banner: false,
    rating: 4.6,
    reviewCount: 512,
  },
  {
    title: 'Free Fire 1000 Diamonds',
    description: 'Fast diamond top-up for Free Fire. ID login required.',
    image: 'https://picsum.photos/seed/freefire/800/800',
    regularPrice: 800,
    salePrice: 750,
    categories: ['Gaming'],
    featured: true,
    banner: false,
    rating: 4.5,
    reviewCount: 320,
  },
];

const demoReviews = [
  { customerName: 'Ariful Islam', rating: 5, reviewText: 'Excellent service! Got my Netflix account within 10 minutes.' },
  { customerName: 'Sabbir Ahmed', rating: 5, reviewText: 'Very reliable. The Canva Pro lifetime deal is amazing.' },
  { customerName: 'Mehedi Hasan', rating: 4, reviewText: 'Good experience, but the WhatsApp response was a bit slow.' },
];

const demoFAQs = [
  { question: 'How long does delivery take?', answer: 'Most digital products are delivered within 5 to 30 minutes after payment confirmation.' },
  { question: 'Is it safe to buy from Tech Loom?', answer: 'Yes, we are a trusted platform with thousands of satisfied customers. We provide full warranty for our products.' },
  { question: 'What payment methods do you accept?', answer: 'We currently accept bKash and Nagad for all transactions.' },
];

const defaultSettings = {
  whatsappNumber: '+8801838192595',
  email: 'ashik.freelance527@gmail.com',
  location: 'Gaibandha, Bangladesh',
  facebookPage: 'https://facebook.com/plaxomart',
  paymentNumber: '01945220851'
};

export const seedDatabase = async () => {
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    if (productsSnap.empty) {
      console.log('Seeding database...');
      
      // Seed Categories
      for (const cat of demoCategories) {
        await addDoc(collection(db, 'categories'), cat);
      }

      // Seed Products
      for (const prod of demoProducts) {
        await addDoc(collection(db, 'products'), {
          ...prod,
          createdAt: serverTimestamp()
        });
      }

      // Seed Reviews
      for (const rev of demoReviews) {
        await addDoc(collection(db, 'reviews'), rev);
      }

      // Seed FAQs
      for (const faq of demoFAQs) {
        await addDoc(collection(db, 'faqs'), faq);
      }

      // Seed Settings
      await setDoc(doc(db, 'settings', 'general'), defaultSettings);

      console.log('Database seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
