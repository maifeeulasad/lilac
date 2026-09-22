// Prepare a package for publishing.
//
// The adapters keep almost nothing publish-specific in version control: no
// per-package README, no LICENSE copy, and a placeholder version. This script
// stamps all of that in at publish time so a change to the shared template or
// the LICENSE only ever touches one file in the repo.
//
// For a given package directory it:
//   1. sets package.json `version` to the release version, and (for adapters)
//      pins the @lilac-wysiwyg/core dependency to it;
//   2. fills in npm metadata (repository.directory, homepage, bugs);
//   3. copies the repo-root LICENSE into the package (adapters only);
//   4. generates a README from the shared template (adapters only — the root
//      package keeps its own hand-written README).
//
// Usage: node dist-scripts/script/prepare-package.js <packageDir> <version>
//   e.g. node dist-scripts/script/prepare-package.js adapter/react 0.6.0
//        node dist-scripts/script/prepare-package.js . 0.6.0

import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO = 'https://github.com/maifeeulasad/lilac';
const DOCS = 'https://maifeeulasad.github.io/lilac';

interface AdapterMeta {
  /** Human framework name. */
  framework: string;
  /** One-line blurb. */
  blurb: string;
  /** Peer requirement, human-readable. */
  requires: string;
  /** Docs page filename. */
  page: string;
  /** Fenced-code language for the usage sample. */
  lang: string;
  /** Usage sample body (no fences). */
  usage: string;
}

// Keyed by package name. Anything not present here (i.e. the core package)
// keeps its own README and skips generation.
const ADAPTERS: Record<string, AdapterMeta> = {
  '@lilac-wysiwyg/react': {
    framework: 'React', requires: 'React >= 16.8', page: 'react.html', lang: 'tsx',
    blurb: 'React component wrapper for the Lilac WYSIWYG editor, with a controlled value and an imperative ref handle.',
    usage: `import { useState } from 'react';
import { LilacEditor } from '@lilac-wysiwyg/react';

function App() {
  const [content, setContent] = useState('<p>Hello!</p>');
  return <LilacEditor value={content} onChange={setContent} toolbar />;
}`,
  },
  '@lilac-wysiwyg/preact': {
    framework: 'Preact', requires: 'Preact >= 10', page: 'preact.html', lang: 'tsx',
    blurb: 'Lightweight, React-compatible Preact component wrapper for the Lilac WYSIWYG editor.',
    usage: `import { useState } from 'preact/hooks';
import { LilacEditor } from '@lilac-wysiwyg/preact';

function App() {
  const [content, setContent] = useState('<p>Hello Preact!</p>');
  return <LilacEditor value={content} onChange={setContent} toolbar />;
}`,
  },
  '@lilac-wysiwyg/vue': {
    framework: 'Vue', requires: 'Vue >= 3', page: 'vue.html', lang: 'vue',
    blurb: 'Vue 3 component wrapper for the Lilac WYSIWYG editor, with v-model support.',
    usage: `<template>
  <LilacEditor v-model="content" :toolbar="true" />
</template>

<script setup>
import { ref } from 'vue';
import { LilacEditor } from '@lilac-wysiwyg/vue';

const content = ref('<p>Hello Vue!</p>');
</script>`,
  },
  '@lilac-wysiwyg/svelte': {
    framework: 'Svelte', requires: 'Svelte >= 4 (works in 4 and 5)', page: 'svelte.html', lang: 'svelte',
    blurb: 'Svelte action for the Lilac WYSIWYG editor — a plain function, no compiler required.',
    usage: `<script>
  import { lilac } from '@lilac-wysiwyg/svelte';
  let content = '<p>Hello Svelte!</p>';
</script>

<div use:lilac={{ value: content, toolbar: true, onChange: (c) => (content = c) }} />`,
  },
  '@lilac-wysiwyg/solid': {
    framework: 'SolidJS', requires: 'solid-js >= 1.6', page: 'solid.html', lang: 'tsx',
    blurb: 'Reactive Solid component and a use:lilac directive for the Lilac WYSIWYG editor.',
    usage: `import { createSignal } from 'solid-js';
import { LilacEditor } from '@lilac-wysiwyg/solid';

function App() {
  const [content, setContent] = createSignal('<p>Hello Solid!</p>');
  return <LilacEditor value={content()} onChange={setContent} toolbar />;
}`,
  },
  '@lilac-wysiwyg/angular': {
    framework: 'Angular', requires: '@angular/core >= 14', page: 'angular.html', lang: 'ts',
    blurb: 'Angular component and directive wrapping the framework-agnostic Lilac core.',
    usage: `import { NgModule } from '@angular/core';
import { LilacEditorModule } from '@lilac-wysiwyg/angular';

@NgModule({ imports: [LilacEditorModule] })
export class AppModule {}`,
  },
  '@lilac-wysiwyg/lit': {
    framework: 'Lit', requires: 'lit >= 2', page: 'lit.html', lang: 'html',
    blurb: 'A native <lilac-editor> Web Component for the Lilac WYSIWYG editor, built on Lit.',
    usage: `<script type="module">
  import '@lilac-wysiwyg/lit';
</script>

<lilac-editor value="<p>Hello Lit!</p>" toolbar></lilac-editor>`,
  },
  '@lilac-wysiwyg/qwik': {
    framework: 'Qwik', requires: '@builder.io/qwik >= 1.5', page: 'qwik.html', lang: 'tsx',
    blurb: 'A resumable Qwik component wrapper for the Lilac WYSIWYG editor.',
    usage: `import { component$, useSignal } from '@builder.io/qwik';
import { LilacEditor } from '@lilac-wysiwyg/qwik';

export const App = component$(() => {
  const content = useSignal('<p>Hello Qwik!</p>');
  return <LilacEditor value={content.value} onChange$={(c) => (content.value = c)} toolbar />;
});`,
  },
  '@lilac-wysiwyg/alpine': {
    framework: 'Alpine.js', requires: 'alpinejs >= 3', page: 'alpine.html', lang: 'html',
    blurb: 'An x-lilac directive for the Lilac WYSIWYG editor, for progressively enhanced pages.',
    usage: `<script type="module">
  import Alpine from 'alpinejs';
  import lilac from '@lilac-wysiwyg/alpine';
  Alpine.plugin(lilac);
  Alpine.start();
</script>

<div x-data="{ body: '<p>Hello Alpine!</p>' }"
     x-lilac="{ value: body, toolbar: true, onChange: c => body = c }"></div>`,
  },
  '@lilac-wysiwyg/ember': {
    framework: 'Ember', requires: 'ember-source >= 4 and ember-modifier >= 4', page: 'ember.html', lang: 'hbs',
    blurb: 'A {{lilac}} element modifier for the Lilac WYSIWYG editor, built with ember-modifier.',
    usage: `{{! app/modifiers/lilac.js re-exports the modifier }}
<div {{lilac value=this.body toolbar=true onChange=this.setBody}}></div>`,
  },
  '@lilac-wysiwyg/astro': {
    framework: 'Astro', requires: 'astro >= 3 (optional peer)', page: 'astro.html', lang: 'astro',
    blurb: 'A client mount helper and an Astro integration for the Lilac WYSIWYG editor.',
    usage: `---
// astro.config.mjs: import lilac from '@lilac-wysiwyg/astro'; integrations: [lilac()]
---
<div id="editor"></div>
<script>
  import { mountLilacEditor } from '@lilac-wysiwyg/astro';
  mountLilacEditor(document.getElementById('editor'), { toolbar: true });
</script>`,
  },
  '@lilac-wysiwyg/vanilla': {
    framework: 'Vanilla JS', requires: 'no framework', page: 'vanilla.html', lang: 'ts',
    blurb: 'Pure JavaScript/TypeScript wrapper for the Lilac WYSIWYG editor — no framework dependencies.',
    usage: `import { LilacEditor } from '@lilac-wysiwyg/vanilla';

const editor = new LilacEditor({
  container: document.getElementById('editor'),
  toolbar: { show: true },
});`,
  },
};

function renderReadme(name: string, meta: AdapterMeta): string {
  return `# ${name}

${meta.blurb}

Part of [Lilac](${REPO}) — a smooth, modern, framework-agnostic WYSIWYG editor with a TypeScript core.

## Installation

\`\`\`bash
npm install ${name}
\`\`\`

Requires ${meta.requires}${meta.requires === 'no framework' ? '.' : ' (declared as a peer dependency, so the copy already in your app is used).'}

## Usage

\`\`\`${meta.lang}
${meta.usage}
\`\`\`

## Documentation

Full documentation and examples: ${DOCS}/${meta.page}

The API reference for the underlying editor lives in the [main README](${REPO}#readme).

## License

MIT © Maifee Ul Asad
`;
}

function main(): void {
  const [dir, version] = process.argv.slice(2);
  if (!dir || !version) {
    console.error('usage: prepare-package <packageDir> <version>');
    process.exit(1);
  }

  const pkgPath = resolve(process.cwd(), dir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as Record<string, unknown> & {
    name: string;
    version: string;
    dependencies?: Record<string, string>;
    repository?: { type?: string; url?: string; directory?: string };
  };

  // 1. Version. Pin the core dependency to the same release for adapters.
  pkg.version = version;
  if (pkg.dependencies && pkg.dependencies['@lilac-wysiwyg/core']) {
    pkg.dependencies['@lilac-wysiwyg/core'] = `^${version}`;
  }

  // 2. npm metadata: link the npm page back to the repo, this subdirectory,
  // the docs site and the issue tracker.
  const isRoot = dir === '.' || dir === './';
  pkg.repository = {
    type: 'git',
    url: 'git+https://github.com/maifeeulasad/lilac.git',
    ...(isRoot ? {} : { directory: dir }),
  };
  (pkg as Record<string, unknown>).homepage = isRoot ? `${REPO}#readme` : `${DOCS}/${ADAPTERS[pkg.name]?.page ?? ''}`;
  (pkg as Record<string, unknown>).bugs = { url: `${REPO}/issues` };

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`prepared ${pkg.name}@${version}`);

  // 3 & 4. Adapters get a generated README and a copied LICENSE; the root
  // package keeps its own hand-written README and already ships LICENSE.
  const meta = ADAPTERS[pkg.name];
  if (meta && !isRoot) {
    writeFileSync(resolve(process.cwd(), dir, 'README.md'), renderReadme(pkg.name, meta));
    copyFileSync(resolve(process.cwd(), 'LICENSE'), resolve(process.cwd(), dir, 'LICENSE'));
    console.log(`  wrote README.md + LICENSE for ${pkg.name}`);
  }
}

main();
