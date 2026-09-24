# Lilac vs. other editors

A packaging- and integration-focused comparison of [Lilac](https://github.com/maifeeulasad/lilac) with other open-source rich-text editors. It is about **integration breadth, packaging, and cost** — not maturity or feature depth (see the fairness note below). All figures are approximate and change often; see [Sources](#sources).

**Legend:** ✅ built in / first-party · 🟡 partial or different scope · ❌ not provided by the core team · 💲 available, but the premium/advanced tier needs a paid plan.

## Feature comparison

| Feature | Lilac | [TipTap](https://tiptap.dev) | [Lexical](https://lexical.dev) | [ProseMirror](https://prosemirror.net) | [Quill](https://quilljs.com) | [Slate](https://docs.slatejs.org) | [TinyMCE](https://www.tiny.cloud) | [CKEditor 5](https://ckeditor.com) |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| TypeScript core | ✅ | ✅ | ✅ | ✅<sup>1</sup> | ✅ | ✅ | ✅ | ✅ |
| Framework-agnostic core | ✅ | ✅ | ✅ | ✅ | ✅ | ❌<sup>2</sup> | ✅ | ✅ |
| Zero runtime dependencies | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Vanilla JS (no framework) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Official React adapter | ✅ | ✅ | ✅ | ❌ | ❌<sup>3</sup> | ✅ | ✅ | ✅ |
| Official Vue adapter | ✅ | ✅ | ❌<sup>4</sup> | ❌ | ❌<sup>3</sup> | ❌ | ✅ | ✅ |
| Official Angular adapter | ✅ | ❌ | ❌ | ❌ | ❌<sup>3</sup> | ❌ | ✅ | ✅ |
| Official Svelte adapter | ✅ | ❌<sup>3</sup> | ❌ | ❌ | ❌ | ❌ | ✅ | ❌<sup>7</sup> |
| Other official adapters<sup>5</sup> | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Web Component (custom element) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| UMD / CDN script-tag build | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| PHP / Laravel package | ✅ | 🟡<sup>6</sup> | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Custom plugin / extension system | ✅ | ✅&nbsp;💲 | ✅ | ✅ | ✅ | ✅ | ✅&nbsp;💲 | ✅&nbsp;💲 |

<sup>1</sup> ProseMirror is JavaScript shipped with bundled type declarations. &nbsp;
<sup>2</sup> Slate is built for React; it has no framework-agnostic core. &nbsp;
<sup>3</sup> Community wrappers exist (e.g. `react-quill`, `vue-quill`, `ngx-quill`, `svelte-tiptap`) but are not maintained by the core team. &nbsp;
<sup>4</sup> Lexical's Vue binding (`lexical-vue`) is community-maintained. &nbsp;
<sup>5</sup> Lilac also ships official adapters for Preact, Solid, Lit, Qwik, Alpine.js, Ember, and Astro. &nbsp;
<sup>6</sup> TipTap offers a PHP package for JSON↔HTML conversion; Lilac's renders the editor via a Blade component / plain PHP. &nbsp;
<sup>7</sup> CKEditor 5 documents a Svelte setup but ships no dedicated Svelte component.

> **In fairness:** this table is about integration breadth and packaging, not maturity or features. TipTap, Lexical, and ProseMirror are mature, widely adopted headless projects with large ecosystems and years of production hardening at scale (Lexical powers Meta's apps); Quill is a long-established batteries-included editor; **TinyMCE and CKEditor are full-featured enterprise editors with the broadest official framework support of the group** (TinyMCE notably ships official React, Vue, Angular, Svelte, Web Component and Laravel integrations). Lilac is a younger, MIT-licensed project whose focus is a zero-dependency TypeScript core (~18&nbsp;KB gzipped) with first-party adapters for many frameworks plus a UMD/PHP path — it does not claim feature parity with these ecosystems.

## Pricing & licensing

The permissively-licensed editors are free for any use, including closed-source commercial products. The enterprise editors are open-source under **GPL** but effectively require a paid license for typical closed-source commercial use, and gate premium features behind subscriptions — which adds up quickly.

| Editor | License | Free for commercial closed-source? | Paid plans (approx., 2026)<sup>†</sup> |
| --- | --- | :---: | --- |
| **Lilac** | MIT | ✅ | None — fully free |
| **Lexical** | MIT | ✅ | None |
| **ProseMirror** | MIT | ✅ | None |
| **Quill** | BSD-3-Clause | ✅ | None |
| **Slate** | MIT | ✅ | None |
| **TipTap** | MIT (editor) | ✅ | Editor is free; the Cloud / collaboration / AI platform runs **~$49–$999/mo** (no free Cloud tier since 2025) |
| **TinyMCE** | GPLv2+ / commercial | ❌<sup>‡</sup> | Commercial & cloud from **~$79/mo**; enterprise custom; premium plugins paid |
| **CKEditor&nbsp;5** | GPLv2+ / commercial | ❌<sup>‡</sup> | From **~$144/mo**; a commercial license runs **~$4,000+/yr**, premium features **$15,000+/yr** |

<sup>†</sup> Prices are approximate, change often, and depend on plan/usage — always check the vendor's pricing page. &nbsp;
<sup>‡</sup> The editor self-hosts for free under **GPLv2+**, but that obliges you to release your own source under GPL. Closed-source commercial use requires a paid commercial license (and CKEditor's free tier shows a "Powered by CKEditor" badge).

> **Takeaway:** with Lilac (and the other MIT/BSD options) there is nothing to buy and no license key — you can ship it in a closed-source commercial app for free. TinyMCE and CKEditor are powerful, but their real-world cost for a commercial product is a recurring subscription, often in the thousands per year.

## Sources

Accessed 2026-09-24. Figures and capabilities change; verify against the vendors' own pages.

- **TipTap** — integrations: <https://tiptap.dev/docs/editor/getting-started/overview> · pricing: <https://tiptap.dev/pricing>
- **Lexical** — docs: <https://lexical.dev/docs/intro>
- **ProseMirror** — <https://prosemirror.net>
- **Quill** — modules: <https://quilljs.com/docs/modules/>
- **Slate** — docs: <https://docs.slatejs.org>
- **TinyMCE** — framework integrations: <https://www.tiny.cloud/solutions/editor-framework-integration/> · pricing: <https://www.tiny.cloud/pricing/> · license (GPLv2+ from v7): <https://github.com/tinymce/tinymce/discussions/9496>
- **CKEditor 5** — installation/integrations: <https://ckeditor.com/docs/ckeditor5/latest/getting-started/index.html> · pricing: <https://ckeditor.com/pricing/> · license: <https://github.com/ckeditor/ckeditor5/blob/master/LICENSE.md>
- **Bundle sizes** — <https://liveblocks.io/blog/which-rich-text-editor-framework-should-you-choose-in-2025> · <https://eddyter.com/blogs/rich-text-editor-bundle-size-comparison-2026>
