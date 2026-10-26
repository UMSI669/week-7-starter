import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { subscribeToTasks } from '../firebase/realtimeService';
import { createTask, setTaskCompleted } from '../firebase/taskService';

function taskError(error) {
  if (error.code === 'permission-denied') {
    return 'You do not have permission to access tasks. Check the Firestore rules with your group.';
  }
  if (error.code === 'unavailable') return 'Could not connect to the task board. Check your internet connection.';
  return error.message || 'We could not update the task board. Please try again.';
}

export default function TaskBoard({ user }) {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [writeError, setWriteError] = useState('');
  const [adding, setAdding] = useState(false);
  const [updatingIds, setUpdatingIds] = useState([]);
  const [retry, setRetry] = useState(0);
  const writing = useRef(false);
  const updating = useRef(new Set());
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);

  useEffect(() => {
    setLoading(true);
    setListError('');
    setTasks([]);
    let listening = true;
    const unsubscribe = subscribeToTasks(nextTasks => {
      if (!listening) return;
      setTasks(nextTasks);
      setLoading(false);
    }, error => {
      if (!listening) return;
      setListError(taskError(error));
      setLoading(false);
    });
    return () => {
      listening = false;
      unsubscribe();
    };
  }, [user.uid, retry]);

  async function addTask() {
    if (writing.current || !newTitle.trim()) return;
    writing.current = true;
    setAdding(true);
    setWriteError('');
    try {
      await createTask({ title: newTitle, user });
      if (active.current) setNewTitle('');
    } catch (error) {
      if (active.current) setWriteError(taskError(error));
    } finally {
      writing.current = false;
      if (active.current) setAdding(false);
    }
  }

  async function toggleTask(task) {
    if (updating.current.has(task.id)) return;
    updating.current.add(task.id);
    setUpdatingIds([...updating.current]);
    setWriteError('');
    try {
      await setTaskCompleted({ taskId: task.id, completed: !task.completed, user });
    } catch (error) {
      if (active.current) setWriteError(taskError(error));
    } finally {
      updating.current.delete(task.id);
      if (active.current) setUpdatingIds([...updating.current]);
    }
  }

  const openCount = tasks.filter(task => !task.completed).length;
  const addDisabled = adding || loading || !!listError || !newTitle.trim();
  return (
    <View style={styles.board}>
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Shared group board</Text>
        <Text style={styles.noticeText}>Tasks are saved to your group’s database. New tasks and completion changes appear automatically.</Text>
      </View>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}><Text style={styles.summaryNumber}>{openCount}</Text><Text style={styles.summaryLabel}>To do</Text></View>
        <View style={styles.summaryCard}><Text style={styles.summaryNumber}>{tasks.length - openCount}</Text><Text style={styles.summaryLabel}>Completed</Text></View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add a task</Text>
        <TextInput accessibilityLabel="Task title" maxLength={80} onChangeText={setNewTitle} onSubmitEditing={addDisabled ? undefined : addTask} placeholder="What needs to get done?" returnKeyType="done" style={styles.input} value={newTitle} editable={!adding} />
        <Pressable accessibilityRole="button" disabled={addDisabled} onPress={addTask} style={[styles.addButton, addDisabled && styles.disabled]}>
          <Text style={styles.addButtonText}>{adding ? 'Adding…' : 'Add task'}</Text>
        </Pressable>
        {writeError ? <Text accessibilityRole="alert" style={styles.error}>{writeError}</Text> : null}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Group tasks</Text>
        {loading ? <View><ActivityIndicator /><Text style={styles.emptyText}>Loading tasks…</Text></View>
          : listError ? <View style={styles.board}>
            <Text accessibilityRole="alert" style={styles.error}>{listError}</Text>
            <Pressable accessibilityRole="button" onPress={() => setRetry(value => value + 1)} style={styles.addButton}><Text style={styles.addButtonText}>Retry loading tasks</Text></Pressable>
          </View>
          : tasks.length === 0 ? <Text style={styles.emptyText}>No tasks yet. Add the first one above.</Text>
          : tasks.map(task => (
            <Pressable accessibilityLabel={`${task.completed ? 'Mark incomplete' : 'Complete'}: ${task.title}`} accessibilityRole="checkbox" accessibilityState={{ checked: !!task.completed, disabled: updatingIds.includes(task.id) }} disabled={updatingIds.includes(task.id)} key={task.id} onPress={() => toggleTask(task)} style={[styles.taskCard, updatingIds.includes(task.id) && styles.pending]}>
              <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>{task.completed ? <Text style={styles.checkmark}>✓</Text> : null}</View>
              <View style={styles.taskDetails}>
                <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>{task.title}</Text>
                <Text style={styles.taskMeta}>{task.authorId === user.uid ? 'Added by you' : 'Added by a group member'}</Text>
                {updatingIds.includes(task.id) ? <Text style={styles.taskMeta}>Saving…</Text> : null}
              </View>
            </Pressable>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: { gap: 18 },
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
  disabled: { backgroundColor: '#aab7d9' },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  taskCard: { alignItems: 'center', borderColor: '#e8ebf2', borderRadius: 11, borderWidth: 1, flexDirection: 'row', gap: 12, padding: 13 },
  pending: { opacity: 0.6 },
  checkbox: { alignItems: 'center', borderColor: '#7d8bad', borderRadius: 7, borderWidth: 2, height: 25, justifyContent: 'center', width: 25 },
  checkboxCompleted: { backgroundColor: '#3558bd', borderColor: '#3558bd' },
  checkmark: { color: '#fff', fontSize: 16, fontWeight: '800' },
  taskDetails: { flex: 1, gap: 4 },
  taskTitle: { color: '#17213a', fontSize: 15, fontWeight: '600', lineHeight: 20 },
  taskTitleCompleted: { color: '#8c96a9', textDecorationLine: 'line-through' },
  taskMeta: { color: '#7b879d', fontSize: 12 },
  emptyText: { color: '#66738a', fontSize: 14, paddingVertical: 8 },
  error: { color: '#a32d32', fontSize: 14 },
});
