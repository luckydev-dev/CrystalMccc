import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Interactive3DBackground } from '../ui/Interactive3DBackground';
import { Crystal3DScene } from '../3d/Crystal3DScene';

const DiscordSvg = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.0777.0777 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
);

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Hero() {
  const [copied, setCopied] = useState(false);
  const [edition, setEdition] = useState<'java' | 'bedrock'>('java');
  const navigate = useNavigate();
  const { data, loading: dataLoading } = useData();
  const { loading: authLoading } = useAuth();
  const { toast } = useToast();
  const heroData = data.hero;
  
  const [animationsActive, setAnimationsActive] = useState(false);

  useEffect(() => {
    if (!dataLoading && !authLoading) {
      const timer = setTimeout(() => {
        setAnimationsActive(true);
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setAnimationsActive(false);
    }
  }, [dataLoading, authLoading]);

  const javaIP = heroData.serverIPCopy || 'play.crystalmc.fun';
  const bedrockIP = 'play.crystalmc.fun:25569';
  const currentIP = edition === 'java' ? javaIP : bedrockIP;

  const handleCopyIP = () => {
    navigator.clipboard.writeText(currentIP);
    setCopied(true);
    toast(`${edition === 'java' ? 'Java IP' : 'Bedrock IP (Port: 25569)'} copied to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenGamemodes = () => {
    navigate('/game-modes');
  };

  return (
    <>
      <section 
        id="home" 
        className="relative h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-center items-center pt-14 sm:pt-16 pb-4 overflow-hidden select-none"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 bg-slate-950 pointer-events-none" />
        
        {/* Cinematic Backdrop Image - Highly Visible & Crisp */}
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={!animationsActive ? { scale: 1.1, opacity: 0 } : { scale: 1, opacity: 0.85 }}
          transition={{ duration: 1.6, ease: easeOutExpo }}
          src="https://i.ibb.co/ccsD6sTv/Chat-GPT-Image-Sep-28-2026-06-50-56-AM.png"
          alt="CrystalMC Server"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />
        
        {/* Atmospheric Gradient Scrim - Balanced so artwork stays prominently visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/50 to-slate-950/90 pointer-events-none" />
        
        {/* Refined Low-Glow Gradient Aura */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-purple-600/10 via-pink-500/05 to-transparent rounded-full blur-[120px] pointer-events-none opacity-80" />

        {/* 3D Interactive Particle Field Backing */}
        <Interactive3DBackground />

        {/* Central Content */}
        <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col justify-center items-center text-center max-w-3xl my-auto w-full">
          
          {/* Top Season Pill - More generous space before 3D model */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={!animationsActive ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-pink-500/20 shadow-[0_0_12px_rgba(232,121,249,0.15)] backdrop-blur-md mb-7 sm:mb-9"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-purple-400 to-pink-400" />
            </span>
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest bg-gradient-to-r from-purple-300 via-pink-300 to-purple-200 bg-clip-text text-transparent font-bold">
              SEASON 1 IS LIVE
            </span>
          </motion.div>

          {/* Interactive 3D End Crystal Model - Prominent and beautifully proportioned */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={!animationsActive ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: easeOutExpo }}
            className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 relative flex items-center justify-center mt-1 sm:mt-2 mb-2 sm:mb-3 shrink-0"
          >
            <div className="absolute w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-purple-600/15 via-pink-500/10 to-transparent blur-2xl pointer-events-none opacity-80" />
            <Crystal3DScene className="w-full h-full relative z-10" />
          </motion.div>

          {/* Headline with Crystal Gradient & Refined Low Glow */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={!animationsActive ? { opacity: 0, y: 12 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: easeOutExpo }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-minecraft tracking-wider text-white leading-tight px-2 mt-2 sm:mt-3 mb-2 sm:mb-2.5"
          >
            <span className="text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">Crystal</span>
            <span className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-fuchsia-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(232,121,249,0.3)] ml-1">
              MC
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={!animationsActive ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: easeOutExpo }}
            className="text-xs sm:text-sm md:text-base text-slate-200 max-w-md mx-auto leading-relaxed px-2 mb-4 drop-shadow"
          >
            Play Survival SMP, Lifesteal, and Competitive PvP in <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-fuchsia-400 bg-clip-text text-transparent font-semibold">Season 1</span>.
          </motion.p>

          {/* Server IP Card with Java & Bedrock Edition Switcher */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={!animationsActive ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: easeOutExpo }}
            className="w-full max-w-sm mx-auto px-2 mb-2"
          >
            {/* Quick Edition Selector */}
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <button
                type="button"
                onClick={() => setEdition('java')}
                className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                  edition === 'java'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm shadow-pink-600/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Java
              </button>
              <button
                type="button"
                onClick={() => setEdition('bedrock')}
                className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                  edition === 'bedrock'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm shadow-pink-600/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Bedrock: 25569
              </button>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 hover:border-pink-500/30 rounded-xl p-2 pl-3.5 flex items-center justify-between shadow-xl backdrop-blur-md transition-all duration-200 group">
              <div className="flex flex-col items-start min-w-0 pr-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    {edition === 'java' ? 'Java Edition' : 'Bedrock (Port: 25569)'}
                  </span>
                </div>
                <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wider truncate group-hover:text-pink-300 transition-colors">
                  {currentIP}
                </span>
              </div>

              {/* Server IP Copy Button */}
              <button
                onClick={handleCopyIP}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-[11px] uppercase tracking-wider transition-all duration-150 shadow-sm shadow-pink-600/20 active:scale-95 cursor-pointer"
                title={`Click to copy ${edition === 'java' ? 'Java' : 'Bedrock'} address`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.div 
                      key="copied" 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied</span>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="copy" 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </motion.div>

          {/* Discord Button Moved Directly BELOW the IP Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={!animationsActive ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: easeOutExpo }}
            className="mb-4 sm:mb-5"
          >
            <a
              href={heroData.discordLink || 'https://discord.gg/crystalmc'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#5865F2]/20 hover:bg-[#5865F2]/30 border border-[#5865F2]/40 hover:border-[#5865F2]/70 text-white font-bold text-[11px] uppercase tracking-wider transition-all duration-150 shadow-sm cursor-pointer"
            >
              <DiscordSvg />
              <span>Join Discord</span>
            </a>
          </motion.div>

          {/* Three Game Modes SMALL SQUARE CARDS */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={!animationsActive ? { opacity: 0, y: 12 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: easeOutExpo }}
            className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-xs sm:max-w-sm mx-auto w-full"
          >
            {[
              {
                id: 'survival',
                name: 'Survival',
                subtitle: 'SMP',
                border: 'hover:border-emerald-500/50 hover:shadow-[0_0_12px_rgba(16,185,129,0.15)]',
                textColor: 'text-emerald-400',
                iconUrl: 'https://i.ibb.co/tMRjCxkz/survival-icon.png'
              },
              {
                id: 'lifesteal',
                name: 'Lifesteal',
                subtitle: 'SMP',
                border: 'hover:border-rose-500/50 hover:shadow-[0_0_12px_rgba(244,63,94,0.15)]',
                textColor: 'text-rose-400',
                iconUrl: 'https://i.ibb.co/1ftp7qpp/lifesteal-icon.png'
              },
              {
                id: 'pvp',
                name: 'PvP Duels',
                subtitle: 'Ranked',
                border: 'hover:border-pink-500/50 hover:shadow-[0_0_12px_rgba(236,72,153,0.15)]',
                textColor: 'text-pink-400',
                iconUrl: 'https://i.ibb.co/4RnDhfhh/pvp-icon.png'
              }
            ].map((mode) => (
              <div
                key={mode.id}
                onClick={handleOpenGamemodes}
                className={`aspect-square bg-slate-900/80 border border-slate-800 ${mode.border} rounded-xl p-2 flex flex-col items-center justify-center text-center backdrop-blur-md transition-all duration-200 cursor-pointer group shadow-md hover:-translate-y-0.5`}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-950 border border-slate-800/80 p-1 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <img
                    src={mode.iconUrl}
                    alt={mode.name}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <span className="text-[10px] sm:text-[11px] font-bold text-white group-hover:text-pink-300 transition-colors leading-tight">
                  {mode.name}
                </span>
                <span className={`text-[8px] sm:text-[9px] font-mono font-medium ${mode.textColor} mt-0.5`}>
                  {mode.subtitle}
                </span>
              </div>
            ))}
          </motion.div>

        </div>
      </section>
    </>
  );
}
