import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirm dialog. React Native's Alert.alert is a no-op on
 * web (react-native-web's Alert.alert renders nothing and never invokes its
 * button callbacks), so this falls back to window.confirm there instead.
 */
export function confirmAction({ title, message, confirmLabel = 'Delete', destructive = true, onConfirm }) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}
