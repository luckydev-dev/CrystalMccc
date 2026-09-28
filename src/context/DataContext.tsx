import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { ref, onValue, get, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { Loader2 } from 'lucide-react';
import { 
  StoreGameModeId, 
  StoreProduct, 
  StoreData, 
  MultiModeStoreData, 
  StoreGameModeMeta, 
  STORE_GAME_MODES, 
  defaultMultiModeStore, 
  normalizeStoreData, 
  getAllStoreProducts,
  OLD_SAMPLE_PRODUCT_IDS 
} from '../lib/storeConfig';
import { fetchServerStatusWithFallback, ServerStatusResult } from '../lib/serverStatus';

export type { 
  StoreGameModeId, 
  StoreProduct, 
  StoreData, 
  MultiModeStoreData, 
  StoreGameModeMeta 
};
export { 
  STORE_GAME_MODES, 
  defaultMultiModeStore, 
  normalizeStoreData, 
  getAllStoreProducts,
  OLD_SAMPLE_PRODUCT_IDS 
};

interface StaffMember {
  id: string;
  name: string;
  role: string;
  username: string;
  color: string;
  bg: string;
  border: string;
}

export interface RuleCategory {
  id: string;
  title: string;
  icon: string;
  rules: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface SettingsData {
  upiId?: string;
  payeeName?: string;
  discordUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
}

export interface VoteSite {
  id: string;
  name: string;
  url: string;
  imageUrl?: string;
  reward?: string;
  color?: string;
}

interface SiteData {
  hero: {
    pillText: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    serverIPDisplay: string;
    serverIPCopy: string;
    port?: string;
    discordLink: string;
    backgroundImage: string;
    pillColor?: string;
    pillBg?: string;
    pillBorder?: string;
    pillTextColor?: string;
    pillPingColor?: string;
    pillGlow?: string;
  };
  rules: RuleCategory[];
  faq: FAQItem[];
  staff: StaffMember[];
  vote?: VoteSite[];
  store: MultiModeStoreData;
  featuredStore: string[];
  visits: number;
  settings?: SettingsData;
}

export const defaultStaffList: StaffMember[] = [
  { id: 'staff_1', name: 'ahammad44708', username: 'AHAMMAD44707', role: 'FOUNDER', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { id: 'staff_2', name: 'demon_uchiha', username: 'demon_uchiha', role: 'FOUNDER', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { id: 'staff_3', name: 'urfev_dark_here', username: 'Dark', role: 'OWNER', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { id: 'staff_4', name: 'wtf_thunder_here', username: 'Thunder', role: 'OWNER', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { id: 'staff_5', name: 'Abhirrrr', username: 'Abhirrr', role: 'OWNER', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { id: 'staff_6', name: 'ft.divine', username: 'OG_Swagat', role: 'CO-OWNER', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { id: 'staff_7', name: 'poke_e9', username: 'POKE_KING9', role: 'CO-OWNER', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { id: 'staff_8', name: 'wtf_overlord_here', username: 'xX_MsPlayzYT_Xx', role: 'SERVER LEAD', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { id: 'staff_9', name: 'jihadbhaix', username: 'Jihad_bhai', role: 'SUPREME', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { id: 'staff_10', name: 'wtf_pagalawm_404', username: 'PagalAWM', role: 'ADMIN', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'staff_11', name: 'itzsparowyt', username: 'ITZSPAROW', role: 'MOD', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'staff_12', name: 'mohitgamerzxx', username: 'Mohitgamerzxx', role: 'JR CREW', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  { id: 'staff_13', name: 'rehman82182', username: 'driftx82182', role: 'DICTATOR', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  { id: 'staff_14', name: 'Lucky Dev', username: 'Lucky', role: 'WEB DEV', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
];

export const defaultData: SiteData = {
  hero: {
    pillText: "Season 4 is now live!",
    title: "Crystal",
    titleHighlight: "MC",
    subtitle: "Experience premium custom survival, unique economy, and epic PvP battles. Join our thriving community and build your empire today.",
    serverIPDisplay: "PLAY.CRYSTALMC.FUN",
    serverIPCopy: "play.crystalmc.fun",
    port: "",
    discordLink: "https://discord.gg/crystalmc",
    backgroundImage: "https://i.ibb.co/ccsD6sTv/Chat-GPT-Image-Sep-28-2026-06-50-56-AM.png",
    pillColor: "emerald"
  },
  rules: [
    {
      id: '1',
      title: 'General',
      icon: 'Shield',
      rules: [
        'Be respectful to all players and staff.',
        'No hate speech, racism, or harassment.',
        'Keep chat clean (no excessive caps or spam).',
        'English only in public chat.'
      ]
    },
    {
      id: '2',
      title: 'Gameplay',
      icon: 'Gavel',
      rules: [
        'No hacking, cheating, or exploiting bugs.',
        'No griefing or stealing in claimed areas.',
        'No lag machines or intentional server stress.',
        'No real money trading (RMT).'
      ]
    },
    {
      id: '3',
      title: 'Chat & Media',
      icon: 'MessageSquare',
      rules: [
        'No advertising other servers.',
        'No sharing personal information (doxxing).',
        'No inappropriate links or content.'
      ]
    }
  ],
  faq: [
    {
      id: '1',
      question: 'How do I join the server?',
      answer: 'Launch Minecraft version 1.20+, click Multiplayer, add server, and use IP: play.crystalmc.fun'
    },
    {
      id: '2',
      question: 'Is the server Bedrock compatible?',
      answer: 'Yes! Bedrock players can join using the address play.crystalmc.fun with port 25569 (IP: play.crystalmc.fun, Port: 25569).'
    },
    {
      id: '3',
      question: 'How can I apply for staff?',
      answer: 'Staff applications open periodically on our Discord server. Keep an eye on the announcements channel!'
    },
    {
      id: '4',
      question: 'Where can I buy ranks?',
      answer: 'You can purchase ranks and other items on our store at store.crystalmc.fun'
    }
  ],
  vote: [
    {
      id: 'vote_1',
      name: 'Minecraft Servers',
      url: 'https://minecraftservers.org/',
      reward: '1x Vote Key',
      color: 'indigo'
    },
    {
      id: 'vote_2',
      name: 'Top Minecraft Servers',
      url: 'https://topminecraftservers.org/',
      reward: '1x Vote Key',
      color: 'rose'
    },
    {
      id: 'vote_3',
      name: 'Minecraft Server List',
      url: 'https://minecraft-server-list.com/',
      reward: '1x Vote Key',
      color: 'emerald'
    }
  ],
  staff: defaultStaffList,
  store: defaultMultiModeStore,
  featuredStore: ['survival_rank_vulture', 'survival_rank_eagle', 'survival_rank_phenix'],
  visits: 0
};

interface DataContextType {
  data: SiteData;
  loading: boolean;
  serverStatus: {
    online: boolean;
    players: number;
    version: string;
    ping: number;
    provider?: string;
  };
}

const DataContext = createContext<DataContextType>({ 
  data: defaultData, 
  loading: true,
  serverStatus: { online: false, players: 0, version: '1.20.x', ping: 0 }
});

export const useData = () => useContext(DataContext);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SiteData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<{
    online: boolean;
    players: number;
    version: string;
    ping: number;
    provider?: string;
  }>({
    online: false,
    players: 0,
    version: '1.20.x',
    ping: 32
  });

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    const initializeAppAndData = async () => {

      const fetchServerStatus = async () => {
        try {
          const heroData = dataRef.current?.hero || defaultData.hero;
          const ip = heroData.serverIPCopy || 'play.crystalmc.fun';

          // Multi-API fallback: calls mcstatus.io, then mcsrvstat.us, then mcapi.us, then minetools.eu
          const result = await fetchServerStatusWithFallback(ip, 3500);

          if (result) {
            setServerStatus((prev) => ({
              online: result.online,
              players: result.players,
              version: result.version || '1.20.x',
              ping: result.ping || prev.ping,
              provider: result.provider
            }));
          } else {
            // All status APIs failed, retain existing state with realistic jitter
            setServerStatus((prev) => ({
              ...prev,
              ping: prev.online ? Math.floor(Math.random() * 15) + 20 : 0
            }));
          }
        } catch (error) {
          console.warn("[Data] Multi-API status fetch error:", error);
          setServerStatus((prev) => ({
            ...prev,
            ping: prev.online ? Math.floor(Math.random() * 15) + 20 : 0
          }));
        }
      };

      fetchServerStatus();
      const statusInterval = setInterval(fetchServerStatus, 30000);

      const pingInterval = setInterval(() => {
        setServerStatus((prev) => {
          if (!prev.online) return { ...prev, ping: 0 };
          const change = Math.floor(Math.random() * 5) - 2;
          const nextPing = Math.max(12, Math.min(120, prev.ping + change));
          return { ...prev, ping: nextPing };
        });
      }, 4000);

      const siteRef = ref(db, 'siteData');

      const unsubscribe = onValue(siteRef, (snapshot) => {
        console.log("[Data] Site data updated from RTDB");
        const val = snapshot.val();
        if (val) {
          const normalizedStore = normalizeStoreData(val.store);

          const isLegacyStaff = !val.staff || 
            !Array.isArray(val.staff) || 
            val.staff.length !== defaultStaffList.length || 
            val.staff.some((s: any) => s.name === 'ahammed' || s.username === 'ahammed' || s.name === 'Notch');

          const validFeaturedStore = Array.isArray(val.featuredStore)
            ? val.featuredStore.filter((id: string) => !OLD_SAMPLE_PRODUCT_IDS.has(id))
            : [];

          setData((prev) => ({ 
            ...prev, 
            ...val, 
            staff: isLegacyStaff ? defaultStaffList : val.staff,
            rules: Array.isArray(val.rules) ? val.rules : defaultData.rules,
            faq: val.faq || defaultData.faq,
            store: normalizedStore,
            featuredStore: validFeaturedStore.length > 0 ? validFeaturedStore : defaultData.featuredStore,
            visits: val.visits || 0
          }));
        }
        console.log("[Data] Setting loading to false");
        setLoading(false);
      }, (error) => {
        console.error("[Data] Error fetching data:", error);
        setLoading(false);
      });

      const safetyTimeout = setTimeout(() => {
        setLoading((currentLoading) => {
          if (currentLoading) {
            console.warn("[Data] Loading safety timeout reached. Forcing loading to false.");
            return false;
          }
          return currentLoading;
        });
      }, 8000);

      // Increment visits (only once per unique browser using localStorage)
      const hasVisited = localStorage.getItem('crystal_mc_visited');
      if (!hasVisited) {
        const visitsRef = ref(db, 'siteData/visits');
        get(visitsRef).then((snapshot) => {
          const currentVisits = snapshot.val() || 0;
          set(visitsRef, currentVisits + 1);
          localStorage.setItem('crystal_mc_visited', 'true');
        });
      }

      return () => {
        unsubscribe();
        clearInterval(statusInterval);
        clearInterval(pingInterval);
        clearTimeout(safetyTimeout);
      };
    };

    let cleanupPromise: any;
    initializeAppAndData().then(cleanup => {
      cleanupPromise = cleanup;
    });

    return () => {
      if (cleanupPromise && typeof cleanupPromise === 'function') {
        cleanupPromise();
      }
    };
  }, []);

  return (
    <DataContext.Provider value={{ data, loading, serverStatus }}>
      {children}
    </DataContext.Provider>
  );
}
