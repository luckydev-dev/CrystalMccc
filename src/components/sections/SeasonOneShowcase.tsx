import React from 'react';
import { motion } from 'motion/react';
import { FlameIcon, StarIcon, ShieldCheckIcon, ZapIcon, SparklesIcon } from '@animateicons/react/lucide';
import { AnimatedIconOnScroll } from '../ui/AnimatedIconOnScroll';

const SEASON_PILLARS = [
  {
    icon: FlameIcon,
    title: 'Fresh Economy & World Reset',
    description: 'Every player starts from scratch. Enjoy balanced item valuations, new land claims, and zero market inflation.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20'
  },
  {
    icon: StarIcon,
    title: 'Season 1 Leaderboards',
    description: 'Compete for the top ranks in Survival Wealth, Lifesteal Hearts, and PvP Elo with exclusive seasonal rewards.',
    color: 'text-pink-400',
    bg: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-pink-500/20'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Smart Combat Anti-Cheat',
    description: 'Custom-tuned heuristic analysis tracks movement and combat in real time, keeping competitive play 100% fair.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20'
  },
  {
    icon: ZapIcon,
    title: 'Locked 20.0 TPS Performance',
    description: 'Powered by dedicated AMD Ryzen 9 7950X hardware with zero lag, instant hit registration, and 99.9% uptime.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20'
  }
];

export function SeasonOneShowcase() {
  return (
    <section className="py-16 md:py-20 relative bg-slate-950 border-t border-slate-800/80 overflow-hidden">
      {/* Refined Ambient Low-Glow Background */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[400px] bg-gradient-to-br from-purple-900/15 via-pink-900/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
        
        {/* Header with Animated Icon Library (Play Once System) */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-pink-500/20 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-pink-300 mb-2.5 shadow-[0_0_10px_rgba(236,72,153,0.12)]">
            <AnimatedIconOnScroll icon={SparklesIcon} size={14} className="text-pink-400" />
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-purple-200 bg-clip-text text-transparent font-bold">
              SEASON ONE
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
            What's New in <span className="font-minecraft bg-gradient-to-r from-purple-400 via-pink-400 to-fuchsia-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(232,121,249,0.25)]">Season 1</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base mt-2 leading-relaxed">
            Fresh world wipes, balanced economies, and optimized combat physics across the server.
          </p>
        </div>

        {/* 4 Feature Pillars with Animated Icon Library */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SEASON_PILLARS.map((pillar, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -3 }}
              className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-pink-500/30 backdrop-blur-sm transition-all duration-300 flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className={`w-11 h-11 rounded-xl ${pillar.bg} border flex items-center justify-center ${pillar.color} mb-4 group-hover:scale-105 transition-transform`}>
                  <AnimatedIconOnScroll icon={pillar.icon} size={22} className={pillar.color} />
                </div>
                <h3 className="text-base font-heading font-bold text-white mb-2 tracking-tight group-hover:text-pink-300 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
