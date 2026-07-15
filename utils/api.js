import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';
import { flushQueue } from './syncQueue';
import { reportConnectivity } from './network';

const FETCH_TIMEOUT_MS = 6000;
const CACHE_PREFIX = 'cache:';

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

/**
 * Fetch JSON from the backend, network-first with a cache fallback.
 *
 * On success: caches the response under `cacheKey` and returns it.
 * On any failure (offline, timeout, non-2xx, bad JSON): falls back to the
 * last cached response for `cacheKey`, if one exists.
 *
 * Returns { data, fromCache }. `data` is null only if the request failed
 * AND nothing was ever cached for this key (e.g. first-ever offline launch).
 */
export async function apiGet(path, cacheKey) {
  const key = CACHE_PREFIX + cacheKey;

  try {
    const response = await withTimeout(fetch(`${BASE_URL}${path}`), FETCH_TIMEOUT_MS);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    // Best-effort cache write — never let a storage failure break a live fetch
    AsyncStorage.setItem(key, JSON.stringify(data)).catch(() => {});
    // A successful fetch is definitive proof we're online — opportunistically
    // flush any queued writes now, rather than relying solely on NetInfo's
    // reconnect event (navigator.onLine is notoriously unreliable on web:
    // it only reflects the network adapter, not actual internet reachability,
    // and doesn't fire on every real-world reconnect).
    flushQueue().catch(() => {});
    reportConnectivity(true);
    return { data, fromCache: false };
  } catch {
    reportConnectivity(false);
    try {
      const cached = await AsyncStorage.getItem(key);
      if (cached != null) {
        return { data: JSON.parse(cached), fromCache: true };
      }
    } catch {
      // fall through to the null-data return below
    }
    return { data: null, fromCache: false };
  }
}

/**
 * Clears every cached apiGet response. Not currently wired to any UI action —
 * exposed for debugging / a future "clear cache" admin action.
 */
export async function clearApiCache() {
  const keys = await AsyncStorage.getAllKeys();
  const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
  if (cacheKeys.length > 0) {
    await AsyncStorage.multiRemove(cacheKeys);
  }
}
