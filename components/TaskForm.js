import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

/**
 * A reusable form for creating a task. The parent owns the database call so
 * this component stays independent of Firebase configuration.
 */
export default function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || isSaving) return;

    setError('');
    setIsSaving(true);
    try {
      await onAddTask(trimmedTitle);
      setTitle('');
    } catch (saveError) {
      setError(saveError?.message || 'Unable to save the task. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  const canSubmit = Boolean(title.trim()) && !isSaving;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Add a task</Text>
      <TextInput
        accessibilityLabel="Task title"
        editable={!isSaving}
        maxLength={80}
        onChangeText={setTitle}
        onSubmitEditing={handleSubmit}
        placeholder="What needs to get done?"
        returnKeyType="done"
        style={styles.input}
        value={title}
      />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSubmit, busy: isSaving }}
        disabled={!canSubmit}
        onPress={handleSubmit}
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
      >
        {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add task</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  label: { color: '#17213a', fontSize: 18, fontWeight: '800' },
  input: { borderColor: '#d8deeb', borderRadius: 10, borderWidth: 1, color: '#17213a', fontSize: 15, minHeight: 46, paddingHorizontal: 13 },
  button: { alignItems: 'center', backgroundColor: '#3558bd', borderRadius: 10, justifyContent: 'center', minHeight: 46, padding: 13 },
  buttonDisabled: { backgroundColor: '#aab7d9' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  error: { color: '#b42318', fontSize: 13, lineHeight: 18 },
});
