import { subscribeToEquipment } from './firebase/equipmentService';
import { addEquipment } from './firebase/equipmentService';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
} from 'react-native';

import {
  registerUser,
  loginUser,
  logoutUser,
  subscribeToAuth,
} from './firebase/authService';

export default function App() {
  // Store information that can change
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [equipmentName, setEquipmentName] = useState('');
  const [equipmentStatus, setEquipmentStatus] = useState('');
  const [savingEquipment, setSavingEquipment] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [equipmentError, setEquipmentError] = useState('');

  // Listen for Firebase authentication changes
  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);
  // Listen for changes in the equipment collection
  useEffect(() => {
  if (!user) {
    setEquipment([]);
    setEquipmentError('');
    return;
  }

  const unsubscribe = subscribeToEquipment(
    user.uid,
    (items) => {
      setEquipment(items);
      setEquipmentError('');
    },
    (error) => {
      setEquipmentError(error.message);
    }
  );

  return unsubscribe;
}, [user]);

  // Create an account
  const handleRegister = async () => {
    setBusy(true);

    try {
      await registerUser(email.trim(), password);
      setPassword('');
    } catch (error) {
      Alert.alert('Registration Error', error.message);
    } finally {
      setBusy(false);
    }
  };

  // Sign in
  const handleLogin = async () => {
    setBusy(true);

    try {
      await loginUser(email.trim(), password);
      setPassword('');
    } catch (error) {
      Alert.alert('Sign-In Error', error.message);
    } finally {
      setBusy(false);
    }
  };

  // Sign out
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      Alert.alert('Sign-Out Error', error.message);
    }
  };

    // Add equipment to Firestore
  const handleAddEquipment = async () => {
    if (!equipmentName.trim() || !equipmentStatus.trim()) {
      Alert.alert('Missing Information', 'Enter a name and status.');
      return;
    }

    setSavingEquipment(true);

    try {
      await addEquipment(
        equipmentName.trim(),
        equipmentStatus.trim()
      );

      setEquipmentName('');
      setEquipmentStatus('');

      Alert.alert('Success', 'Equipment saved successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSavingEquipment(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Equipment Maintenance Tracker
      </Text>

      {user ? (
        // Screen shown after signing in
        <View style={styles.section}>
          <Text>Signed in as:</Text>
          <Text style={styles.email}>{user.email}</Text>

          <Text style={styles.subtitle}>
           My Equipment
          </Text>

          <Text>Add New Equipment</Text>

          <TextInput
            style={styles.input}
            placeholder="Equipment Name (e.g., HVAC System)"
            value={equipmentName}
            onChangeText={setEquipmentName}
          />

          <TextInput
            style={styles.input}
            placeholder="Status (e.g., Needs Maintenance)"
            value={equipmentStatus}
            onChangeText={setEquipmentStatus}
          />

          <Button
            title={savingEquipment ? 'Saving...' : 'Add Equipment'}
            onPress={handleAddEquipment}
            disabled={savingEquipment}
          />

          {equipmentError ? (
        <Text style={{ color: 'red' }}>{equipmentError}</Text>) : null}
          {equipment.length === 0 ? (
            <Text>No equipment added yet.</Text>
          ) : (
            equipment.map((item) => (
              <View key={item.id} style={styles.equipmentCard}>
                <Text style={styles.equipmentName}>{item.name}</Text>
                <Text>Status: {item.status}</Text>
          </View>
        ))
      )}

          <Button title="Sign Out" onPress={handleLogout} />
        </View>
      ) : (
        // Screen shown when signed out
        <View style={styles.section}>
          <Text style={styles.subtitle}>
            Sign In or Create an Account
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            disabled={busy}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            disabled={busy}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    gap: 15,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
  },
  email: {
    fontWeight: 'bold',
  },
  equipmentCard: {
  padding: 12,
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  marginBottom: 10,
  backgroundColor: '#f9f9f9',
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});