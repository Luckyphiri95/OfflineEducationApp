import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import colors from '../theme/colors';

// react-native-webview has no web implementation, so on web we render a
// plain <iframe> (react-native-web renders through react-dom, so raw DOM
// elements work fine here) instead of the native WebView component.
const NativeWebView = Platform.OS === 'web' ? null : require('react-native-webview').WebView;

export default function StudyGuideViewerScreen({ route, navigation }) {
  const { pdfUrl, subjectName } = route.params || {};

  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.blueHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{subjectName || 'Study Guide'}</Text>
      </View>

      {Platform.OS === 'web' ? (
        <iframe
          src={pdfUrl}
          style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
          title={subjectName || 'Study Guide'}
        />
      ) : (
        <NativeWebView source={{ uri: pdfUrl }} style={styles.webview} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  blueHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 16,
  },
  backBtn: { marginBottom: 12 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '500' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  webview: { flex: 1 },
});
