import NetInfo from '@react-native-community/netinfo';

// A real fetch succeeding/failing is stronger evidence of connectivity than
// NetInfo's web implementation, which only reflects navigator.onLine + browser
// online/offline events — those don't fire for every real-world disconnect.
// apiGet/syncQueue report each fetch outcome here so subscribers (e.g.
// OfflineBanner) update immediately instead of waiting on a NetInfo event
// that may never come.
const listeners = new Set();

export function subscribeToConnectivity(callback) {
  listeners.add(callback);
  const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
    callback(!!state.isConnected && state.isInternetReachable !== false);
  });
  return () => {
    listeners.delete(callback);
    unsubscribeNetInfo();
  };
}

export function reportConnectivity(online) {
  listeners.forEach((cb) => {
    try {
      cb(online);
    } catch {}
  });
}

export async function isConnected() {
  const state = await NetInfo.fetch();
  return !!state.isConnected && state.isInternetReachable !== false;
}
