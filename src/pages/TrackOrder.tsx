import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Package, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SEOHead } from '../components/seo/SEOHead';

export function TrackOrder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [orderId, setOrderId] = useState(initialId);
  const [isSearching, setIsSearching] = useState(false);
  const [orderData, setOrderData] = useState<any | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoadingUserOrders, setIsLoadingUserOrders] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    } else {
      setUserOrders([]);
    }
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user) return;
    setIsLoadingUserOrders(true);
    try {
      const ordersRef = ref(db, 'orders');
      const snapshot = await get(ordersRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const ordersList = Object.keys(data)
          .map(key => ({
            id: key,
            ...data[key]
          }))
          .filter(order => order.userId === user.uid)
          .sort((a, b) => b.createdAt - a.createdAt);
        setUserOrders(ordersList);
      } else {
        setUserOrders([]);
      }
    } catch (error) {
      console.error("Error fetching user orders:", error);
    } finally {
      setIsLoadingUserOrders(false);
    }
  };

  const handleSearch = async (idToSearch: string = orderId) => {
    if (!idToSearch.trim()) {
      toast('Please enter an Order ID', 'error');
      return;
    }

    setIsSearching(true);
    setOrderData(null);
    
    try {
      const orderRef = ref(db, `orders/${idToSearch}`);
      const snapshot = await get(orderRef);
      
      if (snapshot.exists()) {
        setOrderData({ id: snapshot.key, ...snapshot.val() });
        setSearchParams({ id: idToSearch });
      } else {
        toast('Order not found. Please check the ID.', 'error');
      }
    } catch (error) {
      toast('Error fetching order details.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'adminap':
      case 'approved':
      case 'success':
        return { icon: <CheckCircle className="text-green-400" size={24} />, text: 'Success', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' };
      case 'rejected':
        return { icon: <XCircle className="text-red-400" size={24} />, text: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
      case 'adminrq':
      case 'pending':
      default:
        return { icon: <Clock className="text-yellow-400" size={24} />, text: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' };
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 pt-32 pb-20 max-w-4xl"
    >
      <SEOHead
        title="Track Order"
        description="Check your store order status on CrystalMC. Enter your Order ID to track rank and key deliveries."
      />
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mb-4">Track Order</h1>
        <p className="text-slate-400 text-lg">Enter your order ID to check its current status.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-sm mb-12 max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter Order ID (e.g. -Oq56ot...)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {isSearching ? 'Searching...' : 'Track'}
          </button>
        </div>
      </div>

      {orderData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-w-2xl mx-auto"
        >
          <div className="p-6 md:p-8 border-b border-slate-800 bg-slate-950/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">Order ID</p>
                <p className="text-lg font-mono text-white font-bold">{orderData.id}</p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${getStatusDisplay(orderData.status).bg}`}>
                {getStatusDisplay(orderData.status).icon}
                <span className={`font-bold ${getStatusDisplay(orderData.status).color}`}>
                  {getStatusDisplay(orderData.status).text}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Date</p>
                <p className="text-white font-medium">{new Date(orderData.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Server Realm</p>
                <p className={`font-bold uppercase ${
                  (orderData.server || 'survival') === 'survival' ? 'text-emerald-400' :
                  (orderData.server || 'survival') === 'lifesteal' ? 'text-rose-400' : 'text-purple-400'
                }`}>
                  {orderData.server || 'survival'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total</p>
                <p className="text-indigo-400 font-bold text-lg">₹{orderData.total.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Package size={16} className="text-indigo-400" /> Items
              </h3>
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
                {orderData.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm pb-3 border-b border-slate-800/60 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded-md text-xs font-bold">{item.quantity}x</span>
                      <span className="text-white font-medium">{item.name}</span>
                    </div>
                    <span className="text-slate-400 font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {user && !orderData && (
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-white font-heading mb-6">Your Recent Orders</h2>
          
          {isLoadingUserOrders ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading your orders...</p>
            </div>
          ) : userOrders.length > 0 ? (
            <div className="grid gap-4">
              {userOrders.map(order => (
                <div key={order.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-500/30 transition-colors">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-white font-bold text-sm sm:text-base">{order.id}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 ${getStatusDisplay(order.status).bg} ${getStatusDisplay(order.status).color}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {getStatusDisplay(order.status).text}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items • ₹{order.total.toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => handleSearch(order.id)}
                    className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl transition-colors text-sm font-bold w-full md:w-auto"
                  >
                    View Details <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-12 text-center">
              <Package size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg">You haven't placed any orders yet.</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
