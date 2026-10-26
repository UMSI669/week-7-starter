import { useEffect, useMemo, useState } from 'react';
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
import { Link, Stack, useRouter } from 'expo-router';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../src/firebase';
import { useAuth } from '../../src/AuthContext';
import { displayName, formatTime } from '../../src/utils';

export default function QuestionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);

  // Real-time listener: any new question (from any device) shows up immediately.
  useEffect(() => {
    const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setQuestions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return questions;
    return questions.filter(
      (q) =>
        q.title?.toLowerCase().includes(term) ||
        q.body?.toLowerCase().includes(term)
    );
  }, [questions, search]);

  const startComposing = () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    setComposing(true);
  };

  const postQuestion = async () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please give your question a title.');
      return;
    }
    setPosting(true);
    try {
      await addDoc(collection(db, 'questions'), {
        title: title.trim(),
        body: body.trim(),
        authorId: user.uid,
        authorEmail: user.email,
        answerCount: 0,
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setBody('');
      setComposing(false);
    } catch (error) {
      Alert.alert('Could not post', error.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link href="/auth" style={styles.headerLink}>
              {user ? displayName(user.email) : 'Log in'}
            </Link>
          ),
        }}
      />

      <TextInput
        style={styles.search}
        placeholder="Search questions..."
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />

      {composing ? (
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Question title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Details (optional)"
            value={body}
            onChangeText={setBody}
            multiline
          />
          <View style={styles.row}>
            <Pressable style={[styles.button, styles.secondary]} onPress={() => setComposing(false)}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={postQuestion} disabled={posting}>
              <Text style={styles.buttonText}>{posting ? 'Posting...' : 'Post'}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={[styles.button, styles.askButton]} onPress={startComposing}>
          <Text style={styles.buttonText}>
            {user ? '+ Ask a question' : 'Log in to ask a question'}
          </Text>
        </Pressable>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={styles.empty}>
              {search ? 'No questions match your search.' : 'No questions yet. Be the first!'}
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/questions/${item.id}`)}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              {!!item.body && (
                <Text style={styles.cardBody} numberOfLines={2}>
                  {item.body}
                </Text>
              )}
              <Text style={styles.meta}>
                {displayName(item.authorEmail)} · {formatTime(item.createdAt)} ·{' '}
                {item.answerCount ?? 0} {item.answerCount === 1 ? 'reply' : 'replies'}
              </Text>
            </Pressable>
          )}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingTop: 12 },
  headerLink: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
  search: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  composer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  askButton: { marginVertical: 12 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  secondary: { backgroundColor: '#e5e7eb' },
  secondaryText: { color: '#111827', fontWeight: '600', fontSize: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#111827' },
  cardBody: { fontSize: 15, color: '#4b5563', marginTop: 4 },
  meta: { fontSize: 13, color: '#6b7280', marginTop: 8 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 32 },
});
