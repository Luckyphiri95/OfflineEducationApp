import { Platform } from 'react-native';

// Copy this file to config.js and update the URL for your setup.
//
// Web browser testing:
//   const BASE_URL = 'http://localhost:3000';
//
// Android device testing (phone must be on the same Wi-Fi as your machine):
//   Find your machine's IP: ipconfig getifaddr en0  (Mac) or ipconfig (Windows)
//   const BASE_URL = 'http://192.168.0.5:3000';  ← replace with your IP
//
// To switch automatically based on platform:
const BASE_URL = Platform.OS === 'android'
  ? 'http://YOUR_LOCAL_IP:3000'   // ← replace with your IP e.g. http://192.168.0.5:3000
  : 'http://localhost:3000';

export default BASE_URL;
