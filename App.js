import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const starterTasks = [
  { id: '1', title: 'Pick a date for the group meeting', creator: 'Alex', completed: false },
  { id: '2', title: 'Share ideas for the project', creator: 'Sam', completed: false },
  { id: '3', title: 'Set up the group board', creator: 'Jordan', completed: true },
];

export default function App() {
  const [tasks, setTasks] = useState(starterTasks);
  const [newTitle, setNewTitle] = useState('');

  const openCount = tasks.filter(task => !task.completed).length;
  const completedCount = tasks.length - openCount;

  function addTask() {
    const title = newTitle.trim();
    if (!title) return;

    setTasks(currentTasks => [
      { id: `${Date.now()}`, title, creator: 'You', completed: false },
      ...currentTasks,
    ]);
    setNewTitle('');
  }

  function toggleTask(id) {
    setTasks(currentTasks => currentTasks.map(task => (
      task.id === id ? { ...task, completed: !task.completed } : task
    )));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f7fb" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.eyebrow}>WORK BETTER TOGETHER</Text>
          <Text style={styles.heading}>Group Task Board</Text>
          <Text style={styles.subtitle}>One place to see what your group is working on.</Text>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Demo board</Text>
          <Text style={styles.noticeText}>Tasks added here are a preview and reset when the app restarts.</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{openCount}</Text>
            <Text style={styles.summaryLabel}>To do</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{completedCount}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add a task</Text>
          <TextInput
            accessibilityLabel="Task title"
            maxLength={80}
            onChangeText={setNewTitle}
            onSubmitEditing={addTask}
            placeholder="What needs to get done?"
            returnKeyType="done"
            style={styles.input}
            value={newTitle}
          />
          <Pressable
            accessibilityRole="button"
            disabled={!newTitle.trim()}
            onPress={addTask}
            style={[styles.addButton, !newTitle.trim() && styles.addButtonDisabled]}
          >
            <Text style={styles.addButtonText}>Add task</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group tasks</Text>
          {tasks.length === 0 ? (
            <Text style={styles.emptyText}>No tasks yet. Add the first one above.</Text>
          ) : tasks.map(task => (
            <Pressable
              accessibilityLabel={`${task.completed ? 'Mark incomplete' : 'Complete'}: ${task.title}`}
              accessibilityRole="button"
              key={task.id}
              onPress={() => toggleTask(task.id)}
              style={styles.taskCard}
            >
              <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
                {task.completed ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <View style={styles.taskDetails}>
                <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>{task.title}</Text>
                <Text style={styles.taskMeta}>Added by {task.creator}</Text>
              </View>
            </Pressable>
          ))}
        </View>
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
  notice: { backgroundColor: '#e7ecfa', borderRadius: 14, padding: 15, gap: 4 },
  noticeTitle: { color: '#304da2', fontSize: 15, fontWeight: '700' },
  noticeText: { color: '#43577c', fontSize: 13, lineHeight: 19 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 18, gap: 3 },
  summaryNumber: { color: '#304da2', fontSize: 27, fontWeight: '800' },
  summaryLabel: { color: '#66738a', fontSize: 13 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12 },
  sectionTitle: { color: '#17213a', fontSize: 18, fontWeight: '800' },
  input: { borderColor: '#d8deeb', borderRadius: 10, borderWidth: 1, color: '#17213a', fontSize: 15, minHeight: 46, paddingHorizontal: 13 },
  addButton: { alignItems: 'center', backgroundColor: '#3558bd', borderRadius: 10, padding: 13 },
  addButtonDisabled: { backgroundColor: '#aab7d9' },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  taskCard: { alignItems: 'center', borderColor: '#e8ebf2', borderRadius: 11, borderWidth: 1, flexDirection: 'row', gap: 12, padding: 13 },
  checkbox: { alignItems: 'center', borderColor: '#7d8bad', borderRadius: 7, borderWidth: 2, height: 25, justifyContent: 'center', width: 25 },
  checkboxCompleted: { backgroundColor: '#3558bd', borderColor: '#3558bd' },
  checkmark: { color: '#fff', fontSize: 16, fontWeight: '800' },
  taskDetails: { flex: 1, gap: 4 },
  taskTitle: { color: '#17213a', fontSize: 15, fontWeight: '600', lineHeight: 20 },
  taskTitleCompleted: { color: '#8c96a9', textDecorationLine: 'line-through' },
  taskMeta: { color: '#7b879d', fontSize: 12 },
  emptyText: { color: '#66738a', fontSize: 14, paddingVertical: 8 },
});
