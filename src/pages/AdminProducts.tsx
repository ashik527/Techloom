import React, { useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Product, Category } from '../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Upload, 
  Star, 
  Image as ImageIcon,
  Check,
  AlertCircle
} from 'lucide-react';
import { formatPrice, cn } from '../utils/utils';
import { motion, AnimatePresence } from 'framer-motion';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [banner, setBanner] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribeProducts = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    });

    const unsubscribeCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setTitle(product.title);
      setDescription(product.description);
      setRegularPrice(product.regularPrice.toString());
      setSalePrice(product.salePrice.toString());
      setSelectedCategories(product.categories);
      setFeatured(product.featured);
      setBanner(product.banner);
      setImagePreview(product.image);
    } else {
      setEditingProduct(null);
      setTitle('');
      setDescription('');
      setRegularPrice('');
      setSalePrice('');
      setSelectedCategories([]);
      setFeatured(false);
      setBanner(false);
      setImageFile(null);
      setImagePreview('');
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress image before setting preview to avoid large base64 strings in Firestore
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setImagePreview(compressedBase64);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = imagePreview;

      if (imageFile) {
        try {
          const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
          
          // Add a timeout to the upload process
          const uploadPromise = uploadBytes(storageRef, imageFile);
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Upload timeout')), 10000);
          });
          
          const uploadResult = await Promise.race([uploadPromise, timeoutPromise]) as any;
          imageUrl = await getDownloadURL(uploadResult.ref);
        } catch (uploadError) {
          console.error("Image upload failed or timed out, using base64 preview instead", uploadError);
          // Fallback to base64 imagePreview if storage upload fails or times out
          imageUrl = imagePreview; 
        }
      }

      const productData = {
        title,
        description,
        regularPrice: Number(regularPrice),
        salePrice: Number(salePrice),
        categories: selectedCategories,
        featured,
        banner,
        image: imageUrl,
        rating: editingProduct ? editingProduct.rating : (Math.random() * (5 - 4.5) + 4.5).toFixed(1),
        reviewCount: editingProduct ? editingProduct.reviewCount : Math.floor(Math.random() * (500 - 10) + 10),
        createdAt: editingProduct ? editingProduct.createdAt : serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
      } else {
        await addDoc(collection(db, 'products'), productData);
      }

      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(`Failed to save product: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteDoc(doc(db, 'products', productToDelete.id));
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Manage Products</h1>
          <p className="text-slate-500">Add, edit, or remove products from your store.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Add New Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="glass-dark p-4 rounded-3xl border border-slate-800 flex items-center gap-4">
        <Search className="w-5 h-5 text-slate-500 ml-2" />
        <input 
          type="text"
          placeholder="Search products by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none focus:ring-0 text-white w-full placeholder:text-slate-600"
        />
      </div>

      {/* Products Table */}
      <div className="glass-dark rounded-[2.5rem] border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-800">
                <th className="px-8 py-6">Product</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Price</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-700">
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm line-clamp-1">{product.title}</p>
                        <p className="text-xs text-slate-500">ID: {product.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex flex-wrap gap-1">
                      {product.categories.map(cat => (
                        <span key={cat} className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded-md uppercase">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-indigo-400 text-sm">{formatPrice(product.salePrice)}</span>
                      {product.regularPrice > product.salePrice && (
                        <span className="text-xs text-slate-500 line-through">{formatPrice(product.regularPrice)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex gap-3">
                      <div className={cn("p-2 rounded-lg", product.featured ? "bg-amber-500/10 text-amber-500" : "bg-slate-800 text-slate-600")}>
                        <Star className="w-4 h-4" />
                      </div>
                      <div className={cn("p-2 rounded-lg", product.banner ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-800 text-slate-600")}>
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-2 bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4 pointer-events-none" />
                      </button>
                      <button 
                        onClick={() => setProductToDelete(product)}
                        className="p-2 bg-slate-800 text-slate-400 hover:bg-red-600 hover:text-white rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 pointer-events-none" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden glass-dark border border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-2xl font-black text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-1 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Basic Info */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Product Title</label>
                      <input 
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="e.g. Premium Digital Asset Pack"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Description</label>
                      <textarea 
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                        placeholder="Describe your product features and benefits..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Regular Price</label>
                        <input 
                          type="number"
                          required
                          value={regularPrice}
                          onChange={(e) => setRegularPrice(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Sale Price</label>
                        <input 
                          type="number"
                          required
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Media & Categories */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Product Image</label>
                      <div className="relative group">
                        <div className={cn(
                          "w-full aspect-video rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900 overflow-hidden flex flex-col items-center justify-center transition-all",
                          !imagePreview && "hover:border-indigo-500/50 hover:bg-slate-800/50"
                        )}>
                          {imagePreview ? (
                            <>
                              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-sm">
                                  Change Image
                                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                              </div>
                            </>
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center gap-2">
                              <Upload className="w-8 h-8 text-slate-600" />
                              <span className="text-sm font-bold text-slate-500">Click to upload image</span>
                              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Categories</label>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              if (selectedCategories.includes(cat.name)) {
                                setSelectedCategories(selectedCategories.filter(c => c !== cat.name));
                              } else {
                                setSelectedCategories([...selectedCategories, cat.name]);
                              }
                            }}
                            className={cn(
                              "flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition-all",
                              selectedCategories.includes(cat.name)
                                ? "bg-indigo-600 border-indigo-500 text-white"
                                : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
                            )}
                          >
                            {cat.name}
                            {selectedCategories.includes(cat.name) && <Check className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setFeatured(!featured)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border font-bold transition-all",
                          featured 
                            ? "bg-amber-500/10 border-amber-500/50 text-amber-500" 
                            : "bg-slate-900 border-slate-800 text-slate-500"
                        )}
                      >
                        <Star className={cn("w-5 h-5", featured && "fill-current")} />
                        Featured
                      </button>
                      <button
                        type="button"
                        onClick={() => setBanner(!banner)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border font-bold transition-all",
                          banner 
                            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" 
                            : "bg-slate-900 border-slate-800 text-slate-500"
                        )}
                      >
                        <ImageIcon className="w-5 h-5" />
                        Banner
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Product'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-dark border border-slate-800 rounded-[2.5rem] shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Delete Product?</h2>
              <p className="text-slate-400 mb-8">Are you sure you want to delete "{productToDelete.title}"? This action cannot be undone.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
