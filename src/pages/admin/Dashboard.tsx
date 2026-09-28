import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Server, Activity, DollarSign, ArrowRight, Image, ShieldCheck, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminHeader } from '../../context/AdminHeaderContext';
import { useData } from '../../context/DataContext';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return 'Just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function Dashboard() {
  const { setTitle, setAction } = useAdminHeader();
  const { data, serverStatus } = useData();
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setTitle('Dashboard Overview');
    setAction(null);

    const usersRef = ref(db, 'users');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const usersList = Object.entries(val).map(([uid, u]: [string, any]) => ({
          uid,
          ...u
        }));
        setUsers(usersList);
      } else {
        setUsers([]);
      }
    });

    const ordersRef = ref(db, 'orders');
    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const ordersList = Object.entries(val).map(([id, o]: [string, any]) => ({
          id,
          ...o
        }));
        setOrders(ordersList);
      } else {
        setOrders([]);
      }
    });

    return () => {
      unsubscribeUsers();
      unsubscribeOrders();
    };
  }, [setTitle, setAction]);

  // Compute stats
  const approvedOrders = orders.filter(o => o.status === 'adminap' || o.status === 'approved' || o.status === 'success');
  const approvedOrdersCount = approvedOrders.length;
  const approvedRevenue = approvedOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newPlayersThisWeek = users.filter(u => (u.createdAt || 0) > oneWeekAgo).length;

  const totalPlayersValue = users.length.toString();
  const currentOnlinePlayers = serverStatus.online ? `${serverStatus.players}` : 'Offline';
  const visitsValue = (data.visits || 0).toLocaleString();
  const totalRevenueValue = `₹${approvedRevenue.toFixed(2)}`;

  const stats = [
    { 
      label: 'Registered Players', 
      value: totalPlayersValue, 
      change: `+${newPlayersThisWeek} this week`, 
      icon: Users, 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/10' 
    },
    { 
      label: 'Active Players', 
      value: currentOnlinePlayers, 
      change: serverStatus.online ? `${serverStatus.ping}ms latency` : 'Offline', 
      icon: Server, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/10' 
    },
    { 
      label: 'Website Visits', 
      value: visitsValue, 
      change: 'Lifetime metrics', 
      icon: Activity, 
      color: 'text-pink-400', 
      bg: 'bg-pink-500/10',
      action: {
        label: 'Reset Visits',
        handler: async () => {
          if (window.confirm('Are you sure you want to reset the website visits counter to 0?')) {
            try {
              await set(ref(db, 'siteData/visits'), 0);
              toast('Website visits counter reset successfully', 'success');
            } catch (error) {
              toast('Failed to reset visits counter', 'error');
            }
          }
        }
      }
    },
    { 
      label: 'Store Revenue', 
      value: totalRevenueValue, 
      change: `${approvedOrdersCount} paid orders`, 
      icon: DollarSign, 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/10' 
    },
  ];

  const quickActions = [
    { title: 'Edit Hero Section', desc: 'Update the main landing page content', icon: Image, link: '/admin/hero', color: 'from-purple-500 to-pink-600' },
    { title: 'Edit Rules', desc: 'Update the server rules', icon: ShieldCheck, link: '/admin/rules', color: 'from-purple-600 to-pink-500' },
    { title: 'Edit FAQ', desc: 'Update the FAQ content', icon: HelpCircle, link: '/admin/faq', color: 'from-pink-500 to-fuchsia-600' },
    { title: 'Manage Staff', desc: 'Add or edit staff members', icon: Users, link: '/admin/staff', color: 'from-purple-500 to-fuchsia-600' },
  ];

  // Combine player registrations and order activities into a system log
  const systemLogs: { msg: string; time: number; type: 'user' | 'order_pending' | 'order_approved' | 'order_rejected' }[] = [];

  users.forEach(u => {
    if (u.createdAt) {
      systemLogs.push({
        msg: `New player "${u.username}" registered`,
        time: u.createdAt,
        type: 'user'
      });
    }
  });

  orders.forEach(o => {
    if (o.createdAt) {
      let type: 'order_pending' | 'order_approved' | 'order_rejected' = 'order_pending';
      let statusLabel = 'ordered';
      if (o.status === 'adminap' || o.status === 'approved' || o.status === 'success') {
        type = 'order_approved';
        statusLabel = 'approved';
      } else if (o.status === 'adminrq' || o.status === 'pending') {
        type = 'order_pending';
        statusLabel = 'ordered';
      } else if (o.status === 'rejected') {
        type = 'order_rejected';
        statusLabel = 'declined';
      }

      systemLogs.push({
        msg: `Order #${o.id} of ₹${parseFloat(o.total || '0').toFixed(2)} ${statusLabel} by ${o.player || o.username || 'Player'}`,
        time: o.createdAt,
        type: type
      });
    }
  });

  // Take the 5 most recent activities
  const displayLogs = systemLogs
    .sort((a, b) => b.time - a.time)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-slate-400">Welcome back to the CrystalMC control center.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-2xl border border-slate-800/60 hover:border-slate-700 hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-all relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon size={48} className={stat.color} />
            </div>
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold text-white font-heading">{stat.value}</h3>
                {stat.action && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      stat.action.handler();
                    }}
                    className="text-[10px] font-bold text-pink-400 hover:text-pink-300 transition-colors mt-1.5 flex items-center gap-1 bg-pink-500/5 hover:bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/10 self-start active:scale-95"
                  >
                    {stat.action.label}
                  </button>
                )}
              </div>
              <span className={`text-xs font-semibold ${stat.color} ${stat.bg} px-2.5 py-1 rounded-full`}>
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 font-heading">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <Link
                to={action.link}
                className="block glass-card p-6 rounded-2xl border border-slate-800/60 hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] transition-all group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon size={20} className="text-slate-300 group-hover:text-white transition-colors" />
                  </div>
                  <ArrowRight size={18} className="text-slate-600 group-hover:text-pink-400 transition-colors group-hover:translate-x-1" />
                </div>
                <h4 className="text-md font-bold text-white mb-1">{action.title}</h4>
                <p className="text-slate-400 text-xs">{action.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent System Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card p-6 rounded-2xl border border-slate-800/60"
      >
        <h3 className="text-xl font-bold text-white mb-6 font-heading">Recent System Activity</h3>
        <div className="space-y-4">
          {displayLogs.length > 0 ? (
            displayLogs.map((log, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    log.type === 'user'
                      ? 'bg-blue-400'
                      : log.type === 'order_approved'
                      ? 'bg-emerald-400'
                      : log.type === 'order_rejected'
                      ? 'bg-rose-400'
                      : 'bg-cyan-400'
                  }`} />
                  <span className="text-slate-300 text-sm font-medium">{log.msg}</span>
                </div>
                <span className="text-slate-500 text-xs">{formatRelativeTime(log.time)}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500 text-sm">No recent system activities found in the database.</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
