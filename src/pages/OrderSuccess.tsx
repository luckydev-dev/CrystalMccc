import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Copy, ArrowRight, Package } from 'lucide-react';
import { useLocation, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const orderId = searchParams.get('id');

  useEffect(() => {
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderId) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
    toast('Order ID copied to clipboard!', 'success');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container mx-auto px-4 pt-32 pb-20 max-w-2xl text-center"
    >
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-sm">
        <div className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(74,222,128,0.2)]">
          <CheckCircle size={48} />
        </div>
        
        <h1 className="text-4xl font-bold text-white font-heading mb-4">Order Placed!</h1>
        <p className="text-slate-400 text-lg mb-8">
          Thank you for your purchase. Your order has been received and is currently pending approval.
        </p>

        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 mb-8">
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Your Order ID</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="text-lg sm:text-2xl font-mono text-indigo-400 font-bold break-all text-center">{orderId}</span>
            <button 
              onClick={handleCopy}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors shrink-0"
              title="Copy Order ID"
            >
              <Copy size={20} />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-4">Please save this ID. You can use it to track your order status.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to={`/track?id=${orderId}`}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
          >
            <Package size={20} /> Track Order
          </Link>
          <Link 
            to="/"
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
          >
            Continue Shopping <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
