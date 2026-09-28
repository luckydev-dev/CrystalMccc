import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  Crown, 
  Package, 
  Key, 
  Banknote, 
  Shield, 
  Check, 
  Heart, 
  Trophy, 
  Sparkles, 
  Swords, 
  Compass, 
  Flame
} from 'lucide-react';
import { 
  useData, 
  StoreProduct, 
  MultiModeStoreData, 
  StoreGameModeId, 
  STORE_GAME_MODES, 
  normalizeStoreData 
} from '../../context/DataContext';
import { DEFAULT_CATEGORIES_BY_MODE } from '../../lib/storeConfig';
import { useAdminHeader } from '../../context/AdminHeaderContext';
import { useToast } from '../../context/ToastContext';
import { ref, set } from 'firebase/database';
import { db } from '../../lib/firebase';

const CATEGORY_ICONS: Record<string, any> = {
  Ranks: Crown,
  Kits: Package,
  'Kits & Presets': Package,
  Keys: Key,
  Money: Banknote,
  'Claim Blocks': Shield,
  Tags: Tag,
  'Hearts & Revives': Heart,
  'Arena Passes': Trophy,
  Cosmetics: Sparkles,
};

const MODE_ICONS: Record<StoreGameModeId, any> = {
  survival: Compass,
  lifesteal: Heart,
  pvp: Swords,
};

const COLORS = [
  { name: 'Red', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { name: 'Rose', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  { name: 'Orange', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { name: 'Yellow', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  { name: 'Green', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { name: 'Cyan', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { name: 'Blue', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { name: 'Indigo', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { name: 'Purple', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { name: 'Fuchsia', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20' },
];

export function StoreEditor() {
  const { data } = useData();
  const { setTitle, setAction } = useAdminHeader();
  const { toast } = useToast();
  
  const [multiStoreData, setMultiStoreData] = useState<MultiModeStoreData>(() => normalizeStoreData(data.store));
  const [activeGameMode, setActiveGameMode] = useState<StoreGameModeId>('survival');
  const [activeCategory, setActiveCategory] = useState<string>('Ranks');
  
  const [isGameModeDropdownOpen, setIsGameModeDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);

  // Sync with incoming server data
  useEffect(() => {
    if (data.store) {
      setMultiStoreData(normalizeStoreData(data.store));
    }
  }, [data.store]);

  // Available categories for the currently active game mode
  const currentModeStore = multiStoreData[activeGameMode] || {};
  const defaultModeCategories = DEFAULT_CATEGORIES_BY_MODE[activeGameMode] || ['Ranks'];
  const availableCategories = Array.from(new Set([
    ...defaultModeCategories,
    ...Object.keys(currentModeStore).filter((cat) => {
      const items = currentModeStore[cat];
      return Array.isArray(items) && items.length > 0;
    })
  ]));

  // Ensure active category is valid when switching game modes
  useEffect(() => {
    if (!availableCategories.includes(activeCategory)) {
      setActiveCategory(availableCategories[0] || 'Ranks');
    }
  }, [activeGameMode]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await set(ref(db, 'siteData/store'), multiStoreData);
      toast('Store data saved successfully across all game modes!', 'success');
    } catch (error) {
      console.error("Error saving store data:", error);
      toast('Failed to save store data.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setTitle('Store Management');
    setAction(
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isSaving ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          'Save All Modes'
        )}
      </button>
    );
    return () => setAction(null);
  }, [multiStoreData, isSaving, setTitle, setAction]);

  const currentProducts = currentModeStore[activeCategory] || [];

  const handleAddProduct = () => {
    const newProduct: StoreProduct = {
      id: `${activeGameMode}_${Date.now()}`,
      name: 'New Product',
      price: 99,
      description: '• Product perk or description\n• Instant delivery',
      color: COLORS[4].color,
      bg: COLORS[4].bg,
      border: COLORS[4].border,
      commands: '',
      gameMode: activeGameMode,
    };
    
    setMultiStoreData(prev => ({
      ...prev,
      [activeGameMode]: {
        ...prev[activeGameMode],
        [activeCategory]: [...(prev[activeGameMode]?.[activeCategory] || []), newProduct]
      }
    }));
    setEditingProduct(newProduct);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setMultiStoreData(prev => ({
        ...prev,
        [activeGameMode]: {
          ...prev[activeGameMode],
          [activeCategory]: (prev[activeGameMode]?.[activeCategory] || []).filter(p => p.id !== id)
        }
      }));
      toast('Product deleted.', 'info');
    }
  };

  const handleUpdateProduct = (updated: StoreProduct) => {
    setMultiStoreData(prev => ({
      ...prev,
      [activeGameMode]: {
        ...prev[activeGameMode],
        [activeCategory]: (prev[activeGameMode]?.[activeCategory] || []).map(p => p.id === updated.id ? updated : p)
      }
    }));
    setEditingProduct(null);
    toast('Product updated.', 'success');
  };

  const handleMoveProduct = (index: number, direction: 'up' | 'down') => {
    const list = [...(multiStoreData[activeGameMode]?.[activeCategory] || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setMultiStoreData(prev => ({
      ...prev,
      [activeGameMode]: {
        ...prev[activeGameMode],
        [activeCategory]: list
      }
    }));
  };

  const currentActiveModeMeta = STORE_GAME_MODES.find(m => m.id === activeGameMode) || STORE_GAME_MODES[0];
  const ActiveModeIcon = MODE_ICONS[activeGameMode] || Compass;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Store Catalog</h2>
        <p className="text-slate-400 text-sm mt-0.5">Select a game mode and category to manage products</p>
      </div>

      {/* Clean Minimalist Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Game Mode Dropdown */}
        <div className="relative z-30">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Game Mode
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsGameModeDropdownOpen(!isGameModeDropdownOpen);
                setIsCategoryDropdownOpen(false);
              }}
              className="w-full bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl px-3.5 py-2.5 text-white transition-all flex items-center justify-between text-sm shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img src={currentActiveModeMeta.iconUrl} alt="" className="w-5 h-5 object-contain shrink-0" />
                <span className="font-medium truncate">{currentActiveModeMeta.name}</span>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform shrink-0 ml-2 ${isGameModeDropdownOpen ? 'rotate-180 text-indigo-400' : ''}`} />
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
                    className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-30 p-1 space-y-0.5"
                  >
                    {STORE_GAME_MODES.map(mode => {
                      const isSelected = activeGameMode === mode.id;

                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => {
                            setActiveGameMode(mode.id);
                            setIsGameModeDropdownOpen(false);
                            setEditingProduct(null);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                            isSelected ? 'bg-indigo-600/20 text-indigo-300 font-medium' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img src={mode.iconUrl} alt="" className="w-5 h-5 object-contain shrink-0" />
                            <span>{mode.name}</span>
                          </div>
                          {isSelected && <Check size={15} className="text-indigo-400" />}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="relative z-20">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Category
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                setIsGameModeDropdownOpen(false);
              }}
              className="w-full bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl px-3.5 py-2.5 text-white transition-all flex items-center justify-between text-sm shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {React.createElement(CATEGORY_ICONS[activeCategory] || Tag, { size: 16, className: 'text-indigo-400 shrink-0' })}
                <span className="font-medium truncate">{activeCategory === 'Tags' ? 'Server Tags' : activeCategory}</span>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform shrink-0 ml-2 ${isCategoryDropdownOpen ? 'rotate-180 text-indigo-400' : ''}`} />
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
                    className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-20 p-1 space-y-0.5 max-h-64 overflow-y-auto custom-scrollbar"
                  >
                    {availableCategories.map(category => {
                      const Icon = CATEGORY_ICONS[category] || Tag;
                      const isCatSelected = activeCategory === category;

                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => {
                            setActiveCategory(category);
                            setIsCategoryDropdownOpen(false);
                            setEditingProduct(null);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                            isCatSelected ? 'bg-indigo-600/20 text-indigo-300 font-medium' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon size={16} className={isCatSelected ? 'text-indigo-400' : 'text-slate-400'} />
                            <span>{category === 'Tags' ? 'Server Tags' : category}</span>
                          </div>
                          {isCatSelected && <Check size={15} className="text-indigo-400" />}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-sm text-slate-400">
          <span className="text-white font-medium">{currentProducts.length}</span> {currentProducts.length === 1 ? 'product' : 'products'} in <span className="text-slate-300 font-medium">{activeCategory === 'Tags' ? 'Server Tags' : activeCategory}</span>
        </div>
        <button
          onClick={handleAddProduct}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm"
        >
          <Plus size={15} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {currentProducts.map((product, index) => {
            const isEditing = editingProduct?.id === product.id;

            if (isEditing) {
              return (
                <motion.div
                  key={`edit-${product.id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card p-5 md:p-6 rounded-3xl border border-indigo-500/50 relative shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">Edit Product</h3>
                      <span className="text-[11px] text-slate-400 font-medium">Realm: {currentActiveModeMeta.name}</span>
                    </div>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Image URL (Optional)
                      </label>
                      <div className="flex gap-3 items-start">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={editingProduct.image || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                            placeholder="https://example.com/image.png"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                          />
                        </div>
                        {editingProduct.image && (
                          <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden p-1 shadow-inner">
                            <img src={editingProduct.image} alt="Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Theme Color
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {COLORS.map((c) => (
                          <button
                            key={c.name}
                            onClick={() => setEditingProduct({ ...editingProduct, color: c.color, bg: c.bg, border: c.border })}
                            className={`h-8 rounded-lg border-2 transition-all ${c.bg} ${
                              editingProduct.color === c.color ? c.border + ' scale-110 shadow-md' : 'border-transparent hover:scale-105'
                            }`}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Description
                      </label>
                      <textarea
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors h-24 resize-none custom-scrollbar text-sm"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Commands (one per line)
                        </label>
                        <span className="text-[9px] text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded" title="Available: %player%, %edition%, %price%, %orderId%">Vars: %player%, %edition%, %price%</span>
                      </div>
                      <textarea
                        value={editingProduct.commands || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, commands: e.target.value })}
                        placeholder="e.g.&#10;give %player% diamond 64&#10;broadcast %player% purchased rank!"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors h-20 resize-none custom-scrollbar text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 mt-auto">
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="flex-1 py-2.5 px-3 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateProduct(editingProduct)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors font-medium shadow-[0_0_15px_rgba(79,70,229,0.4)] text-sm"
                    >
                      Update
                    </button>
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={`view-${product.id}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`glass-card p-5 md:p-6 rounded-3xl border ${product.border} relative group flex flex-col`}
              >
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-100 z-10">
                  <button
                    onClick={() => handleMoveProduct(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-25 disabled:pointer-events-none transition-colors border border-slate-700/50 backdrop-blur-md"
                    title="Move Up"
                  >
                    <ChevronUp size={15} />
                  </button>
                  <button
                    onClick={() => handleMoveProduct(index, 'down')}
                    disabled={index === currentProducts.length - 1}
                    className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-25 disabled:pointer-events-none transition-colors border border-slate-700/50 backdrop-blur-md"
                    title="Move Down"
                  >
                    <ChevronDown size={15} />
                  </button>
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="p-1.5 rounded-lg bg-slate-800/80 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors border border-slate-700/50 backdrop-blur-md"
                    title="Edit Product"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-1.5 rounded-lg bg-slate-800/80 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-slate-700/50 backdrop-blur-md"
                    title="Delete Product"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentActiveModeMeta.borderColor} ${currentActiveModeMeta.bgTint}`}>
                    {currentActiveModeMeta.shortName}
                  </span>
                </div>

                {product.image ? (
                  <div className="mb-4 h-16 flex items-center justify-start">
                    <img src={product.image} alt={product.name} className="max-h-full object-contain drop-shadow-lg" referrerPolicy="no-referrer" />
                  </div>
                ) : (
                  <div className={`w-12 h-12 rounded-2xl ${product.bg} flex items-center justify-center mb-4 border ${product.border}`}>
                    <Tag size={24} className={product.color} />
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
                <p className={`text-lg font-bold mb-3 ${product.color}`}>₹{product.price.toFixed(2)}</p>
                <div className="text-slate-400 text-sm leading-relaxed flex-1 whitespace-pre-line overflow-y-auto max-h-32 custom-scrollbar pr-2 mb-3">{product.description}</div>
                {product.commands && (
                  <div className="mt-auto pt-3 bg-slate-950/45 border border-slate-800/60 rounded-xl p-3">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Configured Commands</span>
                    <div className="text-[10px] font-mono text-cyan-400/90 max-h-16 overflow-y-auto custom-scrollbar space-y-0.5">
                      {product.commands.split('\n').filter(cmd => cmd.trim()).map((cmd, i) => (
                        <div key={i} className="truncate" title={cmd}>• {cmd}</div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}

          <motion.button
            layout
            onClick={handleAddProduct}
            className="h-full min-h-[220px] rounded-3xl border-2 border-dashed border-slate-800 hover:border-slate-700 hover:bg-slate-900/30 transition-all flex flex-col items-center justify-center gap-4 group p-6"
          >
            <div className="w-14 h-14 rounded-full bg-slate-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={24} className="text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <div className="text-center">
              <span className="text-slate-300 font-semibold group-hover:text-white transition-colors block">
                Add Product
              </span>
              <span className="text-xs text-slate-500">
                To {currentActiveModeMeta.shortName} · {activeCategory}
              </span>
            </div>
          </motion.button>
        </AnimatePresence>
      </div>
    </div>
  );
}
