import { Platform } from 'react-native';

// Copy this file to config.js and replace the Android IP with your machine's local IP.
// Run:  ipconfig getifaddr en0   (Mac) or   ipconfig   (Windows) to find your IP.
// Both your machine and Android device must be on the same Wi-Fi network.
const BASE_URL = Platform.OS === 'android'
  ? 'http://YOUR_LOCAL_IP:3000'   // ← replace with your IP, e.g. http://192.168.0.5:3000
  : 'http://localhost:3000';

export default BASE_URL;
