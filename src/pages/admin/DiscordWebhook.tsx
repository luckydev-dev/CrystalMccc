import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Save, Send, MessageSquare, Image as ImageIcon, Link as LinkIcon, Palette, User, Hash, X, Check, Eye } from 'lucide-react';
import { ref, get, set } from 'firebase/database';
import { db } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { useAdminHeader } from '../../context/AdminHeaderContext';

export interface DiscordEmbedField {
  id: string;
  name: string;
  value: string;
  inline: boolean;
}

export interface DiscordWebhookConfig {
  url: string;
  username: string;
  avatarUrl: string;
  content: string;
  embedTitle: string;
  embedDescription: string;
  embedColor: string;
  embedFooter: string;
  embedFooterIcon: string;
  embedImage?: string;
  showProofImage: boolean;
  showPlayerHead: boolean;
  fields: DiscordEmbedField[];
}

const defaultConfig: DiscordWebhookConfig = {
  url: '',
  username: 'CrystalMC Store',
  avatarUrl: '',
  content: '🎉 New order received!',
  embedTitle: 'New Order: #{orderId}',
  embedDescription: '',
  embedColor: '#06b6d4',
  embedFooter: 'CrystalMC Store',
  embedFooterIcon: '',
  embedImage: 'https://store.crystalmc.fun/crystal-embed.gif',
  showProofImage: true,
  showPlayerHead: true,
  fields: [
    { id: '1', name: 'Player', value: '{player}', inline: true },
    { id: '2', name: 'Edition', value: '{version}', inline: true },
    { id: '3', name: 'Total', value: '₹{price}', inline: true },
    { id: '4', name: 'Status', value: '{status}', inline: true },
    { id: '5', name: 'Discount', value: '{discount}', inline: true },
    { id: '6', name: 'Items', value: '{items}', inline: false }
  ]
};

export function DiscordWebhook() {
  const [config, setConfig] = useState<DiscordWebhookConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();
  const { setTitle, setAction } = useAdminHeader();

  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isPreviewOpen]);

  useEffect(() => {
    setTitle('Discord Webhook');
    
    get(ref(db, 'siteData/discordWebhook')).then((snapshot) => {
      if (snapshot.exists()) {
        setConfig({ ...defaultConfig, ...snapshot.val() });
      }
    });
  }, [setTitle]);

  useEffect(() => {
    setAction(
      <div className="flex gap-2 sm:gap-3">
        <button
          onClick={handleTest}
          disabled={isTesting || !config.url}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 sm:px-4 py-2 rounded-xl font-bold transition-colors disabled:opacity-50 text-sm sm:text-base flex-1 sm:flex-none"
        >
          <Send size={18} />
          <span className="hidden xs:inline">{isTesting ? 'Sending...' : 'Test'}</span>
          <span className="xs:hidden">{isTesting ? '...' : 'Test'}</span>
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 sm:px-4 py-2 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50 text-sm sm:text-base flex-1 sm:flex-none"
        >
          <Save size={18} />
          <span className="hidden xs:inline">{isSaving ? 'Saving...' : 'Save'}</span>
          <span className="xs:hidden">{isSaving ? '...' : 'Save'}</span>
        </button>
      </div>
    );
  }, [config, isSaving, isTesting, setAction]);

  const renderDiscordText = (text: string) => {
    if (!text) return null;
    
    // Replace variables first
    const processed = text
      .replace(/{orderId}/g, 'TEST-12345')
      .replace(/{player}/g, 'Notch')
      .replace(/{version}/g, 'Java')
      .replace(/{price}/g, '149.99')
      .replace(/{status}/g, 'Pending')
      .replace(/{discount}/g, '10% (CRYSTAL10)')
      .replace(/{items}/g, '• MVP+ Rank (x1)\n• 10,000 Coins (x2)');

    // Split by emoji patterns and markdown bold
    const parts = processed.split(/(<a?:\w+:\d+>|\*\*.*?\*\*)/g);
    
    return parts.map((part, i) => {
      const emojiMatch = part.match(/<(a?):(\w+):(\d+)>/);
      if (emojiMatch) {
        const [_, isAnimated, name, id] = emojiMatch;
        const extension = isAnimated ? 'gif' : 'png';
        return (
          <img
            key={i}
            src={`https://cdn.discordapp.com/emojis/${id}.${extension}?v=1`}
            alt={name}
            className="inline-block w-5 h-5 align-text-bottom mx-0.5"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        );
      }
      
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      
      return <span key={i}>{part}</span>;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await set(ref(db, 'siteData/discordWebhook'), config);
      toast('Webhook configuration saved!', 'success');
    } catch (error) {
      toast('Failed to save configuration', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!config.url) {
      toast('Please enter a webhook URL first', 'error');
      return;
    }

    setIsTesting(true);
    try {
      const demoData = {
        orderId: 'TEST-12345',
        player: 'Notch',
        version: 'Java',
        price: '149.99',
        status: 'Pending',
        discount: '10% (CRYSTAL10)',
        items: '• MVP+ Rank (x1)\n• 10,000 Coins (x2)',
        proofUrl: 'https://i.ibb.co/8DhgMNkg/minecraft-live-2025-3840x2160-24154.jpg'
      };

      const replaceVars = (text: string) => {
        return text
          .replace(/{orderId}/g, demoData.orderId)
          .replace(/{player}/g, demoData.player)
          .replace(/{version}/g, demoData.version)
          .replace(/{price}/g, demoData.price)
          .replace(/{status}/g, demoData.status)
          .replace(/{discount}/g, demoData.discount)
          .replace(/{items}/g, demoData.items);
      };

      const payload = {
        username: config.username || undefined,
        avatar_url: config.avatarUrl || undefined,
        content: replaceVars(config.content),
        embeds: [
          {
            title: replaceVars(config.embedTitle),
            description: replaceVars(config.embedDescription),
            color: parseInt(config.embedColor.replace('#', ''), 16),
            fields: config.fields?.map(f => ({
              name: replaceVars(f.name),
              value: replaceVars(f.value),
              inline: f.inline
            })),
            footer: {
              text: replaceVars(config.embedFooter),
              icon_url: config.embedFooterIcon || undefined
            },
            image: config.embedImage ? { url: config.embedImage } : (config.showProofImage ? { url: demoData.proofUrl } : undefined),
            thumbnail: config.showPlayerHead ? { url: `https://mc-heads.net/avatar/${demoData.player}` } : undefined,
            timestamp: new Date().toISOString()
          }
        ]
      };

      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast('Test message sent successfully!', 'success');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error(error);
      toast('Failed to send test message. Check your webhook URL.', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleChange = (field: keyof DiscordWebhookConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Preview Button in Page */}
      <div className="mb-6">
        <button
          onClick={() => setIsPreviewOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold transition-all group shadow-lg"
        >
          <Eye size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
          Open Discord Preview
        </button>
      </div>

      {/* Editor */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <LinkIcon size={20} className="text-indigo-400" />
            Connection
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Webhook URL</label>
            <input
              type="text"
              value={config.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <User size={20} className="text-indigo-400" />
            Bot Profile
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
              <input
                type="text"
                value={config.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Avatar URL</label>
              <input
                type="text"
                value={config.avatarUrl}
                onChange={(e) => handleChange('avatarUrl', e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare size={20} className="text-indigo-400" />
            Message Content
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Outside Message (Content)</label>
            <textarea
              value={config.content}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Embed Title</label>
              <input
                type="text"
                value={config.embedTitle}
                onChange={(e) => handleChange('embedTitle', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Embed Color (Hex)</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.embedColor}
                  onChange={(e) => handleChange('embedColor', e.target.value)}
                  className="h-12 w-12 rounded-xl border border-slate-800 cursor-pointer bg-slate-950 p-1 shrink-0"
                />
                <input
                  type="text"
                  value={config.embedColor}
                  onChange={(e) => handleChange('embedColor', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 uppercase"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Embed Description</label>
            <textarea
              value={config.embedDescription}
              onChange={(e) => handleChange('embedDescription', e.target.value)}
              rows={6}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 resize-none font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-2">
              Available variables: <code className="text-indigo-400">{'{orderId}'}</code>, <code className="text-indigo-400">{'{player}'}</code>, <code className="text-indigo-400">{'{version}'}</code>, <code className="text-indigo-400">{'{price}'}</code>, <code className="text-indigo-400">{'{status}'}</code>, <code className="text-indigo-400">{'{discount}'}</code>, <code className="text-indigo-400">{'{items}'}</code>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Footer Text</label>
              <input
                type="text"
                value={config.embedFooter}
                onChange={(e) => handleChange('embedFooter', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Footer Icon URL</label>
              <input
                type="text"
                value={config.embedFooterIcon}
                onChange={(e) => handleChange('embedFooterIcon', e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Embed Image / GIF URL (Full Image, not thumbnail)</label>
            <input
              type="text"
              value={config.embedImage || ''}
              onChange={(e) => handleChange('embedImage', e.target.value)}
              placeholder="https://store.crystalmc.fun/crystal-embed.gif"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Displays as the large full-width banner image at the bottom of the embed rather than a small side thumbnail.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-slate-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showProofImage}
                onChange={(e) => handleChange('showProofImage', e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
              />
              <span className="text-slate-300">Include Payment Proof Image</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showPlayerHead}
                onChange={(e) => handleChange('showPlayerHead', e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
              />
              <span className="text-slate-300">Include Player Head Thumbnail</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-400">Embed Fields</label>
              <button
                onClick={() => {
                  const newFields = [...(config.fields || []), { id: Date.now().toString(), name: 'New Field', value: 'Value', inline: true }];
                  handleChange('fields', newFields);
                }}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Add Field
              </button>
            </div>
            
            <div className="space-y-4">
              {(config.fields || []).map((field, index) => (
                <div key={field.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative group">
                  <button
                    onClick={() => {
                      const newFields = config.fields.filter((_, i) => i !== index);
                      handleChange('fields', newFields);
                    }}
                    className="absolute top-2 right-2 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={16} />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Name</label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => {
                          const newFields = [...config.fields];
                          newFields[index].name = e.target.value;
                          handleChange('fields', newFields);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Value</label>
                      <textarea
                        value={field.value}
                        onChange={(e) => {
                          const newFields = [...config.fields];
                          newFields[index].value = e.target.value;
                          handleChange('fields', newFields);
                        }}
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>
                  </div>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.inline}
                      onChange={(e) => {
                        const newFields = [...config.fields];
                        newFields[index].inline = e.target.checked;
                        handleChange('fields', newFields);
                      }}
                      className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
                    />
                    <span className="text-xs text-slate-400">Inline</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {createPortal(
        <AnimatePresence>
          {isPreviewOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
              onClick={() => setIsPreviewOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#36393f] rounded-xl overflow-hidden max-w-lg w-full shadow-2xl border border-white/5"
              >
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#2f3136]">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <ImageIcon size={18} className="text-indigo-400" />
                    Discord Preview
                  </h3>
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 font-sans text-[#dcddde]">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#202225] shrink-0 overflow-hidden">
                      {config.avatarUrl ? (
                        <img src={config.avatarUrl} alt="Bot Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#b9bbbe]">
                          <User size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-medium text-white hover:underline cursor-pointer">{config.username || 'CrystalMC Store'}</span>
                        <span className="text-[10px] bg-[#5865F2] text-white px-1 py-0.5 rounded font-bold flex items-center gap-0.5">
                          <Check size={8} strokeWidth={4} /> BOT
                        </span>
                        <span className="text-[10px] text-[#72767d]">Today at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      
                      {config.content && (
                        <div className="mb-2 whitespace-pre-wrap text-sm leading-relaxed">
                          {renderDiscordText(config.content)}
                        </div>
                      )}

                      <div className="bg-[#2f3136] border-l-4 rounded-r-md p-4 mt-2 max-w-full" style={{ borderColor: config.embedColor }}>
                        <div className="flex gap-4">
                          <div className="flex-1 min-w-0">
                            {config.embedTitle && (
                              <div className="font-bold text-white mb-2 text-base leading-tight">
                                {renderDiscordText(config.embedTitle)}
                              </div>
                            )}
                            
                            {config.embedDescription && (
                              <div className="text-sm whitespace-pre-wrap mb-4 leading-relaxed">
                                {renderDiscordText(config.embedDescription)}
                              </div>
                            )}

                            {config.fields && config.fields.length > 0 && (
                              <div className="flex flex-wrap gap-y-4 -mx-2 mb-4">
                                {config.fields.map((field, i) => (
                                  <div key={i} className={`px-2 ${field.inline ? 'w-1/2' : 'w-full'}`}>
                                    <div className="text-xs font-bold text-[#dcddde] mb-1">
                                      {renderDiscordText(field.name)}
                                    </div>
                                    <div className="text-sm text-[#dcddde] whitespace-pre-wrap leading-snug">
                                      {renderDiscordText(field.value)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {config.embedImage ? (
                              <div className="mt-4 rounded-md overflow-hidden max-w-full border border-white/5">
                                <img src={config.embedImage} alt="Embed Banner" className="w-full h-auto object-cover max-h-[320px]" />
                              </div>
                            ) : config.showProofImage ? (
                              <div className="mt-4 rounded-md overflow-hidden max-w-[300px] border border-white/5">
                                <img src="https://i.ibb.co/8DhgMNkg/minecraft-live-2025-3840x2160-24154.jpg" alt="Proof" className="w-full h-auto" />
                              </div>
                            ) : null}
                          </div>

                          {config.showPlayerHead && (
                            <div className="w-20 h-20 shrink-0 rounded-md overflow-hidden border border-white/5">
                              <img src="https://mc-heads.net/avatar/Notch" alt="Player Head" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>

                        {(config.embedFooter || config.embedFooterIcon) && (
                          <div className="flex items-center gap-2 mt-4 text-[10px] text-[#72767d]">
                            {config.embedFooterIcon && (
                              <img src={config.embedFooterIcon} alt="Footer Icon" className="w-4 h-4 rounded-full" />
                            )}
                            <span>{config.embedFooter} • Today at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-[#2f3136] border-t border-white/5 flex justify-end">
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                  >
                    Close Preview
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
