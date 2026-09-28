import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Volume2, VolumeX } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { onboardingAudio } from '../../utils/onboardingAudio';

interface ShowcaseItem {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  badge: string;
  iconUrl: string;
  highlights: string[];
}

const GAME_MODES: ShowcaseItem[] = [
  {
    id: 'survival',
    step: 'Game Mode 1 of 3',
    title: 'Survival SMP',
    subtitle: 'Custom Economy & Grief-Free Land Claims',
    badge: 'Peaceful & Guilds',
    iconUrl: 'https://i.ibb.co/tMRjCxkz/survival-icon.png',
    highlights: [
      'Grief-protected claim system',
      'Player-driven economy & chest shops',
      'Custom leveling skills and daily rewards'
    ]
  },
  {
    id: 'lifesteal',
    step: 'Game Mode 2 of 3',
    title: 'Lifesteal SMP',
    subtitle: 'High-Stakes Heart Stealing Hardcore',
    badge: 'Hardcore Raiding',
    iconUrl: 'https://i.ibb.co/1ftp7qpp/lifesteal-icon.png',
    highlights: [
      'Steal hearts on player elimination',
      'Craftable hearts & custom potions',
      'KoTH battles & base raiding'
    ]
  },
  {
    id: 'pvp',
    step: 'Game Mode 3 of 3',
    title: 'Competitive PvP',
    subtitle: 'Ranked Duels & Zero-Lag Practice',
    badge: '20 TPS Arena',
    iconUrl: 'https://i.ibb.co/4RnDhfhh/pvp-icon.png',
    highlights: [
      'Instant queue Crystal PvP & Nodebuff',
      'Ranked Elo leaderboard system',
      'Custom kits and balanced knockback'
    ]
  }
];

// Slow, elegant Minecraft font tumbler sequence
const FONT_REEL = [
  { font: "'Minecraft Title', sans-serif", name: 'Minecraft Title' },
  { font: "'Minercraftory', sans-serif", name: 'Minercraftory' },
  { font: "'Minecraft', sans-serif", name: 'Minecraft' } // final font from minecraft-4
];

const STORAGE_KEY = 'crystalmc_cinematic_tour_seen_v2';

export function EnchantedRealmIntro() {
  const [phase, setPhase] = useState<'idle' | 'welcome' | 'showcase' | 'curtain_up' | 'page_scroll' | 'completed'>('idle');
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [activeTourSection, setActiveTourSection] = useState<string>('');
  const [fontIndex, setFontIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const location = useLocation();
  const { user, userData } = useAuth();

  const isTourActiveRef = useRef(false);
  const scrollTimeoutsRef = useRef<number[]>([]);

  // User name greeting
  const username = userData?.username || user?.displayName?.split(' ')[0] || 'User';

  const clearAllTourTimers = () => {
    scrollTimeoutsRef.current.forEach(clearTimeout);
    scrollTimeoutsRef.current = [];
  };

  useEffect(() => {
    return () => clearAllTourTimers();
  }, []);

  // Check localStorage: only show once on first visit, then save in localStorage
  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem(STORAGE_KEY);
      if (!hasSeen) {
        startTour();
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
  }, []);

  // Allow manual replay from footer event
  useEffect(() => {
    const handleManualReplay = () => {
      startTour();
    };
    window.addEventListener('crystalmc:open-intro', handleManualReplay);
    return () => window.removeEventListener('crystalmc:open-intro', handleManualReplay);
  }, []);

  const startTour = () => {
    clearAllTourTimers();
    isTourActiveRef.current = true;
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {}
    setShowcaseIndex(0);
    setFontIndex(0);
    setPhase('welcome');

    // Smooth relaxing chime for welcome arrival
    onboardingAudio.playWelcomeTone();

    // Run calm, slow font tumbler between the 3 Minecraft fonts:
    // 0ms -> Font 0 (Minecraft Title)
    // 950ms -> Font 1 (Minercraftory)
    // 1900ms -> Font 2 (Minecraft - final font from minecraft-4)
    // Holds final font until 4200ms, then proceeds smoothly to showcase
    const tFont1 = window.setTimeout(() => {
      if (isTourActiveRef.current) {
        setFontIndex(1);
        onboardingAudio.playFontTumbler(1);
      }
    }, 950);
    const tFont2 = window.setTimeout(() => {
      if (isTourActiveRef.current) {
        setFontIndex(2);
        onboardingAudio.playFontTumbler(2);
      }
    }, 1900);

    scrollTimeoutsRef.current.push(tFont1, tFont2);

    // Welcome holds calmly for 4.2 seconds
    const tWelcomeEnd = window.setTimeout(() => {
      if (!isTourActiveRef.current) return;
      setPhase('showcase');
      onboardingAudio.playCardSlide(0);
      startShowcaseCycle();
    }, 4200);
    scrollTimeoutsRef.current.push(tWelcomeEnd);
  };

  // Stage 2: Step through the 3 game modes smoothly (2.8 seconds each)
  const startShowcaseCycle = () => {
    const itemDuration = 2800; // 2.8s per gamemode (relaxed, smooth, readable)
    const totalItems = GAME_MODES.length;

    GAME_MODES.forEach((_, index) => {
      if (index === 0) return;
      const t = window.setTimeout(() => {
        if (!isTourActiveRef.current) return;
        setShowcaseIndex(index);
        onboardingAudio.playCardSlide(index);
      }, index * itemDuration);
      scrollTimeoutsRef.current.push(t);
    });

    // After all 3 gamemodes, initiate the smooth curtain roll up
    const finishShowcaseTime = totalItems * itemDuration;
    const tEnd = window.setTimeout(() => {
      if (!isTourActiveRef.current) return;
      initiateCurtainRollUp();
    }, finishShowcaseTime);
    scrollTimeoutsRef.current.push(tEnd);
  };

  // Stage 3: Smooth curtain slide up
  const initiateCurtainRollUp = () => {
    setPhase('curtain_up');
    onboardingAudio.playCurtainRoll();

    const tCurtain = window.setTimeout(() => {
      if (!isTourActiveRef.current) return;
      
      if (location.pathname === '/') {
        setPhase('page_scroll');
        runHomepageGuidedScroll();
      } else {
        finishTour();
      }
    }, 1200);
    scrollTimeoutsRef.current.push(tCurtain);
  };

  // Stage 4: Guided smooth camera scroll through homepage sections
  const runHomepageGuidedScroll = () => {
    const sections = [
      { id: 'home', label: 'Welcome Portal', duration: 1800 },
      { id: 'features', label: 'Server Highlights & Features', duration: 2500 },
      { id: 'store', label: 'Featured Store & Perks', duration: 2500 },
      { id: 'join', label: 'Connection Guide', duration: 2400 },
      { id: 'home', label: 'Welcome to CrystalMC', duration: 1600 }
    ];

    let accumulatedTime = 150;

    sections.forEach((sec, i) => {
      const t = window.setTimeout(() => {
        if (!isTourActiveRef.current) return;
        setActiveTourSection(sec.label);
        onboardingAudio.playSectionTick();

        const el = document.getElementById(sec.id);
        if (el) {
          if (sec.id === 'home' && i === sections.length - 1) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, accumulatedTime);

      scrollTimeoutsRef.current.push(t);
      accumulatedTime += sec.duration;
    });

    const tFinish = window.setTimeout(() => {
      if (!isTourActiveRef.current) return;
      finishTour();
    }, accumulatedTime + 400);
    scrollTimeoutsRef.current.push(tFinish);
  };

  // Gentle user interrupt handling
  useEffect(() => {
    if (phase !== 'page_scroll') return;

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (Math.abs(e.touches[0].clientY - touchStartY) > 30) {
        finishTour();
      }
    };
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 25) {
        finishTour();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [phase]);

  const finishTour = () => {
    clearAllTourTimers();
    isTourActiveRef.current = false;
    localStorage.setItem(STORAGE_KEY, 'true');
    setPhase('completed');
  };

  if (phase === 'idle' || phase === 'completed') {
    return null;
  }

  const currentMode = GAME_MODES[showcaseIndex];
  const activeFont = FONT_REEL[fontIndex];
  const isFinalFont = fontIndex === FONT_REEL.length - 1;

  return (
    <>
      {/* ========================================================
          CURTAIN OVERLAY
          ======================================================== */}
      <AnimatePresence>
        {(phase === 'welcome' || phase === 'showcase' || phase === 'curtain_up') && (
          <motion.div
            key="cinematic-overlay"
            initial={{ y: 0, opacity: 1 }}
            animate={
              phase === 'curtain_up'
                ? { y: '-100%', opacity: 1 }
                : { y: 0, opacity: 1 }
            }
            transition={{
              duration: 1.15,
              ease: [0.65, 0, 0.35, 1] // Smooth silky curtain ease
            }}
            className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col justify-between overflow-hidden text-slate-100 select-none"
          >
            {/* Minimal ambient backdrop vignette */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-purple-950/15 rounded-full blur-[140px]" />
            </div>

            {/* Top Navigation: Completely hidden during the welcome screen to ensure ONLY ONE LINE is shown */}
            {phase !== 'welcome' ? (
              <div className="relative z-20 w-full px-6 py-6 md:px-12 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 p-1 flex items-center justify-center">
                    <img
                      src="https://i.ibb.co/FLT58CqD/CM.png"
                      alt="CrystalMC"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="font-minecraft text-sm tracking-wider text-slate-300">
                    Crystal<span className="text-purple-400">MC</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const next = !isMuted;
                      setIsMuted(next);
                      if (next) {
                        onboardingAudio.playClickPop();
                      }
                    }}
                    title={isMuted ? "Unmute audio" : "Mute audio"}
                    aria-label="Toggle tour audio"
                    className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
                  </button>

                  <button
                    onClick={() => {
                      onboardingAudio.playClickPop();
                      finishTour();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Skip
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-16" />
            )}

            {/* Central Animated Content Stage */}
            <div className="relative z-10 w-full max-w-4xl mx-auto px-6 my-auto flex flex-col items-center justify-center text-center overflow-visible">
              
              {/* ========================================================
                  STAGE 1: EXACTLY ONE LINE ONLY - SLOW MINECRAFT FONT ROLLER
                  "Welcome User, To Crystal MC"
                  NEVER CUT OFF AT THE BOTTOM: Ample padding, line-height 1.5, overflow-visible
                  ======================================================== */}
              {phase === 'welcome' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-center w-full min-h-[240px] overflow-visible py-6"
                >
                  <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-3 text-center max-w-3xl overflow-visible px-2">
                    {/* Welcome User, To */}
                    <span className="text-2xl sm:text-4xl md:text-5xl font-heading font-light tracking-tight text-slate-200">
                      Welcome <span className="font-medium text-white">{username}</span>, To
                    </span>

                    {/* Smooth, slow vertical tumbler roller for Crystal MC with ZERO bottom clipping */}
                    <span className="inline-flex items-center justify-center relative min-h-[60px] sm:min-h-[80px] overflow-visible align-middle px-2 py-2">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={fontIndex}
                          initial={{ y: 14, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -14, opacity: 0 }}
                          transition={{ 
                            duration: 0.5, 
                            ease: [0.16, 1, 0.3, 1] 
                          }}
                          style={{ 
                            fontFamily: activeFont.font,
                            lineHeight: 1.45,
                            paddingBottom: '0.3em'
                          }}
                          className={`inline-block text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-wider select-none ${
                            isFinalFont
                              ? 'text-purple-400 drop-shadow-[0_0_24px_rgba(168,85,247,0.7)]'
                              : 'text-slate-100'
                          }`}
                        >
                          CRYSTAL MC
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </div>
                </motion.div>
              )}

              {/* ========================================================
                  STAGE 2: GAME MODES SHOWCASE (Simple, Elegant, Focused)
                  ======================================================== */}
              {(phase === 'showcase' || phase === 'curtain_up') && (
                <div className="w-full max-w-lg mx-auto flex flex-col items-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentMode.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-xl backdrop-blur-sm"
                    >
                      {/* Step Indicator */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                          {currentMode.step}
                        </span>
                        <span className="text-[11px] font-medium text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/20">
                          {currentMode.badge}
                        </span>
                      </div>

                      {/* Official Game Mode Icon */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center mb-4">
                        <img
                          src={currentMode.iconUrl}
                          alt={currentMode.title}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Title & Subtitle */}
                      <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-1 tracking-tight">
                        {currentMode.title}
                      </h3>
                      <p className="text-slate-400 text-xs sm:text-sm mb-5">
                        {currentMode.subtitle}
                      </p>

                      {/* Clean highlight points */}
                      <div className="w-full space-y-2 text-left bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
                        {currentMode.highlights.map((pt, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Clean progress dots */}
                  <div className="flex items-center gap-2 mt-6">
                    {GAME_MODES.map((mode, idx) => (
                      <div
                        key={mode.id}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === showcaseIndex
                            ? 'w-8 bg-purple-400'
                            : 'w-2 bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Bottom spacer */}
            <div className="w-full h-16" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          STAGE 4: CLEAN FLOATING TOUR PILL
          ======================================================== */}
      <AnimatePresence>
        {phase === 'page_scroll' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[8000] px-4 py-2.5 rounded-xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-md flex items-center gap-3 select-none"
          >
            <Compass className="w-4 h-4 text-purple-400 animate-spin" />
            <span className="text-xs font-medium text-slate-200">
              {activeTourSection}
            </span>
            <button
              onClick={() => {
                onboardingAudio.playClickPop();
                finishTour();
              }}
              className="ml-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
            >
              Skip
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
