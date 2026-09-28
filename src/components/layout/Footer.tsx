import React from 'react';
import { TwitterIcon, MessageCircleIcon, PlayIcon } from '@animateicons/react/lucide';
import { AnimatedIconOnScroll } from '../ui/AnimatedIconOnScroll';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';

export function Footer() {
  const { data } = useData();
  const settings = data?.settings || {};

  return (
    <footer className="bg-slate-950 border-t border-slate-800/60 pt-14 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-xl mx-auto mb-10">
          {/* Brand */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-[36px] w-[36px] items-center justify-center rounded-lg overflow-hidden">
              <img 
                src="https://i.ibb.co/FLT58CqD/CM.png" 
                alt="CrystalMC Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-minecraft text-xl tracking-wider text-white">
              Crystal<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">MC</span>
            </span>
          </div>
          
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
            The ultimate Minecraft server. Join thousands of players in Survival SMP, Lifesteal, and Competitive PvP.
          </p>

          <div className="flex items-center justify-center gap-3">
            {settings.discordUrl && (
              <a href={settings.discordUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#5865F2] hover:border-[#5865F2]/50 transition-colors group">
                <AnimatedIconOnScroll icon={MessageCircleIcon} size={15} className="group-hover:text-[#5865F2]" />
              </a>
            )}
            {settings.twitterUrl && (
              <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/50 transition-colors group">
                <AnimatedIconOnScroll icon={TwitterIcon} size={15} className="group-hover:text-[#1DA1F2]" />
              </a>
            )}
            {settings.youtubeUrl && (
              <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#FF0000] hover:border-[#FF0000]/50 transition-colors group">
                <AnimatedIconOnScroll icon={PlayIcon} size={15} className="group-hover:text-[#FF0000]" />
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-8 text-xs text-slate-400">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span className="text-slate-800">•</span>
          <Link to="/store" className="hover:text-white transition-colors">Store</Link>
          <span className="text-slate-800">•</span>
          <Link to="/gamemodes" className="hover:text-white transition-colors">Game Modes</Link>
          <span className="text-slate-800">•</span>
          <Link to="/rules" className="hover:text-white transition-colors">Rules</Link>
          <span className="text-slate-800">•</span>
          <Link to="/vote" className="hover:text-white transition-colors">Vote</Link>
          <span className="text-slate-800">•</span>
          <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <span className="text-slate-800">•</span>
          <Link to="/staff" className="hover:text-white transition-colors">Staff</Link>
          <span className="text-slate-800">•</span>
          <Link to="/track" className="hover:text-white transition-colors">Track Order</Link>
          <span className="text-slate-800">•</span>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('crystalmc:open-intro'))}
            className="hover:text-purple-400 text-slate-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Replay Intro Tour</span>
          </button>
        </div>

        <div className="pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} <span className="font-minecraft text-slate-300">CrystalMC</span> Network. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="hover:text-slate-300 transition-colors">Admin Portal</Link>
            <span className="text-slate-800">•</span>
            <span>Not affiliated with Mojang AB.</span>
          </div>
        </div>

        <div className="mt-8 flex justify-center pb-2">
          <div className="relative group cursor-default hover:-translate-y-0.5 transition-transform duration-300">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500/80 rounded-full blur opacity-30 group-hover:opacity-70 transition duration-500"></div>
            <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/90 backdrop-blur-sm border border-white/10 shadow-xl">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                {typeof window !== 'undefined' ? window.atob("TWFkZSBieQ==") : "Made by"}
              </span>
              <span className="text-xs font-black bg-gradient-to-r from-purple-500 via-purple-500 to-pink-400 bg-clip-text text-transparent drop-shadow-sm">
                {typeof window !== 'undefined' ? window.atob("THVja3kgRGV2") : "Lucky Dev"}
              </span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                {typeof window !== 'undefined' ? window.atob("d2l0aA==") : "with"}
              </span>
              <span className="text-xs text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                ❤️
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
