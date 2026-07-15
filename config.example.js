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
// Hosted backend (Render — see render.yaml at the repo root):
//   Once deployed, Render gives you a URL like https://mzansigo-backend.onrender.com
//   const BASE_URL = 'https://mzansigo-backend.onrender.com';
//   Free-tier note: the instance spins down after inactivity (the first
//   request after idle can take ~30-50s to wake it up) and its filesystem
//   is NOT persistent — the SQLite database and any uploaded PDFs reset on
//   every redeploy/restart. Fine for a demo; upgrade to a paid plan with a
//   persistent disk before relying on this for real data.
//
// To switch automatically based on platform:
const BASE_URL = Platform.OS === 'android'
  ? 'http://YOUR_LOCAL_IP:3000'   // ← replace with your IP e.g. http://192.168.0.5:3000
  : 'http://localhost:3000';

export default BASE_URL;
