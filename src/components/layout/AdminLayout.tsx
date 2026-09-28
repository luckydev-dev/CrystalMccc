import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { LayoutDashboard, Image, LogOut, Menu, X, Users, ShieldCheck, HelpCircle, Store, ShoppingBag, Settings, Ticket, Star, Bell, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { AdminHeaderProvider, useAdminHeader } from '../../context/AdminHeaderContext';
import { useToast } from '../../context/ToastContext';
import { PlayerAvatar } from '../common/PlayerAvatar';

const SidebarContent = ({ 
  isMobile = false, 
  location, 
  navItems, 
  user, 
  role, 
  userData,
  handleLogout, 
  setIsMobileMenuOpen 
}: { 
  isMobile?: boolean, 
  location: any, 
  navItems: any[], 
  user: any, 
  role: string | null, 
  userData?: any,
  handleLogout: () => void,
  setIsMobileMenuOpen: (open: boolean) => void
}) => (
  <>
    <div className="p-6 border-b border-slate-800/50">
      <div className="flex items-center gap-3">
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-xl overflow-hidden">
          <img 
            src="https://i.ibb.co/FLT58CqD/CM.png" 
            alt="CrystalMC Logo" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white font-heading tracking-tight">Admin Panel</h1>
          <p className="text-slate-400 text-xs font-medium">CrystalMC Network</p>
        </div>
      </div>
    </div>

    <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
      <p className="px-4 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 mt-2">Menu</p>
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
        
        return (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <Link
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-indigo-500/10 text-indigo-400 font-medium" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId={`activeNav-${isMobile ? 'mobile' : 'desktop'}`}
                  className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <motion.div
                initial={{ rotate: -15, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 300 }}
              >
                <Icon size={18} className={cn("transition-colors", isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
              </motion.div>
              {item.name}
            </Link>
          </motion.div>
        );
      })}
    </nav>

    <div className="p-4 border-t border-slate-800/50 bg-slate-900/20">
      <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800/50 flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 shadow-md flex items-center justify-center">
          <PlayerAvatar 
            username={userData?.username || user.displayName || user.email?.split('@')[0]} 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="overflow-hidden flex-1">
          <p className="text-sm font-bold text-white truncate">{userData?.username || user.displayName || user.email?.split('@')[0] || user.email}</p>
          <p className="text-xs text-indigo-400 capitalize font-medium">{role || 'Administrator'}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors group font-medium text-sm"
      >
        <LogOut size={16} className="text-red-400/70 group-hover:text-red-400 transition-colors" />
        Sign Out
      </button>
    </div>
  </>
);

function AdminLayoutContent() {
  const { user, role, userData, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { title, action } = useAdminHeader();
  const { toast } = useToast();

  const allNavItems = React.useMemo(() => [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, id: 'dashboard' },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag, id: 'orders' },
    { name: 'Promo Codes', path: '/admin/promo-codes', icon: Ticket, id: 'promo-codes' },
    { name: 'Hero Section', path: '/admin/hero', icon: Image, id: 'hero' },
    { name: 'Featured Store', path: '/admin/featured', icon: Star, id: 'featured' },
    { name: 'Rules', path: '/admin/rules', icon: ShieldCheck, id: 'rules' },
    { name: 'FAQ', path: '/admin/faq', icon: HelpCircle, id: 'faq' },
    { name: 'Vote', path: '/admin/vote', icon: Heart, id: 'vote' },
    { name: 'Store', path: '/admin/store', icon: Store, id: 'store' },
    { name: 'Staff', path: '/admin/staff', icon: Users, id: 'staff' },
    { name: 'Users', path: '/admin/users', icon: Users, id: 'users' },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell, id: 'notifications' },
    { name: 'Discord Webhook', path: '/admin/discord', icon: Settings, id: 'discord' },
    { name: 'Settings', path: '/admin/settings', icon: Settings, id: 'settings' },
  ], []);

  const navItems = React.useMemo(() => {
    return role === 'owner' 
      ? allNavItems 
      : allNavItems.filter(item => item.id === 'dashboard' || (userData?.permissions && userData.permissions.includes(item.id)));
  }, [role, userData?.permissions, allNavItems]);

  React.useEffect(() => {
    // Only redirect if loading is finished and we are sure there is no user or role
    if (!loading) {
      if (!user) {
        navigate('/admin/login');
      } else if (role !== 'admin' && role !== 'owner') {
        // If user exists but role is not admin/owner, and we've waited for loading
        toast('Access denied. Admin or Owner only.', 'error');
        signOut(auth).then(() => {
          navigate('/admin/login');
        });
      }
    }
  }, [user, role, loading, navigate, toast]);

  React.useEffect(() => {
    if (!loading && user && role === 'admin') {
      const currentPath = location.pathname;
      const isAllowed = navItems.some(item => currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path)));
      if (!isAllowed) {
        toast('You do not have permission to access this page.', 'error');
        navigate('/admin');
      }
    }
  }, [location.pathname, loading, user, role, navItems, navigate, toast]);

  if (loading) return null;

  if (!user || (role !== 'admin' && role !== 'owner')) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-red-500 w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-6">You don't have permission to view this page.</p>
          <button
            onClick={() => navigate('/admin/login')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold transition-colors"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut(auth);
    toast('Logged out successfully.', 'info');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans selection:bg-indigo-500/30">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 rounded-lg"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-[30.5px] w-[30.5px] items-center justify-center rounded-lg overflow-hidden">
              <img 
                src="https://i.ibb.co/FLT58CqD/CM.png" 
                alt="CrystalMC Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center">
          {action}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-slate-900 border-r border-slate-800 z-50 flex flex-col md:hidden shadow-2xl"
            >
              <SidebarContent 
                isMobile={true} 
                location={location} 
                navItems={navItems} 
                user={user} 
                role={role} 
                userData={userData}
                handleLogout={handleLogout} 
                setIsMobileMenuOpen={setIsMobileMenuOpen} 
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[280px] bg-slate-900/80 backdrop-blur-2xl border-r border-slate-800/60 flex-col sticky top-0 h-screen shrink-0 shadow-2xl">
        <SidebarContent 
          isMobile={false} 
          location={location} 
          navItems={navItems} 
          user={user} 
          role={role} 
          userData={userData}
          handleLogout={handleLogout} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 md:h-screen overflow-hidden bg-slate-950 relative">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* Unified Top Header (Desktop) */}
        <header className="hidden md:flex h-20 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl items-center justify-between px-6 md:px-10 shrink-0 relative z-30 shadow-sm">
          <h2 className="text-2xl font-bold text-white font-heading">{title}</h2>
          <div className="flex items-center gap-4">
            {action}
          </div>
        </header>

        {/* Mobile Title (since header is hidden) */}
        <div className="md:hidden px-4 pt-6 pb-2">
          <h2 className="text-2xl font-bold text-white font-heading">{title}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export function AdminLayout() {
  return (
    <AdminHeaderProvider>
      <AdminLayoutContent />
    </AdminHeaderProvider>
  );
}
