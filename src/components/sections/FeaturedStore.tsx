import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { SparklesIcon, ShoppingCartIcon, PackageOpenIcon, ChevronRightIcon } from '@animateicons/react/lucide';
import { AnimatedIconOnScroll } from '../ui/AnimatedIconOnScroll';
import { useData, getAllStoreProducts } from '../../context/DataContext';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

export function FeaturedStore() {
  const { data } = useData();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'survival' | 'lifesteal' | 'pvp'>('all');

  const allProducts = useMemo(() => {
    if (!data.store) return [];
    return getAllStoreProducts(data.store);
  }, [data.store]);

  const featuredProducts = useMemo(() => {
    if (!data.featuredStore || data.featuredStore.length === 0) {
      return allProducts.slice(0, 3);
    }
    return data.featuredStore
      .map(id => allProducts.find(p => p.id === id))
      .filter(Boolean);
  }, [data.featuredStore, allProducts]);

  const filteredProducts = useMemo(() => {
    if (selectedFilter === 'all') return featuredProducts;
    return featuredProducts.filter(p => {
      const mode = (p as any)?.gameMode || (p as any)?.server || '';
      return mode.toLowerCase() === selectedFilter;
    });
  }, [featuredProducts, selectedFilter]);

  const displayList = filteredProducts.length > 0 ? filteredProducts : featuredProducts;

  if (displayList.length === 0) return null;

  return (
    <section id="store" className="py-16 md:py-20 relative bg-slate-950 border-t border-slate-800/80 overflow-hidden">
      {/* Refined Ambient Low-Glow Background */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[380px] bg-gradient-to-br from-purple-950/15 via-pink-950/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
        
        {/* Header with Animated Icon Library (Play Once System) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-pink-500/20 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-pink-300 mb-2.5 shadow-[0_0_10px_rgba(236,72,153,0.12)]">
              <AnimatedIconOnScroll icon={SparklesIcon} size={14} className="text-pink-400" />
              <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-purple-200 bg-clip-text text-transparent font-bold">
                SEASON ONE STORE & PERKS
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
              Featured <span className="font-minecraft bg-gradient-to-r from-purple-400 via-pink-400 to-fuchsia-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(232,121,249,0.25)]">Ranks & Packages</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-2 leading-relaxed">
              Support server hosting and development while unlocking exclusive ranks, custom tags, and quality-of-life benefits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/store')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm shadow-pink-600/20 cursor-pointer active:scale-95 group"
            >
              <span>Explore All Store Items</span>
              <AnimatedIconOnScroll icon={ChevronRightIcon} size={16} className="text-white group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {[
            { id: 'all', label: 'All Featured' },
            { id: 'survival', label: 'Survival SMP' },
            { id: 'lifesteal', label: 'Lifesteal SMP' },
            { id: 'pvp', label: 'Competitive PvP' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm font-bold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {displayList.map((product: any, index: number) => {
            const rawDescription = product.description || '';
            const descriptionPoints = rawDescription
              .split('\n')
              .filter(Boolean)
              .slice(0, 5);

            return (
              <motion.div
                key={product.id || index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -3 }}
                className="group relative bg-slate-900/70 border border-slate-800/90 hover:border-pink-500/30 rounded-3xl p-6 backdrop-blur-md transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-[0_0_15px_rgba(236,72,153,0.12)]"
              >
                <div>
                  {/* Top Badge & Product Price */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-pink-300 bg-pink-500/10 px-2.5 py-0.5 rounded border border-pink-500/20 font-bold">
                      {product.gameMode?.toUpperCase() || 'SEASON 1'}
                    </span>
                    <span className="text-xl font-heading font-black text-white">
                      ₹{product.price ? product.price.toFixed(2) : '0.00'}
                    </span>
                  </div>

                  {/* Product Visual */}
                  {product.image ? (
                    <div className="h-28 w-full flex items-center justify-center mb-4 p-2 bg-slate-950/60 rounded-2xl border border-slate-800/80 group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4 text-pink-400 group-hover:scale-105 transition-transform">
                      <AnimatedIconOnScroll icon={PackageOpenIcon} size={24} className="text-pink-400" />
                    </div>
                  )}

                  {/* Name */}
                  <h3 className="text-xl font-heading font-extrabold text-white mb-3 tracking-tight group-hover:text-pink-300 transition-colors">
                    {product.name}
                  </h3>

                  {/* Features List */}
                  <div className="space-y-2 mb-6">
                    {descriptionPoints.map((line: string, i: number) => {
                      const cleanLine = line.replace(/^[-•*]\s*/, '');
                      return (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{cleanLine}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Action Buttons with Animated Icon Library */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
                  <button
                    onClick={() =>
                      addToCart({
                        ...product,
                        server: product.server || product.gameMode || 'survival',
                        gameMode: product.gameMode || 'survival'
                      })
                    }
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm shadow-pink-600/20 cursor-pointer active:scale-95 group/btn"
                  >
                    <AnimatedIconOnScroll icon={ShoppingCartIcon} size={15} className="text-white" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={() => navigate('/store')}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center"
                    title="View in full store"
                  >
                    <AnimatedIconOnScroll icon={ChevronRightIcon} size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
