import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../theme/colors';

const TABS = [
  { name: 'Dashboard', label: 'Home', icon: '🏠' },
  { name: 'Subjects', label: 'Subjects', icon: '📚' },
  { name: 'CommunityBoard', label: 'Community', icon: '📝' },
  { name: 'Progress', label: 'Progress', icon: '📊' },
];

// user prop is forwarded via navigation params so screens further down
// the stack (SubjectDetails → Quiz) can still access the logged-in user.
export default function BottomNav({ current, navigation, user }) {
  return (
    <View style={styles.nav}>
      {TABS.map((tab) => {
        const active = current === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => current !== tab.name && navigation.navigate(tab.name, { user })}
          >
            <Text style={styles.icon}>{tab.icon}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
            {active && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  icon: {
    fontSize: 22,
    marginBottom: 3,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  activeDot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
