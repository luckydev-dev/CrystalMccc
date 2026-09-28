import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Trash2, ExternalLink, Package } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ref, onValue, update, remove, get } from 'firebase/database';
import { db } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { useAdminHeader } from '../../context/AdminHeaderContext';
import { useData, getAllStoreProducts } from '../../context/DataContext';

export function Orders() {
  const { data } = useData();
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'archived'>('pending');
  const [selectedServerFilter, setSelectedServerFilter] = useState<'all' | 'survival' | 'lifesteal' | 'pvp'>('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { toast } = useToast();
  const { setTitle, setAction } = useAdminHeader();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id') || searchParams.get('orderId');

  useEffect(() => {
    setTitle('Orders');
    setAction(null);
    
    const ordersRef = ref(db, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const ordersList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => b.createdAt - a.createdAt);
        setOrders(ordersList);

        // Auto select order if highlightId is specified in URL query params
        if (highlightId) {
          const matchingOrder = ordersList.find(o => o.id === highlightId);
          if (matchingOrder) {
            setSelectedOrder(matchingOrder);
            if (matchingOrder.status !== 'pending') {
              setActiveTab('archived');
            } else {
              setActiveTab('pending');
            }
          }
        }
      } else {
        setOrders([]);
      }
    });

    return () => unsubscribe();
  }, [setTitle, setAction, highlightId]);

  const pendingOrders = orders.filter(o => o.status === 'adminrq' || o.status === 'pending');
  const archivedOrders = orders.filter(o => o.status !== 'adminrq' && o.status !== 'pending');

  const findProductCommands = (productId: string): string => {
    if (!data || !data.store) return '';
    const all = getAllStoreProducts(data.store);
    const product = all.find(p => p.id === productId);
    return product ? product.commands || '' : '';
  };

  const handleUpdateStatus = async (orderId: string, status: 'approved' | 'rejected') => {
    try {
      const order = orders.find(o => o.id === orderId);
      let resolvedCommands: string[] = [];

      if (order && order.items) {
        order.items.forEach((item: any) => {
          const productCommands = findProductCommands(item.id) || item.commands || '';
          if (productCommands) {
            const lines = productCommands.split('\n').filter((cmd: string) => cmd.trim());
            lines.forEach((cmd: string) => {
              let resolved = cmd;
              resolved = resolved.replace(/%player%/gi, order.player || order.username || 'Unknown');
              resolved = resolved.replace(/%edition%/gi, order.edition || 'Java');
              resolved = resolved.replace(/%server%/gi, order.server || 'survival');
              resolved = resolved.replace(/%total%/gi, (order.total || 0).toString());
              resolved = resolved.replace(/%price%/gi, (order.total || 0).toString());
              resolved = resolved.replace(/%orderId%/gi, orderId);
              resolved = resolved.replace(/%id%/gi, orderId);
              
              const qty = item.quantity || 1;
              for (let q = 0; q < qty; q++) {
                resolvedCommands.push(resolved);
              }
            });
          }
        });
      }

      const dbStatus = status === 'approved' ? 'adminap' : status;
      const executionStatus = status === 'approved' ? 'pending' : 'cancelled';

      await update(ref(db, `orders/${orderId}`), { 
        status: dbStatus,
        commandsExecutionStatus: executionStatus,
        resolvedCommands: resolvedCommands.length > 0 ? resolvedCommands : null,
        commands: (resolvedCommands.length > 0 && status === 'approved') ? resolvedCommands : null,
        updatedAt: Date.now()
      });

      toast(`Order marked as ${dbStatus}`, 'success');
      
      // Send Discord Webhook for status update
      if (order) {
        try {
          const webhookSnapshot = await get(ref(db, 'siteData/discordWebhook'));
          if (webhookSnapshot.exists()) {
            const config = webhookSnapshot.val();
            if (config.url) {
              const color = status === 'approved' ? 5763719 : 15548997; // Green or Red
              
              const payload = {
                username: config.username || undefined,
                avatar_url: config.avatarUrl || undefined,
                embeds: [
                  {
                    title: `Order Status Updated`,
                    description: `Order **#${orderId}** for **${order.player || order.username || 'Unknown'}** has been **${status.toUpperCase()}**.`,
                    color: color,
                    fields: [
                      { name: 'Order ID', value: orderId, inline: true },
                      { name: 'Player', value: order.player || order.username || 'Unknown', inline: true },
                      { name: 'New Status', value: status.toUpperCase(), inline: true },
                      { name: 'Total', value: `₹${order.total?.toFixed(2) || '0.00'}`, inline: true }
                    ],
                    image: config.embedImage ? { url: config.embedImage } : undefined,
                    timestamp: new Date().toISOString()
                  }
                ]
              };

              await fetch(config.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
            }
          }
        } catch (webhookErr) {
          console.error('Failed to send status update webhook:', webhookErr);
        }

        // Send OneSignal Notification to the User (best-effort, non-blocking)
        if (order.userId) {
          try {
            const onesignalSnapshot = await get(ref(db, 'siteData/onesignal'));
            if (onesignalSnapshot.exists()) {
              const osConfig = onesignalSnapshot.val();
              if (osConfig.appId && osConfig.restApiKey) {
                const payload = {
                  app_id: osConfig.appId,
                  include_aliases: { external_id: [order.userId] },
                  target_channel: "push",
                  headings: { en: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}` },
                  contents: { en: `Your order #${orderId} has been ${status}.` },
                  url: `${window.location.origin}/track?id=${orderId}`
                };

                await fetch('/api/onesignal/send', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ payload, restApiKey: osConfig.restApiKey })
                }).catch(() => {});
              }
            }
          } catch (_) {
            // Non-blocking notification
          }
        }
      }

      setSelectedOrder(null);
    } catch (error) {
      toast('Failed to update order status', 'error');
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    try {
      await remove(ref(db, `orders/${selectedOrder.id}`));
      toast('Order deleted permanently', 'success');
      setIsDeleteModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      toast('Failed to delete order', 'error');
    }
  };

  const baseOrders = activeTab === 'pending' ? pendingOrders : archivedOrders;
  const displayedOrders = selectedServerFilter === 'all'
    ? baseOrders
    : baseOrders.filter(o => (o.server || 'survival').toLowerCase() === selectedServerFilter);

  return (
    <div className="space-y-6">
      {/* Tabs & Server Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'pending' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            Pending ({pendingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'archived' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            Archived ({archivedOrders.length})
          </button>
        </div>

        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <span className="text-slate-500 px-2 uppercase text-[10px] tracking-wider">Server:</span>
          {(['all', 'survival', 'lifesteal', 'pvp'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSelectedServerFilter(s)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                selectedServerFilter === s
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {displayedOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Package size={48} className="mx-auto mb-4 opacity-20" />
            <p>No {activeTab} orders found{selectedServerFilter !== 'all' ? ` for server ${selectedServerFilter}` : ''}.</p>
          </div>
        ) : (
          displayedOrders.map(order => (
            <div 
              key={order.id}
              className="glass-card p-4 rounded-xl border border-slate-800/60 flex items-center justify-between hover:border-indigo-500/50 transition-colors cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${(order.status === 'pending' || order.status === 'adminrq') ? 'bg-yellow-400' : (order.status === 'approved' || order.status === 'adminap') ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{order.player || order.username || 'Unknown'}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      (order.server || 'survival') === 'survival'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : (order.server || 'survival') === 'lifesteal'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    }`}>
                      {order.server || 'survival'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-bold text-indigo-400">₹{order.total.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">{order.edition}</p>
                </div>
                {activeTab === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, 'approved'); }}
                      className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                    >
                      <Check size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, 'rejected'); }}
                      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedOrder && !isDeleteModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 md:p-6"
              onClick={() => setSelectedOrder(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]"
              >
                <div className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 shrink-0">
                  <div>
                    <h2 className="text-xl font-bold text-white font-heading">Order Details</h2>
                    <p className="text-sm text-slate-400 mt-1">ID: {selectedOrder.id}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white transition-colors p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-4 md:p-6 overflow-y-auto space-y-6 md:space-y-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                    <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/60">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Customer</p>
                      <p className="font-bold text-white truncate text-sm">{selectedOrder.player || selectedOrder.username || 'Unknown'}</p>
                    </div>
                    <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/60">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Server Realm</p>
                      <p className={`font-bold uppercase text-sm ${
                        (selectedOrder.server || 'survival') === 'survival' ? 'text-emerald-400' :
                        (selectedOrder.server || 'survival') === 'lifesteal' ? 'text-rose-400' : 'text-purple-400'
                      }`}>
                        {selectedOrder.server || 'survival'}
                      </p>
                    </div>
                    <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/60">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Edition</p>
                      <p className="font-bold text-white text-sm">{selectedOrder.edition}</p>
                    </div>
                    <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/60">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Total</p>
                      <p className="font-bold text-indigo-400 text-sm">
                        {selectedOrder.currency && selectedOrder.localTotal ? `${selectedOrder.currency === 'BDT' ? '৳' : selectedOrder.currency === 'USD' ? '$' : '₹'}${selectedOrder.localTotal}` : `₹${selectedOrder.total?.toFixed(2)}`}
                      </p>
                    </div>
                    <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/60">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Status</p>
                      <p className={`font-bold capitalize text-sm ${(selectedOrder.status === 'pending' || selectedOrder.status === 'adminrq') ? 'text-yellow-400' : (selectedOrder.status === 'approved' || selectedOrder.status === 'adminap' || selectedOrder.status === 'success') ? 'text-green-400' : 'text-red-400'}`}>
                        {(selectedOrder.status === 'adminap' || selectedOrder.status === 'approved' || selectedOrder.status === 'success') ? 'Success' : (selectedOrder.status === 'adminrq' || selectedOrder.status === 'pending') ? 'Pending' : selectedOrder.status}
                      </p>
                    </div>
                  </div>

                  {/* Payment Details Banner */}
                  {(selectedOrder.paymentMethod || selectedOrder.trxId || selectedOrder.country) && (
                    <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Country / Region</span>
                        <span className="font-bold text-white flex items-center gap-1.5">
                          {selectedOrder.country === 'BD' ? '🇧🇩 Bangladesh' : selectedOrder.country === 'IN' ? '🇮🇳 India' : '🌐 International'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Payment Method</span>
                        <span className="font-bold text-indigo-400">{selectedOrder.paymentMethod || 'UPI / Standard'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Transaction / TRX ID</span>
                        <span className="font-mono font-bold text-emerald-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 inline-block">
                          {selectedOrder.trxId || 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Package size={16} className="text-indigo-400" /> Items Ordered
                        </h3>
                        <div className="bg-slate-950/50 rounded-xl border border-slate-800/60 p-4 space-y-3">
                          {selectedOrder.items?.map((item: any, idx: number) => (
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

                      {selectedOrder.note && (
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Customer Note</h3>
                          <div className="bg-indigo-500/5 rounded-xl border border-indigo-500/20 p-4 text-sm text-indigo-200 italic">
                            "{selectedOrder.note}"
                          </div>
                        </div>
                      )}

                      {selectedOrder.resolvedCommands && selectedOrder.resolvedCommands.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${(selectedOrder.commandsExecutionStatus === 'executed' || selectedOrder.commandsExecutionStatus === 'completed' || selectedOrder.commandsExecutionStatus === 'given') ? 'bg-green-500' : selectedOrder.commandsExecutionStatus === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
                            Commands Queue ({selectedOrder.commandsExecutionStatus || 'pending'})
                          </h3>
                          <div className="bg-slate-950/70 rounded-xl border border-slate-800/80 p-4 font-mono text-xs text-cyan-400/90 space-y-1.5 overflow-y-auto max-h-40 custom-scrollbar shadow-inner">
                            {selectedOrder.resolvedCommands.map((cmd: string, idx: number) => (
                              <div key={idx} className="break-all whitespace-pre-wrap leading-relaxed">
                                <span className="text-slate-600 select-none mr-2">[{idx + 1}]</span>
                                {cmd}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Payment Proof</h3>
                      <div className="bg-slate-950/50 rounded-xl border border-slate-800/60 p-2 group relative overflow-hidden">
                        <img src={selectedOrder.proofUrl} alt="Payment Proof" className="w-full rounded-lg object-cover aspect-[3/4] md:aspect-auto md:max-h-80" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a 
                            href={selectedOrder.proofUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors font-medium"
                          >
                            View Full Image <ExternalLink size={16} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-6 border-t border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                  {activeTab === 'pending' ? (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'rejected')}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors font-bold"
                      >
                        Reject Order
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'approved')}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors font-bold shadow-lg shadow-indigo-600/20"
                      >
                        Approve Order
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors font-bold"
                    >
                      <Trash2 size={18} /> Delete Record
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {createPortal(
        <AnimatePresence>
          {isDeleteModalOpen && (
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
                className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
              >
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Order?</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Are you sure you want to permanently delete this order? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteOrder}
                    className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
