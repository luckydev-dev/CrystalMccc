import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BellIcon, CheckIcon, XIcon } from '@animateicons/react/lucide';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

// Helper to trigger guaranteed immediate welcome notification on both Desktop & Mobile (Android)
async function dispatchWelcomeNotification() {
  const title = "CrystalMC Network ✦";
  const options: NotificationOptions & { vibrate?: number[] } = {
    body: "🎉 Subscription confirmed! You'll receive real-time server updates, rank deliveries, and drop alerts.",
    icon: "https://i.ibb.co/FLT58CqD/CM.png",
    badge: "https://i.ibb.co/FLT58CqD/CM.png",
    tag: `crystalmc-welcome-${Date.now()}`,
    vibrate: [200, 100, 200],
    data: { url: window.location.origin }
  };

  // 1. Android & Modern Browsers: Ensure service worker registration & display via showNotification
  if ('serviceWorker' in navigator) {
    try {
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        reg = await navigator.serviceWorker.register('/OneSignalSDKWorker.js', { scope: '/' });
      }

      if (reg) {
        // Wait briefly if worker is still installing
        if (reg.installing) {
          await new Promise<void>((resolve) => {
            reg?.installing?.addEventListener('statechange', function () {
              if (this.state === 'activated' || this.state === 'installed') resolve();
            });
            setTimeout(resolve, 1200);
          });
        }

        // Show directly via Service Worker
        if (typeof reg.showNotification === 'function') {
          await reg.showNotification(title, options);
          return;
        }

        // Or dispatch to active worker via postMessage
        if (reg.active) {
          reg.active.postMessage({
            type: 'SHOW_NOTIFICATION',
            title,
            options
          });
          return;
        }
      }

      // Try waiting for ready registration
      const readyReg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 1500))
      ]);
      if (readyReg && typeof readyReg.showNotification === 'function') {
        await readyReg.showNotification(title, options);
        return;
      }
    } catch (swErr) {
      console.warn('[Notifications] ServiceWorker notification error:', swErr);
    }
  }

  // 2. Desktop Fallback: Notification API
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, {
        body: options.body,
        icon: options.icon
      });
    }
  } catch (notifErr) {
    console.warn('[Notifications] Window Notification constructor fallback:', notifErr);
  }
}

export function SubscriptionPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has already granted notification permission
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      setIsSubscribed(true);
      return;
    }

    // Check if dismissed in this immediate session (unless manually reopened)
    const isDismissed = sessionStorage.getItem('crystal_notifications_dismissed_session') === 'true';

    // OneSignal subscription change listener
    const setupListener = () => {
      const OneSignal = (window as any).OneSignal;
      if (OneSignal?.User?.PushSubscription) {
        if (OneSignal.User.PushSubscription.optedIn) {
          setIsSubscribed(true);
          return;
        }

        try {
          if (!(window as any).__oneSignalChangeListenerAttached) {
            (window as any).__oneSignalChangeListenerAttached = true;
            OneSignal.User.PushSubscription.addEventListener('change', (e: any) => {
              if (e.current?.optedIn) {
                setIsSubscribed(true);
                setIsVisible(false);
                dispatchWelcomeNotification();
              }
            });
          }
        } catch (err) {
          console.warn('[Notifications] OneSignal listener attach warning:', err);
        }
      }
    };

    if ((window as any).OneSignal) {
      setupListener();
    } else {
      (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
      (window as any).OneSignalDeferred.push(setupListener);
    }

    // Allow manual open via custom event
    const handleManualOpen = () => {
      setIsSubscribed(false);
      setIsVisible(true);
    };
    window.addEventListener('crystalmc:open-notifications-prompt', handleManualOpen);

    // Show prompt after 1.5 seconds if user has not yet granted permission and hasn't closed it
    const timer = setTimeout(() => {
      const granted = typeof Notification !== 'undefined' && Notification.permission === 'granted';
      if (!granted && !isDismissed) {
        setIsVisible(true);
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('crystalmc:open-notifications-prompt', handleManualOpen);
    };
  }, []);

  const handleSubscribe = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      let permissionGranted = false;

      // 1. Check if permission is already granted in the browser
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        permissionGranted = true;
      } else {
        // 2. Trigger OneSignal SDK requestPermission first so OneSignal captures the event
        const OneSignal = (window as any).OneSignal;
        if (OneSignal?.Notifications && typeof OneSignal.Notifications.requestPermission === 'function') {
          try {
            await Promise.race([
              OneSignal.Notifications.requestPermission(),
              new Promise((r) => setTimeout(r, 4000))
            ]);
            if (Notification.permission === 'granted') {
              permissionGranted = true;
            }
          } catch (osErr) {
            console.warn('[Notifications] OneSignal requestPermission:', osErr);
          }
        }

        // 3. Fallback to native browser requestPermission if still not granted
        if (!permissionGranted && typeof Notification !== 'undefined' && typeof Notification.requestPermission === 'function') {
          try {
            const res = await new Promise<NotificationPermission>((resolve) => {
              try {
                const p = Notification.requestPermission((result) => {
                  if (result) resolve(result);
                });
                if (p && typeof p.then === 'function') {
                  p.then(resolve).catch(() => resolve('default'));
                }
              } catch {
                resolve('default');
              }
            });

            if (res === 'granted' || Notification.permission === 'granted') {
              permissionGranted = true;
            }
          } catch (permErr) {
            console.warn('[Notifications] requestPermission error:', permErr);
          }
        }
      }

      // If user accepted / granted permission:
      if (permissionGranted || (typeof Notification !== 'undefined' && Notification.permission === 'granted')) {
        // Immediately dismiss modal
        setIsVisible(false);
        setIsSubscribed(true);

        // Store permanent subscription flag
        localStorage.setItem('crystal_notifications_subscribed', 'true');
        sessionStorage.setItem('crystal_notifications_dismissed_session', 'true');

        // Tell OneSignal to opt-in the subscription
        const OneSignal = (window as any).OneSignal;
        if (OneSignal?.User?.PushSubscription && typeof OneSignal.User.PushSubscription.optIn === 'function') {
          try {
            await OneSignal.User.PushSubscription.optIn();
          } catch (err: any) {
            console.warn('[Notifications] OneSignal optIn error:', err);
          }
        }

        toast('🎉 Notifications turned on successfully!', 'success');

        // Immediately trigger guaranteed welcome push notification
        await dispatchWelcomeNotification();
      } else if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
        // User explicitly blocked notifications
        setIsVisible(false);
        sessionStorage.setItem('crystal_notifications_dismissed_session', 'true');
        toast('Notifications are blocked in your browser settings.', 'info');
      } else {
        // User closed or dismissed browser prompt
        setIsVisible(false);
        sessionStorage.setItem('crystal_notifications_dismissed_session', 'true');
      }
    } catch (error) {
      console.error('[Notifications] Subscribe error:', error);
      setIsVisible(false);
      sessionStorage.setItem('crystal_notifications_dismissed_session', 'true');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('crystal_notifications_dismissed_session', 'true');
  };

  if (isSubscribed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-[999] max-w-[calc(100%-2rem)] sm:max-w-sm w-full font-sans"
        >
          <div className="relative overflow-hidden bg-slate-900/95 border border-slate-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
            {/* Background Accent Gradients */}
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3.5">
              {/* Left Decoration: Responsive Brand Bell Icon */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <BellIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                </div>
              </div>

              {/* Right content area */}
              <div className="flex-grow flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-white text-base leading-none">Enable Push Alerts</h3>
                  <button 
                    onClick={handleDismiss}
                    aria-label="Close notification prompt"
                    className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-800/50 rounded-lg cursor-pointer"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Subscribe to receive real-time rank & item deliveries, exclusive discount codes, and live Minecraft server notices.
                </p>

                {/* Event Actions */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={handleSubscribe}
                    disabled={isProcessing}
                    className="flex-grow flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-75 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Enabling...</span>
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-3.5 h-3.5" />
                        <span>Subscribe Now</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDismiss}
                    disabled={isProcessing}
                    className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-transparent hover:border-slate-700 rounded-xl transition-all cursor-pointer"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
