import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { colors, serifFont, softShadow } from '../theme';

export default function ChatScreen({ user }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef(null);

  // Real-time updates: onSnapshot fires once with the current messages and
  // again every time any user adds a message. Oldest first = chronological.
  useEffect(() => {
    const messagesQuery = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      },
    );
    // Stop listening when the screen unmounts (which happens on logout).
    return unsubscribe;
  }, []);

  async function sendMessage() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    setError('');
    try {
      await addDoc(collection(db, 'messages'), {
        text: trimmed,
        userId: user.uid,
        senderEmail: user.email,
        createdAt: serverTimestamp(),
      });
      setText('');
    } catch (e) {
      setError('Message could not be sent. ' + e.message);
    } finally {
      setSending(false);
    }
  }

  function renderMessage({ item }) {
    const isMine = item.userId === user.uid;
    return (
      <View style={[styles.messageRow, isMine ? styles.rowMine : styles.rowTheirs]}>
        <Text style={styles.sender}>{isMine ? 'You' : item.senderEmail}</Text>
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Chat Room</Text>
            <Text style={styles.signedInAs} numberOfLines={1}>
              {user.email}
            </Text>
          </View>
          <Pressable style={styles.logoutButton} onPress={() => signOut(auth)}>
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <Text style={styles.empty}>No messages yet. Say hello!</Text>
            }
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Message the room"
            placeholderTextColor={colors.muted}
            value={text}
            onChangeText={setText}
            multiline
          />
          <Pressable
            style={[styles.sendButton, (!text.trim() || sending) && styles.sendDisabled]}
            onPress={sendMessage}
            disabled={!text.trim() || sending}
            accessibilityLabel="Send message"
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.sendIcon}>↑</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerText: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontFamily: serifFont,
    fontSize: 28,
    color: colors.text,
  },
  signedInAs: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: colors.background,
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 18,
    ...softShadow,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  empty: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 40,
    fontSize: 15,
  },
  messageRow: {
    marginBottom: 14,
    maxWidth: '82%',
  },
  rowMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  rowTheirs: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  sender: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
    marginHorizontal: 6,
  },
  bubble: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bubbleMine: {
    backgroundColor: colors.sentBubble,
  },
  bubbleTheirs: {
    backgroundColor: colors.receivedBubble,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: 17,
    lineHeight: 23,
    color: colors.text,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 32,
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 4,
    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 8,
    ...softShadow,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: colors.text,
    maxHeight: 110,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.35,
  },
  sendIcon: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
});
