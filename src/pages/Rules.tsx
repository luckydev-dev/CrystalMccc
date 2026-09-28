import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { PageTransition } from '../components/utils/PageTransition';
import { useData } from '../context/DataContext';
import { Shield, Gavel, MessageSquare, AlertCircle, ChevronRight } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';

const ICONS = {
  Shield: Shield,
  Gavel: Gavel,
  MessageSquare: MessageSquare,
  AlertCircle: AlertCircle,
};

export function Rules() {
  const { data } = useData();
  const rules = Array.isArray(data.rules) ? data.rules : [];

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title="Server Rules"
        description="Review the official CrystalMC community guidelines and server rules. Keep gameplay fair, enjoyable, and safe for everyone."
      />
      <div className="pt-32 pb-20 min-h-screen relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none"></div>
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-20 h-20 mx-auto bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20"
            >
              <Shield size={40} className="text-indigo-400" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 tracking-tight"
            >
              Server <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-400 font-extrabold">Rules</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 text-lg max-w-2xl mx-auto"
            >
              Please read and follow these rules to ensure a fun and fair environment for everyone. Ignorance of the rules is not an excuse.
            </motion.p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            {/* Table of Contents Sidebar */}
            {rules.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:w-64 flex-shrink-0"
              >
                <div className="sticky top-32 glass-card rounded-2xl p-6 border border-slate-800">
                  <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Categories</h3>
                  <nav className="space-y-2">
                    {rules.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => scrollToHeading(`category-${category.id}`)}
                        className="block w-full text-left text-sm transition-colors hover:text-indigo-400 flex items-center group text-slate-300 font-medium"
                      >
                        <ChevronRight size={14} className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                        {category.title}
                      </button>
                    ))}
                  </nav>
                </div>
              </motion.div>
            )}

            {/* Rules Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-1 space-y-8"
            >
              {rules.map((category) => {
                const IconComponent = ICONS[category.icon as keyof typeof ICONS] || Shield;
                
                return (
                  <div 
                    key={category.id} 
                    id={`category-${category.id}`}
                    className="glass-card rounded-3xl p-8 md:p-10 border border-slate-800 shadow-xl scroll-mt-32"
                  >
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800/60">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <IconComponent size={24} className="text-indigo-400" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white font-heading">{category.title}</h2>
                    </div>
                    
                    <ul className="space-y-4">
                      {category.rules.map((rule, i) => (
                        <li key={i} className="flex items-start gap-4 text-slate-300 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/40">
                          <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5 text-indigo-400 text-xs font-bold">
                            {i + 1}
                          </div>
                          <span className="leading-relaxed">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {rules.length === 0 && (
                <div className="text-center py-12 text-slate-500 glass-card rounded-3xl border border-slate-800">
                  No rules defined yet.
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
