import React from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { observeAuthState, signIn, signOutCurrentUser, signUp } from './firebase/authService';
import { createThread, subscribeToThreads } from './firebase/threadService';

function initialsFor(email = '') {
  const name = email.split('@')[0];
  const parts = name.split(/[._-]+/).filter(Boolean);
  if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || '?';
}

function formatPostDate(value) {
  const date = value && typeof value.toDate === 'function'
    ? value.toDate()
    : value instanceof Date ? value : null;
  if (!date || Number.isNaN(date.getTime())) return 'Just now';

  const now = new Date();
  const sameDay = date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const isYesterday = date.getFullYear() === yesterday.getFullYear()
    && date.getMonth() === yesterday.getMonth()
    && date.getDate() === yesterday.getDate();
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (sameDay) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;
  const day = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${day}, ${time}`;
}

function AuthScreen({
  authError,
  authReady,
  authBusy,
  email,
  password,
  setEmail,
  setPassword,
  runAuthOperation,
}) {
  return (
    <View style={styles.authContent}>
      <Text style={styles.authEyebrow}>A SMALL FIREBASE CODE TOUR</Text>
      <Text style={styles.authHeading}>Firebase tour</Text>
      <Text style={styles.authCopy}>A shared message board. As you work through the parts below, this static screen will become a realtime app.</Text>
      <View style={styles.authPanel}>
        <Text style={styles.authSubheading}>Join the conversation</Text>
        <TextInput
          accessibilityLabel="Email"
          autoCapitalize="none"
          autoComplete="email"
          onChangeText={setEmail}
          placeholder="Email"
          style={styles.authInput}
          value={email}
        />
        <TextInput
          accessibilityLabel="Password"
          autoCapitalize="none"
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={styles.authInput}
          value={password}
        />
        {authError ? <Text accessibilityRole="alert" style={styles.authError}>{authError}</Text> : null}
        <View style={styles.authButtonRow}>
          <Pressable accessibilityRole="button" disabled={authBusy} onPress={() => runAuthOperation(signUp)} style={styles.authPrimary}>
            <Text style={styles.authPrimaryText}>{authBusy ? 'Please wait…' : 'Create account'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={authBusy} onPress={() => runAuthOperation(signIn)} style={styles.authSecondary}>
            <Text style={styles.authSecondaryText}>Sign in</Text>
          </Pressable>
        </View>
        <Text style={styles.authMuted}>
          {!authReady ? 'Auth observer not enabled yet. Complete Part 2.' : 'You are signed out.'}
        </Text>
      </View>
    </View>
  );
}

function Brand() {
  return (
    <View style={styles.brand}>
      <View style={styles.brandMark}>
        <View style={[styles.logoRay, styles.logoRayOne]} />
        <View style={[styles.logoRay, styles.logoRayTwo]} />
        <View style={[styles.logoRay, styles.logoRayThree]} />
      </View>
      <Text style={styles.brandName}>commonplace</Text>
    </View>
  );
}

function ThreadCard({ thread }) {
  const email = thread.authorEmail || 'A community member';
  return (
    <View style={styles.threadCard}>
      <View style={styles.threadAuthorRow}>
        <View style={styles.authorAvatar}><Text style={styles.authorInitials}>{initialsFor(email)}</Text></View>
        <View style={styles.authorDetails}>
          <Text style={styles.authorEmail} numberOfLines={1}>{email}</Text>
          <Text style={styles.postedAt}>{formatPostDate(thread.createdAt)}</Text>
        </View>
        <Text accessibilityLabel="Thread options" style={styles.moreIcon}>•••</Text>
      </View>
      <Text style={styles.threadTitle}>{thread.title}</Text>
      <Text style={styles.threadContent}>{thread.content}</Text>
    </View>
  );
}

function ThreadComposer({
  visible,
  onClose,
  title,
  setTitle,
  content,
  setContent,
  email,
  posting,
  error,
  onPublish,
}) {
  const disabled = posting || !title.trim() || !content.trim();

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}
      >
        <Pressable accessibilityLabel="Close thread composer" onPress={onClose} style={StyleSheet.absoluteFill} />
        <ScrollView
          contentContainerStyle={styles.modalScrollContent}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          style={styles.modalScrollView}
        >
          <View style={styles.composer}>
            <View style={styles.composerTopRow}>
              <Text style={styles.eyebrow}>A THOUGHT WORTH SHARING</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>
            <Text style={styles.composerHeading}>Start a thread.</Text>
            <Text style={styles.composerIntro}>Big ideas or little observations. All welcome.</Text>

            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              accessibilityLabel="Title"
              maxLength={120}
              onChangeText={setTitle}
              placeholder="Give your thread a title"
              returnKeyType="next"
              style={[styles.input, styles.titleInput]}
              value={title}
            />
            <Text style={[styles.fieldLabel, styles.contentFieldLabel]}>Content</Text>
            <TextInput
              accessibilityLabel="Content"
              multiline
              onChangeText={setContent}
              placeholder="What is on your mind?"
              scrollEnabled
              style={[styles.input, styles.contentInput]}
              textAlignVertical="top"
              value={content}
            />

            <View style={styles.composerByline}>
              <View style={styles.bylineAvatar}><Text style={styles.bylineInitials}>{initialsFor(email)}</Text></View>
              <Text style={styles.bylineText} numberOfLines={1}>Posting as {email}</Text>
            </View>
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={onPublish}
              style={[styles.publishButton, disabled && styles.disabled]}
            >
              <Text style={styles.publishButtonText}>{posting ? 'Publishing…' : 'Publish thread'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function App() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [user, setUser] = React.useState(null);
  const [authReady, setAuthReady] = React.useState(false);
  const [authBusy, setAuthBusy] = React.useState(false);
  const [authError, setAuthError] = React.useState('');
  const [threads, setThreads] = React.useState([]);
  const [threadsLoading, setThreadsLoading] = React.useState(false);
  const [threadError, setThreadError] = React.useState('');
  const [composerVisible, setComposerVisible] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [posting, setPosting] = React.useState(false);
  const [composerError, setComposerError] = React.useState('');
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);

  React.useEffect(() => observeAuthState(nextUser => {
    setUser(nextUser);
    setAuthReady(true);
  }), []);

  async function runAuthOperation(operation) {
    setAuthBusy(true);
    setAuthError('');
    try {
      await operation(email.trim(), password);
      return true;
    } catch (error) {
      setAuthError(error.message || 'We could not complete that sign-in action.');
      return false;
    } finally {
      setAuthBusy(false);
    }
  }

  React.useEffect(() => {
    if (!user) {
      setThreads([]);
      setThreadsLoading(false);
      return undefined;
    }

    setThreadsLoading(true);
    setThreadError('');
    return subscribeToThreads(
      nextThreads => {
        setThreads(nextThreads);
        setThreadsLoading(false);
      },
      error => {
        setThreadError(error.message || 'Threads could not be loaded.');
        setThreadsLoading(false);
      },
    );
  }, [user]);

  async function publishThread() {
    if (posting) return;
    setPosting(true);
    setComposerError('');
    try {
      await createThread({ title, content, user });
      setTitle('');
      setContent('');
      setComposerVisible(false);
    } catch (error) {
      setComposerError(error.message || 'Your thread could not be published.');
    } finally {
      setPosting(false);
    }
  }

  function openComposer() {
    setComposerError('');
    setComposerVisible(true);
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />
          <AuthScreen
            authError={authError}
            authReady={authReady}
            authBusy={authBusy}
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
            runAuthOperation={runAuthOperation}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const todayLabel = new Date().toLocaleDateString([], {
    weekday: 'long', month: 'long', day: 'numeric',
  }).toUpperCase();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.feedScreen}>
          <View style={styles.fixedHeader}>
            <View style={styles.topBar}>
              <Brand />
              <View style={styles.profileMenuAnchor}>
                <Pressable
                  accessibilityLabel="Account menu"
                  accessibilityRole="button"
                  accessibilityState={{ expanded: profileMenuOpen }}
                  disabled={authBusy}
                  onPress={() => setProfileMenuOpen(isOpen => !isOpen)}
                  style={styles.profileAvatar}
                >
                  <Text style={styles.profileInitials}>{initialsFor(user.email || '')}</Text>
                </Pressable>
                {profileMenuOpen ? (
                  <View style={styles.profileMenu}>
                    <Text numberOfLines={1} style={styles.profileMenuEmail}>{user.email}</Text>
                    {authError ? <Text accessibilityRole="alert" style={styles.profileMenuError}>{authError}</Text> : null}
                    <View style={styles.profileMenuDivider} />
                    <Pressable
                      accessibilityRole="button"
                      disabled={authBusy}
                      onPress={async () => {
                        const signedOut = await runAuthOperation(signOutCurrentUser);
                        if (signedOut) setProfileMenuOpen(false);
                      }}
                      style={styles.logoutButton}
                    >
                      <Text style={styles.logoutText}>{authBusy ? 'Logging out…' : 'Log out'}</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </View>
            <Text style={styles.dateEyebrow}>{todayLabel}</Text>
            <Text style={styles.pageHeading}>The common room.</Text>
            <Text style={styles.pageSubheading}>Everyday stories. Different perspectives.</Text>
            <View style={styles.feedTools}>
              <Text style={styles.activeFilter}>•  Latest threads</Text>
              <Text style={styles.sortLabel}>Newest first</Text>
            </View>
            {threadError ? <Text accessibilityRole="alert" style={styles.error}>{threadError}</Text> : null}
          </View>
          <FlatList
            contentContainerStyle={styles.threadListContent}
            data={threads}
            keyExtractor={thread => thread.id}
            ListEmptyComponent={(
              <Text style={styles.emptyText}>
                {threadsLoading ? 'Loading threads…' : 'No threads yet. Start the conversation.'}
              </Text>
            )}
            renderItem={({ item }) => <ThreadCard thread={item} />}
            showsVerticalScrollIndicator={false}
            style={styles.threadList}
          />
          <Pressable accessibilityLabel="Start a thread" accessibilityRole="button" onPress={openComposer} style={styles.fab}>
            <View style={styles.plusIcon}>
              <View style={styles.plusHorizontal} />
              <View style={styles.plusVertical} />
            </View>
          </Pressable>
        </View>
        <ThreadComposer
          visible={composerVisible}
          onClose={() => setComposerVisible(false)}
          title={title}
          setTitle={setTitle}
          content={content}
          setContent={setContent}
          email={user.email || 'Community member'}
          posting={posting}
          error={composerError}
          onPublish={publishThread}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const colors = {
  background: '#f7f7f3',
  paper: '#fffefa',
  ink: '#232824',
  muted: '#7b817c',
  line: '#d9ddd6',
  blue: '#3154d1',
  avatar: '#e8edf9',
};

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  feedScreen: { flex: 1 },
  fixedHeader: { backgroundColor: colors.background, paddingHorizontal: 28, position: 'relative', zIndex: 2 },
  threadList: { flex: 1 },
  threadListContent: { paddingHorizontal: 28, paddingBottom: 108 },
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', overflow: 'visible', paddingTop: 20, paddingBottom: 27, position: 'relative', zIndex: 3 },
  brand: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  brandMark: { alignItems: 'center', backgroundColor: colors.blue, borderRadius: 7, height: 26, justifyContent: 'center', overflow: 'hidden', width: 26 },
  logoRay: { backgroundColor: '#fff', borderRadius: 1, height: 12, position: 'absolute', width: 2 },
  logoRayOne: { transform: [{ rotate: '0deg' }] },
  logoRayTwo: { transform: [{ rotate: '60deg' }] },
  logoRayThree: { transform: [{ rotate: '120deg' }] },
  brandName: { color: colors.ink, fontSize: 19, letterSpacing: 0.1 },
  profileMenuAnchor: { alignItems: 'flex-end', overflow: 'visible', position: 'relative', zIndex: 4 },
  profileAvatar: { alignItems: 'center', backgroundColor: colors.avatar, borderRadius: 25, height: 50, justifyContent: 'center', width: 50 },
  profileInitials: { color: colors.blue, fontSize: 13, fontWeight: '600' },
  profileMenu: { backgroundColor: colors.paper, borderColor: colors.line, borderRadius: 13, borderWidth: 1, elevation: 8, minWidth: 208, paddingHorizontal: 15, paddingTop: 14, position: 'absolute', right: 0, shadowColor: '#202720', shadowOffset: { height: 5, width: 0 }, shadowOpacity: 0.15, shadowRadius: 12, top: 58, zIndex: 10 },
  profileMenuEmail: { color: colors.muted, fontSize: 12, paddingBottom: 11, paddingHorizontal: 4 },
  profileMenuDivider: { backgroundColor: colors.line, height: 1 },
  logoutButton: { justifyContent: 'center', minHeight: 48, paddingHorizontal: 4 },
  logoutText: { color: '#b4232d', fontSize: 14, fontWeight: '600' },
  profileMenuError: { color: '#a32d32', fontSize: 11, paddingBottom: 8, paddingHorizontal: 4 },
  dateEyebrow: { color: colors.muted, fontSize: 10, fontWeight: '600', marginBottom: 8 },
  pageHeading: { color: colors.ink, fontSize: 35, fontWeight: '600', letterSpacing: -0.8 },
  pageSubheading: { color: colors.muted, fontSize: 14, marginTop: 7 },
  feedTools: { alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingBottom: 11 },
  activeFilter: { color: colors.blue, fontSize: 13 },
  sortLabel: { color: colors.muted, fontSize: 11 },
  threadCard: { borderBottomColor: colors.line, borderBottomWidth: 1, paddingTop: 16, paddingBottom: 17 },
  threadAuthorRow: { alignItems: 'center', flexDirection: 'row' },
  authorAvatar: { alignItems: 'center', backgroundColor: '#e4e8dd', borderRadius: 17, height: 34, justifyContent: 'center', marginRight: 10, width: 34 },
  authorInitials: { color: colors.ink, fontSize: 10, fontWeight: '500' },
  authorDetails: { flex: 1 },
  authorEmail: { color: colors.ink, fontSize: 12 },
  postedAt: { color: colors.muted, fontSize: 11, marginTop: 2 },
  moreIcon: { color: colors.muted, fontSize: 15, letterSpacing: 1 },
  threadTitle: { color: colors.ink, fontSize: 23, fontWeight: '600', letterSpacing: -0.3, marginTop: 12 },
  threadContent: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 6 },
  emptyText: { color: colors.muted, fontSize: 14, paddingTop: 24 },
  fab: { alignItems: 'center', backgroundColor: colors.blue, borderRadius: 23, bottom: 24, elevation: 5, height: 64, justifyContent: 'center', position: 'absolute', right: 24, shadowColor: '#26345e', shadowOffset: { height: 4, width: 0 }, shadowOpacity: 0.2, shadowRadius: 8, width: 64 },
  plusIcon: { alignItems: 'center', height: 22, justifyContent: 'center', width: 22 },
  plusHorizontal: { backgroundColor: '#fff', height: 1.5, position: 'absolute', width: 18 },
  plusVertical: { backgroundColor: '#fff', height: 18, position: 'absolute', width: 1.5 },
  modalBackdrop: { alignItems: 'center', backgroundColor: 'rgba(29, 34, 32, 0.42)', flex: 1, justifyContent: 'center', paddingHorizontal: 20, width: '100%' },
  modalScrollView: { alignSelf: 'stretch', width: '100%' },
  modalScrollContent: { alignItems: 'stretch', flexGrow: 1, justifyContent: 'center', paddingVertical: 18, width: '100%' },
  composer: { alignSelf: 'center', backgroundColor: colors.background, borderRadius: 23, flexShrink: 1, maxWidth: 480, padding: 24, width: '100%' },
  composerTopRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  eyebrow: { color: colors.blue, fontSize: 10, fontWeight: '500' },
  closeButton: { alignItems: 'center', backgroundColor: '#eff0eb', borderRadius: 16, height: 30, justifyContent: 'center', width: 30 },
  closeText: { color: colors.ink, fontSize: 22, fontWeight: '300', lineHeight: 24 },
  composerHeading: { color: colors.ink, fontSize: 30, fontWeight: '600', letterSpacing: -0.5, marginTop: 10 },
  composerIntro: { color: colors.muted, fontSize: 14, marginBottom: 22, marginTop: 8 },
  fieldLabel: { color: colors.ink, fontSize: 13, fontWeight: '500', marginBottom: 8, marginTop: 2 },
  contentFieldLabel: { marginTop: 10 },
  input: { alignSelf: 'stretch', backgroundColor: colors.paper, borderColor: colors.line, borderRadius: 12, borderWidth: 1, color: colors.ink, flexShrink: 1, fontSize: 15, maxWidth: '100%', minHeight: 54, paddingHorizontal: 15, paddingVertical: 12, width: '100%' },
  titleInput: { marginTop: 6 },
  contentInput: { height: 142, marginBottom: 17 },
  composerByline: { alignItems: 'center', flexDirection: 'row', marginBottom: 15 },
  bylineAvatar: { alignItems: 'center', backgroundColor: colors.avatar, borderRadius: 12, height: 24, justifyContent: 'center', marginRight: 8, width: 24 },
  bylineInitials: { color: colors.blue, fontSize: 8, fontWeight: '600' },
  bylineText: { color: colors.muted, flex: 1, fontSize: 11 },
  publishButton: { alignItems: 'center', backgroundColor: colors.blue, borderRadius: 13, justifyContent: 'center', minHeight: 58 },
  publishButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.55 },
  error: { color: '#a32d32', fontSize: 12, marginBottom: 10 },
  muted: { color: colors.muted, fontSize: 13 },
  authContent: { flex: 1, gap: 12, padding: 18, paddingTop: 24 },
  authEyebrow: { color: colors.blue, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  authHeading: { color: '#19233b', fontSize: 30, fontWeight: '800' },
  authCopy: { color: '#5f6b83', fontSize: 14, lineHeight: 20 },
  authPanel: { backgroundColor: '#fff', borderRadius: 12, gap: 9, padding: 13 },
  authSubheading: { color: '#19233b', fontSize: 17, fontWeight: '700' },
  authInput: { backgroundColor: '#fff', borderColor: '#dce2ee', borderRadius: 9, borderWidth: 1, minHeight: 42, paddingHorizontal: 12, paddingVertical: 9 },
  authButtonRow: { flexDirection: 'row', gap: 8 },
  authPrimary: { alignItems: 'center', backgroundColor: colors.blue, borderRadius: 9, paddingHorizontal: 14, paddingVertical: 11 },
  authPrimaryText: { color: '#fff', fontWeight: '700' },
  authSecondary: { alignItems: 'center', borderColor: colors.blue, borderRadius: 9, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  authSecondaryText: { color: '#3448c0', fontWeight: '700' },
  authError: { color: '#a32d32', fontSize: 13 },
  authMuted: { color: '#5f6b83', fontSize: 12 },
});
