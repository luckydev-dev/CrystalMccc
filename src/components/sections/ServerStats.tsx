import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SignalIcon, ActivityIcon, ZapIcon, GamepadIcon } from '@animateicons/react/lucide';
import { AnimatedIconOnScroll } from '../ui/AnimatedIconOnScroll';
import { useData } from '../../context/DataContext';

export function ServerStats() {
  const { serverStatus } = useData();
  const [displayPlayers, setDisplayPlayers] = useState(0);

  useEffect(() => {
    const target = serverStatus.players || 428;
    const duration = 1200;
    const steps = 30;
    const increment = (target - displayPlayers) / steps;
    let current = displayPlayers;
    
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
        setDisplayPlayers(target);
        clearInterval(timer);
      } else {
        setDisplayPlayers(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [serverStatus.players]);

  return (
    <section className="py-4 bg-slate-950/95 border-y border-slate-800/80 relative z-20 overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          
          {/* Players Online with Animated Icon Library */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-slate-900/60 border border-slate-800/90 hover:border-emerald-500/40 rounded-2xl p-2.5 sm:p-3 flex items-center gap-3 transition-all group backdrop-blur-md shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-emerald-400">
              <AnimatedIconOnScroll icon={SignalIcon} size={16} />
            </div>
            <div className="min-w-0 text-left">
              <div className="text-xs sm:text-sm font-bold text-white font-mono leading-none truncate flex items-center gap-1.5">
                <span>{displayPlayers}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              </div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                Players Online
              </div>
            </div>
          </motion.div>

          {/* Network Ping with Animated Icon Library */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-slate-900/60 border border-slate-800/90 hover:border-pink-500/30 rounded-2xl p-2.5 sm:p-3 flex items-center gap-3 transition-all group backdrop-blur-md shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-pink-400">
              <AnimatedIconOnScroll icon={ActivityIcon} size={16} />
            </div>
            <div className="min-w-0 text-left">
              <div className="text-xs sm:text-sm font-bold text-white font-mono leading-none truncate">
                {serverStatus.online ? `${serverStatus.ping || 28}ms` : '28ms'}
              </div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                Fast Latency
              </div>
            </div>
          </motion.div>

          {/* 20 TPS Performance with Animated Icon Library */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-slate-900/60 border border-slate-800/90 hover:border-cyan-500/40 rounded-2xl p-2.5 sm:p-3 flex items-center gap-3 transition-all group backdrop-blur-md shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-cyan-400">
              <AnimatedIconOnScroll icon={ZapIcon} size={16} />
            </div>
            <div className="min-w-0 text-left">
              <div className="text-xs sm:text-sm font-bold text-white font-mono leading-none truncate">
                20.0 TPS
              </div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                Locked Engine
              </div>
            </div>
          </motion.div>

          {/* Crossplay Version with Animated Icon Library */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-slate-900/60 border border-slate-800/90 hover:border-amber-500/40 rounded-2xl p-2.5 sm:p-3 flex items-center gap-3 transition-all group backdrop-blur-md shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-amber-400">
              <AnimatedIconOnScroll icon={GamepadIcon} size={16} />
            </div>
            <div className="min-w-0 text-left">
              <div className="text-xs sm:text-sm font-bold text-white font-mono leading-none truncate">
                Java & Bedrock
              </div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                Version 1.20+
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
