import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageTransition } from '../components/utils/PageTransition';
import { 
  ShoppingCart, 
  ChevronDown, 
  Tag, 
  ArrowRight, 
  Check, 
  Heart, 
  Trophy, 
  Flame, 
  Swords, 
  Compass
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { SEOHead } from '../components/seo/SEOHead';
import { 
  SparklesIcon, 
  PackageOpenIcon, 
  KeyIcon, 
  HandCoinsIcon, 
  ShieldCheckIcon, 
  StarIcon 
} from '@animateicons/react/lucide';
import { 
  useData, 
  StoreGameModeId, 
  STORE_GAME_MODES, 
  normalizeStoreData, 
  StoreProduct 
} from '../context/DataContext';
import { DEFAULT_CATEGORIES_BY_MODE } from '../lib/storeConfig';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

const CATEGORY_ICONS: Record<string, any> = {
  Ranks: SparklesIcon,
  Kits: PackageOpenIcon,
  'Kits & Presets': PackageOpenIcon,
  Keys: KeyIcon,
  Money: HandCoinsIcon,
  'Claim Blocks': ShieldCheckIcon,
  Tags: StarIcon,
  'Hearts & Revives': Heart,
  'Arena Passes': Trophy,
  Cosmetics: Flame,
};

const MODE_ICONS: Record<StoreGameModeId, any> = {
  survival: Compass,
  lifesteal: Heart,
  pvp: Swords,
};

function CategoryAnimatedIcon({ icon: Icon, className, size = 18 }: { icon: any; className?: string; size?: number }) {
  const iconRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      iconRef.current?.startAnimation?.();
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  if (!Icon) return <Tag className={className} size={size} />;

  // Lucide standard component vs Animated icon check
  if (Icon === Heart || Icon === Trophy || Icon === Flame || Icon === Swords || Icon === Compass) {
    const Component = Icon;
    return <Component className={className} size={size} />;
  }

  return (
    <div
      onMouseEnter={() => {
        iconRef.current?.startAnimation?.();
      }}
      className={`flex items-center justify-center shrink-0 ${className || ''}`}
    >
      <Icon ref={iconRef} className={className} size={size} />
    </div>
  );
}

export function Store() {
  const { data } = useData();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read game mode from query parameter (e.g. ?mode=lifesteal)
  const urlMode = searchParams.get('mode') as StoreGameModeId | null;
  const initialMode: StoreGameModeId = (urlMode === 'survival' || urlMode === 'lifesteal' || urlMode === 'pvp')
    ? urlMode
    : 'survival';

  const [activeGameMode, setActiveGameMode] = useState<StoreGameModeId>(initialMode);
  const [activeCategory, setActiveCategory] = useState<string>('Ranks');
  
  const [isGameModeDropdownOpen, setIsGameModeDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const gameModeDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Sync mode with URL if param changes externally
  useEffect(() => {
    const modeFromUrl = searchParams.get('mode') as StoreGameModeId | null;
    if (modeFromUrl && (modeFromUrl === 'survival' || modeFromUrl === 'lifesteal' || modeFromUrl === 'pvp')) {
      if (modeFromUrl !== activeGameMode) {
        setActiveGameMode(modeFromUrl);
      }
    }
  }, [searchParams]);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (gameModeDropdownRef.current && !gameModeDropdownRef.current.contains(e.target as Node)) {
        setIsGameModeDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedStore = normalizeStoreData(data.store);
  const currentModeStore = normalizedStore[activeGameMode] || {};
  
  // Only display categories that contain at least 1 product
  const categories = Object.keys(currentModeStore).filter((cat) => {
    const items = currentModeStore[cat];
    return Array.isArray(items) && items.length > 0;
  });

  // Ensure active category is valid when switching game modes or when categories change
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(activeCategory)) {
      setActiveCategory(categories[0]);
    }
  }, [activeGameMode, categories, activeCategory]);

  const currentProducts: StoreProduct[] = currentModeStore[activeCategory] || [];
  const activeModeMeta = STORE_GAME_MODES.find(m => m.id === activeGameMode) || STORE_GAME_MODES[0];
  const ActiveGameModeIcon = MODE_ICONS[activeGameMode] || Compass;

  const handleSelectGameMode = (mode: StoreGameModeId) => {
    setActiveGameMode(mode);
    setIsGameModeDropdownOpen(false);
    setSearchParams({ mode }, { replace: true });
  };

  const handleAddToCart = (product: StoreProduct) => {
    const itemToAdd: StoreProduct = {
      ...product,
      gameMode: product.gameMode || activeGameMode,
      server: product.server || product.gameMode || activeGameMode
    };
    addToCart(itemToAdd);
    toast(`Added ${product.name} to cart!`, 'success');
  };

  return (
    <PageTransition>
      <SEOHead
        title={`${activeModeMeta.name} Store`}
        description={`Official CrystalMC ${activeModeMeta.name} Store. Purchase custom Minecraft ranks, crate keys, claim blocks, money, and kits. Instant delivery.`}
      />
      <div className="pt-32 pb-20 min-h-screen relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none"></div>
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-20 h-20 mx-auto bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 shadow-[0_0_25px_rgba(168,85,247,0.15)]"
            >
              <ShoppingCart size={40} className="text-purple-400" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-heading font-bold text-white mb-5 tracking-tight"
            >
              Server <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-400 font-extrabold">Store</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 text-lg max-w-2xl mx-auto"
            >
              Select your game mode and category below to browse exclusive perks, rank packages, and items.
            </motion.p>
          </div>

          {/* Store Layout with Sidebar on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto items-start">
            
            {/* Left Column: Dropdowns & Navigation */}
            <div className="lg:col-span-1 space-y-4">
              
              {/* 1. Game Mode Dropdown */}
              <div className="relative z-30" ref={gameModeDropdownRef}>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-0.5">
                  Game Mode
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsGameModeDropdownOpen(!isGameModeDropdownOpen);
                    setIsCategoryDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl text-white transition-all text-sm shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={activeModeMeta.iconUrl} alt="" className="w-5 h-5 object-contain shrink-0" />
                    <span className="font-medium truncate">{activeModeMeta.name}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isGameModeDropdownOpen ? 'rotate-180 text-purple-400' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {isGameModeDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsGameModeDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.12 }}
                        className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-xl z-30 space-y-0.5"
                      >
                        {STORE_GAME_MODES.map((mode) => {
                          const isSelected = activeGameMode === mode.id;

                          return (
                            <button
                              key={mode.id}
                              onClick={() => handleSelectGameMode(mode.id)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm text-left ${
                                isSelected
                                  ? 'bg-purple-600/20 text-purple-300 font-medium'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <img src={mode.iconUrl} alt="" className="w-5 h-5 object-contain shrink-0" />
                                <span>{mode.name}</span>
                              </div>
                              {isSelected && <Check size={15} className="text-purple-400" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. Mobile Category Dropdown */}
              <div className="lg:hidden relative z-20" ref={categoryDropdownRef}>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-0.5">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                    setIsGameModeDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl text-white transition-all text-sm shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CategoryAnimatedIcon icon={CATEGORY_ICONS[activeCategory]} size={16} className="text-purple-400 shrink-0" />
                    <span className="font-medium truncate">{activeCategory === 'Tags' ? 'Server Tags' : activeCategory}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isCategoryDropdownOpen ? 'rotate-180 text-purple-400' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {isCategoryDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsCategoryDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.12 }}
                        className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-xl z-20 space-y-0.5 max-h-64 overflow-y-auto custom-scrollbar"
                      >
                        {categories.map(category => {
                          const Icon = CATEGORY_ICONS[category];
                          const isActive = activeCategory === category;
                          return (
                            <button
                              key={category}
                              onClick={() => {
                                setActiveCategory(category);
                                setIsCategoryDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                                isActive
                                  ? 'bg-purple-600/20 text-purple-300 font-medium'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <CategoryAnimatedIcon icon={Icon} size={16} className={isActive ? 'text-purple-400' : 'text-slate-400'} />
                                <span>{category === 'Tags' ? 'Server Tags' : category}</span>
                              </div>
                              {isActive && <Check size={15} className="text-purple-400" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop Category Sidebar */}
              <div className="hidden lg:block sticky top-28 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-2.5 shadow-lg space-y-1">
                <div className="px-2.5 py-1.5 mb-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Categories
                  </h3>
                </div>
                {categories.map(category => {
                  const Icon = CATEGORY_ICONS[category];
                  const isActive = activeCategory === category;
                  const count = (currentModeStore[category] || []).length;
                  return (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30 font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CategoryAnimatedIcon icon={Icon} size={16} className={isActive ? 'text-purple-300' : 'text-slate-500'} />
                        <span>{category === 'Tags' ? 'Server Tags' : category}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${isActive ? 'bg-purple-500/30 text-purple-200' : 'bg-slate-800 text-slate-500'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Right Column: Active Realm Banner & Products Grid */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Realm Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-heading font-bold text-white">
                    {activeCategory === 'Tags' ? 'Server Tags' : activeCategory}
                  </h2>
                  <span className="text-xs text-slate-400 font-medium">· {activeModeMeta.name}</span>
                </div>
                <span className="text-xs text-slate-400">
                  <strong className="text-white font-medium">{currentProducts.length}</strong> {currentProducts.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {currentProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -15 }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                      className={`glass-card p-6 rounded-3xl border ${product.border} relative group hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl`}
                    >
                      <div className={`absolute top-0 right-0 w-28 h-28 ${product.bg} rounded-bl-full -z-10 opacity-40 group-hover:opacity-80 transition-opacity`}></div>
                      
                      {/* Realm Tag on Card */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeModeMeta.borderColor} ${activeModeMeta.bgTint}`}>
                          {activeModeMeta.shortName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {activeCategory === 'Tags' ? 'Tag' : activeCategory}
                        </span>
                      </div>

                      {product.image ? (
                        <div className="mb-6 h-28 relative flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-500">
                          <div className={`absolute inset-0 ${product.bg} blur-xl opacity-30 rounded-full scale-75 group-hover:scale-100 transition-transform duration-500`}></div>
                          <img src={product.image} alt={product.name} className="relative z-10 max-h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]" referrerPolicy="no-referrer" />
                        </div>
                      ) : (
                        <div className={`w-14 h-14 rounded-2xl ${product.bg} flex items-center justify-center mb-6 border ${product.border} shrink-0 shadow-lg`}>
                          <Tag className={`w-7 h-7 ${product.color}`} />
                        </div>
                      )}
                      
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-1.5 font-heading">{product.name}</h3>
                        <div className="flex items-baseline gap-1.5 mb-4">
                          <span className={`text-2xl font-extrabold ${product.color}`}>₹{product.price.toFixed(2)}</span>
                          <span className="text-slate-500 font-medium text-xs">INR</span>
                        </div>
                        
                        <div className="text-slate-300 mb-6 leading-relaxed text-xs space-y-1.5 min-h-[50px] flex-1">
                          {(() => {
                            const lines = (product.description || '').split('\n').filter(Boolean);
                            const visibleLines = lines.slice(0, 3);
                            const hiddenCount = lines.length - 3;
                            return (
                              <>
                                {visibleLines.map((line: string, i: number) => {
                                  const cleanedLine = line.replace(/^\s*[•\-\*]\s*/, '');
                                  return (
                                    <div key={i} className="flex items-start gap-2">
                                      <span className={`w-1.5 h-1.5 rounded-full ${product.color ? product.color.replace('text-', 'bg-') : 'bg-purple-400'} mt-1 shrink-0`} />
                                      <span className="flex-1 text-left line-clamp-1">{cleanedLine}</span>
                                    </div>
                                  );
                                })}
                                {hiddenCount > 0 && (
                                  <div className="mt-1 text-purple-400 font-semibold text-[11px] text-left">+{hiddenCount} more perks</div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className={`w-full py-3 rounded-xl font-bold text-white text-xs transition-all flex items-center justify-center gap-2 ${product.bg.replace('/10', '/80')} hover:${product.bg.replace('/10', '')} border ${product.border} shadow-md hover:shadow-xl active:scale-95`}
                      >
                        Add to Cart
                        <ArrowRight size={15} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {currentProducts.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 glass-card rounded-3xl border border-slate-800 max-w-xl mx-auto"
                >
                  <ShoppingCart size={48} className="mx-auto text-slate-600 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Products Available</h3>
                  <p className="text-slate-400 text-sm">
                    There are currently no products in {activeModeMeta.name} for this category. Check back later or select another category!
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
