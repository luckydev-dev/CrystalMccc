import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { ref, set } from 'firebase/database';
import { db } from '../../lib/firebase';
import { Save } from 'lucide-react';
import { useAdminHeader } from '../../context/AdminHeaderContext';
import { useToast } from '../../context/ToastContext';

export function HeroEditor() {
  const { data } = useData();
  const [formData, setFormData] = useState(() => ({
    pillText: '',
    title: '',
    titleHighlight: '',
    subtitle: '',
    serverIPDisplay: '',
    serverIPCopy: '',
    port: '',
    discordLink: '',
    backgroundImage: '',
    pillColor: 'emerald',
    pillBg: '',
    pillBorder: '',
    pillTextColor: '',
    pillPingColor: '',
    pillGlow: '',
    ...data.hero
  }));
  const [saving, setSaving] = useState(false);
  const { setTitle, setAction } = useAdminHeader();
  const { toast } = useToast();

  useEffect(() => {
    if (data.hero) {
      setFormData(prev => ({
        ...prev,
        ...data.hero
      }));
    }
  }, [data.hero]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await set(ref(db, 'siteData/hero'), formData);
      toast('Hero section saved successfully!', 'success');
    } catch (error: any) {
      toast('Error saving: ' + error.message, 'error');
    }
    setSaving(false);
  };

  useEffect(() => {
    setTitle('Edit Hero Section');
    setAction(
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-lg shadow-indigo-600/20"
      >
        <Save size={18} />
        {saving ? 'Saving...' : 'Save'}
      </button>
    );
    return () => setAction(null);
  }, [saving, formData, setTitle, setAction]);

  return (
    <div>
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-400 text-sm mb-1">Pill Text</label>
            <input
              type="text"
              name="pillText"
              value={formData.pillText}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Pill Color Theme</label>
            <select
              name="pillColor"
              value={formData.pillColor}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="emerald">Vibrant Emerald Green (Default)</option>
              <option value="blue">Lapis Blue</option>
              <option value="rose">Ruby Rose</option>
              <option value="violet">Amethyst Violet</option>
              <option value="amber">Amber Orange</option>
              <option value="pink">Rose Pink</option>
              <option value="fuchsia">Fuchsia Purple</option>
              <option value="custom">Custom (Tailwind classes)</option>
            </select>
          </div>
          {formData.pillColor === 'custom' && (
            <div className="md:col-span-2 p-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 space-y-4">
              <h4 className="text-sm font-semibold text-indigo-400">Custom Pill Tailwind Classes</h4>
              <p className="text-xs text-slate-500">Provide custom Tailwind classes to style your pill manually.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Background Class (Gradient Start/End)</label>
                  <input
                    type="text"
                    name="pillBg"
                    value={formData.pillBg}
                    onChange={handleChange}
                    placeholder="from-emerald-500/20 to-teal-500/20"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Border Class</label>
                  <input
                    type="text"
                    name="pillBorder"
                    value={formData.pillBorder}
                    onChange={handleChange}
                    placeholder="border-emerald-400"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Text Color Class</label>
                  <input
                    type="text"
                    name="pillTextColor"
                    value={formData.pillTextColor}
                    onChange={handleChange}
                    placeholder="text-emerald-300"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Glow Class (Shadow)</label>
                  <input
                    type="text"
                    name="pillGlow"
                    value={formData.pillGlow}
                    onChange={handleChange}
                    placeholder="shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Ping/Dot BG Class</label>
                  <input
                    type="text"
                    name="pillPingColor"
                    value={formData.pillPingColor}
                    onChange={handleChange}
                    placeholder="bg-emerald-400"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
          <div>
            <label className="block text-slate-400 text-sm mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Title Highlight</label>
            <input
              type="text"
              name="titleHighlight"
              value={formData.titleHighlight}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Server IP (Display)</label>
            <input
              type="text"
              name="serverIPDisplay"
              value={formData.serverIPDisplay}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Server IP (Copy)</label>
            <input
              type="text"
              name="serverIPCopy"
              value={formData.serverIPCopy}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Server Port (Optional, e.g., 25565)</label>
            <input
              type="text"
              name="port"
              value={formData.port || ''}
              onChange={handleChange}
              placeholder="e.g. 25565"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Discord Link</label>
            <input
              type="text"
              name="discordLink"
              value={formData.discordLink}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-slate-400 text-sm mb-1">Background Image URL</label>
            <div className="flex flex-col sm:flex-row gap-4 items-start w-full">
              <input
                type="text"
                name="backgroundImage"
                value={formData.backgroundImage}
                onChange={handleChange}
                className="w-full sm:flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
              {formData.backgroundImage && (
                <div className="w-full sm:w-48 h-32 sm:h-24 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0 bg-slate-900">
                  <img 
                    src={formData.backgroundImage} 
                    alt="Background Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-slate-400 text-sm mb-1">Subtitle</label>
            <textarea
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
