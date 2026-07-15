import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'session:user';

export async function saveSession(user) {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    // non-fatal — the app still works for this launch, just won't
    // auto-resume next time
  }
}

export async function getSession() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearSession() {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
