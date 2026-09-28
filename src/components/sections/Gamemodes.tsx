import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GameModeCard {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  accentColor: string;
  borderHover: string;
  textColor: string;
  badgeStyle: string;
  iconUrl: string;
  activePlayers: number;
  tps: string;
  keyFeatures: string[];
  popularCommands: string[];
}

const GAMEMODES_DATA: GameModeCard[] = [
  {
    id: 'survival',
    name: 'Survival SMP',
    badge: 'Peaceful & Economy',
    tagline: 'Custom Player Economy, Land Claims & Deep MMO Skills',
    description: 'Our flagship survival server designed for builders, traders, and adventurers. Establish your base, protect your builds with land claims, and dominate player markets.',
    accentColor: 'emerald',
    borderHover: 'hover:border-emerald-500/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    textColor: 'text-emerald-400',
    badgeStyle: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
    iconUrl: 'https://i.ibb.co/tMRjCxkz/survival-icon.png',
    activePlayers: 184,
    tps: '20.0 TPS',
    keyFeatures: [
      'Grief-free golden shovel land claim protection',
      'Player chest shops & global Auction House trading',
      'MMO skills: Mining, Woodcutting, Fishing & Jobs',
      '80+ custom biomes and underground dungeons'
    ],
    popularCommands: ['/claim', '/shop', '/skills', '/ah']
  },
  {
    id: 'lifesteal',
    name: 'Lifesteal SMP',
    badge: 'Hardcore Raiding',
    tagline: 'High-Stakes Heart Stealing, KoTH Arenas & Base Raiding',
    description: 'The ultimate survival crucible where every fight matters. Eliminate enemy players to steal their permanent hearts; craft revive totems, and capture King of the Hill.',
    accentColor: 'rose',
    borderHover: 'hover:border-rose-500/60 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]',
    textColor: 'text-rose-400',
    badgeStyle: 'bg-rose-950/60 text-rose-300 border-rose-500/30',
    iconUrl: 'https://i.ibb.co/1ftp7qpp/lifesteal-icon.png',
    activePlayers: 142,
    tps: '20.0 TPS',
    keyFeatures: [
      'Steal 1 permanent heart per player elimination',
      'Craftable Revive Beacons to bring teammates back',
      'Scheduled King of the Hill (KoTH) battles every 4 hours',
      'Custom obsidian durability and explosive raiding mechanics'
    ],
    popularCommands: ['/withdrawhearts', '/revive', '/koth', '/team']
  },
  {
    id: 'pvp',
    name: 'Competitive PvP',
    badge: '20 TPS Duel Arena',
    tagline: 'Ranked Elo Ladders, Crystal PvP & Zero-Delay Practice Kits',
    description: 'Built exclusively for combat perfection. Practice ranked Crystal PvP, Nodebuff, Sword, and Axe duels with zero knockback anomalies and instant respawns.',
    accentColor: 'purple',
    borderHover: 'hover:border-purple-500/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]',
    textColor: 'text-purple-400',
    badgeStyle: 'bg-purple-950/60 text-purple-300 border-purple-500/30',
    iconUrl: 'https://i.ibb.co/4RnDhfhh/pvp-icon.png',
    activePlayers: 102,
    tps: '20.0 TPS',
    keyFeatures: [
      'Instant queue Ranked & Unranked duels in under 2s',
      'Ranked Elo divisions from Bronze to Grandmaster',
      'Custom-tuned combat netcode with zero delay',
      'Customizable kit layouts and AI practice bots'
    ],
    popularCommands: ['/duel', '/ranked', '/leaderboard', '/editkit']
  }
];

export function Gamemodes() {
  return (
    <section id="gamemodes" className="py-20 md:py-28 relative bg-slate-950 border-t border-slate-800/80 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-purple-900/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>THREE GAME MODES · ONE SERVER</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
              Three Game Modes
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-2.5 leading-relaxed">
              Every game mode features custom gameplay, 20 TPS performance, and dedicated progression. Connect with IP <span className="font-mono text-purple-300">play.crystalmc.fun</span> to play any mode.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-end">
            <Link
              to="/game-modes"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <span>Full Guide</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 3 Self-Contained Gamemode Cards (No extra popup/info card below) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {GAMEMODES_DATA.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`bg-slate-900/60 border border-slate-800/90 ${mode.borderHover} rounded-3xl p-6 sm:p-7 backdrop-blur-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 shadow-xl`}
            >
              <div>
                {/* Header: Icon & Badge */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center shrink-0 shadow-inner">
                    <img
                      src={mode.iconUrl}
                      alt={mode.name}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <span className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg border font-bold ${mode.badgeStyle}`}>
                    {mode.badge}
                  </span>
                </div>

                {/* Title & Live Status */}
                <div className="mb-3">
                  <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-tight">
                    {mode.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        mode.id === 'survival' ? 'bg-emerald-400' : mode.id === 'lifesteal' ? 'bg-rose-400' : 'bg-purple-400'
                      }`} />
                      {mode.activePlayers} Online
                    </span>
                    <span>·</span>
                    <span className="text-slate-500">{mode.tps}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
                  {mode.description}
                </p>

                {/* Key Features Bullet List */}
                <div className="space-y-2 mb-6">
                  {mode.keyFeatures.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check className={`w-3.5 h-3.5 ${mode.textColor} shrink-0 mt-0.5`} />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Commands */}
                <div className="mb-6">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-2 font-bold">
                    Quick Commands
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {mode.popularCommands.map((cmd) => (
                      <span
                        key={cmd}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300"
                      >
                        {cmd}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80">
                <Link
                  to="/store"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-purple-600/20"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Store</span>
                </Link>

                <Link
                  to="/game-modes"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
