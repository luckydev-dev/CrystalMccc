import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Trophy, Gift, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { PageTransition } from '../components/utils/PageTransition';
import { SEOHead } from '../components/seo/SEOHead';

const COLOR_MAP: Record<string, string> = {
  emerald: 'from-emerald-500/20 to-emerald-500/5 hover:border-emerald-500/50 text-emerald-400 border-emerald-500/20',
  indigo: 'from-indigo-500/20 to-indigo-500/5 hover:border-indigo-500/50 text-indigo-400 border-indigo-500/20',
  rose: 'from-rose-500/20 to-rose-500/5 hover:border-rose-500/50 text-rose-400 border-rose-500/20',
  amber: 'from-amber-500/20 to-amber-500/5 hover:border-amber-500/50 text-amber-400 border-amber-500/20',
  cyan: 'from-cyan-500/20 to-cyan-500/5 hover:border-cyan-500/50 text-cyan-400 border-cyan-500/20',
  purple: 'from-purple-500/20 to-purple-500/5 hover:border-purple-500/50 text-purple-400 border-purple-500/20',
  blue: 'from-blue-500/20 to-blue-500/5 hover:border-blue-500/50 text-blue-400 border-blue-500/20',
};

const TEXT_COLOR_MAP: Record<string, string> = {
  emerald: 'text-emerald-400',
  indigo: 'text-indigo-400',
  rose: 'text-rose-400',
  amber: 'text-amber-400',
  cyan: 'text-cyan-400',
  purple: 'text-purple-400',
  blue: 'text-blue-400',
};

const BG_COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-500',
  indigo: 'bg-indigo-500',
  rose: 'bg-rose-500',
  amber: 'bg-amber-500',
  cyan: 'bg-cyan-500',
  purple: 'bg-purple-500',
  blue: 'bg-blue-500',
};

export function Vote() {
  const { data } = useData();
  const voteSites = data?.vote || [];

  return (
    <PageTransition>
      <SEOHead
        title="Vote for Rewards"
        description="Vote daily for CrystalMC to earn free in-game keys, vote streaks, and exclusive perks. Support the server and claim your rewards!"
      />
      <div className="pt-32 pb-16 min-h-screen relative">
        {/* Background Effects */}
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-6"
            >
              <Trophy size={14} />
              <span className="text-sm font-medium tracking-wide uppercase">Support the Server</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 font-heading tracking-tight"
            >
              Vote <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-400 font-extrabold">Daily</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto"
            >
              Support CrystalMC by voting on server lists. In return, you earn exclusive rewards, keys, and in-game money every time you vote!
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {voteSites.map((site, index) => {
              const colorBase = site.color || 'indigo';
              const borderStyles = COLOR_MAP[colorBase] || COLOR_MAP.indigo;
              const textStyles = TEXT_COLOR_MAP[colorBase] || TEXT_COLOR_MAP.indigo;
              const bgStyles = BG_COLOR_MAP[colorBase] || BG_COLOR_MAP.indigo;

              return (
                <motion.a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={site.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`group relative overflow-hidden flex flex-col bg-slate-900/50 backdrop-blur-md rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br ${borderStyles}`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 opacity-20 -mr-8 -mt-8 rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-500 ${bgStyles}`} />
                  
                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className={`p-3 rounded-xl bg-slate-950/50 shadow-inner ${textStyles}`}>
                      {site.imageUrl ? (
                        <img src={site.imageUrl} alt={site.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <ExternalLink size={28} />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950/40 px-3 py-1 rounded-full border border-slate-800 backdrop-blur-sm">
                      <Gift size={14} className={textStyles} />
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">{site.reward || 'Reward'}</span>
                    </div>
                  </div>

                  <div className="relative z-10 mt-auto">
                    <h3 className="text-xl font-bold text-white mb-2 font-heading tracking-wide flex items-center justify-between">
                      {site.name}
                      <ArrowRight size={18} className={`opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${textStyles}`} />
                    </h3>
                    <p className="text-sm text-slate-400 font-medium group-hover:text-slate-300 transition-colors">
                      Click to vote and claim reward
                    </p>
                  </div>
                </motion.a>
              );
            })}
          </div>

          {voteSites.length === 0 && (
            <div className="text-center py-24 text-slate-500">
              No voting sites configured yet.
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
