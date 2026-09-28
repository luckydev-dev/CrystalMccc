import React, { useState, useEffect, useRef } from 'react';
import { motion, PanInfo } from 'motion/react';
import { Crown, Copy, Check } from 'lucide-react';
import { TerminalIcon, SparklesIcon } from '@animateicons/react/lucide';
import { AnimatedIconOnScroll } from '../ui/AnimatedIconOnScroll';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export function FoundersCarousel() {
  const { data } = useData();
  const { toast } = useToast();
  const staffList = data.staff || [];
  
  // Filter ONLY founders
  const founders = staffList.filter(
    (member) => member.role?.toUpperCase() === 'FOUNDER'
  );

  // Fallback if data hasn't loaded yet
  const displayFounders = founders.length > 0 ? founders : [
    {
      id: 'founder_1',
      name: 'ahammad44708',
      username: 'AHAMMAD44707',
      role: 'FOUNDER'
    },
    {
      id: 'founder_2',
      name: 'demon_uchiha',
      username: 'demon_uchiha',
      role: 'FOUNDER'
    }
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const autoChangeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const total = displayFounders.length;
  const backIdx = (activeIdx + 1) % total;

  const triggerSwap = () => {
    if (isSwapping || total <= 1) return;
    setIsSwapping(true);

    // After card slides right, toggle the index so the second card is now in front
    setTimeout(() => {
      setActiveIdx((prev) => (prev + 1) % total);
      setIsSwapping(false);
    }, 320);
  };

  // Auto-change timer (4.5s), pauses on hover or touch
  useEffect(() => {
    if (isHovered || total <= 1) return;
    autoChangeTimerRef.current = setInterval(() => {
      triggerSwap();
    }, 4500);

    return () => {
      if (autoChangeTimerRef.current) clearInterval(autoChangeTimerRef.current);
    };
  }, [isHovered, activeIdx, isSwapping, total]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If swiped right or flicked right
    if (info.offset.x > 50 || info.velocity.x > 200) {
      triggerSwap();
    }
  };

  const handleCopyIGN = (e: React.MouseEvent, ign: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ign);
    setCopied(true);
    toast(`Copied ${ign} to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const frontFounder = displayFounders[activeIdx];
  const backFounder = displayFounders[backIdx];

  const renderFounderCard = (founder: typeof displayFounders[0], isFront: boolean) => (
    <div className="w-full h-full flex flex-col items-center justify-between p-5 select-none">
      {/* Top Details */}
      <div className="w-full flex flex-col items-center">
        {/* Full Skin - Clean floating with NO black pill underneath */}
        <div className="relative w-full h-32 sm:h-36 flex items-center justify-center">
          <motion.div
            animate={isFront ? { y: [-3, 3, -3] } : { y: 0 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative z-10 flex items-center justify-center h-full w-full pointer-events-none"
          >
            <img
              src={`https://mc-heads.net/body/${encodeURIComponent(founder.username || 'Steve')}/right`}
              alt={`${founder.name} Full Skin`}
              className="max-h-28 sm:max-h-32 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)] filter contrast-105"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://minotar.net/armor/body/${encodeURIComponent(founder.username || 'Steve')}/300.png`;
              }}
            />
          </motion.div>
        </div>

        {/* Founder Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold tracking-wider mt-2 mb-1 shadow-sm">
          <Crown className="w-2.5 h-2.5 text-amber-400" />
          <span>FOUNDER</span>
        </div>

        {/* Founder Name */}
        <h3 className="text-lg sm:text-xl font-heading font-extrabold text-white tracking-tight mb-0.5 text-center">
          {founder.name}
        </h3>
        
        {/* In-Game Name */}
        <div className="text-[11px] font-mono bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-1 font-bold">
          <AnimatedIconOnScroll icon={TerminalIcon} size={12} className="text-pink-400" />
          <span>IGN: {founder.username}</span>
        </div>

        {/* Short 2-Line Bio */}
        <p className="text-xs text-slate-300 leading-snug text-center max-w-[240px] px-1 line-clamp-2">
          {founder.username.toLowerCase().includes('ahammad')
            ? "Network Founder & Chief Architect. Dedicated to server development and player experience."
            : "Network Co-Founder & Executive Lead. Overseeing server community and tournament hosting."
          }
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col items-center gap-2 pt-2">
        <div className="flex items-center justify-center gap-2 w-full">
          <button
            onClick={(e) => handleCopyIGN(e, founder.username)}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-[11px] uppercase tracking-wider transition-all shadow-sm shadow-pink-600/20 cursor-pointer active:scale-95"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? 'Copied' : 'Copy IGN'}</span>
          </button>

          <a
            href="https://discord.gg/crystalmc"
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <span>Discord</span>
          </a>
        </div>

        {/* Swipe Right Indicator */}
        <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
          <AnimatedIconOnScroll icon={SparklesIcon} size={10} className="text-pink-400" />
          <span>Swipe right to switch</span>
        </div>
      </div>
    </div>
  );

  return (
    <section 
      id="founders" 
      className="scroll-mt-28 py-14 md:py-20 relative bg-slate-950 border-t border-slate-800/80 overflow-hidden"
    >
      {/* Refined Ambient Low-Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[350px] bg-gradient-to-br from-purple-950/15 via-pink-950/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-4xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-8 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-pink-500/20 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-pink-300 mb-2.5 shadow-[0_0_10px_rgba(236,72,153,0.12)]">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-purple-200 bg-clip-text text-transparent font-bold">
              FOUNDERS
            </span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
            Server <span className="font-minecraft bg-gradient-to-r from-purple-400 via-pink-400 to-fuchsia-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(232,121,249,0.25)]">Leadership</span>
          </h2>
        </div>

        {/* TWO CARDS STACKED CONTAINER (Compact, Stacked Above, Swipes Right Behind) */}
        <div 
          className="relative w-full max-w-[290px] sm:max-w-[310px] mx-auto h-[385px] sm:h-[395px] pt-4"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          
          {/* BACK CARD (Stacked on LITTLE LEFT SIDE, peeking out, smoothly comes forward) */}
          {total > 1 && (
            <motion.div
              key={`back-${backFounder.id}`}
              animate={{
                x: isSwapping ? 0 : -16,
                y: isSwapping ? 0 : -12,
                rotate: isSwapping ? 0 : -2.5,
                scale: isSwapping ? 1 : 0.94,
                opacity: isSwapping ? 1 : 0.65,
                zIndex: isSwapping ? 25 : 10,
              }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              onClick={triggerSwap}
              className="absolute inset-x-0 top-4 h-[370px] sm:h-[380px] bg-slate-900/70 border border-slate-800/80 rounded-2xl shadow-lg backdrop-blur-sm overflow-hidden cursor-pointer"
            >
              {renderFounderCard(backFounder, false)}
            </motion.div>
          )}

          {/* FRONT CARD (Active, Slides smoothly RIGHT and goes to the back) */}
          <motion.div
            key={`front-${frontFounder.id}`}
            drag="x"
            dragConstraints={{ left: 0, right: 260 }}
            dragElastic={0.25}
            onDragEnd={handleDragEnd}
            animate={{
              x: isSwapping ? 270 : 0,
              rotate: isSwapping ? 9 : 0,
              y: 0,
              scale: isSwapping ? 0.96 : 1,
              opacity: isSwapping ? 0.85 : 1,
              zIndex: isSwapping ? 15 : 20,
            }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-4 h-[370px] sm:h-[380px] bg-slate-900/95 border border-slate-800/90 hover:border-pink-500/30 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden cursor-grab active:cursor-grabbing"
          >
            {renderFounderCard(frontFounder, true)}
          </motion.div>

        </div>

      </div>
    </section>
  );
}
