import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Upload, ChevronRight, Check, ArrowLeft, Monitor, Smartphone, 
  ChevronDown, Copy, Globe, ShieldCheck, QrCode, Receipt, Sparkles, 
  ExternalLink, CreditCard, HelpCircle, Info, ShoppingBag, Tag, RefreshCw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ref, push, set, get } from 'firebase/database';
import { db } from '../../lib/firebase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CountryCode = 'BD' | 'IN' | 'GLOBAL';
type BDPaymentMethod = 'bkash' | 'nagad';

interface SitePaymentSettings {
  upiId: string;
  payeeName: string;
  bkashNumber: string;
  nagadNumber: string;
  bdtRate: number; // 1 INR = X BDT (e.g. 1.40)
  discordUrl?: string;
}

const COUNTRIES: { id: CountryCode; name: string; flag: string; currency: string; symbol: string }[] = [
  { id: 'BD', name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT', symbol: '৳' },
  { id: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', symbol: '₹' },
  { id: 'GLOBAL', name: 'International / Other', flag: '🌐', currency: 'USD', symbol: '$' }
];

const BD_METHODS: { id: BDPaymentMethod; name: string; color: string; bgGradient: string; textClass: string; borderColor: string; logoUrl?: string }[] = [
  { 
    id: 'bkash', 
    name: 'bKash', 
    color: '#e2136e', 
    bgGradient: 'from-pink-500/20 to-rose-500/10', 
    textClass: 'text-pink-400',
    borderColor: 'border-pink-500/50'
  },
  { 
    id: 'nagad', 
    name: 'Nagad', 
    color: '#f7941d', 
    bgGradient: 'from-orange-500/20 to-amber-500/10', 
    textClass: 'text-orange-400',
    borderColor: 'border-orange-500/50'
  }
];

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, cartTotal, discount, toggleCart, clearCart, appliedPromoCode } = useCart();
  const { user, userData } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [playerName, setPlayerName] = useState(userData?.username || '');
  const [edition, setEdition] = useState<'Java' | 'Pocket'>('Java');
  const initialDetectedServer = ((items.find(i => (i as any).server || i.gameMode)?.server || items.find(i => (i as any).server || i.gameMode)?.gameMode || 'survival') as 'survival' | 'lifesteal' | 'pvp');
  const [server, setServer] = useState<'survival' | 'lifesteal' | 'pvp'>(initialDetectedServer);
  const [country, setCountry] = useState<CountryCode>('BD');
  const [bdMethod, setBdMethod] = useState<BDPaymentMethod>('bkash');
  
  const [proofUrl, setProofUrl] = useState('');
  const [trxId, setTrxId] = useState('');
  const [note, setNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  useEffect(() => {
    const itemServer = items.find(i => (i as any).server || i.gameMode);
    if (itemServer) {
      const mode = ((itemServer as any).server || itemServer.gameMode || 'survival') as any;
      if (mode === 'survival' || mode === 'lifesteal' || mode === 'pvp') {
        setServer(mode);
      }
    }
  }, [items]);

  const [settings, setSettings] = useState<SitePaymentSettings>({
    upiId: 'crystalmc@upi',
    payeeName: 'CrystalMC',
    bkashNumber: '01700000000',
    nagadNumber: '01800000000',
    bdtRate: 1.40,
    discordUrl: 'https://discord.gg/crystalmc'
  });

  const [isEditionDropdownOpen, setIsEditionDropdownOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const finalTotalINR = cartTotal * (1 - discount);
  
  // Calculate converted prices based on selected country
  const selectedCountryObj = COUNTRIES.find(c => c.id === country) || COUNTRIES[0];
  
  const getFormattedTotal = () => {
    if (country === 'BD') {
      const bdt = finalTotalINR * (settings.bdtRate || 1.40);
      return { amount: Math.ceil(bdt), currency: 'BDT', symbol: '৳' };
    } else if (country === 'GLOBAL') {
      // 1 INR ~= 0.012 USD
      const usd = finalTotalINR * 0.012;
      return { amount: parseFloat(usd.toFixed(2)), currency: 'USD', symbol: '$' };
    }
    return { amount: parseFloat(finalTotalINR.toFixed(2)), currency: 'INR', symbol: '₹' };
  };

  const formattedTotal = getFormattedTotal();

  useEffect(() => {
    if (isOpen) {
      get(ref(db, 'siteData/settings')).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setSettings({
            upiId: data.upiId || 'crystalmc@upi',
            payeeName: data.payeeName || 'CrystalMC',
            bkashNumber: data.bkashNumber || '01700000000',
            nagadNumber: data.nagadNumber || '01800000000',
            bdtRate: parseFloat(data.bdtRate) || 1.40,
            discordUrl: data.discordUrl || 'https://discord.gg/crystalmc'
          });
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsEditionDropdownOpen(false);
      }
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const getBdAccountNumber = () => {
    switch (bdMethod) {
      case 'bkash': return settings.bkashNumber;
      case 'nagad': return settings.nagadNumber;
      default: return settings.bkashNumber;
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const base64Content = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

      try {
        const formData = new FormData();
        formData.append('image', base64Content);

        const res = await fetch('https://api.imgbb.com/1/upload?key=0821b9a2d3493637e6ed7f07918b8bae', {
          method: 'POST',
          body: formData
        });
        
        const data = await res.json();

        if (data && data.success && data.data && data.data.url) {
          setProofUrl(data.data.url);
          toast('Payment proof uploaded successfully!', 'success');
          setIsUploading(false);
          return;
        }
      } catch (err) {
        console.warn('ImgBB upload error, using local fallback:', err);
      }

      setProofUrl(dataUrl);
      toast('Payment proof uploaded successfully!', 'success');
      setIsUploading(false);
    };

    reader.onerror = () => {
      toast('Failed to read image file.', 'error');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!proofUrl) {
      toast('Please upload payment proof screenshot.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderRef = push(ref(db, 'orders'));
      const activeBdMethod = BD_METHODS.find(m => m.id === bdMethod);
      const selectedPaymentName = country === 'BD' 
        ? `${activeBdMethod?.name || 'bKash'} (Bangladesh MFS)`
        : country === 'IN' 
        ? 'UPI (India)'
        : 'International / Discord';

      await set(orderRef, {
        id: orderRef.key,
        userId: user?.uid || 'guest',
        player: playerName.trim(),
        server,
        items: items.map(item => ({
          ...item,
          server,
          gameMode: item.gameMode || server
        })),
        total: finalTotalINR,
        localTotal: formattedTotal.amount,
        currency: formattedTotal.currency,
        country: country,
        paymentMethod: selectedPaymentName,
        trxId: trxId.trim() || 'N/A',
        accountNumber: country === 'BD' ? getBdAccountNumber() : (country === 'IN' ? settings.upiId : 'N/A'),
        edition,
        proofUrl,
        note: note.trim(),
        status: 'adminrq',
        promoCode: appliedPromoCode || null,
        createdAt: Date.now()
      });

      if (appliedPromoCode) {
        const promoRef = ref(db, `promoCodes/${appliedPromoCode}`);
        const snapshot = await get(promoRef);
        if (snapshot.exists()) {
          const promoData = snapshot.val();
          await set(ref(db, `promoCodes/${appliedPromoCode}/currentUses`), (promoData.currentUses || 0) + 1);
        }
      }

      // Send Discord Webhook
      try {
        const webhookSnapshot = await get(ref(db, 'siteData/discordWebhook'));
        if (webhookSnapshot.exists()) {
          const config = webhookSnapshot.val();
          if (config.url) {
            const itemsList = items.map(item => `- ${item.name} (x${item.quantity})`).join('\n');
            const replaceVars = (text: string) => {
              return text
                .replace(/{orderId}/g, orderRef.key || 'UNKNOWN')
                .replace(/{player}/g, playerName.trim())
                .replace(/{server}/g, server.toUpperCase())
                .replace(/{version}/g, edition)
                .replace(/{price}/g, `${formattedTotal.symbol}${formattedTotal.amount} (${formattedTotal.currency})`)
                .replace(/{status}/g, 'Pending Approval')
                .replace(/{discount}/g, appliedPromoCode ? `${(discount * 100).toFixed(0)}% (${appliedPromoCode})` : 'None')
                .replace(/{items}/g, itemsList);
            };

            const payload = {
              username: config.username || 'CrystalMC Store',
              avatar_url: config.avatarUrl || undefined,
              content: replaceVars(config.content || ''),
              embeds: [
                {
                  title: replaceVars(config.embedTitle || `New Order #${orderRef.key}`),
                  description: replaceVars(config.embedDescription || `Player **${playerName.trim()}** placed an order on **${server.toUpperCase()}** using **${selectedPaymentName}**.`),
                  color: config.embedColor ? parseInt(config.embedColor.replace('#', ''), 16) : 0x6366f1,
                  fields: [
                    { name: 'Order ID', value: orderRef.key || 'N/A', inline: true },
                    { name: 'Player Name', value: playerName.trim(), inline: true },
                    { name: 'Server', value: server.toUpperCase(), inline: true },
                    { name: 'Edition', value: edition, inline: true },
                    { name: 'Payment Method', value: selectedPaymentName, inline: true },
                    { name: 'TRX ID', value: trxId.trim() || 'Not provided', inline: true },
                    { name: 'Amount Paid', value: `${formattedTotal.symbol}${formattedTotal.amount} ${formattedTotal.currency}`, inline: true },
                    { name: 'Items Ordered', value: itemsList || 'N/A', inline: false }
                  ],
                  footer: {
                    text: `CrystalMC Store - ${selectedCountryObj.name}`,
                    icon_url: config.embedFooterIcon || undefined
                  },
                  image: config.embedImage ? { url: config.embedImage } : (config.showProofImage ? { url: proofUrl } : undefined),
                  thumbnail: config.showPlayerHead ? { url: `https://mc-heads.net/avatar/${playerName.trim()}` } : undefined,
                  timestamp: new Date().toISOString()
                }
              ]
            };

            await fetch(config.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          }
        }
      } catch (webhookErr) {
        console.error('Failed to send webhook:', webhookErr);
      }

      // Send OneSignal Notification to Admins
      try {
        const onesignalSnapshot = await get(ref(db, 'siteData/onesignal'));
        if (onesignalSnapshot.exists()) {
          const osConfig = onesignalSnapshot.val();
          if (osConfig.appId && osConfig.restApiKey) {
            const usersSnapshot = await get(ref(db, 'users'));
            if (usersSnapshot.exists()) {
              const usersData = usersSnapshot.val();
              const adminUids = Object.keys(usersData).filter(uid => 
                usersData[uid].role === 'admin' || usersData[uid].role === 'owner'
              );

              if (adminUids.length > 0) {
                const payload = {
                  app_id: osConfig.appId,
                  include_aliases: { external_id: adminUids },
                  target_channel: "push",
                  headings: { en: "🛒 New Order Received!" },
                  contents: { en: `Order #${orderRef.key} placed by ${playerName.trim()} (${selectedPaymentName}) for ${formattedTotal.symbol}${formattedTotal.amount}.` },
                  url: `${window.location.origin}/admin/orders?id=${orderRef.key}`
                };

                await fetch('/api/onesignal/send', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ payload, restApiKey: osConfig.restApiKey })
                }).catch(() => {});
              }
            }
          }
        }
      } catch (_) {
        // Non-blocking notification
      }

      toast('Order submitted successfully!', 'success');
      onClose();
      toggleCart();
      clearCart();
      
      window.location.href = `/order-success?id=${orderRef.key}`;
    } catch (err) {
      toast('Failed to submit order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build payment payload for QR Code
  const getQrPayload = () => {
    if (country === 'BD') {
      const num = getBdAccountNumber();
      // Format as standard BD MFS URL payload or scan target
      return `${bdMethod}://pay?number=${num}&amount=${formattedTotal.amount}&ref=${encodeURIComponent('CrystalMC')}`;
    } else if (country === 'IN') {
      return `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.payeeName)}&am=${formattedTotal.amount}&cu=INR`;
    }
    return settings.discordUrl || 'https://discord.gg/crystalmc';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col my-auto max-h-[92vh] relative"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-950/80 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button 
                  onClick={() => setStep((step - 1) as any)} 
                  className="text-slate-400 hover:text-white transition-colors p-2 bg-slate-800/60 hover:bg-slate-800 rounded-xl"
                  title="Go Back"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-heading flex items-center gap-2">
                  <span>Checkout</span>
                  <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-sans font-bold">
                    Step {step} of 3
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {step === 1 && 'Enter player details & country'}
                  {step === 2 && 'Complete payment via QR or App'}
                  {step === 3 && 'Submit payment screenshot proof'}
                </p>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800/60 rounded-xl"
            >
              <X size={20} />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="bg-slate-950/60 px-6 py-2.5 border-b border-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-400 shrink-0">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-400' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                1
              </div>
              <span className="hidden sm:inline">Details</span>
            </div>
            <div className={`h-0.5 flex-1 mx-3 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-800'}`} />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-400' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                2
              </div>
              <span className="hidden sm:inline">Payment</span>
            </div>
            <div className={`h-0.5 flex-1 mx-3 rounded-full ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-800'}`} />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-indigo-400' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                3
              </div>
              <span className="hidden sm:inline">Submit</span>
            </div>
          </div>

          {/* Main Scrollable Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">

            {/* Collapsible Order Summary Bar */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setShowOrderSummary(!showOrderSummary)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                    <ShoppingBag size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      Order Summary ({items.reduce((sum, i) => sum + i.quantity, 0)} items)
                    </span>
                    <span className="text-xs text-slate-400">
                      Total: <strong className="text-indigo-400 font-extrabold">{formattedTotal.symbol}{formattedTotal.amount} {formattedTotal.currency}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                  <span>{showOrderSummary ? 'Hide' : 'View'}</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${showOrderSummary ? 'rotate-180' : ''}`} />
                </div>
              </button>

              <AnimatePresence>
                {showOrderSummary && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-800/80 px-4 py-3 space-y-2.5 bg-slate-900/40 text-xs"
                  >
                    {items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-800 text-indigo-300 font-mono font-bold px-1.5 py-0.5 rounded">
                            {item.quantity}x
                          </span>
                          <span className="font-semibold text-white">{item.name}</span>
                        </div>
                        <span className="font-mono text-slate-400">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}

                    {discount > 0 && (
                      <div className="flex justify-between items-center text-emerald-400 pt-2 border-t border-slate-800/60 font-semibold">
                        <span className="flex items-center gap-1">
                          <Tag size={12} /> Promo Discount ({(discount * 100).toFixed(0)}%)
                        </span>
                        <span>-₹{(cartTotal * discount).toFixed(2)}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold text-sm text-white">
                      <span>Total Amount:</span>
                      <span className="text-indigo-400 font-extrabold text-base">
                        {formattedTotal.symbol}{formattedTotal.amount} {formattedTotal.currency}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STEP 1: Details & Payment Country Selection */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Minecraft Username */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Minecraft Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your exact in-game name..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white font-bold focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                  />
                </div>

                {/* Select Edition */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Minecraft Edition
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsEditionDropdownOpen(!isEditionDropdownOpen)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white font-bold flex items-center justify-between focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer hover:border-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        {edition === 'Java' ? <Monitor size={18} className="text-indigo-400" /> : <Smartphone size={18} className="text-indigo-400" />}
                        <span>{edition === 'Java' ? 'Java Edition' : 'Pocket / Bedrock Edition'}</span>
                      </div>
                      <ChevronDown size={18} className={`text-slate-400 transition-transform ${isEditionDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isEditionDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute z-20 w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setEdition('Java');
                              setIsEditionDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left font-bold transition-colors ${edition === 'Java' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-300 hover:bg-slate-800'}`}
                          >
                            <Monitor size={18} />
                            Java Edition
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEdition('Pocket');
                              setIsEditionDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left font-bold transition-colors border-t border-slate-800 ${edition === 'Pocket' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-300 hover:bg-slate-800'}`}
                          >
                            <Smartphone size={18} />
                            Pocket / Bedrock Edition
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Select Server / Gamemode */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
                    <span>Target Server</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Plugin Detection
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'survival', name: 'Survival', badge: 'SMP', iconUrl: 'https://i.ibb.co/tMRjCxkz/survival-icon.png' },
                      { id: 'lifesteal', name: 'Lifesteal', badge: 'SMP', iconUrl: 'https://i.ibb.co/1ftp7qpp/lifesteal-icon.png' },
                      { id: 'pvp', name: 'PvP', badge: 'Duels', iconUrl: 'https://i.ibb.co/4RnDhfhh/pvp-icon.png' }
                    ].map((s) => {
                      const isSelected = server === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setServer(s.id as 'survival' | 'lifesteal' | 'pvp')}
                          className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer relative ${
                            isSelected
                              ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg shadow-indigo-600/10 ring-1 ring-indigo-500'
                              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          <img src={s.iconUrl} alt="" className="w-6 h-6 object-contain" />
                          <span className="text-xs font-bold leading-tight">{s.name}</span>
                          <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`}>
                            {s.badge}
                          </span>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                              <Check size={10} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Country / Payment Region Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
                    <span>Payment Country / Region</span>
                    <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      Auto Local Currency
                    </span>
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {COUNTRIES.map((c) => {
                      const isSelected = country === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCountry(c.id)}
                          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer relative ${
                            isSelected 
                              ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg shadow-indigo-600/10 ring-1 ring-indigo-500' 
                              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          <span className="text-2xl">{c.flag}</span>
                          <span className="text-xs font-bold leading-tight">{c.name}</span>
                          <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`}>
                            {c.currency} ({c.symbol})
                          </span>

                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                              <Check size={10} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Conversion Highlight Banner */}
                <div className="p-4 bg-gradient-to-r from-indigo-950/50 via-slate-950 to-purple-950/40 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Payable Amount</span>
                    <div className="text-2xl font-black text-white font-heading mt-0.5 flex items-baseline gap-2">
                      <span>{formattedTotal.symbol}{formattedTotal.amount}</span>
                      <span className="text-xs text-indigo-400 font-mono font-bold">{formattedTotal.currency}</span>
                    </div>
                  </div>

                  {country === 'BD' && (
                    <div className="text-right text-[11px] font-medium text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                      <span className="text-slate-300 font-bold block">Rate: 1 INR = {settings.bdtRate} BDT</span>
                      <span className="text-indigo-400">bKash / Nagad</span>
                    </div>
                  )}

                  {country === 'IN' && (
                    <div className="text-right text-[11px] font-medium text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                      <span className="text-emerald-400 font-bold block">Instant UPI QR</span>
                      <span>GPay, PhonePe, Paytm</span>
                    </div>
                  )}

                  {country === 'GLOBAL' && (
                    <div className="text-right text-[11px] font-medium text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                      <span className="text-amber-400 font-bold block">Discord Support</span>
                      <span>PayPal / Card / Crypto</span>
                    </div>
                  )}
                </div>

                {/* Next Step Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!playerName.trim()) {
                      toast('Please enter your Minecraft username', 'error');
                      return;
                    }
                    setStep(2);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 text-base cursor-pointer mt-2"
                >
                  Proceed to Payment <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* STEP 2: Payment Section */}
            {step === 2 && (
              <div className="space-y-5">
                {/* BANGLADESH PAYMENT OPTIONS (bKash / Nagad / Rocket / Upay) */}
                {country === 'BD' && (
                  <div className="space-y-4">
                    {/* BD Method Tabs */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                        Select Bangladesh MFS Method
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {BD_METHODS.map((m) => {
                          const isSelected = bdMethod === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setBdMethod(m.id)}
                              className={`py-2.5 px-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer font-bold text-xs ${
                                isSelected 
                                  ? `bg-slate-950 ${m.borderColor} ${m.textClass} ring-2 ring-offset-2 ring-offset-slate-900 ring-slate-700 shadow-md`
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                              }`}
                            >
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                              <span>{m.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active BD Method Payment Box */}
                    {(() => {
                      const currentMethodObj = BD_METHODS.find(m => m.id === bdMethod)!;
                      const num = getBdAccountNumber();

                      return (
                        <div className={`p-5 rounded-2xl border bg-slate-950/80 ${currentMethodObj.borderColor} space-y-4 text-center relative overflow-hidden shadow-xl`}>
                          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                            <div className="flex items-center gap-2">
                              <div className="w-3.5 h-3.5 rounded-full animate-pulse" style={{ backgroundColor: currentMethodObj.color }} />
                              <span className={`font-black font-heading text-lg ${currentMethodObj.textClass}`}>
                                {currentMethodObj.name} Payment
                              </span>
                            </div>
                            <span className="text-xs bg-slate-900 text-slate-300 px-2.5 py-1 rounded-full border border-slate-800 font-bold">
                              Send Money / Personal
                            </span>
                          </div>

                          {/* Dynamic QR Code for MFS */}
                          <div className="space-y-2">
                            <p className="text-xs text-slate-400 font-medium">
                              Scan QR with your <strong className="text-white">{currentMethodObj.name} App</strong> scanner:
                            </p>
                            
                            <div className="bg-white p-3.5 rounded-2xl inline-block mx-auto shadow-2xl border-4 border-slate-800">
                              <QRCodeSVG
                                value={getQrPayload()}
                                size={170}
                                level="M"
                                includeMargin={true}
                              />
                            </div>
                            <p className="text-[11px] text-slate-400 italic">
                              Or copy the account number & amount below
                            </p>
                          </div>

                          {/* Copy Account Number & Amount */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                              <div className="text-left">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Number</span>
                                <span className="text-white font-mono font-bold text-sm">{num}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(num);
                                  toast(`${currentMethodObj.name} number copied!`, 'success');
                                }}
                                className="p-2 text-indigo-400 hover:text-white hover:bg-indigo-600/20 rounded-lg transition-colors"
                                title="Copy Number"
                              >
                                <Copy size={16} />
                              </button>
                            </div>

                            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                              <div className="text-left">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Amount to Send</span>
                                <span className="text-indigo-400 font-mono font-black text-sm">৳{formattedTotal.amount} BDT</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(formattedTotal.amount.toString());
                                  toast('Amount copied!', 'success');
                                }}
                                className="p-2 text-indigo-400 hover:text-white hover:bg-indigo-600/20 rounded-lg transition-colors"
                                title="Copy Amount"
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Quick Instructions */}
                          <div className="bg-slate-900/60 p-3 rounded-xl text-left text-xs text-slate-300 space-y-1 border border-slate-800/60">
                            <p className="font-bold text-indigo-400 flex items-center gap-1.5">
                              <Info size={14} /> Step-by-step instructions:
                            </p>
                            <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] pl-1">
                              <li>Open your <strong>{currentMethodObj.name}</strong> app or dial code.</li>
                              <li>Select <strong>Send Money</strong> and enter number: <strong className="text-white">{num}</strong></li>
                              <li>Enter exact amount: <strong className="text-white">৳{formattedTotal.amount} BDT</strong></li>
                              <li>Copy the <strong>TRX ID / Transaction ID</strong> & take a screenshot proof!</li>
                            </ol>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* INDIA UPI PAYMENT OPTIONS */}
                {country === 'IN' && (
                  <div className="space-y-4 text-center">
                    <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <span className="font-bold text-white text-base font-heading">UPI Instant QR Code</span>
                        <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          GPay / PhonePe / Paytm
                        </span>
                      </div>

                      <p className="text-xs text-slate-400">
                        Paying Payee: <strong className="text-white font-bold">{settings.payeeName}</strong>
                      </p>

                      <div className="bg-white p-3.5 rounded-2xl inline-block mx-auto shadow-2xl border-4 border-slate-800">
                        <QRCodeSVG
                          value={getQrPayload()}
                          size={180}
                          level="M"
                          includeMargin={true}
                        />
                      </div>

                      <div className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 rounded-xl py-2 px-4 w-fit mx-auto">
                        <span className="text-indigo-300 font-mono font-bold text-sm">{settings.upiId}</span>
                        <button 
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(settings.upiId);
                            toast('UPI ID copied to clipboard!', 'success');
                          }}
                          className="text-slate-400 hover:text-white transition-colors p-1"
                          title="Copy UPI ID"
                        >
                          <Copy size={16} />
                        </button>
                      </div>

                      <a 
                        href={getQrPayload()}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700 text-sm"
                      >
                        <ExternalLink size={16} className="text-indigo-400" /> Open Mobile UPI App
                      </a>
                    </div>
                  </div>
                )}

                {/* GLOBAL INTERNATIONAL PAYMENT OPTIONS */}
                {country === 'GLOBAL' && (
                  <div className="space-y-4">
                    <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-center">
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto">
                        <Globe size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white font-heading">International Payments</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          We accept PayPal, International Cards, and Crypto via Discord Support Ticket.
                        </p>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left text-xs space-y-2 text-slate-300">
                        <p className="font-bold text-indigo-400 flex items-center gap-2">
                          <HelpCircle size={16} /> How to pay from outside BD/India:
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                          Click below to open a payment ticket on our official Discord server. Our staff will process your transaction instantly using PayPal or Crypto.
                        </p>
                      </div>

                      <a 
                        href={settings.discordUrl || 'https://discord.gg/crystalmc'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <ExternalLink size={16} /> Open Discord Payment Ticket
                      </a>
                    </div>
                  </div>
                )}

                {/* Confirm Paid Button */}
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 relative overflow-hidden text-base cursor-pointer"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    I Have Paid <ChevronRight size={18} />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent w-[150%] animate-shimmer" />
                </button>
              </div>
            )}

            {/* STEP 3: Verification & Submit Proof */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                    Upload Payment Proof Screenshot <span className="text-rose-500">*</span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">
                    Upload a clear screenshot of your completed transaction screen or receipt.
                  </p>
                  
                  <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center transition-all bg-slate-950/60 relative cursor-pointer group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={isUploading}
                    />

                    {isUploading ? (
                      <div className="flex flex-col items-center text-indigo-400 py-4">
                        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
                        <span className="font-bold text-sm">Uploading Screenshot...</span>
                      </div>
                    ) : proofUrl ? (
                      <div className="flex flex-col items-center text-emerald-400 py-2 space-y-2">
                        <div className="relative">
                          <img 
                            src={proofUrl} 
                            alt="Payment Proof" 
                            className="w-24 h-24 object-cover rounded-xl border border-emerald-500/50 shadow-lg"
                          />
                          <div className="absolute -top-2 -right-2 bg-emerald-500 text-slate-950 p-1 rounded-full shadow">
                            <Check size={14} strokeWidth={3} />
                          </div>
                        </div>
                        <span className="font-bold text-sm text-white">Screenshot Uploaded!</span>
                        <span className="text-xs text-slate-400 underline group-hover:text-indigo-400">
                          Click to change file
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-slate-400 py-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-300 group-hover:scale-110 group-hover:text-indigo-400 transition-all mb-2">
                          <Upload size={24} />
                        </div>
                        <span className="font-bold text-white text-sm">Click or Drag Image to Upload</span>
                        <span className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP up to 10MB</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transaction ID / TRX ID Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center justify-between">
                    <span>Transaction ID / TRX ID</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Recommended)</span>
                  </label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder={country === 'BD' ? 'e.g. TRX9823X12' : 'e.g. 320498102938'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Optional Order Note */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Optional Order Note
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors min-h-[70px]"
                    placeholder="Any special instructions or in-game rank request notes..."
                  />
                </div>

                {/* Final Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !proofUrl}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-4 rounded-xl shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-base cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw size={18} className="animate-spin" /> Submitting Order...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShieldCheck size={20} /> Complete & Submit Order
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
