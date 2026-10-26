import { Platform } from 'react-native';

// Shared look taken from the reference images in src/image.
export const colors = {
  background: '#FFFFFF',
  text: '#000000',
  muted: '#8E8E93',
  border: '#E5E7EB',
  sentBubble: '#F3F4F6',
  receivedBubble: '#FFFFFF',
  primary: '#000000',
  error: '#D93025',
};

export const serifFont = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

export const softShadow = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
};
