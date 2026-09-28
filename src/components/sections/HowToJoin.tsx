import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Monitor, Smartphone, Server, Copy, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function HowToJoin() {
  const [platform, setPlatform] = useState<'java' | 'bedrock'>('java');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const javaSteps = [
    { num: '1', title: 'Launch Java', desc: 'Open Minecraft 1.20+' },
    { num: '2', title: 'Multiplayer', desc: 'Click Add Server' },
    { num: '3', title: 'Enter Address', desc: 'play.crystalmc.fun' },
    { num: '4', title: 'Join & Play', desc: 'Select and connect' }
  ];

  const bedrockSteps = [
    { num: '1', title: 'Open Bedrock', desc: 'Mobile, Console, or PC' },
    { num: '2', title: 'Servers Tab', desc: 'Click Add External Server' },
    { num: '3', title: 'Enter Credentials', desc: 'IP: play.crystalmc.fun | Port: 25569' },
    { num: '4', title: 'Join & Play', desc: 'Save and start playing' }
  ];

  const currentSteps = platform === 'java' ? javaSteps : bedrockSteps;
  const copyText = platform === 'java' ? 'play.crystalmc.fun' : 'play.crystalmc.fun:25569';

  return (
    <section id="join" className="py-12 md:py-16 relative bg-slate-950 border-t border-slate-800/80 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl relative z-10">
        
        {/* Compact Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>QUICK CONNECT</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
            How to Join <span className="font-minecraft bg-gradient-to-r from-purple-400 via-pink-400 to-fuchsia-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(232,121,249,0.25)]">CrystalMC</span>
          </h2>
        </div>

        {/* Compact Unified Connection Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-xl">
          
          {/* Top Row: Platform Toggle & Quick Copy Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-5 border-b border-slate-800">
            {/* Platform Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
              <button
                onClick={() => setPlatform('java')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  platform === 'java'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Java Edition</span>
              </button>
              <button
                onClick={() => setPlatform('bedrock')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  platform === 'bedrock'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Bedrock</span>
              </button>
            </div>

            {/* Quick Copy Widget */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 w-full sm:w-auto justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wide">
                  {platform === 'java' ? 'play.crystalmc.fun' : 'play.crystalmc.fun:25569 (Port: 25569)'}
                </span>
              </div>
              <button
                onClick={() => handleCopy(copyText)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold uppercase transition-colors shrink-0 cursor-pointer"
                title="Copy Address"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-pink-400" />
                )}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: 4 Compact Numbered Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={platform}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-5"
            >
              {currentSteps.map((step) => (
                <div
                  key={step.num}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-start hover:border-pink-500/20 transition-colors"
                >
                  <span className="font-mono text-[10px] font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20 w-max mb-1.5">
                    STEP {step.num}
                  </span>
                  <h4 className="text-xs sm:text-sm font-heading font-bold text-white mb-0.5">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {step.desc}
                  </p>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}
