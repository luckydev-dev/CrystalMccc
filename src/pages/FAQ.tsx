import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageTransition } from '../components/utils/PageTransition';
import { useData } from '../context/DataContext';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';

export function FAQ() {
  const { data } = useData();
  const faqs = Array.isArray(data.faq) ? data.faq : [];
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <PageTransition>
      <SEOHead
        title="Frequently Asked Questions"
        description="Got questions about joining CrystalMC, Bedrock compatibility, store purchases, or voting? Find quick answers here."
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
              <HelpCircle size={40} className="text-indigo-400" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 tracking-tight"
            >
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-400 font-extrabold">Questions</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 text-lg max-w-2xl mx-auto"
            >
              Find answers to common questions about our server, rules, and community.
            </motion.p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl border border-slate-800 overflow-hidden"
              >
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-lg font-medium text-white pr-8">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openId === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 text-indigo-400"
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-5 text-slate-300 leading-relaxed border-t border-slate-800/50 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {faqs.length === 0 && (
              <div className="text-center py-12 text-slate-500 glass-card rounded-3xl border border-slate-800">
                No FAQs available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
