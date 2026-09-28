/**
 * Multi-API Minecraft Server Status Resolver
 * Provides automatic failover across multiple public Minecraft ping APIs:
 * 1. mcstatus.io (Primary)
 * 2. mcsrvstat.us (Secondary Failover)
 * 3. mcapi.us (Tertiary Failover)
 * 4. minetools.eu (Quaternary Failover)
 *
 * If one API fails, times out, or gets rate-limited, the system automatically
 * falls back to the next healthy provider in milliseconds.
 */

export interface ServerStatusResult {
  online: boolean;
  players: number;
  maxPlayers?: number;
  version: string;
  ping: number;
  provider: string;
}

interface StatusProvider {
  name: string;
  fetchStatus: (ip: string, signal: AbortSignal) => Promise<Omit<ServerStatusResult, 'ping' | 'provider'>>;
}

const PROVIDERS: StatusProvider[] = [
  // 1. mcstatus.io (Fast, detailed)
  {
    name: 'mcstatus.io',
    fetchStatus: async (ip: string, signal: AbortSignal) => {
      const res = await fetch(`https://api.mcstatus.io/v2/status/java/${encodeURIComponent(ip)}`, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (typeof data.online !== 'boolean') throw new Error('Invalid schema from mcstatus.io');
      return {
        online: Boolean(data.online),
        players: data.players?.online ?? 0,
        maxPlayers: data.players?.max,
        version: data.version?.name_clean || data.version?.name_raw || '1.20.x'
      };
    }
  },

  // 2. mcsrvstat.us (Established, high availability)
  {
    name: 'mcsrvstat.us',
    fetchStatus: async (ip: string, signal: AbortSignal) => {
      const res = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(ip)}`, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (typeof data.online !== 'boolean') throw new Error('Invalid schema from mcsrvstat.us');
      return {
        online: Boolean(data.online),
        players: data.players?.online ?? 0,
        maxPlayers: data.players?.max,
        version: typeof data.version === 'string' ? data.version : '1.20.x'
      };
    }
  },

  // 3. mcapi.us (Lightweight, reliable)
  {
    name: 'mcapi.us',
    fetchStatus: async (ip: string, signal: AbortSignal) => {
      const res = await fetch(`https://mcapi.us/server/status?ip=${encodeURIComponent(ip)}`, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.status !== 'success' && typeof data.online !== 'boolean') {
        throw new Error('Invalid schema from mcapi.us');
      }
      return {
        online: Boolean(data.online),
        players: data.players?.now ?? 0,
        maxPlayers: data.players?.max,
        version: data.server?.name || '1.20.x'
      };
    }
  },

  // 4. minetools.eu (Additional fallback)
  {
    name: 'minetools.eu',
    fetchStatus: async (ip: string, signal: AbortSignal) => {
      const res = await fetch(`https://api.minetools.eu/ping/${encodeURIComponent(ip)}`, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(`Minetools error: ${data.error}`);
      return {
        online: Boolean(data.players !== undefined),
        players: data.players?.online ?? 0,
        maxPlayers: data.players?.max,
        version: data.version?.name || '1.20.x'
      };
    }
  }
];

/**
 * Fetches server status through multi-API fallback waterfall.
 * If one API fails, times out, or errors, the next one is called immediately.
 */
export async function fetchServerStatusWithFallback(
  ip: string,
  timeoutMs: number = 4000
): Promise<ServerStatusResult | null> {
  const cleanIp = (ip || 'play.crystalmc.fun').trim();

  for (const provider of PROVIDERS) {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const result = await provider.fetchStatus(cleanIp, controller.signal);
      clearTimeout(timeoutId);
      const latency = Math.max(8, Date.now() - startTime);

      return {
        ...result,
        ping: result.online ? (latency < 1200 ? latency : 35) : 0,
        provider: provider.name
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn(`[ServerStatus] API '${provider.name}' failed for '${cleanIp}':`, err?.message || err, 'Trying next status API...');
    }
  }

  // All providers failed
  console.error(`[ServerStatus] All ${PROVIDERS.length} status APIs failed to respond for ${cleanIp}`);
  return null;
}
