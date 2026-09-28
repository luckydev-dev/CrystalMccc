import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BellIcon, CheckIcon, XIcon } from '@animateicons/react/lucide';
import { useToast } from '../../context/ToastContext';

export function SubscriptionPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // 1. Check native browser notification permission directly
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      setIsSubscribed(true);
      return;
    }

    // 2. Check if user already dismissed in the current session
    const isDismissedSession = sessionStorage.getItem('crystal_notifications_dismissed_session');
    if (isDismissedSession === 'true') {
      return;
    }

    // 3. Query actual OneSignal state if available
    const checkOneSignalState = () => {
      const OneSignal = (window as any).OneSignal;
      if (OneSignal && OneSignal.User && OneSignal.User.PushSubscription) {
        const optedIn = OneSignal.User.PushSubscription.optedIn;
        if (optedIn) {
          setIsSubscribed(true);
          return true;
        }
      }
      return false;
    };

    // 4. Setup listener for OneSignal initialization and subscription changes
    const setupOneSignalListeners = () => {
      const OneSignal = (window as any).OneSignal;
      if (OneSignal) {
        // Init state check
        checkOneSignalState();

        // Listen for changes
        try {
          if (OneSignal.User && OneSignal.User.PushSubscription) {
            if (!(window as any).__oneSignalChangeListenerAttached) {
              (window as any).__oneSignalChangeListenerAttached = true;
              OneSignal.User.PushSubscription.addEventListener('change', (e: any) => {
                if (e.current?.optedIn) {
                  setIsSubscribed(true);
                  setIsVisible(false);
                  toast('Successfully subscribed to notifications!', 'success');
                }
              });
            }
          }
        } catch (err) {
          console.error('Failed to attach OneSignal change listener:', err);
        }
      }
    };

    // Listen to OneSignalDeferred or OneSignal
    if ((window as any).OneSignal) {
      setupOneSignalListeners();
    } else {
      (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
      (window as any).OneSignalDeferred.push(() => {
        setupOneSignalListeners();
      });
    }

    // Set a slight delay before showing the prompt toast so it is highly polished and non-intrusive
    const timer = setTimeout(() => {
      const OneSignalValue = (window as any).OneSignal;
      let alreadySubscribed = false;
      if (OneSignalValue && OneSignalValue.User && OneSignalValue.User.PushSubscription) {
        alreadySubscribed = OneSignalValue.User.PushSubscription.optedIn;
      }
      
      const isDismissed = sessionStorage.getItem('crystal_notifications_dismissed_session') === 'true';
      const nativeGranted = typeof Notification !== 'undefined' && Notification.permission === 'granted';

      if (!nativeGranted && !alreadySubscribed && !isDismissed) {
        setIsVisible(true);
      }
    }, 2500); // Shorter delay for responsive feedback during testing

    return () => clearTimeout(timer);
  }, [toast]);

  const handleSubscribe = async () => {
    try {
      let permissionResult = 'default';

      // First, directly invoke browser Notification API if available
      if (typeof Notification !== 'undefined') {
        if (Notification.permission === 'granted') {
          permissionResult = 'granted';
        } else {
          try {
            permissionResult = await Notification.requestPermission();
          } catch (e) {
            console.warn('Native requestPermission error, falling back to OneSignal:', e);
          }
        }
      }

      const triggerPushPrompt = async (os: any) => {
        try {
          if (os.Notifications && typeof os.Notifications.requestPermission === 'function') {
            await os.Notifications.requestPermission();
          } else if (os.Slidedown && typeof os.Slidedown.promptPush === 'function') {
            await os.Slidedown.promptPush();
          } else if (typeof os.registerForPushNotifications === 'function') {
            await os.registerForPushNotifications();
          }

          if (os.User?.PushSubscription && typeof os.User.PushSubscription.optIn === 'function') {
            await os.User.PushSubscription.optIn();
          }
        } catch (err) {
          console.error('Error triggering OneSignal prompt:', err);
        }
      };

      const OneSignal = (window as any).OneSignal;
      if (OneSignal) {
        await triggerPushPrompt(OneSignal);
      } else {
        (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
        (window as any).OneSignalDeferred.push(async function(os: any) {
          await triggerPushPrompt(os);
        });
      }

      if (permissionResult === 'granted' || (typeof Notification !== 'undefined' && Notification.permission === 'granted')) {
        setIsSubscribed(true);
        setIsVisible(false);
        toast('Notifications turned on successfully!', 'success');
      } else {
        setIsVisible(false);
        toast('Notification prompt opened. Please allow notifications in your browser.', 'info');
      }
    } catch (error) {
      console.error('OneSignal Subscription Request Failed:', error);
      toast('Failed to launch notification system. Please check browser notification permissions.', 'error');
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Dismiss for the current session to ensure testing is easy and painless upon refresh/reentry
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
                    className="flex-grow flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-all shadow-md shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <CheckIcon className="w-3.5 h-3.5" />
                    <span>Subscribe Now</span>
                  </button>
                  <button
                    onClick={handleDismiss}
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
