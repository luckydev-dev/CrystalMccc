import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, Plus, Trash2, Check, X, Calendar, Percent, Hash } from 'lucide-react';
import { ref, onValue, set, remove } from 'firebase/database';
import { db } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { useAdminHeader } from '../../context/AdminHeaderContext';

interface PromoCode {
  code: string;
  discount: number;
  expiresAt: string | null;
  maxUses: number | null;
  currentUses: number;
  isActive: boolean;
}

export function PromoCodes() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const { setTitle, setAction } = useAdminHeader();

  // Form state
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [hasMaxUses, setHasMaxUses] = useState(false);
  const [maxUses, setMaxUses] = useState('');

  useEffect(() => {
    setTitle('Promo Codes');
    setAction(
      <button
        onClick={() => setIsAdding(true)}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-600/20"
      >
        <Plus size={18} />
        New Code
      </button>
    );

    const promoRef = ref(db, 'promoCodes');
    const unsubscribe = onValue(promoRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const codesList = Object.entries(data).map(([key, value]: [string, any]) => ({
          code: key,
          ...value
        }));
        setPromoCodes(codesList);
      } else {
        setPromoCodes([]);
      }
    });

    return () => unsubscribe();
  }, [setTitle, setAction]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discount) {
      toast('Please fill in all required fields', 'error');
      return;
    }

    const formattedCode = code.toUpperCase().trim();
    const discountNum = parseFloat(discount);

    if (discountNum <= 0 || discountNum > 100) {
      toast('Discount must be between 1 and 100', 'error');
      return;
    }

    try {
      await set(ref(db, `promoCodes/${formattedCode}`), {
        discount: discountNum,
        expiresAt: hasExpiry ? expiresAt : null,
        maxUses: hasMaxUses ? parseInt(maxUses) : null,
        currentUses: 0,
        isActive: true
      });
      
      toast('Promo code created successfully!', 'success');
      setIsAdding(false);
      
      // Reset form
      setCode('');
      setDiscount('');
      setHasExpiry(false);
      setExpiresAt('');
      setHasMaxUses(false);
      setMaxUses('');
    } catch (error) {
      console.error(error);
      toast('Failed to create promo code', 'error');
    }
  };

  const toggleStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      await set(ref(db, `promoCodes/${codeId}/isActive`), !currentStatus);
      toast(`Promo code ${!currentStatus ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      toast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (codeId: string) => {
    if (!window.confirm('Are you sure you want to delete this promo code?')) return;
    try {
      await remove(ref(db, `promoCodes/${codeId}`));
      toast('Promo code deleted', 'success');
    } catch (error) {
      toast('Failed to delete promo code', 'error');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Add New Modal */}
      {createPortal(
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              >
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                  <h2 className="text-xl font-bold text-white font-heading">Create Promo Code</h2>
                  <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Code Name</label>
                    <div className="relative">
                      <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="e.g. SUMMER20"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 uppercase"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Discount Percentage (%)</label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        placeholder="e.g. 15"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-slate-800 pt-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-300">Has Expiry Date?</label>
                      <button
                        type="button"
                        onClick={() => setHasExpiry(!hasExpiry)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${hasExpiry ? 'bg-indigo-500' : 'bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${hasExpiry ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                    {hasExpiry && (
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                          type="datetime-local"
                          value={expiresAt}
                          onChange={(e) => setExpiresAt(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500"
                          required={hasExpiry}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 border-t border-slate-800 pt-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-300">Limit Maximum Uses?</label>
                      <button
                        type="button"
                        onClick={() => setHasMaxUses(!hasMaxUses)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${hasMaxUses ? 'bg-indigo-500' : 'bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${hasMaxUses ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                    {hasMaxUses && (
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                          type="number"
                          min="1"
                          value={maxUses}
                          onChange={(e) => setMaxUses(e.target.value)}
                          placeholder="e.g. 100"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500"
                          required={hasMaxUses}
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
                    >
                      Create Code
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Promo Codes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promoCodes.length === 0 ? (
          <div className="col-span-full bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl p-12 text-center">
            <Ticket size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Promo Codes</h3>
            <p className="text-slate-400">Create your first discount code to offer savings to your players.</p>
          </div>
        ) : (
          promoCodes.map((promo) => {
            const isExpired = promo.expiresAt && new Date(promo.expiresAt) < new Date();
            const isExhausted = promo.maxUses && promo.currentUses >= promo.maxUses;
            const isUsable = promo.isActive && !isExpired && !isExhausted;

            return (
              <motion.div
                key={promo.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-slate-900 border rounded-2xl p-6 relative overflow-hidden transition-colors ${isUsable ? 'border-slate-700 hover:border-indigo-500/50' : 'border-red-900/30 opacity-75'}`}
              >
                {!isUsable && (
                  <div className="absolute top-4 right-4 px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-md">
                    {isExpired ? 'Expired' : isExhausted ? 'Exhausted' : 'Disabled'}
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Ticket size={16} className="text-indigo-400" />
                      <h3 className="text-xl font-bold text-white font-mono tracking-wider">{promo.code}</h3>
                    </div>
                    <p className="text-2xl font-extrabold text-emerald-400">{promo.discount}% OFF</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Expires</span>
                    <span className="text-slate-300 font-medium">
                      {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Uses</span>
                    <span className="text-slate-300 font-medium">
                      {promo.currentUses} / {promo.maxUses || '∞'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(promo.code, promo.isActive)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${promo.isActive ? 'bg-indigo-500' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${promo.isActive ? 'left-5.5' : 'left-0.5'}`} />
                    </button>
                    <span className="text-xs font-medium text-slate-400">{promo.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(promo.code)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
