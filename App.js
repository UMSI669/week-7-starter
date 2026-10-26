import AuthGate from './components/AuthGate';
import TaskBoard from './components/TaskBoard';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f7fb" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.eyebrow}>WORK BETTER TOGETHER</Text>
          <Text style={styles.heading}>Group Task Board</Text>
          <Text style={styles.subtitle}>One place to see what your group is working on.</Text>
        </View>
        <AuthGate>
          {user => <TaskBoard key={user.uid} user={user} />}
        </AuthGate>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f6f7fb' },
  content: { padding: 20, paddingBottom: 40, gap: 18 },
  header: { gap: 7, paddingTop: 10 },
  eyebrow: { color: '#5269bf', fontSize: 12, fontWeight: '800', letterSpacing: 1.3 },
  heading: { color: '#17213a', fontSize: 32, fontWeight: '800' },
  subtitle: { color: '#66738a', fontSize: 15, lineHeight: 22 },
});
