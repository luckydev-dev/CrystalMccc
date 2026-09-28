import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, Send, Key, Link as LinkIcon, Type, FileText } from 'lucide-react';
import { ref, get, set } from 'firebase/database';
import { db } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { useAdminHeader } from '../../context/AdminHeaderContext';

export function Notifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const [restApiKey, setRestApiKey] = useState('');
  const [appId, setAppId] = useState('feba20a1-9619-4a2b-b3c5-a8692fe8b20d');
  const [isSending, setIsSending] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const { toast } = useToast();
  const { setTitle: setHeaderTitle, setAction } = useAdminHeader();

  useEffect(() => {
    setHeaderTitle('Push Notifications');
    setAction(null);

    // Load OneSignal settings from Firebase
    const loadSettings = async () => {
      try {
        const snapshot = await get(ref(db, 'siteData/onesignal'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.restApiKey) setRestApiKey(data.restApiKey);
          if (data.appId) setAppId(data.appId);
        }
      } catch (error) {
        console.error('Failed to load OneSignal settings:', error);
      }
    };
    loadSettings();
  }, [setHeaderTitle, setAction]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await set(ref(db, 'siteData/onesignal'), {
        restApiKey,
        appId
      });
      toast('OneSignal settings saved successfully', 'success');
    } catch (error) {
      toast('Failed to save settings', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restApiKey) {
      toast('Please configure your REST API Key first', 'error');
      return;
    }

    setIsSending(true);
    try {
      const payload = {
        app_id: appId,
        included_segments: ["Subscribed Users", "Total Subscriptions"],
        headings: { en: title },
        contents: { en: message },
        url: url || window.location.origin,
      };

      const response = await fetch('/api/onesignal/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payload, restApiKey })
      });

      const contentType = response.headers.get('content-type');
      let data: any = {};

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('[Notification Client Success/Info] Response JSON Data:', data);
      } else {
        const text = await response.text();
        console.error('[Notification Client Error] Received non-JSON response text:', text);
        
        let displayError = text;
        if (text.trim().startsWith('<')) {
          const match = text.match(/<title>(.*?)<\/title>/i);
          if (match && match[1]) {
            displayError = `HTML Error: ${match[1]}`;
          } else {
            displayError = text.slice(0, 150) + '...';
          }
        }
        throw new Error(`${displayError} (HTTP status ${response.status})`);
      }

      if (response.ok && data.id) {
        toast('Notification sent successfully!', 'success');
        setTitle('');
        setMessage('');
        setUrl('');
      } else {
        const errMsg = data.errors?.[0] || data.error || 'Failed to send notification';
        console.error('[Notification Client Error] Error message from JSON endpoint:', errMsg, data);
        throw new Error(errMsg);
      }
    } catch (error: any) {
      console.error('[Notification Client Error] Complete exception details:', error);
      toast(error.message || 'Failed to send notification', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Send Notification Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">Send Notification</h2>
              <p className="text-sm text-slate-400">Push a message to all subscribed users</p>
            </div>
          </div>
          <button
            onClick={() => {
              if ((window as any).OneSignalDeferred) {
                (window as any).OneSignalDeferred.push(async function(OneSignal: any) {
                  await OneSignal.Slidedown.promptPush();
                });
              }
            }}
            className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <Bell size={16} />
            Subscribe to Test
          </button>
        </div>

        <form onSubmit={handleSendNotification} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Notification Title</label>
              <div className="relative">
                <Type className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g., Massive Weekend Sale!"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Message Content</label>
              <div className="relative">
                <FileText className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors min-h-[100px] resize-y"
                  placeholder="e.g., Get 50% off all ranks this weekend only. Click here to shop now!"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Target URL (Optional)</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="https://yourstore.com/sale"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">Where users will be taken when they click the notification.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSending || !restApiKey}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Send to All Subscribers
              </>
            )}
          </button>
          
          {!restApiKey && (
            <p className="text-center text-sm text-amber-400 mt-2">
              Please configure your REST API Key below before sending notifications.
            </p>
          )}
        </form>
      </div>

      {/* Settings Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
            <Key size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">OneSignal Settings</h2>
            <p className="text-sm text-slate-400">Configure your API keys to enable sending</p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">App ID</label>
              <input
                type="text"
                required
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">REST API Key</label>
              <input
                type="password"
                required
                value={restApiKey}
                onChange={(e) => setRestApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm"
                placeholder="os_v2_app_..."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
            >
              {isSavingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
