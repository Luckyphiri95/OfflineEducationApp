import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, RefreshControl, StatusBar, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../theme/colors';
import Loader from '../components/Loader';
import BottomNav from '../components/BottomNav';
import { apiGet } from '../utils/api';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'module', label: 'Module Articles' },
  { key: 'improvement', label: 'School Improvement' },
];

function CategoryBadge({ category }) {
  const isModule = category === 'module';
  return (
    <View style={[badge.wrap, { backgroundColor: isModule ? colors.badgeInfo : colors.badgeWarning }]}>
      <Text style={[badge.text, { color: isModule ? colors.badgeInfoText : colors.badgeWarningText }]}>
        {isModule ? 'Module' : 'School Improvement'}
      </Text>
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '700' },
});

export default function CommunityBoardScreen({ navigation, route }) {
  const { user } = route.params || {};
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadData = async () => {
    const { data } = await apiGet(`/api/articles?user_id=${user?.id || ''}`, `articles:${user?.id || 'anon'}`);
    if (Array.isArray(data)) {
      setArticles(data);
      setLoadError('');
    } else {
      setArticles([]);
      setLoadError('Could not load the community board. Check your connection and try again.');
    }
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const filtered = articles.filter((a) => filter === 'all' || a.category === filter);

  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.blueHeader}>
        <Text style={styles.headerTitle}>Community Board</Text>
        <Text style={styles.headerSub}>Articles from your school</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.chips}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, filter === f.key && styles.chipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <Loader message="Loading articles..." />
        ) : loadError ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{loadError}</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No articles here yet. Check back later.</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('ArticleDetail', { article: item, user })}
              >
                <CategoryBadge category={item.category} />
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardPreview} numberOfLines={2}>{item.body}</Text>
                <View style={styles.cardMeta}>
                  <Text style={styles.metaText}>❤️ {item.like_count || 0}</Text>
                  <Text style={styles.metaText}>💬 {item.comment_count || 0}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <BottomNav current="CommunityBoard" navigation={navigation} user={user} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  blueHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 20,
  },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: colors.surface, borderRadius: 16,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 10 },
  cardPreview: { color: colors.textSecondary, fontSize: 13, marginTop: 4, lineHeight: 19 },
  cardMeta: { flexDirection: 'row', gap: 16, marginTop: 10 },
  metaText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textSecondary, fontSize: 15, textAlign: 'center', paddingHorizontal: 24 },
});
