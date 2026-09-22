// Live playground loader for the documentation pages.
//
// Each framework doc page carries a <div class="lilac-playground" data-framework="…">.
// This module mounts a real, working editor into it by importing the *published*
// adapter (and its framework) straight from the esm.sh CDN — no build step and
// nothing committed to the repo. The adapter version comes from the
// <meta name="lilac-version"> tag, which CI stamps with the root package version
// at deploy time (falling back to a sane default for local viewing).
//
// Frameworks that need their own compiler/toolchain to run (Angular, Qwik,
// Ember) can't be demoed purely in the browser, so they render a short note
// instead of an editor.

const FALLBACK_VERSION = '0.6.0';

function metaVersion() {
  const meta = document.querySelector('meta[name="lilac-version"]');
  const v = meta && meta.getAttribute('content');
  // Ignore an unreplaced CI placeholder (e.g. local viewing).
  return v && !v.includes('__') ? v : null;
}

// The version shown (and loaded) comes from the live npm registry, so the docs
// always reflect the latest published release without a redeploy. If the API
// call fails (offline/blocked), fall back to the CI-stamped meta tag, then to a
// hardcoded default.
async function resolveVersion() {
  try {
    const res = await fetch('https://registry.npmjs.org/@lilac-wysiwyg/core/latest', {
      headers: { accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.version === 'string') return data.version;
    }
  } catch (_) {
    /* fall through to the offline fallbacks */
  }
  return metaVersion() || FALLBACK_VERSION;
}

const sample = (fw) => `<p>Hello from <strong>${fw}</strong>! Edit me — this editor is the published <code>@lilac-wysiwyg</code> adapter, loaded from npm.</p>`;

// Framework runtime versions used only to drive the demo (not the adapter).
const REACT = '18.3.1';
const PREACT = '10.19.0';
const VUE = '3.5.13';
const SOLID = '1.8.0';
const ALPINE = '3.13.0';

const MOUNTERS = {
  async react(el, V) {
    const React = await import(`https://esm.sh/react@${REACT}`);
    const { createRoot } = await import(`https://esm.sh/react-dom@${REACT}/client?deps=react@${REACT}`);
    const { LilacEditor } = await import(`https://esm.sh/@lilac-wysiwyg/react@${V}?deps=react@${REACT},react-dom@${REACT}`);
    createRoot(el).render(React.createElement(LilacEditor, { toolbar: true, initialContent: sample('React') }));
  },
  async preact(el, V) {
    const preact = await import(`https://esm.sh/preact@${PREACT}`);
    const { LilacEditor } = await import(`https://esm.sh/@lilac-wysiwyg/preact@${V}?deps=preact@${PREACT}`);
    preact.render(preact.h(LilacEditor, { toolbar: true, initialContent: sample('Preact') }), el);
  },
  async vue(el, V) {
    const { createApp } = await import(`https://esm.sh/vue@${VUE}/dist/vue.esm-browser.prod.js`);
    const { LilacEditor } = await import(`https://esm.sh/@lilac-wysiwyg/vue@${V}?deps=vue@${VUE}`);
    createApp({
      components: { LilacEditor },
      data: () => ({ content: sample('Vue') }),
      template: `<LilacEditor v-model="content" :toolbar="true" />`,
    }).mount(el);
  },
  async svelte(el, V) {
    const { lilac } = await import(`https://esm.sh/@lilac-wysiwyg/svelte@${V}`);
    lilac(el, { value: sample('Svelte'), toolbar: true });
  },
  async solid(el, V) {
    const { render } = await import(`https://esm.sh/solid-js@${SOLID}/web`);
    const { LilacEditor } = await import(`https://esm.sh/@lilac-wysiwyg/solid@${V}?deps=solid-js@${SOLID}`);
    render(() => LilacEditor({ toolbar: true, value: sample('Solid') }), el);
  },
  async lit(el, V) {
    await import(`https://esm.sh/@lilac-wysiwyg/lit@${V}`);
    const element = document.createElement('lilac-editor');
    element.setAttribute('toolbar', '');
    element.value = sample('Lit');
    el.appendChild(element);
  },
  async alpine(el, V) {
    const Alpine = (await import(`https://esm.sh/alpinejs@${ALPINE}`)).default;
    const plugin = (await import(`https://esm.sh/@lilac-wysiwyg/alpine@${V}`)).default;
    if (!window.__lilacAlpineStarted) {
      Alpine.plugin(plugin);
      window.Alpine = Alpine;
    }
    const host = document.createElement('div');
    host.setAttribute('x-data', `{ body: ${JSON.stringify(sample('Alpine'))} }`);
    host.setAttribute('x-lilac', '{ value: body, toolbar: true, onChange: c => body = c }');
    el.appendChild(host);
    if (!window.__lilacAlpineStarted) {
      window.__lilacAlpineStarted = true;
      Alpine.start();
    }
  },
  async astro(el, V) {
    const { mountLilacEditor } = await import(`https://esm.sh/@lilac-wysiwyg/astro@${V}`);
    mountLilacEditor(el, { toolbar: true, value: sample('Astro') });
  },
  // Angular has no build-free component entry, so we JIT-compile a real
  // standalone Angular component in the browser (compiler + zone.js) and mount
  // the core editor inside it. Heavier than the others; the first load pulls
  // Angular from the CDN.
  async angular(el, V) {
    const NG = '18.2.0';
    await import('https://esm.sh/reflect-metadata@0.2.2');
    await import('https://esm.sh/zone.js@0.15.0');
    await import(`https://esm.sh/@angular/compiler@${NG}`);
    const core = await import(`https://esm.sh/@angular/core@${NG}?deps=zone.js@0.15.0`);
    const { bootstrapApplication } = await import(`https://esm.sh/@angular/platform-browser@${NG}?deps=@angular/core@${NG},zone.js@0.15.0`);
    const { LilacEditor } = await import(`https://esm.sh/@lilac-wysiwyg/core@${V}`);

    class LilacAngularDemo {
      el = core.inject(core.ElementRef);
      ngAfterViewInit() {
        new LilacEditor({
          container: this.el.nativeElement,
          toolbar: { show: true },
          initialContent: sample('Angular'),
        });
      }
    }
    core.Component({ selector: 'lilac-angular-demo', standalone: true, template: '' })(LilacAngularDemo);

    const mount = document.createElement('lilac-angular-demo');
    el.appendChild(mount);
    await bootstrapApplication(LilacAngularDemo);
  },
};

// Needs a build step / toolchain that a CDN import can't reproduce — no honest
// in-browser demo. (Qwik needs its resumability optimizer; Ember needs ember-cli
// / the Glimmer compiler and a booted app + resolver.)
const BUILD_ONLY = {
  qwik: 'Qwik',
  ember: 'Ember',
};

function note(el, framework) {
  el.innerHTML = `<div style="padding:1.25rem;border:1px dashed var(--color-border);border-radius:var(--border-radius);color:var(--color-text-muted)">
    A live in-browser demo isn't practical for ${framework}, which needs its own build step to run.
    The editor is identical across every adapter — see the usage above, or try the
    <a href="vanilla.html" style="color:var(--color-primary)">Vanilla JS demo</a> for a running editor.
  </div>`;
}

function fail(el, framework, err) {
  console.error(`[lilac playground] ${framework} failed`, err);
  el.innerHTML = `<div style="padding:1.25rem;border:1px solid var(--color-border);border-radius:var(--border-radius);color:var(--color-text-muted)">
    Couldn't load the live demo (network or CDN issue). The code sample above shows how the adapter is used.
  </div>`;
}

async function boot() {
  const V = await resolveVersion();
  document.querySelectorAll('[data-lilac-version]').forEach((n) => (n.textContent = V));

  for (const el of document.querySelectorAll('.lilac-playground')) {
    const fw = el.getAttribute('data-framework');
    if (BUILD_ONLY[fw]) {
      note(el, BUILD_ONLY[fw]);
      continue;
    }
    const mount = MOUNTERS[fw];
    if (!mount) continue;
    el.innerHTML = `<p style="color:var(--color-text-muted)">Loading a live ${fw} editor from npm…</p>`;
    try {
      el.innerHTML = '';
      await mount(el, V);
    } catch (err) {
      fail(el, fw, err);
    }
  }
}

boot();
