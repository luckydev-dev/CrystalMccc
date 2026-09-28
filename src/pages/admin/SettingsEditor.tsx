import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Settings as SettingsIcon, Smartphone, CreditCard } from 'lucide-react';
import { ref, get, set } from 'firebase/database';
import { db } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { useAdminHeader } from '../../context/AdminHeaderContext';

export function SettingsEditor() {
  const [upiId, setUpiId] = useState('');
  const [payeeName, setPayeeName] = useState('');
  
  // Bangladesh MFS Settings
  const [bkashNumber, setBkashNumber] = useState('');
  const [nagadNumber, setNagadNumber] = useState('');
  const [bdtRate, setBdtRate] = useState('1.40');

  const [discordUrl, setDiscordUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { setTitle, setAction } = useAdminHeader();

  useEffect(() => {
    setTitle('Settings');
    
    get(ref(db, 'siteData/settings')).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUpiId(data.upiId || '');
        setPayeeName(data.payeeName || '');
        
        setBkashNumber(data.bkashNumber || '01700000000');
        setNagadNumber(data.nagadNumber || '01800000000');
        setBdtRate(data.bdtRate?.toString() || '1.40');

        setDiscordUrl(data.discordUrl || '');
        setTwitterUrl(data.twitterUrl || '');
        setYoutubeUrl(data.youtubeUrl || '');
      }
    });
  }, [setTitle]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await set(ref(db, 'siteData/settings'), {
        upiId,
        payeeName,
        bkashNumber,
        nagadNumber,
        bdtRate: parseFloat(bdtRate) || 1.40,
        discordUrl,
        twitterUrl,
        youtubeUrl
      });
      toast('Settings saved successfully!', 'success');
    } catch (error) {
      toast('Failed to save settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setAction(
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 text-sm cursor-pointer"
      >
        <Save size={16} />
        {isSaving ? 'Saving...' : 'Save Settings'}
      </button>
    );
    return () => setAction(null);
  }, [isSaving, upiId, payeeName, bkashNumber, nagadNumber, bdtRate, discordUrl, twitterUrl, youtubeUrl, setAction]);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Bangladesh Payment Settings */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800/60 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-xl text-pink-400">
            <Smartphone size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">Bangladesh Payment Settings (MFS)</h2>
            <p className="text-xs text-slate-400">Configure bKash & Nagad numbers & BDT conversion rate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              bKash Number
            </label>
            <input
              type="text"
              value={bkashNumber}
              onChange={(e) => setBkashNumber(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 font-mono transition-colors"
              placeholder="01700000000"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              Nagad Number
            </label>
            <input
              type="text"
              value={nagadNumber}
              onChange={(e) => setNagadNumber(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 font-mono transition-colors"
              placeholder="01800000000"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>BDT Conversion Rate (1 INR = ? BDT)</span>
            <span className="text-indigo-400 text-[11px] font-normal">e.g. 1 INR = 1.40 BDT</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={bdtRate}
            onChange={(e) => setBdtRate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="1.40"
          />
        </div>
      </div>

      {/* India UPI Payment Settings */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800/60 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
            <CreditCard size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">India UPI Payment Settings</h2>
            <p className="text-xs text-slate-400">Configure UPI ID and Payee Name for GPay/PhonePe/Paytm</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">UPI ID</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 font-mono transition-colors"
              placeholder="yourname@upi"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Payee Name</label>
            <input
              type="text"
              value={payeeName}
              onChange={(e) => setPayeeName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="CrystalMC"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800/60 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
            <SettingsIcon size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">Social Links</h2>
            <p className="text-xs text-slate-400">Server social community links</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Discord URL</label>
            <input
              type="text"
              value={discordUrl}
              onChange={(e) => setDiscordUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="https://discord.gg/yourserver"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">X / Twitter URL</label>
            <input
              type="text"
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="https://x.com/yourserver"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">YouTube URL</label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="https://youtube.com/@yourserver"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
