export type StoreGameModeId = 'survival' | 'lifesteal' | 'pvp';

export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  color: string;
  bg: string;
  border: string;
  image?: string;
  commands?: string;
  gameMode?: StoreGameModeId | string;
  server?: StoreGameModeId | string;
}

export interface StoreData {
  [category: string]: StoreProduct[];
}

export interface MultiModeStoreData {
  survival: StoreData;
  lifesteal: StoreData;
  pvp: StoreData;
  [mode: string]: StoreData;
}

export interface StoreGameModeMeta {
  id: StoreGameModeId;
  name: string;
  shortName: string;
  badge: string;
  description: string;
  accentColor: string;
  bgTint: string;
  borderColor: string;
  gradient: string;
  iconUrl: string;
}

export const STORE_GAME_MODES: StoreGameModeMeta[] = [
  {
    id: 'survival',
    name: 'Survival SMP',
    shortName: 'Survival',
    badge: 'Economy & Claims',
    description: 'Ranks, crate keys, claim blocks, and in-game economy packages for our custom survival realm.',
    accentColor: 'text-emerald-400',
    bgTint: 'bg-emerald-500/10 text-emerald-400',
    borderColor: 'border-emerald-500/30',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    iconUrl: 'https://i.ibb.co/tMRjCxkz/survival-icon.png'
  },
  {
    id: 'lifesteal',
    name: 'Lifesteal SMP',
    shortName: 'Lifesteal',
    badge: 'Hardcore & Raiding',
    description: 'Heart bundles, revive beacons, blood crate keys, and raider gear for high-stakes survival.',
    accentColor: 'text-rose-400',
    bgTint: 'bg-rose-500/10 text-rose-400',
    borderColor: 'border-rose-500/30',
    gradient: 'from-rose-500/20 to-red-500/10',
    iconUrl: 'https://i.ibb.co/1ftp7qpp/lifesteal-icon.png'
  },
  {
    id: 'pvp',
    name: 'Competitive PvP',
    shortName: 'PvP',
    badge: 'Duels & Ranked',
    description: 'Duel ranks, tournament entry passes, Elo shields, and cosmetic kill effects for arena champions.',
    accentColor: 'text-cyan-400',
    bgTint: 'bg-cyan-500/10 text-cyan-400',
    borderColor: 'border-cyan-500/30',
    gradient: 'from-cyan-500/20 via-sky-500/15 to-blue-600/10',
    iconUrl: 'https://i.ibb.co/4RnDhfhh/pvp-icon.png'
  }
];

export const DEFAULT_CATEGORIES_BY_MODE: Record<StoreGameModeId, string[]> = {
  survival: ['Ranks', 'Keys', 'Kits'],
  lifesteal: ['Ranks', 'Keys', 'Kits', 'Tags'],
  pvp: ['Ranks', 'Tags']
};

export const defaultMultiModeStore: MultiModeStoreData = {
  survival: {
    Ranks: [
      {
        id: 'survival_rank_elite',
        name: 'ELITE',
        price: 49,
        description: '• 100K In-Game Money\n• 1,000 Claim Blocks\n• 1 Paid Tag of Your Choice\n• Access to Kit Cool',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        gameMode: 'survival'
      },
      {
        id: 'survival_rank_vulture',
        name: 'VULTURE',
        price: 99,
        description: '• 500K In-Game Money\n• 2,000 Claim Blocks\n• 1 Paid Tag of Your Choice\n• Access to Kit Cool\n• Extra Rank Perks',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        gameMode: 'survival'
      },
      {
        id: 'survival_rank_eagle',
        name: 'EAGLE',
        price: 199,
        description: '• 1M In-Game Money\n• 3,000 Claim Blocks\n• 1 Paid Tag of Your Choice\n• Access to Kit Cool\n• Extra Rank Perks',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        gameMode: 'survival'
      },
      {
        id: 'survival_rank_dragon',
        name: 'DRAGON',
        price: 249,
        description: '• 2.5M In-Game Money\n• 4,000 Claim Blocks\n• 1 Paid Tag of Your Choice\n• Access to Kit Cool\n• Extra Rank Perks\n• Special Dragon Perks',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        gameMode: 'survival'
      },
      {
        id: 'survival_rank_phenix',
        name: 'PHENIX',
        price: 399,
        description: '• 5M In-Game Money\n• 5,000 Claim Blocks\n• 1 Paid Tag of Your Choice\n• Access to Kit Cool\n• Maximum Rank Perks\n• Exclusive Phenix Perks',
        color: 'text-fuchsia-400',
        bg: 'bg-fuchsia-500/10',
        border: 'border-fuchsia-500/20',
        gameMode: 'survival'
      }
    ],
    Keys: [
      {
        id: 'survival_key_basics',
        name: 'Basics Key',
        price: 10,
        description: '• 1x Basics Crate Key\n• Essential starter gear & resources\n• Instant delivery',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        gameMode: 'survival'
      },
      {
        id: 'survival_key_epic',
        name: 'Epic Key',
        price: 29,
        description: '• 1x Epic Crate Key\n• Rare items and cosmetics\n• Dynamic rewards inside\n• Instant delivery',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        gameMode: 'survival'
      },
      {
        id: 'survival_key_hyper',
        name: 'Hyper Key',
        price: 49,
        description: '• 1x Hyper Crate Key\n• High-value loot & powerful buffs\n• Instant delivery',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        gameMode: 'survival'
      },
      {
        id: 'survival_key_ace',
        name: 'Ace Key',
        price: 79,
        description: '• 1x Ace Crate Key\n• Elite-grade equipment & rewards\n• Instant delivery',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        gameMode: 'survival'
      },
      {
        id: 'survival_key_monthly',
        name: 'Monthly Key',
        price: 99,
        description: '• 1x Monthly Special Crate Key\n• Massive exclusive monthly crate rewards\n• Instant delivery',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        gameMode: 'survival'
      }
    ],
    Kits: [
      {
        id: 'survival_kit_elite',
        name: 'Elite Rank Kit',
        price: 20,
        description: '• Exclusive Elite Kit\n• Instant gear and supplies\n• Cooldown-based kit access',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        gameMode: 'survival'
      },
      {
        id: 'survival_kit_vulture',
        name: 'VULTURE Kit',
        price: 59,
        description: '• Exclusive Vulture Kit\n• Upgraded weapon and armor\n• Cooldown-based kit access',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        gameMode: 'survival'
      },
      {
        id: 'survival_kit_eagle',
        name: 'EAGLE Kit',
        price: 129,
        description: '• Exclusive Eagle Kit\n• High-tier gear and supplies\n• Cooldown-based kit access',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        gameMode: 'survival'
      },
      {
        id: 'survival_kit_dragon',
        name: 'Dragon Kit',
        price: 189,
        description: '• Exclusive Dragon Kit\n• High-enchant armor and tools\n• Cooldown-based kit access',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        gameMode: 'survival'
      },
      {
        id: 'survival_kit_phenix',
        name: 'Phenix Kit',
        price: 249,
        description: '• Ultimate Phenix Kit\n• Maximum tier equipment & items\n• Cooldown-based kit access',
        color: 'text-fuchsia-400',
        bg: 'bg-fuchsia-500/10',
        border: 'border-fuchsia-500/20',
        gameMode: 'survival'
      }
    ]
  },
  lifesteal: {
    Ranks: [
      {
        id: 'lifesteal_rank_premium',
        name: 'Premium Rank',
        price: 149,
        description: '• 500K Lifesteal Coins\n• Access to /fly in claims\n• 3 Set Homes\n• Premium Chat Prefix',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        gameMode: 'lifesteal'
      },
      {
        id: 'lifesteal_rank_ocean',
        name: 'Ocean Rank',
        price: 219,
        description: '• 1M Lifesteal Coins\n• Water breathing & depth strider perks\n• 5 Set Homes\n• Ocean Chat Prefix',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        gameMode: 'lifesteal'
      },
      {
        id: 'lifesteal_rank_coconut',
        name: 'Coconut Rank',
        price: 299,
        description: '• 2.5M Lifesteal Coins\n• Coconut shield durability boost\n• 8 Set Homes\n• Coconut Chat Prefix',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        gameMode: 'lifesteal'
      },
      {
        id: 'lifesteal_rank_turtle',
        name: 'Turtle Rank',
        price: 349,
        description: '• 5M Lifesteal Coins\n• Permanent Resistance I boost\n• 12 Set Homes\n• Turtle Chat Prefix',
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        gameMode: 'lifesteal'
      },
      {
        id: 'lifesteal_rank_crystal_plus',
        name: 'Crystal+ Rank',
        price: 499,
        description: '• 10M Lifesteal Coins\n• Ultimate Lifesteal Perks & Max Hearts\n• Unlimited Set Homes\n• Exclusive Crystal+ Prefix & Glow',
        color: 'text-fuchsia-400',
        bg: 'bg-fuchsia-500/10',
        border: 'border-fuchsia-500/20',
        gameMode: 'lifesteal'
      }
    ],
    Keys: [
      {
        id: 'lifesteal_key_common',
        name: 'Common Key',
        price: 20,
        description: '• 1x Common Lifesteal Crate Key\n• Essential weapons & survival items\n• Instant delivery',
        color: 'text-slate-400',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/20',
        gameMode: 'lifesteal'
      },
      {
        id: 'lifesteal_key_matrix',
        name: 'Matrix Key',
        price: 69,
        description: '• 1x Matrix Crate Key\n• Custom Matrix gear and hearts\n• Instant delivery',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        gameMode: 'lifesteal'
      },
      {
        id: 'lifesteal_key_spacial',
        name: 'Spacial Key',
        price: 149,
        description: '• 1x Spacial Crate Key\n• High-tier hearts, god apples & weapons\n• Instant delivery',
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        gameMode: 'lifesteal'
      },
      {
        id: 'lifesteal_key_monthly',
        name: 'Monthly Key',
        price: 259,
        description: '• 1x Monthly Lifesteal Special Key\n• Massive jackpot crates with legendary gear\n• Instant delivery',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        gameMode: 'lifesteal'
      }
    ],
    Kits: [
      {
        id: 'lifesteal_kit_premium',
        name: 'Premium Kit',
        price: 79,
        description: '• Premium diamond gear & tools\n• Heart fragments & potions\n• Cooldown-based kit access',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        gameMode: 'lifesteal'
      },
      {
        id: 'lifesteal_kit_ocean',
        name: 'Ocean Kit',
        price: 129,
        description: '• Ocean trident, netherite pieces & heart bundle\n• Water breathing & speed boosts\n• Cooldown-based kit access',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        gameMode: 'lifesteal'
      },
      {
        id: 'lifesteal_kit_coconut',
        name: 'Coconut Kit',
        price: 199,
        description: '• Heavy defensive netherite gear\n• 3 Full Hearts & enchanted golden apples\n• Cooldown-based kit access',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        gameMode: 'lifesteal'
      },
      {
        id: 'lifesteal_kit_turtle',
        name: 'Turtle Kit',
        price: 249,
        description: '• Turtle Master enchanted armor set\n• 5 Full Hearts & Totems of Undying\n• Cooldown-based kit access',
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        gameMode: 'lifesteal'
      },
      {
        id: 'lifesteal_kit_crystal_plus',
        name: 'Crystal+ Kit',
        price: 349,
        description: '• Supreme Protection V Netherite Set\n• Maximum Heart Containers & God Gear\n• Cooldown-based kit access',
        color: 'text-fuchsia-400',
        bg: 'bg-fuchsia-500/10',
        border: 'border-fuchsia-500/20',
        gameMode: 'lifesteal'
      }
    ],
    Tags: [
      {
        id: 'lifesteal_tag_custom',
        name: '🏷️ CUSTOM TAG',
        price: 29,
        description: '• Create your own custom tag\n• Choose any tag name\n• Free chat color with the tag\n• Fully customizable',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        gameMode: 'lifesteal'
      }
    ]
  },
  pvp: {
    Ranks: [
      {
        id: 'pvp_rank_vip',
        name: 'VIP',
        price: 50,
        description: '• 1 Choice Tag\n• Cool Prefix\n• High Priority\n• VIP Chat/Rank Display',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        gameMode: 'pvp'
      },
      {
        id: 'pvp_rank_sky',
        name: 'SKY',
        price: 100,
        description: '• 1 Choice Tag\n• Cool Prefix\n• High Priority\n• Special Chat/Rank Display\n• Extra Practice Perks',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        gameMode: 'pvp'
      },
      {
        id: 'pvp_rank_titan',
        name: 'TITAN',
        price: 199,
        description: '• 1 Choice Tag\n• Exclusive Cool Prefix\n• High Priority\n• Special Chat/Rank Display\n• More Practice Perks\n• TITAN Rank Badge',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        gameMode: 'pvp'
      },
      {
        id: 'pvp_rank_crystal_plus',
        name: 'CRYSTAL+',
        price: 299,
        description: '• 1 Choice Tag\n• Exclusive Crystal+ Prefix\n• Highest Priority\n• Exclusive Chat/Rank Display\n• Premium Practice Perks\n• Exclusive Crystal+ Badge\n• Special Crystal+ Perks',
        color: 'text-fuchsia-400',
        bg: 'bg-fuchsia-500/10',
        border: 'border-fuchsia-500/20',
        gameMode: 'pvp'
      }
    ],
    Tags: [
      {
        id: 'pvp_tag_custom',
        name: '🏷️ CUSTOM TAG',
        price: 29,
        description: '• Create your own custom tag\n• Choose any tag name\n• Free chat color with the tag\n• Fully customizable',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        gameMode: 'pvp'
      }
    ]
  }
};

export const OLD_SAMPLE_PRODUCT_IDS = new Set([
  'rank_custom', 'rank_supra', 'rank_cosmic', 'rank_alpha', 'rank_deadliest', 'rank_crystal_plus', 'rank_demon', 'rank_god', 'rank_king',
  'key_koth', 'key_spawners', 'key_epic', 'key_mythic', 'key_hellfire',
  'tag_standard', 'tag_premium', 'tag_custom',
  'kit_king', 'kit_god', 'kit_demon', 'kit_crystal_plus', 'kit_deadliest', 'kit_alpha', 'kit_cosmic', 'kit_supra',
  'money_100k', 'money_250k', 'money_500k', 'money_1m', 'money_5m', 'money_10m', 'money_25m', 'money_50m', 'money_100m', 'money_250m', 'money_500m', 'money_1b',
  'claim_500', 'claim_1k', 'claim_25k', 'claim_5k', 'claim_10k', 'claim_25k_blocks', 'claim_50k', 'claim_100k', 'claim_250k', 'claim_500k', 'claim_1m'
]);

/**
 * Normalizes incoming Firebase data for the store.
 * Handles both the modern multi-mode store object and legacy single-mode store data.
 * Automatically removes any category that does not have at least 1 product.
 */
export function normalizeStoreData(raw: any): MultiModeStoreData {
  if (!raw || typeof raw !== 'object') {
    return defaultMultiModeStore;
  }

  const cleanCategoryList = (items: any): StoreProduct[] => {
    if (!Array.isArray(items)) return [];
    return items.filter((p: any) => p && p.id && !OLD_SAMPLE_PRODUCT_IDS.has(p.id));
  };

  const cleanModeStore = (modeObj: any, defaultCats: string[], defaultModeObj?: StoreData, modeKey?: string): StoreData => {
    const result: StoreData = {};
    const allCatKeys = Array.from(new Set([
      ...defaultCats,
      ...(modeObj && typeof modeObj === 'object' ? Object.keys(modeObj) : []),
      ...(defaultModeObj ? Object.keys(defaultModeObj) : [])
    ]));

    for (const cat of allCatKeys) {
      if (cat === '_initialized') continue;
      // Completely exclude Tags category from survival only
      if (modeKey === 'survival' && cat.toLowerCase() === 'tags') continue;

      const rawItems = modeObj?.[cat];
      const cleaned = cleanCategoryList(rawItems);
      const defaultItems = defaultModeObj?.[cat] || [];
      const finalItems = cleaned.length > 0 ? cleaned : defaultItems;

      // Filter out any survival tag products if somehow present
      const filteredItems = modeKey === 'survival'
        ? finalItems.filter((item) => item.id !== 'survival_tag_custom')
        : finalItems;

      // Only retain category if it has at least 1 product!
      if (filteredItems.length > 0) {
        result[cat] = filteredItems;
      }
    }
    return result;
  };

  // Check if raw is in multi-gamemode format
  const hasModeKeys = raw.survival !== undefined || raw.lifesteal !== undefined || raw.pvp !== undefined;
  if (hasModeKeys) {
    return {
      survival: cleanModeStore(raw.survival, DEFAULT_CATEGORIES_BY_MODE.survival, defaultMultiModeStore.survival, 'survival'),
      lifesteal: cleanModeStore(raw.lifesteal, DEFAULT_CATEGORIES_BY_MODE.lifesteal, defaultMultiModeStore.lifesteal, 'lifesteal'),
      pvp: cleanModeStore(raw.pvp, DEFAULT_CATEGORIES_BY_MODE.pvp, defaultMultiModeStore.pvp, 'pvp'),
    };
  }

  // Otherwise, raw is a legacy store where top keys are categories
  return {
    survival: cleanModeStore(raw, DEFAULT_CATEGORIES_BY_MODE.survival, defaultMultiModeStore.survival, 'survival'),
    lifesteal: defaultMultiModeStore.lifesteal,
    pvp: defaultMultiModeStore.pvp
  };
}

/**
 * Flattens all products across all game modes and categories.
 * Used by Featured Store, Orders, search, etc.
 */
export function getAllStoreProducts(store: any): StoreProduct[] {
  if (!store || typeof store !== 'object') return [];
  const normalized = normalizeStoreData(store);
  const products: StoreProduct[] = [];
  const seenIds = new Set<string>();

  for (const modeKey of ['survival', 'lifesteal', 'pvp', ...Object.keys(normalized)]) {
    const modeStore = normalized[modeKey];
    if (modeStore && typeof modeStore === 'object') {
      for (const catKey of Object.keys(modeStore)) {
        const catList = modeStore[catKey];
        if (Array.isArray(catList)) {
          for (const item of catList) {
            if (item && item.id && !seenIds.has(item.id)) {
              seenIds.add(item.id);
              products.push({ ...item, gameMode: item.gameMode || modeKey });
            }
          }
        }
      }
    }
  }

  return products;
}
