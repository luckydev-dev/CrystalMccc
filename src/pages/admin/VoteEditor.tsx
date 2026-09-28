import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Link as LinkIcon, Gift, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { useData, VoteSite } from '../../context/DataContext';
import { useAdminHeader } from '../../context/AdminHeaderContext';
import { useToast } from '../../context/ToastContext';
import { ref, set } from 'firebase/database';
import { db } from '../../lib/firebase';

const COLORS = [
  { id: 'emerald', bg: 'bg-emerald-500' },
  { id: 'indigo', bg: 'bg-indigo-500' },
  { id: 'rose', bg: 'bg-rose-500' },
  { id: 'amber', bg: 'bg-amber-500' },
  { id: 'cyan', bg: 'bg-cyan-500' },
  { id: 'purple', bg: 'bg-purple-500' },
  { id: 'blue', bg: 'bg-blue-500' },
];

export function VoteEditor() {
  const { data } = useData();
  const { setTitle, setAction } = useAdminHeader();
  const { toast } = useToast();
  
  const [sites, setSites] = useState<VoteSite[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data.vote && Array.isArray(data.vote)) {
      setSites(data.vote);
    }
  }, [data.vote]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await set(ref(db, 'siteData/vote'), sites);
      toast('Vote sites saved successfully!', 'success');
    } catch (error) {
      console.error("Error saving vote sites:", error);
      toast('Failed to save vote sites.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setTitle('Vote Management');
    setAction(
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.5)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isSaving ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </button>
    );
    return () => setAction(null);
  }, [sites, isSaving, setTitle, setAction]);

  const handleAddSite = () => {
    const newSite: VoteSite = {
      id: Date.now().toString(),
      name: 'New Voting Site',
      url: 'https://',
      reward: '1x Key',
      color: 'indigo'
    };
    setSites([...sites, newSite]);
  };

  const handleUpdateSite = (id: string, field: keyof VoteSite, value: string) => {
    setSites(sites.map(site => 
      site.id === id ? { ...site, [field]: value } : site
    ));
  };

  const handleDeleteSite = (id: string) => {
    setSites(sites.filter(site => site.id !== id));
  };

  const moveSite = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === sites.length - 1)
    ) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newSites = [...sites];
    const temp = newSites[index];
    newSites[index] = newSites[newIndex];
    newSites[newIndex] = temp;
    setSites(newSites);
  };

  return (
    <div className="max-w-4xl max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar pb-12">
      <div className="mb-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 text-indigo-400">
        <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
          <LinkIcon size={18} className="text-indigo-400" />
          Manage Voting Links
        </h3>
        <p className="text-sm text-indigo-300">
          Add up to 6 voting links below. These will be displayed on the public Vote page as glowing cards. Keep descriptions of rewards concise.
        </p>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {sites.map((site, index) => (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 flex flex-col gap-2">
                <button 
                  onClick={() => moveSite(index, 'up')}
                  disabled={index === 0}
                  className="hover:text-slate-300 disabled:opacity-30 disabled:hover:text-slate-600 transition-colors p-1"
                >
                  <ArrowUp size={18} />
                </button>
                <button 
                  onClick={() => moveSite(index, 'down')}
                  disabled={index === sites.length - 1}
                  className="hover:text-slate-300 disabled:opacity-30 disabled:hover:text-slate-600 transition-colors p-1"
                >
                  <ArrowDown size={18} />
                </button>
              </div>

              <div className="pl-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Site Name</label>
                    <input
                      type="text"
                      value={site.name}
                      onChange={(e) => handleUpdateSite(site.id, 'name', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="e.g. MinecraftServers.org"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Voting URL</label>
                    <div className="relative">
                      <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="url"
                        value={site.url}
                        onChange={(e) => handleUpdateSite(site.id, 'url', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Icon/Image URL (Optional)</label>
                    <input
                      type="url"
                      value={site.imageUrl || ''}
                      onChange={(e) => handleUpdateSite(site.id, 'imageUrl', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="https://.../icon.png"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Reward</label>
                    <div className="relative">
                      <Gift size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={site.reward || ''}
                        onChange={(e) => handleUpdateSite(site.id, 'reward', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="e.g. 1x Vote Key"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Card Theme Color</label>
                    <div className="flex gap-2">
                      {COLORS.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleUpdateSite(site.id, 'color', c.id)}
                          className={`w-8 h-8 rounded-full ${c.bg} flex items-center justify-center transition-all ${
                            site.color === c.id 
                              ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' 
                              : 'opacity-50 hover:opacity-100 hover:scale-110'
                          }`}
                        >
                          {site.color === c.id && <Check size={14} className="text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4">
                <button
                  onClick={() => handleDeleteSite(site.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <button
          onClick={handleAddSite}
          className="w-full py-4 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-2xl text-slate-400 hover:text-indigo-400 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={20} />
          Add Voting Site
        </button>
      </div>
    </div>
  );
}
