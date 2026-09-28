import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageTransition } from '../components/utils/PageTransition';
import { useData } from '../context/DataContext';
import { SEOHead } from '../components/seo/SEOHead';
import { Shield, Sparkles, Search, Copy, Check, X, Users } from 'lucide-react';

export function Staff() {
  const { data } = useData();
  const staffMembers = data.staff || [];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'leadership' | 'admin' | 'staff'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyIGN = (id: string, ign: string) => {
    if (!ign) return;
    navigator.clipboard.writeText(ign);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const filteredStaff = useMemo(() => {
    return staffMembers.filter((staff) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        staff.name?.toLowerCase().includes(q) ||
        staff.username?.toLowerCase().includes(q) ||
        staff.role?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      const role = (staff.role || '').toLowerCase();
      if (activeFilter === 'leadership') {
        return role.includes('founder') || role.includes('owner');
      }
      if (activeFilter === 'admin') {
        return (
          role.includes('lead') ||
          role.includes('supreme') ||
          role.includes('dictator') ||
          role.includes('admin')
        );
      }
      if (activeFilter === 'staff') {
        return (
          role.includes('mod') ||
          role.includes('crew') ||
          role.includes('helper') ||
          role.includes('dev') ||
          role.includes('builder')
        );
      }
      return true;
    });
  }, [staffMembers, searchQuery, activeFilter]);

  const getRoleDescription = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('founder') || r.includes('owner')) {
      return 'Network leadership, core vision, and community direction.';
    }
    if (r.includes('lead') || r.includes('supreme') || r.includes('dictator')) {
      return 'Server administration, team coordination, and system operations.';
    }
    if (r.includes('admin')) {
      return 'High-level administration, dispute resolution, and security.';
    }
    if (r.includes('mod')) {
      return 'In-game chat integrity, rule enforcement, and player moderation.';
    }
    if (r.includes('crew') || r.includes('helper')) {
      return 'Assisting players, answering questions, and handling tickets.';
    }
    if (r.includes('dev')) {
      return 'Developing web platforms, custom plugins, and server tooling.';
    }
    return 'Dedicated staff member keeping gameplay fair and enjoyable.';
  };

  const getGlowRgba = (colorStr?: string) => {
    if (!colorStr) return 'rgba(168, 85, 247, 0.2)';
    if (colorStr.includes('red')) return 'rgba(239, 68, 68, 0.25)';
    if (colorStr.includes('amber')) return 'rgba(245, 158, 11, 0.25)';
    if (colorStr.includes('yellow')) return 'rgba(234, 179, 8, 0.25)';
    if (colorStr.includes('orange')) return 'rgba(249, 115, 22, 0.25)';
    if (colorStr.includes('fuchsia')) return 'rgba(217, 70, 239, 0.25)';
    if (colorStr.includes('purple')) return 'rgba(168, 85, 247, 0.25)';
    if (colorStr.includes('rose')) return 'rgba(244, 63, 94, 0.25)';
    if (colorStr.includes('blue')) return 'rgba(59, 130, 246, 0.25)';
    if (colorStr.includes('emerald') || colorStr.includes('green')) return 'rgba(16, 185, 129, 0.25)';
    if (colorStr.includes('indigo')) return 'rgba(99, 102, 241, 0.25)';
    if (colorStr.includes('cyan')) return 'rgba(6, 182, 212, 0.25)';
    return 'rgba(168, 85, 247, 0.2)';
  };

  return (
    <PageTransition>
      <SEOHead
        title="Staff Team"
        description="Meet the dedicated leaders, administrators, and moderators of CrystalMC who keep our community safe and enjoyable."
      />
      <div className="pt-28 pb-24 min-h-screen relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-6xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-4"
            >
              <Shield size={14} className="text-purple-400" />
              <span>CrystalMC Administration</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white mb-4 tracking-tight"
            >
              Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 font-extrabold">Staff Team</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto"
            >
              The dedicated leaders and moderators ensuring CrystalMC remains fair, secure, and fun for all players.
            </motion.p>
          </div>

          {/* Filter Tabs and Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-2xl backdrop-blur-sm shadow-lg shadow-black/20"
          >
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                All Staff ({staffMembers.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('leadership')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeFilter === 'leadership'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Leadership
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('admin')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeFilter === 'admin'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Administration
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('staff')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeFilter === 'staff'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Moderation & Dev
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search staff or rank..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-purple-500 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </motion.div>

          {/* Staff Cards Grid */}
          {filteredStaff.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredStaff.map((staff, i) => {
                  const glowColor = getGlowRgba(staff.color);
                  const isCopied = copiedId === staff.id;

                  return (
                    <motion.div
                      layout
                      key={staff.id}
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.35 }}
                      className="bg-slate-900/85 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-3xl p-6 flex flex-col items-center justify-between transition-all duration-300 shadow-xl shadow-black/20 group relative overflow-hidden"
                    >
                      {/* Top Rank Accent Line */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-[2px] opacity-75 group-hover:opacity-100 transition-opacity"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${glowColor.replace('0.25', '0.9')}, transparent)`
                        }}
                      />

                      {/* Rank Badge at top */}
                      <div className="w-full flex items-center justify-between mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${staff.bg || 'bg-purple-500/10'} ${staff.color || 'text-purple-400'} border ${staff.border || 'border-purple-500/20'}`}>
                          {staff.role}
                        </span>
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: glowColor.replace('0.25', '0.9') }}
                          title="Active Staff Member"
                        />
                      </div>

                      {/* Avatar with Dynamic Rank Glow */}
                      <div className="relative my-4 flex justify-center items-center">
                        <div 
                          className="absolute inset-0 rounded-full blur-xl opacity-40 group-hover:opacity-90 transition-opacity duration-300"
                          style={{ backgroundColor: glowColor }}
                        />
                        <div className="relative z-10 p-1 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl group-hover:scale-105 transition-transform duration-300">
                          <img 
                            src={`https://mc-heads.net/avatar/${encodeURIComponent(staff.username?.replace(/\s+/g, '_') || 'Steve')}/128`} 
                            alt={staff.name} 
                            className="w-20 h-20 md:w-24 md:h-24 rounded-xl"
                            style={{ imageRendering: 'pixelated' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/Steve/128';
                            }}
                          />
                        </div>
                      </div>

                      {/* Staff Member Metadata */}
                      <div className="w-full text-center mt-2 pt-3 border-t border-slate-800/60 flex flex-col items-center">
                        <h3 className="text-lg font-heading font-bold text-white group-hover:text-purple-200 transition-colors mb-2">
                          {staff.name}
                        </h3>

                        {/* Minecraft IGN Copy Pill */}
                        {staff.username && (
                          <button
                            type="button"
                            onClick={() => copyIGN(staff.id, staff.username)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-mono mb-3 group/btn"
                            title="Click to copy Minecraft username"
                          >
                            <span className="text-[11px] text-slate-400">IGN:</span>
                            <span className="font-semibold">{staff.username}</span>
                            {isCopied ? (
                              <Check size={12} className="text-emerald-400 ml-0.5" />
                            ) : (
                              <Copy size={12} className="text-slate-500 group-hover/btn:text-slate-300 ml-0.5" />
                            )}
                          </button>
                        )}

                        <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                          {getRoleDescription(staff.role)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 px-4 bg-slate-900/40 border border-slate-800/60 rounded-3xl"
            >
              <Users size={36} className="mx-auto text-slate-600 mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No staff members found</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-4">
                No staff members matched your search for "{searchQuery}".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Reset Filters
              </button>
            </motion.div>
          )}

          {/* Staff Application Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-14 bg-gradient-to-r from-purple-950/30 via-slate-900/60 to-indigo-950/30 border border-purple-500/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-lg shadow-black/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Sparkles size={22} />
              </div>
              <div>
                <h4 className="text-lg font-heading font-bold text-white mb-1">Want to join the CrystalMC Team?</h4>
                <p className="text-sm text-slate-400">We periodically recruit helpers, moderators, and developers through our Discord community.</p>
              </div>
            </div>

            <a
              href={data?.hero?.discordLink || 'https://discord.gg/crystalmc'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0 shadow-lg shadow-purple-600/20"
            >
              Apply on Discord
            </a>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
