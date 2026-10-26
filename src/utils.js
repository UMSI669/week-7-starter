// Firestore serverTimestamp() is null on the local snapshot until the server
// confirms the write, so fall back to "just now".
export function formatTime(timestamp) {
  if (!timestamp) return 'just now';
  return timestamp.toDate().toLocaleString();
}

export function displayName(email) {
  return email ? email.split('@')[0] : 'anonymous';
}
