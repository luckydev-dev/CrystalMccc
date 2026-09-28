import React from 'react';
import { motion } from 'motion/react';
import { Cpu, ShieldCheck, Zap, RefreshCw, Headphones, Award } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: Cpu,
    title: 'Enterprise Ryzen 9 7950X',
    description: 'Every realm runs on dedicated enterprise bare-metal hardware overclocked to 5.7 GHz, delivering locked 20.0 TPS with zero rubberbanding.',
    accent: 'purple',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20'
  },
  {
    icon: ShieldCheck,
    title: 'Smart Combat Anti-Cheat',
    description: 'Custom-tuned heuristic analysis tracks movement and combat packets in real time, stopping cheaters instantly while never obstructing legitimate plays.',
    accent: 'emerald',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20'
  },
  {
    icon: Zap,
    title: 'Instant 30s Store Fulfillment',
    description: 'Automated socket sync links store transactions directly to server memory. Ranks, crate keys, and perks activate in-game within seconds.',
    accent: 'cyan',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20'
  },
  {
    icon: RefreshCw,
    title: 'Redundant Hourly Backups',
    description: 'Continuous off-site snapshots protect your builds, inventories, and claim territories against accidental loss or unexpected server events.',
    accent: 'amber',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20'
  },
  {
    icon: Headphones,
    title: '24/7 Active Discord Support',
    description: 'Dedicated team of trained administrators and moderators available around the clock to assist with questions, reports, and technical help.',
    accent: 'rose',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20'
  },
  {
    icon: Award,
    title: 'Balanced & Fair Play',
    description: 'We believe competitive integrity comes first. Every custom kit, economy item, and perk is designed so skill and strategy always win.',
    accent: 'indigo',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20'
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-28 relative bg-slate-950 border-t border-slate-800/80 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>INFRASTRUCTURE & INTEGRITY</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
            Why Choose <span className="font-minecraft text-purple-400">CrystalMC</span>?
          </h2>
          <p className="text-slate-400 text-sm md:text-base mt-2.5 leading-relaxed">
            Engineered from the ground up for maximum responsiveness, competitive fairness, and uninterrupted gaming sessions.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {HIGHLIGHTS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 backdrop-blur-sm transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 shadow-lg"
            >
              <div>
                <div className={`w-11 h-11 rounded-xl ${item.bg} border flex items-center justify-center ${item.color} mb-4 group-hover:scale-105 transition-transform`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-heading font-bold text-white mb-2 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
