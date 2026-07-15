import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';
import { reportConnectivity } from './network';

const QUEUE_KEY = 'syncQueue:v1';

// All queue reads/writes go through this chain so concurrent callers (e.g.
// several apiGet calls resolving around the same moment after reconnecting,
// each opportunistically calling flushQueue) never interleave a
// read-modify-write cycle against AsyncStorage — without this, two
// concurrent flushes could both read the same queued item before either
// had a chance to clear it, sending it twice.
let mutexTail = Promise.resolve();
function withLock(fn) {
  const result = mutexTail.then(fn, fn);
  mutexTail = result.then(() => {}, () => {});
  return result;
}

async function getQueue() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function setQueue(queue) {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // ignore — worst case, this queued action is lost, which is no worse
    // than not having a queue at all
  }
}

/**
 * Attempts a write request immediately. On failure (offline, timeout,
 * non-2xx), queues { path, options } for later and resolves with
 * { queued: true } instead of throwing — callers should apply whatever
 * local/optimistic effect makes sense and treat `queued: true` as "will
 * sync once back online," not as an error.
 */
export async function enqueueOrSend(path, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json().catch(() => null);
    reportConnectivity(true);
    return { queued: false, ok: true, data };
  } catch {
    reportConnectivity(false);
    await withLock(async () => {
      const queue = await getQueue();
      queue.push({ path, options, timestamp: Date.now() });
      await setQueue(queue);
    });
    return { queued: true, ok: false, data: null };
  }
}

export async function getQueueLength() {
  const queue = await getQueue();
  return queue.length;
}

/**
 * Replays every queued write against the real API, in order (oldest first).
 * Stops at the first failure so a mid-flush disconnect doesn't drop the
 * remaining items — they stay queued for the next attempt. Serialized via
 * withLock so overlapping calls (common right after reconnecting, when
 * several screens' apiGet calls all succeed within milliseconds of each
 * other) never double-send the same queued item.
 */
export function flushQueue() {
  return withLock(async () => {
    const queue = await getQueue();
    if (queue.length === 0) return { flushed: 0, remaining: 0 };

    const remaining = [...queue];
    let flushed = 0;

    while (remaining.length > 0) {
      const item = remaining[0];
      try {
        const response = await fetch(`${BASE_URL}${item.path}`, item.options);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        remaining.shift();
        flushed += 1;
      } catch {
        break;
      }
    }

    await setQueue(remaining);
    return { flushed, remaining: remaining.length };
  });
}
