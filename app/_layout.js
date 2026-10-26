import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: '#2563eb',
          // iOS 26+ defaults to a transparent header that floats over the
          // screen content; keep it opaque so content starts below it.
          headerTransparent: false,
          headerStyle: { backgroundColor: '#ffffff' },
          contentStyle: { backgroundColor: '#f3f4f6' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="questions/index" options={{ title: 'Questions' }} />
        <Stack.Screen name="questions/[id]" options={{ title: 'Question' }} />
        <Stack.Screen name="auth" options={{ title: 'Account', presentation: 'modal' }} />
      </Stack>
    </AuthProvider>
  );
}
