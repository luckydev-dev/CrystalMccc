import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence } from 'motion/react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Store } from './pages/Store';
import { GameModes } from './pages/GameModes';
import { Rules } from './pages/Rules';
import { FAQ } from './pages/FAQ';
import { Staff } from './pages/Staff';
import { OrderSuccess } from './pages/OrderSuccess';
import { TrackOrder } from './pages/TrackOrder';
import { NotFound } from './pages/NotFound';
import { ScrollToTop } from './components/utils/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AdminLayout } from './components/layout/AdminLayout';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { HeroEditor } from './pages/admin/HeroEditor';
import { RulesEditor } from './pages/admin/RulesEditor';
import { FAQEditor } from './pages/admin/FAQEditor';
import { StoreEditor } from './pages/admin/StoreEditor';
import { StaffEditor } from './pages/admin/StaffEditor';
import { Orders } from './pages/admin/Orders';
import { SettingsEditor } from './pages/admin/SettingsEditor';
import { PromoCodes } from './pages/admin/PromoCodes';
import { FeaturedProductsEditor } from './pages/admin/FeaturedProducts';
import { Users } from './pages/admin/Users';
import { Notifications } from './pages/admin/Notifications';
import { DiscordWebhook } from './pages/admin/DiscordWebhook';
import { VoteEditor } from './pages/admin/VoteEditor';
import { Vote } from './pages/Vote';
import { SEOHead } from './components/seo/SEOHead';

import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { CartSidebar } from './components/shop/CartSidebar';
import { AuthModal } from './components/auth/AuthModal';
import { SubscriptionPrompt } from './components/notifications/SubscriptionPrompt';
import { EnchantedRealmIntro } from './components/onboarding/EnchantedRealmIntro';
import { BackgroundMusic } from './components/common/BackgroundMusic';
import { useData } from './context/DataContext';
import { useAuth } from './context/AuthContext';
import { motion } from 'motion/react';

function GlobalLoader() {
  const { loading: dataLoading } = useData();
  const { loading: authLoading } = useAuth();
  const loading = dataLoading || authLoading;

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[1000] select-none"
        >
          <div className="flex flex-col items-center gap-5">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 bg-slate-900/60 p-2 flex items-center justify-center"
            >
              <img 
                src="https://i.ibb.co/FLT58CqD/CM.png" 
                alt="CrystalMC Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            <div className="flex flex-col items-center gap-3">
              <h2 className="text-white font-heading font-bold text-lg tracking-tight">
                Crystal<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-extrabold">MC</span>
              </h2>

              {/* Minimalist sleek progress bar */}
              <div className="w-28 h-0.5 bg-slate-800/80 rounded-full overflow-hidden relative">
                <motion.div 
                  className="h-full w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full absolute"
                  animate={{ x: [-48, 112] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      {/* @ts-ignore - React Router types sometimes complain about key, but AnimatePresence requires it */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/store" element={<Store />} />
        <Route path="/gamemodes" element={<GameModes />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 overflow-x-hidden">
      <SEOHead />
      <EnchantedRealmIntro />
      <Navbar />
      <main className="flex-grow">
        <AnimatedRoutes />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <CartProvider>
          <AuthProvider>
            <DataProvider>
              <Router>
                <GlobalLoader />
                <ScrollToTop />
                <CartSidebar />
                <AuthModal />
                <SubscriptionPrompt />
                <BackgroundMusic />
                <Routes>
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<Login />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="promo-codes" element={<PromoCodes />} />
                    <Route path="hero" element={<HeroEditor />} />
                    <Route path="featured" element={<FeaturedProductsEditor />} />
                    <Route path="rules" element={<RulesEditor />} />
                    <Route path="faq" element={<FAQEditor />} />
                    <Route path="vote" element={<VoteEditor />} />
                    <Route path="store" element={<StoreEditor />} />
                    <Route path="staff" element={<StaffEditor />} />
                    <Route path="users" element={<Users />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="discord" element={<DiscordWebhook />} />
                    <Route path="settings" element={<SettingsEditor />} />
                  </Route>

                  {/* Public Routes */}
                  <Route path="/*" element={<PublicLayout />} />
                </Routes>
              </Router>
            </DataProvider>
          </AuthProvider>
        </CartProvider>
      </ToastProvider>
    </HelmetProvider>
  );
}
