// Packaging smoke test.
//
// The adapters were published to npm for several releases containing no
// JavaScript at all: `tsc` picked up the root tsconfig, emitted nothing for the
// adapter, exited 0, and CI shipped it. Typecheck and build both passed the
// whole time. This asserts the thing that actually matters — that every package
// declares an entry point which exists in what `npm pack` would publish.

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PACKAGES = [
  '.',
  'adapter/angular',
  'adapter/react',
  'adapter/svelte',
  'adapter/vanilla',
  'adapter/vue',
];

let failures = 0;

function fail(pkg, message) {
  failures++;
  console.error(`FAIL  ${pkg}: ${message}`);
}

for (const dir of PACKAGES) {
  const pkgPath = resolve(dir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

  // 1. The declared entry points must exist on disk after a build.
  const entries = [pkg.main, pkg.types].filter(Boolean);
  for (const entry of entries) {
    if (!existsSync(resolve(dir, entry))) {
      fail(pkg.name, `declares "${entry}" but it does not exist (did the build emit nothing?)`);
    }
  }

  // 2. They must also survive into the tarball, which `files` can silently omit.
  let packed;
  try {
    const raw = execSync('npm pack --dry-run --json', {
      cwd: resolve(dir),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    packed = JSON.parse(raw)[0].files.map((f) => f.path.replace(/\\/g, '/'));
  } catch (error) {
    fail(pkg.name, `npm pack failed: ${error.message}`);
    continue;
  }

  for (const entry of entries) {
    const normalized = entry.replace(/^\.\//, '');
    if (!packed.includes(normalized)) {
      fail(pkg.name, `"${entry}" is missing from the tarball (check the "files" field)`);
    }
  }

  if (!packed.some((f) => f.endsWith('.js'))) {
    fail(pkg.name, 'tarball contains no JavaScript at all');
  }

  if (failures === 0 || !entries.some((e) => !existsSync(resolve(dir, e)))) {
    console.log(`PASS  ${pkg.name} -> ${entries.join(', ')} (${packed.length} files)`);
  }

  // 3. The entry must actually import under plain Node — not just exist. This is
  // what catches extensionless ESM specifiers (#23): the file is present and
  // ships, but Node's resolver throws ERR_MODULE_NOT_FOUND on the first relative
  // import. Only run it where every dependency resolves without an install; the
  // adapters import @lilac-wysiwyg/core, which is not linked in this layout.
  if (pkg.main && existsSync(resolve(dir, pkg.main)) && !pkg.dependencies && !pkg.peerDependencies) {
    try {
      execSync(`node -e "import('./${pkg.main.replace(/^\.\//, '')}')"`, {
        cwd: resolve(dir),
        stdio: ['ignore', 'ignore', 'pipe'],
        encoding: 'utf8',
      });
      console.log(`PASS  ${pkg.name} imports under Node`);
    } catch (error) {
      fail(pkg.name, `entry does not import under Node: ${String(error.stderr || error.message).trim().split('\n').pop()}`);
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} packaging failure(s)`);
  process.exit(1);
}
console.log('\nAll packages declare an entry point that exists and ships.');
