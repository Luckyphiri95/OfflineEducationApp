import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Platform, Alert, KeyboardAvoidingView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../theme/colors';
import Input from '../components/Input';
import Button from '../components/Button';
import BASE_URL from '../config';

export default function ArticleDetailScreen({ route, navigation }) {
  const { article, user } = route.params || {};
  const [liked, setLiked] = useState(!!article?.liked_by_me);
  const [likeCount, setLikeCount] = useState(article?.like_count || 0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      const data = await fetch(`${BASE_URL}/api/articles/${article.id}/comments`).then((r) => r.json());
      setComments(Array.isArray(data) ? data : []);
    } catch {
      // fail silently — article body/like state still usable offline of comments
    } finally {
      setLoading(false);
    }
  }, [article?.id]);

  useFocusEffect(useCallback(() => { loadComments(); }, [loadComments]));

  const toggleLike = async () => {
    // Optimistic update, matching this app's existing pattern of trusting the
    // client and not blocking the UI on the network round-trip
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? Math.max(0, prev - 1) : prev + 1));
    try {
      await fetch(`${BASE_URL}/api/articles/${article.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id }),
      });
    } catch {
      // revert on failure
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const postComment = async () => {
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/articles/${article.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id, body: commentText.trim() }),
      });
      if (!res.ok) throw new Error();
      setCommentText('');
      loadComments();
    } catch {
      Alert.alert('Error', 'Could not post your comment. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const deleteComment = (comment) => {
    Alert.alert(
      'Delete Comment',
      'Delete this comment? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await fetch(`${BASE_URL}/api/comments/${comment.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user?.id, is_admin: !!user?.is_admin }),
              });
              loadComments();
            } catch {
              Alert.alert('Error', 'Could not delete comment.');
            }
          },
        },
      ]
    );
  };

  const canDelete = (comment) => comment.user_id === user?.id || user?.is_admin;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.page}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

        <View style={styles.blueHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={2}>{article?.title}</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.bodyText}>{article?.body}</Text>

            <TouchableOpacity style={[styles.likeBtn, liked && styles.likeBtnActive]} onPress={toggleLike}>
              <Text style={[styles.likeBtnText, liked && styles.likeBtnTextActive]}>
                {liked ? '❤️' : '🤍'} {likeCount} {likeCount === 1 ? 'like' : 'likes'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comments</Text>
            {loading ? (
              <Text style={styles.emptyText}>Loading comments...</Text>
            ) : comments.length === 0 ? (
              <Text style={styles.emptyText}>No comments yet. Be the first to share your thoughts.</Text>
            ) : (
              comments.map((c) => (
                <View key={c.id} style={styles.commentRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.commentAuthor}>{c.username || 'Student'}</Text>
                    <Text style={styles.commentBody}>{c.body}</Text>
                  </View>
                  {canDelete(c) && (
                    <TouchableOpacity onPress={() => deleteComment(c)}>
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Input
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Add a comment..."
            />
          </View>
          <Button title={posting ? '...' : 'Post'} onPress={postComment} disabled={posting || !commentText.trim()} />
        </View>
      </View>
    </KeyboardAvoidingView>
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
  backBtn: { marginBottom: 12 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '500' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { paddingBottom: 20 },
  section: { padding: 20, paddingBottom: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  bodyText: { fontSize: 15, color: colors.textPrimary, lineHeight: 24 },
  likeBtn: {
    flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center',
    marginTop: 16, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border,
  },
  likeBtnActive: { backgroundColor: colors.badgeError, borderColor: colors.badgeErrorText },
  likeBtnText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  likeBtnTextActive: { color: colors.badgeErrorText },
  emptyText: { color: colors.textSecondary, fontSize: 14 },
  commentRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: colors.surface, borderRadius: 12,
    padding: 12, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  commentAuthor: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  commentBody: { fontSize: 14, color: colors.textSecondary, marginTop: 3, lineHeight: 20 },
  deleteText: { fontSize: 12, fontWeight: '700', color: colors.error, marginLeft: 10 },
  footer: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
});
