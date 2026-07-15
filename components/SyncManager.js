import { useEffect, useRef } from 'react';
import { subscribeToConnectivity } from '../utils/network';
import { flushQueue } from '../utils/syncQueue';

/**
 * Invisible component (renders nothing) — mounted once at the app root.
 * Watches connectivity and flushes the offline write queue the moment the
 * device transitions from offline back to online. Screens don't need to
 * do anything special to benefit from this; they'll simply see fresh data
 * next time they fetch (apiGet is network-first already).
 */
export default function SyncManager() {
  const wasOnlineRef = useRef(true);

  useEffect(() => {
    const unsubscribe = subscribeToConnectivity((online) => {
      if (online && !wasOnlineRef.current) {
        flushQueue().catch(() => {});
      }
      wasOnlineRef.current = online;
    });
    return unsubscribe;
  }, []);

  return null;
}
