const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '../..');

test('starter infrastructure includes documented environment placeholders and test commands', () => {
  const example = fs.readFileSync(path.join(root, '.env.example'), 'utf8');
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  expect(example).toContain('EXPO_PUBLIC_FIREBASE_API_KEY=');
  expect(example).toContain('EXPO_PUBLIC_FIREBASE_APP_ID=');
  expect(packageJson.scripts['check-progress:report']).toBeDefined();
  expect(packageJson.scripts['test:infrastructure']).toBeDefined();
});

test('progress checker parses the project and prints its progress report', () => {
  const output = execFileSync(process.execPath, ['scripts/check-progress.js', '--report-only'], {
    cwd: root,
    encoding: 'utf8',
  });
  expect(output).toContain('Firebase Tour Progress');
  expect(output).toContain('PART 8: Firestore Security Rules included');
});
