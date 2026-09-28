import { execSync } from 'child_process';
try {
  const out = execSync('npx wrangler deploy --dry-run', { encoding: 'utf-8', stdio: 'pipe' });
  console.log('SUCCESS:', out);
} catch (e) {
  console.log('STDERR:', e.stderr?.toString());
  console.log('STDOUT:', e.stdout?.toString());
}
