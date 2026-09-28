import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingCart, Tag, Package } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { db } from '../../lib/firebase';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { CheckoutModal } from './CheckoutModal';

export function CartSidebar() {
  const navigate = useNavigate();
  const { isCartOpen, toggleCart, items, updateQuantity, removeFromCart, cartTotal, discount, applyPromoCode } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { toast } = useToast();
  const { user, openAuthModal } = useAuth();

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    
    setIsApplyingPromo(true);
    try {
      const formattedCode = promoCode.toUpperCase().trim();
      const promoRef = ref(db, `promoCodes/${formattedCode}`);
      const snapshot = await get(promoRef);
      
      if (snapshot.exists()) {
        const promo = snapshot.val();
        
        if (!promo.isActive) {
          toast('This promo code is disabled.', 'error');
          return;
        }
        
        if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
          toast('This promo code has expired.', 'error');
          return;
        }
        
        if (promo.maxUses && promo.currentUses >= promo.maxUses) {
          toast('This promo code usage limit has been reached.', 'error');
          return;
        }
        
        await applyPromoCode(formattedCode, promo.discount / 100);
        toast('Promo code applied successfully!', 'success');
      } else {
        toast('Invalid promo code.', 'error');
      }
    } catch (error) {
      console.error(error);
      toast('Failed to apply promo code.', 'error');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleCheckoutClick = () => {
    if (!user) {
      toast('Please login to checkout.', 'info');
      toggleCart();
      openAuthModal();
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const finalTotal = cartTotal * (1 - discount);

  React.useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleCart}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] transition-all"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-950/95 backdrop-blur-2xl border-l border-slate-800/80 z-[101] flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.15)]"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-slate-900/80 via-slate-950 to-slate-900/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-md shadow-purple-500/10">
                    <ShoppingCart size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white font-heading tracking-tight">Your Shopping Cart</h2>
                    <p className="text-xs text-slate-400">{items.length} {items.length === 1 ? 'item' : 'items'} selected</p>
                  </div>
                </div>
                <button 
                  onClick={toggleCart} 
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-5 my-auto">
                    <div className="relative">
                      <div className="absolute -inset-4 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
                      <div className="w-24 h-24 bg-slate-900/90 rounded-3xl flex items-center justify-center border border-slate-800 shadow-2xl relative">
                        <ShoppingCart size={42} className="text-slate-600" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg text-slate-300">Your cart is currently empty</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs">Explore our store to find exclusive ranks, keys, kits, and in-game cosmetics.</p>
                    </div>
                    <button 
                      onClick={() => {
                        toggleCart();
                        navigate('/store');
                      }} 
                      className="px-6 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl transition-all text-sm font-bold shadow-lg shadow-purple-500/10 cursor-pointer"
                    >
                      Explore Store Items
                    </button>
                  </div>
                ) : (
                  items.map(item => (
                    <motion.div 
                      key={item.id} 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group flex gap-4 bg-slate-900/60 hover:bg-slate-900/90 p-4 rounded-2xl border border-slate-800/80 hover:border-purple-500/40 transition-all duration-300 shadow-lg relative overflow-hidden"
                    >
                      <div className="w-16 h-16 bg-slate-950/90 rounded-xl flex items-center justify-center border border-slate-800 shrink-0 overflow-hidden shadow-inner p-1">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1 transform group-hover:scale-110 transition-transform" />
                        ) : (
                          <Package size={26} className="text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-white leading-snug text-sm">{item.name}</h3>
                          <button 
                            onClick={() => removeFromCart(item.id)} 
                            className="text-slate-500 hover:text-rose-400 transition-colors p-1.5 hover:bg-rose-500/10 rounded-lg shrink-0"
                            title="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-purple-400 font-extrabold text-base">₹{(item.price * item.quantity).toFixed(2)}</p>
                          <div className="flex items-center gap-2 bg-slate-950 rounded-xl border border-slate-800/80 px-2.5 py-1 shadow-inner">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-slate-400 hover:text-white p-0.5 transition-colors"><Minus size={13} /></button>
                            <span className="text-white text-xs font-bold w-5 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-slate-400 hover:text-white p-0.5 transition-colors"><Plus size={13} /></button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="p-6 border-t border-slate-800/80 bg-slate-900/80 backdrop-blur-md space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" size={15} />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Promo code (e.g. CRYSTAL)"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs font-medium focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <button 
                      onClick={handleApplyPromo} 
                      disabled={isApplyingPromo}
                      className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-purple-600/20 active:scale-95"
                    >
                      {isApplyingPromo ? '...' : 'Apply'}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60">
                    <div className="flex justify-between text-slate-400 font-medium">
                      <span>Subtotal</span>
                      <span className="text-slate-200">₹{cartTotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>Discount ({(discount * 100).toFixed(0)}%)</span>
                        <span>-₹{(cartTotal * discount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-white text-base font-extrabold pt-2 border-t border-slate-800/80">
                      <span>Total Due</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">₹{finalTotal.toFixed(2)} INR</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckoutClick}
                    className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-extrabold py-3.5 rounded-2xl shadow-xl shadow-purple-600/25 transition-all overflow-hidden relative group active:scale-[0.99] flex items-center justify-center gap-2 text-sm"
                  >
                    <span className="relative z-10">Proceed to Checkout</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </>
  );
}
