import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, ShoppingCart, ThumbsUp } from 'lucide-react';

export function Community() {
  return (
    <section id="community" className="py-24 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-heading font-bold text-white mb-6"
          >
            Join Our <span className="text-gradient">Community</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-slate-400 text-lg"
          >
            Connect with other players, get support, purchase ranks, and help the server grow by voting daily.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Discord */}
          <motion.a
            href="#"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group glass-card rounded-2xl p-8 text-center hover:-translate-y-2 transition-all duration-300 hover:border-[#5865F2]/50"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <MessageSquare className="w-8 h-8 text-[#5865F2]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-heading">Discord Server</h3>
            <p className="text-slate-400 mb-6 text-sm">Join 5,000+ members. Chat, get support, and find teammates.</p>
            <span className="inline-block px-6 py-2.5 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium text-sm transition-colors w-full">
              Join Discord
            </span>
          </motion.a>

          {/* Store */}
          <motion.a
            href="#"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group glass-card rounded-2xl p-8 text-center hover:-translate-y-2 transition-all duration-300 hover:border-purple-500/50"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <ShoppingCart className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-heading">Server Store</h3>
            <p className="text-slate-400 mb-6 text-sm">Support the server and get exclusive ranks, crates, and cosmetics.</p>
            <span className="inline-block px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500/80 hover:from-purple-500 hover:to-pink-400/80 text-white font-medium text-sm transition-all w-full">
              Visit Store
            </span>
          </motion.a>

          {/* Vote */}
          <motion.a
            href="#"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group glass-card rounded-2xl p-8 text-center hover:-translate-y-2 transition-all duration-300 hover:border-emerald-500/50"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <ThumbsUp className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-heading">Vote Daily</h3>
            <p className="text-slate-400 mb-6 text-sm">Vote for CrystalMC on server lists to earn free in-game rewards.</p>
            <span className="inline-block px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors w-full">
              Vote Now
            </span>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
