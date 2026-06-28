import { Platform } from 'react-native';

// On Android device, 'localhost' points to the phone itself, not your Mac. 
// So we use the Mac's local IP for Android, and localhost for everything else. 
// Make sure that your Mac and Android device are on the same Wi-Fi network, and that your Mac's firewall allows incoming connections on port 3000.

const BASE_URL = Platform.OS === 'android'
  ? 'http://192.168.0.5:3000'   // Your Mac's local IP — run: ipconfig getifaddr en0
  : 'http://localhost:3000';      // Web and iOS simulator

export default BASE_URL;
