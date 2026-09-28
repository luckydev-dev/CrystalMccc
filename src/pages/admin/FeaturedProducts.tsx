import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Star, Search } from 'lucide-react';
import { ref, get, set } from 'firebase/database';
import { db } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { useAdminHeader } from '../../context/AdminHeaderContext';
import { useData, getAllStoreProducts } from '../../context/DataContext';

export function FeaturedProductsEditor() {
  const { data } = useData();
  const { toast } = useToast();
  const { setTitle, setAction } = useAdminHeader();
  
  const [featured, setFeatured] = useState<string[]>(['', '', '']);
  const [isSaving, setIsSaving] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    setTitle('Featured Store');
    
    // Flatten products across all game modes
    if (data.store) {
      const products = getAllStoreProducts(data.store);
      setAllProducts(products);
    }
    
    if (data.featuredStore) {
      setFeatured([
        data.featuredStore[0] || '',
        data.featuredStore[1] || '',
        data.featuredStore[2] || ''
      ]);
    }
  }, [data, setTitle]);

  useEffect(() => {
    setAction(
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
      >
        <Save size={18} />
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
    );
  }, [featured, isSaving, setAction]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const filtered = featured.filter(id => id !== '');
      await set(ref(db, 'siteData/featuredStore'), filtered);
      toast('Featured products updated successfully!', 'success');
    } catch (error) {
      console.error(error);
      toast('Failed to update featured products', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    const newFeatured = [...featured];
    newFeatured[index] = value;
    setFeatured(newFeatured);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-2">Homepage Featured Cards</h2>
        <p className="text-slate-400">Select which products to display on the homepage. The middle card (Slot 2) will be highlighted as "Most Popular".</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((index) => (
          <div key={index} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
            {index === 1 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-lg shadow-indigo-500/30 whitespace-nowrap">
                Most Popular
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                <Star size={20} className={index === 1 ? 'text-indigo-400' : ''} />
              </div>
              <h3 className="text-lg font-bold text-white">Slot {index + 1}</h3>
            </div>

            <div className="relative">
              <select
                value={featured[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">-- Select Product --</option>
                {allProducts.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (₹{product.price})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            {featured[index] && (
              <div className="mt-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                {(() => {
                  const p = allProducts.find(p => p.id === featured[index]);
                  if (!p) return null;
                  return (
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-contain" />
                      ) : (
                        <div className={`w-10 h-10 rounded-lg ${p.bg} border ${p.border}`} />
                      )}
                      <div>
                        <p className="text-sm font-bold text-white truncate">{p.name}</p>
                        <p className="text-xs text-slate-400">₹{p.price}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
