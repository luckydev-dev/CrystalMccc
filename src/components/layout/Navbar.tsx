import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimate, type Variants } from 'motion/react';
import { Menu, X, Copy, Check, ChevronRight, LogOut, Swords } from 'lucide-react';
import { HouseIcon, ShoppingCartIcon, ShieldCheckIcon, BookOpenTextIcon, InfoIcon, UsersIcon, HeartIcon, LoginIcon } from '@animateicons/react/lucide';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { AnimatedIconOnScroll } from '../ui/AnimatedIconOnScroll';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { PlayerAvatar } from '../common/PlayerAvatar';

export function Navbar() {
  const [scope, animate] = useAnimate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasScrolledOnce, setHasScrolledOnce] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const { items, toggleCart } = useCart();
  const { user, userData, openAuthModal } = useAuth();

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const serverIPDisplay = "PLAY.CRYSTALMC.FUN";
  const serverIPCopy = "play.crystalmc.fun";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let ticking = false;
    let lastScrolled = window.scrollY > 35;
    if (lastScrolled) {
      setIsScrolled(true);
      setHasScrolledOnce(true);
    }

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          let newScrolled = lastScrolled;
          if (y > 35) {
            newScrolled = true;
          } else if (y < 15) {
            newScrolled = false;
          }

          if (newScrolled !== lastScrolled) {
            lastScrolled = newScrolled;
            setIsScrolled(newScrolled);
            setHasScrolledOnce(true);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger staggered pop animation every single time header transitions between normal and sticky
  useEffect(() => {
    if (!hasScrolledOnce || !scope.current) return;

    if (isMobile) {
      const items = [
        { sel: '.header-pop-logo-icon', delay: 0.02 },
        { sel: '.header-pop-logo-text', delay: 0.14 },
        { sel: '.header-pop-cart', delay: 0.26 },
        { sel: '.header-pop-menu', delay: 0.38 },
      ];
      items.forEach(({ sel, delay }) => {
        try {
          animate(
            sel,
            { scale: [1, 1.18, 1], y: [0, -8, 0] },
            { duration: 0.5, delay, ease: [0.34, 1.3, 0.64, 1] }
          );
        } catch {
          // ignore selector not found
        }
      });
    } else {
      const items = [
        { sel: '.header-pop-logo-icon', delay: 0.02 },
        { sel: '.header-pop-logo-text', delay: 0.10 },
        { sel: '.header-pop-nav-0', delay: 0.18 },
        { sel: '.header-pop-nav-1', delay: 0.25 },
        { sel: '.header-pop-nav-2', delay: 0.32 },
        { sel: '.header-pop-nav-3', delay: 0.39 },
        { sel: '.header-pop-nav-4', delay: 0.46 },
        { sel: '.header-pop-nav-5', delay: 0.53 },
        { sel: '.header-pop-nav-6', delay: 0.60 },
        { sel: '.header-pop-nav-7', delay: 0.67 },
        { sel: '.header-pop-cart', delay: 0.74 },
        { sel: '.header-pop-profile', delay: 0.82 },
      ];
      items.forEach(({ sel, delay }) => {
        try {
          animate(
            sel,
            { scale: [1, 1.18, 1], y: [0, -8, 0] },
            { duration: 0.5, delay, ease: [0.34, 1.3, 0.64, 1] }
          );
        } catch {
          // ignore selector not found
        }
      });
    }
  }, [isScrolled, hasScrolledOnce, isMobile, animate, scope]);

  const handleCopyIP = () => {
    navigator.clipboard.writeText(serverIPCopy);
    setCopied(true);
    toast('Server IP copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast('Logged out successfully.', 'info');
  };

  const navLinks = [
    { name: 'Home', href: '/', icon: HouseIcon },
    { name: 'Store', href: '/store', icon: ShoppingCartIcon },
    { name: 'Game Modes', href: '/gamemodes', icon: Swords },
    { name: 'Rules', href: '/rules', icon: ShieldCheckIcon },
    { name: 'Vote', href: '/vote', icon: HeartIcon },
    { name: 'FAQ', href: '/faq', icon: InfoIcon },
    { name: 'Staff', href: '/staff', icon: UsersIcon },
    { name: 'Track Order', href: '/track', icon: BookOpenTextIcon },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0, height: 0, y: -10 },
    visible: {
      opacity: 1,
      height: 'auto',
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      y: -10,
      transition: {
        duration: 0.2,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <>
        <header
          ref={scope}
          className={cn(
            "fixed z-50 left-0 right-0 top-0 w-full sticky-header-container flex justify-center pointer-events-none select-none",
            isScrolled ? "px-4 pt-3 md:pt-4" : "px-4 pt-0"
          )}
        >
          <div
            className={cn(
              'w-full mx-auto sticky-header-inner relative transform-gpu pointer-events-auto flex items-center justify-between',
              isScrolled 
                ? 'max-w-6xl xl:max-w-7xl py-2.5 px-4 md:px-6 rounded-2xl md:rounded-[2.2rem]' 
                : 'max-w-7xl py-5 px-4 md:px-6 rounded-none'
            )}
          >
            {/* Sticky glass background that materializes around elements in sticky mode and dematerializes first when returning to normal */}
            <motion.div
              className="absolute inset-0 rounded-2xl md:rounded-[2.2rem] bg-slate-900/90 backdrop-blur-md md:backdrop-blur-xl border border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.6)] shadow-purple-500/10 pointer-events-none -z-10 will-change-transform"
              initial={false}
              animate={{
                opacity: isScrolled ? 1 : 0,
                scale: isScrolled ? 1 : 0.98,
              }}
              transition={{
                duration: isScrolled ? 0.55 : 0.28,
                delay: isScrolled ? (isMobile ? 0.48 : 0.92) : 0,
                ease: [0.25, 1, 0.5, 1] as const,
              }}
            />

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="header-pop-logo-icon relative flex h-[38px] w-[38px] items-center justify-center rounded-xl overflow-hidden transition-all duration-300 shrink-0">
                <img 
                  src="https://i.ibb.co/FLT58CqD/CM.png" 
                  alt="CrystalMC Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="header-pop-logo-text font-minecraft font-normal text-lg md:text-xl tracking-wider text-white shrink-0">
                Crystal<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">MC</span>
              </span>
            </Link>

            {/* Desktop Navigation with slow, smooth staggered pop items */}
            <nav className="hidden md:flex items-center gap-0.5 md:gap-1 lg:gap-1.5 xl:gap-2 shrink-0">
              {navLinks.map((link, idx) => (
                <div
                  key={link.name}
                  className={`header-pop-nav-${idx} shrink-0`}
                >
                  <Link
                    to={link.href}
                    className={cn(
                      "relative flex items-center text-xs xl:text-sm font-semibold xl:font-bold transition-all group px-2 xl:px-2.5 py-1.5 rounded-lg hover:bg-slate-800/50 whitespace-nowrap",
                      location.pathname === link.href 
                        ? "text-purple-400 bg-purple-500/10" 
                        : "text-slate-300 hover:text-white"
                    )}
                    title={link.name}
                  >
                    <span>{link.name}</span>
                    {location.pathname === link.href && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                    )}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Header Actions & Toggle */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <button
                onClick={toggleCart}
                className="header-pop-cart relative p-2 text-slate-300 hover:text-white transition-colors group shrink-0"
                aria-label="View Shopping Cart"
              >
                <div className="w-6 h-6 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <AnimatedIconOnScroll icon={ShoppingCartIcon} size={24} className="text-slate-300 group-hover:text-purple-400 transition-colors" />
                </div>
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center transform scale-100 group-hover:scale-110 transition-transform">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Profile Dropdown (Desktop) */}
              <div className="header-pop-profile hidden md:block relative shrink-0">
                {user ? (
                  <>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-700/80 overflow-hidden hover:border-purple-400 transition-colors cursor-pointer bg-slate-800 shrink-0 shadow-sm"
                      title={userData?.username || user.displayName || user.email?.split('@')[0] || 'Steve'}
                    >
                      <PlayerAvatar 
                        username={userData?.username || user.displayName || user.email?.split('@')[0]} 
                        className="w-full h-full object-cover" 
                      />
                    </button>

                    <AnimatePresence>
                      {isProfileDropdownOpen && (
                        <>
                          {/* Invisible click-away overlay */}
                          <div 
                            className="fixed inset-0 z-40 cursor-default" 
                            onClick={() => setIsProfileDropdownOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2.5 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 flex flex-col gap-2"
                          >
                            <div className="px-2 py-1.5 border-b border-slate-800 pb-2 mb-1">
                              <p className="text-slate-500 text-[10px] tracking-wider uppercase font-bold">Logged in as</p>
                              <p className="font-bold text-white text-sm truncate">{userData?.username || 'Player'}</p>
                              {userData?.coins !== undefined && (
                                <p className="text-purple-400 text-xs font-semibold mt-0.5">🪙 {userData.coins} Coins</p>
                              )}
                            </div>
                            <button
                              onClick={async () => {
                                setIsProfileDropdownOpen(false);
                                await handleLogout();
                              }}
                              className="flex items-center gap-2 w-full text-left text-xs font-semibold px-2 py-2 text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            >
                              <LogOut size={14} className="text-rose-500" />
                              <span>Sign Out</span>
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <button
                    onClick={openAuthModal}
                    className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-700 bg-purple-600 hover:bg-purple-500 hover:border-purple-400 text-white transition-colors group cursor-pointer shadow-lg shadow-purple-600/20 shrink-0"
                    title="Login"
                  >
                    <AnimatedIconOnScroll icon={LoginIcon} size={18} className="text-white" />
                  </button>
                )}
              </div>

              <button
                className="header-pop-menu p-2 text-slate-300 hover:text-white transition-colors md:hidden shrink-0"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
        </div>
      </header>

      {/* Navigation Modal / Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[70] flex justify-center items-start pt-[70px] md:pt-[120px] pb-4 px-4 overflow-y-auto pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 md:bg-black/60 md:backdrop-blur-sm pointer-events-auto"
            />

            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { y: -20, opacity: 0, scale: 0.95 },
                visible: { 
                  y: 0, 
                  opacity: 1, 
                  scale: 1,
                  transition: { 
                    type: 'spring', damping: 25, stiffness: 200,
                    staggerChildren: 0.05,
                    delayChildren: 0.1
                  }
                },
                exit: { y: -20, opacity: 0, scale: 0.95 }
              }}
              className="relative w-full max-w-[320px] md:max-w-[600px] bg-slate-900 border border-slate-800 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] shadow-purple-500/10 flex flex-col p-4 md:p-8 rounded-3xl md:rounded-[2.5rem] z-10 pointer-events-auto"
            >
              <div className="flex justify-end mb-2 md:mb-4">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 md:p-3 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl md:rounded-2xl transition-all group z-20"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:scale-110 group-hover:rotate-90" />
                </button>
              </div>

              <div className="flex flex-col gap-1 md:gap-2 flex-1">
                {navLinks.map((link) => (
                  <motion.div key={link.name} variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}>
                    <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 md:gap-6 text-sm md:text-lg font-medium transition-all py-3 px-3 md:p-5 rounded-2xl md:rounded-3xl group",
                      location.pathname === link.href 
                        ? "bg-purple-500/10 text-purple-400 shadow-[inset_0_0_20px_rgba(168,85,247,0.05)] border border-purple-500/20" 
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50"
                    )}
                  >
                    <div className="w-5 h-5 md:w-8 md:h-8 flex items-center justify-center shrink-0">
                      <AnimatedIconOnScroll 
                        icon={link.icon} 
                        size={typeof window !== 'undefined' && window.innerWidth >= 768 ? 24 : 20} 
                        className={location.pathname === link.href ? "text-purple-400" : "text-slate-400 group-hover:text-purple-400 transition-colors"} 
                      />
                    </div>
                    <span className="text-sm md:text-xl font-bold">{link.name}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="h-px bg-slate-800 my-4 md:my-8" />
              
              <motion.div variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col gap-4">
                {user ? (
                  <div className="flex items-center justify-between px-4 py-3 md:p-5 bg-slate-800/50 rounded-2xl md:rounded-3xl border border-slate-700">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 shadow-md">
                        <PlayerAvatar 
                          username={userData?.username || user.displayName || user.email?.split('@')[0]} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <p className="text-base md:text-lg font-bold text-white">{userData?.username || user.displayName || user.email?.split('@')[0] || 'Player'}</p>
                        <p className="text-sm text-slate-400 font-medium">Logged in</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="p-3 md:p-4 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl md:rounded-2xl transition-all hover:scale-105"
                      title="Logout"
                    >
                      <LogOut size={24} className="md:w-7 md:h-7" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal();
                    }}
                    className="flex items-center justify-center gap-2 w-full py-4 md:py-5 rounded-2xl md:rounded-3xl bg-purple-600 hover:bg-purple-500 text-base md:text-lg font-bold text-white transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-500/40 hover:-translate-y-1"
                  >
                    Login / Signup
                  </button>
                )}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
