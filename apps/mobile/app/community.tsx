// ============================================================
// app/community.tsx — Community Feed
//
// Anonymous community posts with heart reactions and a post
// composer at the top. Posts fetched from /api/community.
// ============================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { apiClient } from '../src/lib/api';

const C = {
  primary: '#226779',
  primaryLight: 'rgba(34,103,121,0.10)',
  background: '#fbf9f8',
  surface: '#ffffff',
  onSurface: '#1a1a2e',
  onSurfaceVariant: '#6b7280',
  error: '#ef4444',
  heart: '#e11d48',
  heartLight: 'rgba(225,29,72,0.08)',
  emerald: '#10b981',
  border: '#e5e7eb',
  amber: '#f59e0b',
  amberLight: 'rgba(245,158,11,0.10)',
  violet: '#8b5cf6',
  violetLight: 'rgba(139,92,246,0.10)',
} as const;

const POST_CHAR_LIMIT = 280;

const POST_TYPES = [
  { key: 'reflection', label: 'Reflection', icon: 'bulb-outline' as const, color: C.amber, bg: C.amberLight },
  { key: 'gratitude', label: 'Gratitude', icon: 'heart-outline' as const, color: C.heart, bg: C.heartLight },
  { key: 'victory', label: 'Victory', icon: 'trophy-outline' as const, color: C.emerald, bg: 'rgba(16,185,129,0.10)' },
  { key: 'question', label: 'Question', icon: 'help-circle-outline' as const, color: C.violet, bg: C.violetLight },
] as const;

type PostType = (typeof POST_TYPES)[number]['key'];

type CommunityPost = {
  id: string;
  body: string;
  type: PostType;
  hearts: number;
  hearted_by_me: boolean;
  created_at: string;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function PostCard({
  post,
  onHeart,
}: {
  post: CommunityPost;
  onHeart: (id: string) => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const typeInfo = POST_TYPES.find((t) => t.key === post.type) ?? POST_TYPES[0];

  return (
    <View style={s.postCard}>
      <View style={s.postHeader}>
        <View style={[s.typePill, { backgroundColor: typeInfo.bg }]}>
          <Ionicons name={typeInfo.icon} size={13} color={typeInfo.color} />
          <Text style={[s.typePillText, { color: typeInfo.color }]}>{typeInfo.label}</Text>
        </View>
        <Text style={s.postTime}>{timeAgo(post.created_at)}</Text>
      </View>
      <Text style={s.postBody}>{post.body}</Text>
      <View style={s.postFooter}>
        <Animated.View style={animStyle}>
          <Pressable
            style={[s.heartButton, post.hearted_by_me && s.heartButtonActive]}
            onPress={() => {
              scale.value = withSpring(1.3, { damping: 8, stiffness: 400 });
              setTimeout(() => {
                scale.value = withSpring(1, { damping: 12, stiffness: 300 });
              }, 120);
              onHeart(post.id);
            }}
            hitSlop={8}
          >
            <Ionicons
              name={post.hearted_by_me ? 'heart' : 'heart-outline'}
              size={18}
              color={post.hearted_by_me ? C.heart : C.onSurfaceVariant}
            />
            <Text
              style={[
                s.heartCount,
                post.hearted_by_me && { color: C.heart, fontWeight: '600' },
              ]}
            >
              {post.hearts}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

export default function CommunityScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [composerText, setComposerText] = useState('');
  const [composerType, setComposerType] = useState<PostType>('reflection');
  const [posting, setPosting] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await apiClient.get<{ posts: CommunityPost[] }>('/api/community');
      setPosts(res.posts ?? []);
    } catch (e) {
      console.warn('[Community] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, [fetchPosts]);

  const handlePost = useCallback(async () => {
    const trimmed = composerText.trim();
    if (!trimmed) return;
    setPosting(true);
    try {
      const res = await apiClient.post<{ post: CommunityPost }>('/api/community', {
        body: trimmed,
        type: composerType,
      });
      setPosts((prev) => [res.post, ...prev]);
      setComposerText('');
      Keyboard.dismiss();
    } catch (e) {
      Alert.alert('Error', 'Could not publish your post.');
      console.warn('[Community] Post error:', e);
    } finally {
      setPosting(false);
    }
  }, [composerText, composerType]);

  const handleHeart = useCallback(async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              hearted_by_me: !p.hearted_by_me,
              hearts: p.hearted_by_me ? p.hearts - 1 : p.hearts + 1,
            }
          : p,
      ),
    );
    try {
      await apiClient.post(`/api/community/${postId}/heart`);
    } catch (e) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                hearted_by_me: !p.hearted_by_me,
                hearts: p.hearted_by_me ? p.hearts - 1 : p.hearts + 1,
              }
            : p,
        ),
      );
    }
  }, []);

  const charsLeft = POST_CHAR_LIMIT - composerText.length;

  const composer = (
    <View style={s.composer}>
      <View style={s.composerTypeRow}>
        {POST_TYPES.map((t) => (
          <Pressable
            key={t.key}
            style={[
              s.composerTypePill,
              composerType === t.key && { backgroundColor: t.bg, borderColor: t.color },
            ]}
            onPress={() => setComposerType(t.key)}
          >
            <Ionicons name={t.icon} size={14} color={composerType === t.key ? t.color : C.onSurfaceVariant} />
            <Text
              style={[
                s.composerTypePillText,
                composerType === t.key && { color: t.color, fontWeight: '600' },
              ]}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        ref={inputRef}
        style={s.composerInput}
        placeholder="Share something with the community..."
        placeholderTextColor="#9ca3af"
        multiline
        maxLength={POST_CHAR_LIMIT}
        value={composerText}
        onChangeText={setComposerText}
        textAlignVertical="top"
      />
      <View style={s.composerFooter}>
        <Text style={[s.charCount, charsLeft < 30 && { color: C.error }]}>
          {charsLeft}
        </Text>
        <Pressable
          style={[s.postButton, (!composerText.trim() || posting) && { opacity: 0.4 }]}
          onPress={handlePost}
          disabled={!composerText.trim() || posting}
        >
          {posting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={s.postButtonText}>Post</Text>
          )}
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={s.loadingContainer}>
        <ActivityIndicator size="large" color={C.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={C.onSurface} />
        </Pressable>
        <Text style={s.headerTitle}>Community</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={composer}
        renderItem={({ item }) => <PostCard post={item} onHeart={handleHeart} />}
        contentContainerStyle={s.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={C.border} />
            <Text style={s.emptyText}>
              Be the first to share. Your post is anonymous.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.onSurface },
  listContent: { padding: 20, paddingTop: 0 },

  // Composer
  composer: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 20,
  },
  composerTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  composerTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: C.border,
  },
  composerTypePillText: { fontSize: 12, color: C.onSurfaceVariant, fontWeight: '500' },
  composerInput: {
    fontSize: 15,
    color: C.onSurface,
    minHeight: 72,
    lineHeight: 22,
  },
  composerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  charCount: { fontSize: 13, color: C.onSurfaceVariant, fontVariant: ['tabular-nums'] },
  postButton: {
    backgroundColor: C.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 9999,
    minWidth: 72,
    alignItems: 'center',
  },
  postButtonText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },

  // Post Card
  postCard: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  typePillText: { fontSize: 12, fontWeight: '600' },
  postTime: { fontSize: 12, color: C.onSurfaceVariant },
  postBody: { fontSize: 15, color: C.onSurface, lineHeight: 22, marginBottom: 12 },
  postFooter: { flexDirection: 'row' },
  heartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 9999,
    backgroundColor: 'transparent',
  },
  heartButtonActive: { backgroundColor: C.heartLight },
  heartCount: { fontSize: 14, color: C.onSurfaceVariant, fontVariant: ['tabular-nums'] },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 56, gap: 12 },
  emptyText: { fontSize: 15, color: C.onSurfaceVariant, textAlign: 'center', maxWidth: 260, lineHeight: 22 },
});
