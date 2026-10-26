import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../src/firebase';
import { useAuth } from '../../src/AuthContext';
import { displayName, formatTime } from '../../src/utils';

// Replies live in questions/{id}/replies and are either an "answer" or a
// "comment" (general discussion).
export default function QuestionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [question, setQuestion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [type, setType] = useState('answer');
  const [sending, setSending] = useState(false);

  // Real-time listeners on the question doc and its replies.
  useEffect(() => {
    const unsubQuestion = onSnapshot(doc(db, 'questions', id), (snap) => {
      setQuestion(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    const repliesQuery = query(
      collection(db, 'questions', id, 'replies'),
      orderBy('createdAt', 'asc')
    );
    const unsubReplies = onSnapshot(repliesQuery, (snap) => {
      setReplies(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => {
      unsubQuestion();
      unsubReplies();
    };
  }, [id]);

  const sendReply = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      // Add the reply and bump the counter on the question together.
      const batch = writeBatch(db);
      batch.set(doc(collection(db, 'questions', id, 'replies')), {
        text: text.trim(),
        type,
        authorId: user.uid,
        authorEmail: user.email,
        createdAt: serverTimestamp(),
      });
      batch.update(doc(db, 'questions', id), { answerCount: increment(1) });
      await batch.commit();
      setText('');
    } catch (error) {
      Alert.alert('Could not send', error.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 32 }} />;
  if (!question) return <Text style={styles.empty}>This question no longer exists.</Text>;

  const answers = replies.filter((r) => r.type === 'answer');
  const comments = replies.filter((r) => r.type !== 'answer');
  const sections = [
    { kind: 'header', id: 'answers-header', label: `Answers (${answers.length})` },
    ...answers,
    { kind: 'header', id: 'comments-header', label: `Discussion (${comments.length})` },
    ...comments,
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        ListHeaderComponent={
          <View style={styles.questionCard}>
            <Text style={styles.title}>{question.title}</Text>
            {!!question.body && <Text style={styles.body}>{question.body}</Text>}
            <Text style={styles.meta}>
              Asked by {displayName(question.authorEmail)} · {formatTime(question.createdAt)}
            </Text>
          </View>
        }
        renderItem={({ item }) =>
          item.kind === 'header' ? (
            <Text style={styles.sectionHeader}>{item.label}</Text>
          ) : (
            <View style={[styles.reply, item.type === 'answer' && styles.answer]}>
              <Text style={styles.replyText}>{item.text}</Text>
              <Text style={styles.meta}>
                {displayName(item.authorEmail)} · {formatTime(item.createdAt)}
              </Text>
            </View>
          )
        }
      />

      {user ? (
        <View style={[styles.composer, { paddingBottom: 12 + insets.bottom }]}>
          <View style={styles.toggle}>
            {['answer', 'comment'].map((t) => (
              <Pressable
                key={t}
                onPress={() => setType(t)}
                style={[styles.toggleOption, type === t && styles.toggleActive]}
              >
                <Text style={[styles.toggleText, type === t && styles.toggleTextActive]}>
                  {t === 'answer' ? 'Answer' : 'Discuss'}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={type === 'answer' ? 'Write an answer...' : 'Add to the discussion...'}
              value={text}
              onChangeText={setText}
              multiline
            />
            <Pressable style={styles.sendButton} onPress={sendReply} disabled={sending}>
              <Text style={styles.sendText}>{sending ? '...' : 'Send'}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          style={[styles.loginBar, { paddingBottom: 16 + insets.bottom }]}
          onPress={() => router.push('/auth')}
        >
          <Text style={styles.loginText}>Log in to answer or join the discussion</Text>
        </Pressable>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  questionCard: { backgroundColor: '#fff', borderRadius: 10, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  body: { fontSize: 16, color: '#374151', marginTop: 8, lineHeight: 22 },
  meta: { fontSize: 13, color: '#6b7280', marginTop: 8 },
  sectionHeader: { fontSize: 15, fontWeight: '700', color: '#374151', marginTop: 20, marginBottom: 4 },
  reply: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginTop: 8 },
  answer: { borderLeftWidth: 4, borderLeftColor: '#16a34a' },
  replyText: { fontSize: 15, color: '#111827', lineHeight: 21 },
  composer: {
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  toggle: { flexDirection: 'row', gap: 8 },
  toggleOption: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#e5e7eb' },
  toggleActive: { backgroundColor: '#2563eb' },
  toggleText: { color: '#374151', fontWeight: '600' },
  toggleTextActive: { color: '#fff' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16 },
  sendText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  loginBar: { backgroundColor: '#2563eb', padding: 16, alignItems: 'center' },
  loginText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 32 },
});
