import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PageTransition } from '../components/utils/PageTransition';
import { SEOHead } from '../components/seo/SEOHead';
import { 
  Copy, 
  Check, 
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useData } from '../context/DataContext';

interface GameModeItem {
  id: string;
  name: string;
  badge: string;
  command: string;
  iconUrl: string;
  iconBg: string;
  borderColor: string;
  cardGradient: string;
  glowGradient: string;
  titleGradient: string;
  badgeStyle: string;
  accentTextColor: string;
  storeBtn: string;
  featureDot: string;
  description: string;
  features: string[];
  stats: { label: string; value: string }[];
}

const GAME_MODES: GameModeItem[] = [
  {
    id: 'survival',
    name: 'Survival SMP',
    badge: 'Economy & Claims',
    command: '/server survival',
    iconUrl: 'https://i.ibb.co/tMRjCxkz/survival-icon.png',
    iconBg: 'bg-emerald-500/15 border-emerald-500/35 shadow-emerald-500/20',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400/70 hover:shadow-[0_0_35px_rgba(16,185,129,0.22)]',
    cardGradient: 'bg-gradient-to-b from-emerald-950/40 via-slate-900/90 to-slate-950/95',
    glowGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    titleGradient: 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400',
    badgeStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    accentTextColor: 'text-emerald-400',
    storeBtn: 'bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-200 border-emerald-500/40 hover:border-emerald-400/70',
    featureDot: 'bg-emerald-400',
    description: 'A custom economy SMP with land claiming, player shops, jobs, custom enchantments, and guild towns.',
    features: [
      'Grief-free golden shovel land claims',
      'Player-driven economy & chest shops',
      'Levelable skills, jobs & custom enchants',
      'Guilds, towns & community events'
    ],
    stats: [
      { label: 'PvP', value: 'Toggleable' },
      { label: 'Claims', value: 'Protected' },
      { label: 'Difficulty', value: 'Hard' }
    ]
  },
  {
    id: 'lifesteal',
    name: 'Lifesteal SMP',
    badge: 'Hardcore Survival',
    command: '/server lifesteal',
    iconUrl: 'https://i.ibb.co/1ftp7qpp/lifesteal-icon.png',
    iconBg: 'bg-rose-500/15 border-rose-500/35 shadow-rose-500/20',
    borderColor: 'border-rose-500/30 hover:border-rose-400/70 hover:shadow-[0_0_35px_rgba(244,63,94,0.22)]',
    cardGradient: 'bg-gradient-to-b from-rose-950/40 via-slate-900/90 to-slate-950/95',
    glowGradient: 'from-rose-500/20 via-red-500/10 to-transparent',
    titleGradient: 'text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-400 to-amber-400',
    badgeStyle: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    accentTextColor: 'text-rose-400',
    storeBtn: 'bg-rose-600/20 hover:bg-rose-600/35 text-rose-200 border-rose-500/40 hover:border-rose-400/70',
    featureDot: 'bg-rose-400',
    description: 'High-stakes hardcore survival where killing a player steals their heart. Lose all your hearts and face elimination.',
    features: [
      'Steal hearts on kill (+1 kill / -1 death)',
      'Craftable heart fragments & revive beacons',
      'Base raiding & custom explosive mechanics',
      'Daily King of the Hill (KoTH) battles'
    ],
    stats: [
      { label: 'Max Hearts', value: '30 Hearts' },
      { label: 'Elimination', value: 'Spectate/Ban' },
      { label: 'Team Limit', value: '4 Players' }
    ]
  },
  {
    id: 'pvp',
    name: 'Competitive PvP',
    badge: 'Duels & Practice',
    command: '/server pvp',
    iconUrl: 'https://i.ibb.co/4RnDhfhh/pvp-icon.png',
    iconBg: 'bg-cyan-500/15 border-cyan-500/35 shadow-cyan-500/20',
    borderColor: 'border-cyan-500/30 hover:border-cyan-400/70 hover:shadow-[0_0_35px_rgba(6,182,212,0.25)]',
    cardGradient: 'bg-gradient-to-b from-cyan-950/45 via-sky-950/35 to-slate-950/95',
    glowGradient: 'from-cyan-400/25 via-blue-500/15 to-transparent',
    titleGradient: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-400',
    badgeStyle: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    accentTextColor: 'text-cyan-400',
    storeBtn: 'bg-cyan-600/20 hover:bg-cyan-600/35 text-cyan-200 border-cyan-500/40 hover:border-cyan-400/70',
    featureDot: 'bg-cyan-400',
    description: 'Zero ping-loss competitive duel arenas, ranked Elo ladders, and custom practice kits with instant respawns.',
    features: [
      'Ranked 1v1 & 2v2 instant queue duels',
      'Crystal PvP, Nodebuff & Netherite kits',
      'Seasonal Elo rankings & leaderboard prizes',
      '24/7 FFA Colosseum with killstreak perks'
    ],
    stats: [
      { label: 'Hit Detection', value: 'Tick-Perfect' },
      { label: 'Queue', value: 'Instant' },
      { label: 'Leaderboard', value: 'Seasonal Elo' }
    ]
  }
];

export function GameModes() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [copiedIP, setCopiedIP] = useState(false);
  const { toast } = useToast();
  const { data } = useData();

  const serverIP = data?.hero?.serverIPCopy || 'play.crystalmc.fun';

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    toast(`Copied "${cmd}" to clipboard`, 'success');
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleCopyIP = () => {
    navigator.clipboard.writeText(serverIP);
    setCopiedIP(true);
    toast(`Copied server IP: ${serverIP}`, 'success');
    setTimeout(() => setCopiedIP(false), 2000);
  };

  return (
    <PageTransition>
      <SEOHead
        title="Game Modes"
        description="Explore CrystalMC game modes: custom Survival SMP, high-stakes Lifesteal hardcore, and competitive 1v1 PvP duels. Join now at play.crystalmc.fun!"
      />

      <div className="pt-28 pb-20 min-h-screen">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white tracking-tight mb-3">
              Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 font-extrabold">Game Modes</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Choose your realm. Each world is crafted with custom mechanics, balanced economies, and active staff.
            </p>
          </div>

          {/* Clean 3-Card Grid with Distinct Gradients */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {GAME_MODES.map((mode, index) => {
              const isCopied = copiedCmd === mode.command;

              return (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.3 }}
                  className={`${mode.cardGradient} border rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 group relative overflow-hidden ${mode.borderColor}`}
                >
                  {/* Glowing Ambient Top Flare */}
                  <div className={`absolute top-0 right-0 left-0 h-36 bg-gradient-to-b ${mode.glowGradient} opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none`} />

                  <div className="space-y-4 relative z-10">
                    {/* Top Row: Icon & Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border p-2 transition-transform duration-300 group-hover:scale-105 shadow-md ${mode.iconBg}`}>
                        <img 
                          src={mode.iconUrl} 
                          alt={`${mode.name} icon`} 
                          className="w-full h-full object-contain select-none drop-shadow-md"
                          loading="lazy"
                        />
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-xl border ${mode.badgeStyle}`}>
                        {mode.badge}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h2 className={`text-2xl font-heading font-extrabold mb-1.5 ${mode.titleGradient}`}>
                        {mode.name}
                      </h2>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {mode.description}
                      </p>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 bg-slate-950/40 rounded-xl px-2">
                      {mode.stats.map((stat, i) => (
                        <div key={i} className="text-center">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">{stat.label}</span>
                          <span className="text-xs text-slate-200 font-medium">{stat.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Features List */}
                    <ul className="space-y-2 pt-1">
                      {mode.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${mode.featureDot}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 mt-6 border-t border-slate-800/80 space-y-2.5 relative z-10">
                    <button
                      type="button"
                      onClick={() => handleCopyCommand(mode.command)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800/80 text-xs font-mono text-slate-300 transition-colors cursor-pointer group"
                      title="Copy server switch command"
                    >
                      <span className={`font-semibold ${mode.accentTextColor}`}>{mode.command}</span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-white">
                        {isCopied ? (
                          <>
                            <Check size={13} className="text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy</span>
                          </>
                        )}
                      </span>
                    </button>

                    <Link
                      to={`/store?mode=${mode.id}`}
                      className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${mode.storeBtn}`}
                    >
                      <span>Browse Store</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Minimalist Server Connection Bar */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0 hidden sm:block" />
              <div>
                <p className="text-xs text-slate-400">Server Address</p>
                <p className="text-sm font-bold font-mono text-white">{serverIP}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopyIP}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                {copiedIP ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedIP ? 'IP Copied' : 'Copy IP'}</span>
              </button>

              <Link
                to="/rules"
                className="flex items-center justify-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-slate-700/50"
              >
                Rules
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
