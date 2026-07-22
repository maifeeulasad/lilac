// Build every adapter package.
//
// Adapters resolve @lilac-wysiwyg/core through a tsconfig paths mapping onto
// core's built .d.ts, so the root build has to have run first. Kept as a script
// rather than a shell one-liner so it behaves the same on Windows and CI.

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const ADAPTERS = ['angular', 'react', 'svelte', 'vanilla', 'vue'];

if (!existsSync('dist/index.d.ts')) {
  console.error('core is not built — run `pnpm build` first (adapters resolve its types from dist/)');
  process.exit(1);
}

let failed = 0;
for (const name of ADAPTERS) {
  const dir = `adapter/${name}`;
  process.stdout.write(`building ${dir} ... `);
  try {
    execSync(`npx tsc -p ${dir}/tsconfig.json`, { stdio: 'pipe', encoding: 'utf8' });
    console.log('ok');
  } catch (error) {
    failed++;
    console.log('FAILED');
    console.error(error.stdout || error.message);
  }
}

if (failed > 0) {
  console.error(`\n${failed} adapter build(s) failed`);
  process.exit(1);
}
