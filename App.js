import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { observeAuthState, signIn, signOutCurrentUser, signUp } from './firebase/authService';
import { createMessage, loadMessagesOnce, subscribeToMessages } from './firebase/messageService';

export default function App() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [user, setUser] = React.useState(null);
  const [authReady, setAuthReady] = React.useState(false);
  const [authBusy, setAuthBusy] = React.useState(false);
  const [authError, setAuthError] = React.useState('');
  const [messageText, setMessageText] = React.useState('');
  const [messages, setMessages] = React.useState([]);
  const [messagesLoading, setMessagesLoading] = React.useState(false);
  const [messageError, setMessageError] = React.useState('');
  const [sending, setSending] = React.useState(false);

  // ======================================================
  // PART 2 - OBSERVE AUTHENTICATION STATE
  //
  // WHY: Firebase needs a moment to restore a saved sign-in.
  // PRODUCT QUESTION: What should a returning visitor see while we wait?
  // DO: Uncomment this effect and the PART 2 line in firebase/authService.js.
  // VERIFY: The status below changes from “Checking…” to signed-out or signed-in.
  // NEXT: Search for "PART 3 - SIGN UP, SIGN IN, AND SIGN OUT" in authService.js.
  // ======================================================
  React.useEffect(() => {
    const unsubscribe = observeAuthState(nextUser => {
      setUser(nextUser);
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

  // These buttons and error messages are already wired to the service stubs.
  // PART 3 works as soon as the three return lines in authService.js are enabled.
  async function runAuthOperation(operation) {
    setAuthBusy(true);
    setAuthError('');
    try {
      await operation(email.trim(), password);
    } catch (error) {
      setAuthError(error.message || 'We could not complete that sign-in action.');
    } finally {
      setAuthBusy(false);
    }
  }

  async function sendMessage() {
    setSending(true);
    setMessageError('');
    try {
      await createMessage({ text: messageText, user });
      setMessageText('');
    } catch (error) {
      setMessageError(error.message || 'Your message could not be sent.');
    } finally {
      setSending(false);
    }
  }

  // ======================================================
  // PART 5 - ONE-TIME READ DEMONSTRATION
  //
  // WHY: The one-time read is useful for seeing the collection's current contents.
  // PRODUCT QUESTION: Is one photograph enough for a conversation?
  // DO: Uncomment this effect and the PART 5 block in messageService.js.
  // VERIFY: Existing messages appear once when the signed-in board opens.
  // NEXT: For live updates, disable this effect and search for "PART 6" below.
  // ======================================================

  React.useEffect(() => {
    if (!user) return;

    setMessagesLoading(true);
    loadMessagesOnce()
      .then(nextMessages => setMessages(nextMessages))
      .catch(error => setMessageError(error.message))
      .finally(() => setMessagesLoading(false));
  }, [user]);


  // ======================================================
  // PART 6 - REALTIME MESSAGE SUBSCRIPTION
  //
  // WHY: A listener keeps the message list current without refreshing.
  // PRODUCT QUESTION: How quickly should another client's message appear?
  // DO: Disable the PART 5 effect above, then remove the comment markers around
  //     this effect and the PART 6 block in messageService.js. Leave the marked
  //     return line commented until PART 7.
  // VERIFY: Two clients show new messages without refreshing.
  // NEXT: Search for "PART 7 - CLEAN UP THE SUBSCRIPTION" below.
  // ======================================================

  React.useEffect(() => {
    if (!user) {
      setMessages([]);
      setMessagesLoading(false);
      return undefined;
    }

    setMessagesLoading(true);
    setMessageError('');
    const unsubscribe = subscribeToMessages(
      nextMessages => {
        setMessages(nextMessages);
        setMessagesLoading(false);
      },
      error => {
        setMessageError(error.message);
        setMessagesLoading(false);
      },
    );

    // PART 7 - Uncomment this line so the effect stops listening when it ends.
    return unsubscribe;
  }, [user]);


  const sendDisabled = !messageText.trim() || sending || !user;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.content}>
          <Text style={styles.eyebrow}>A SMALL FIREBASE CODE TOUR</Text>
          <Text style={styles.heading}>Firebase tour</Text>
          <Text style={styles.copy}>A shared message board. As you work through the parts below, this static screen will become a realtime app.</Text>

          <View style={styles.panel}>
            <Text style={styles.subheading}>Join the conversation</Text>
            <TextInput
              accessibilityLabel="Email"
              autoCapitalize="none"
              autoComplete="email"
              onChangeText={setEmail}
              placeholder="Email"
              style={styles.input}
              value={email}
            />
            <TextInput
              accessibilityLabel="Password"
              autoCapitalize="none"
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              style={styles.input}
              value={password}
            />
            {authError ? <Text accessibilityRole="alert" style={styles.error}>{authError}</Text> : null}
            <View style={styles.buttonRow}>
              <Pressable accessibilityRole="button" disabled={authBusy} onPress={() => runAuthOperation(signUp)} style={styles.primary}>
                <Text style={styles.primaryText}>{authBusy ? 'Please wait…' : 'Create account'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" disabled={authBusy} onPress={() => runAuthOperation(signIn)} style={styles.secondary}>
                <Text style={styles.secondaryText}>Sign in</Text>
              </Pressable>
            </View>
            <Text style={styles.muted}>
              {!authReady ? 'Auth observer not enabled yet. Complete Part 2.' : user ? `Signed in as ${user.email}` : 'You are signed out.'}
            </Text>
            {user ? (
              <Pressable accessibilityRole="button" disabled={authBusy} onPress={() => runAuthOperation(signOutCurrentUser)}>
                <Text style={styles.secondaryText}>Sign out</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.board}>
            <Text style={styles.subheading}>Community messages</Text>
            <View style={styles.composerRow}>
              <TextInput
                accessibilityLabel="Message"
                onChangeText={setMessageText}
                placeholder="Write a message..."
                style={[styles.input, styles.messageInput]}
                value={messageText}
              />
              <Pressable accessibilityRole="button" disabled={sendDisabled} onPress={sendMessage} style={[styles.primary, sendDisabled && styles.disabled]}>
                <Text style={styles.primaryText}>Send</Text>
              </Pressable>
            </View>
            {messageError ? <Text accessibilityRole="alert" style={styles.error}>{messageError}</Text> : null}
            <FlatList
              contentContainerStyle={styles.listContent}
              data={messages}
              keyExtractor={message => message.id}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={(
                <Text style={styles.muted}>
                  {messagesLoading ? 'Loading messages…' : 'No messages yet. Sign in and start the conversation!'}
                </Text>
              )}
              renderItem={({ item }) => (
                <View style={styles.messageCard}>
                  <Text style={styles.message}>{item.text}</Text>
                  <Text style={styles.muted}>{item.authorEmail || 'A community member'}</Text>
                </View>
              )}
              style={styles.messageList}
            />
          </View>

          <Text style={styles.footer}>Authentication decides who can join. Firebase Security Rules decide what signed-in people may do.</Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ======================================================
// PART 7 - CLEAN UP THE SUBSCRIPTION
//
// WHY: Firestore keeps sending updates until its listener is stopped.
// PRODUCT QUESTION: Should a screen keep receiving messages after it closes?
// DO: Uncomment the PART 7 line inside the PART 6 effect above.
// CODE TO ENABLE: return unsubscribe;
// VERIFY: The listener cleanup test passes after the screen unmounts.
// NEXT: Search for "PART 8 - SECURITY RULES" in firestore.rules.
// ======================================================

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#f4f6fb', flex: 1 },
  content: { flex: 1, gap: 12, padding: 18, paddingTop: 24 },
  eyebrow: { color: '#4358d5', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  heading: { color: '#19233b', fontSize: 30, fontWeight: '800' },
  copy: { color: '#5f6b83', fontSize: 14, lineHeight: 20 },
  panel: { backgroundColor: '#fff', borderRadius: 12, gap: 9, padding: 13 },
  subheading: { color: '#19233b', fontSize: 17, fontWeight: '700' },
  input: { backgroundColor: '#fff', borderColor: '#dce2ee', borderRadius: 9, borderWidth: 1, minHeight: 42, paddingHorizontal: 12, paddingVertical: 9 },
  buttonRow: { flexDirection: 'row', gap: 8 },
  primary: { alignItems: 'center', backgroundColor: '#4358d5', borderRadius: 9, paddingHorizontal: 14, paddingVertical: 11 },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondary: { alignItems: 'center', borderColor: '#4358d5', borderRadius: 9, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  secondaryText: { color: '#3448c0', fontWeight: '700' },
  disabled: { backgroundColor: '#aab2d8' },
  error: { color: '#a32d32', fontSize: 13 },
  muted: { color: '#5f6b83', fontSize: 12 },
  board: { flex: 1, gap: 8, minHeight: 100 },
  composerRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  messageInput: { flex: 1 },
  messageList: { flex: 1 },
  listContent: { gap: 8, paddingBottom: 8 },
  messageCard: { backgroundColor: '#fff', borderRadius: 9, gap: 5, padding: 12 },
  message: { color: '#19233b', fontSize: 15, lineHeight: 21 },
  footer: { color: '#778198', fontSize: 11, lineHeight: 16 },
});
