<?php

declare(strict_types=1);

namespace Lilac;

/**
 * Server-side renderer for the Lilac WYSIWYG editor.
 *
 * Lilac's core is a browser library, so "PHP integration" means emitting the
 * markup that mounts it: a container element plus a script that loads the
 * published UMD build (window.Lilac) from a CDN and constructs an editor into
 * the container. Works in plain PHP, or via the Laravel {@see \Lilac\LilacServiceProvider}
 * Blade component.
 *
 * Usage (plain PHP):
 *
 *   echo \Lilac\Editor::render(['toolbar' => ['show' => true], 'placeholder' => 'Write…']);
 */
final class Editor
{
    /** Default CDN base for the published core package. */
    public const CDN = 'https://cdn.jsdelivr.net/npm/@lilac-wysiwyg/core';

    /** Default version tag to load from the CDN. */
    public const DEFAULT_VERSION = 'latest';

    /**
     * Render the editor as an HTML string.
     *
     * @param array<string,mixed> $options Editor options passed straight to
     *        `new Lilac.LilacEditor(...)` — e.g. `toolbar`, `placeholder`,
     *        `theme`, `readOnly`, `minHeight`, `maxHeight`, `initialContent`.
     *        A `container` key is ignored; it is set to the generated element.
     * @param array{id?:string,class?:string,version?:string,cdn?:string} $attrs
     *        Presentation/loader options.
     */
    public static function render(array $options = [], array $attrs = []): string
    {
        $id = (string) ($attrs['id'] ?? ('lilac-' . bin2hex(random_bytes(5))));
        $class = (string) ($attrs['class'] ?? '');
        $version = (string) ($attrs['version'] ?? self::DEFAULT_VERSION);
        $cdn = rtrim((string) ($attrs['cdn'] ?? self::CDN), '/');
        $src = $cdn . '@' . $version . '/dist/lilac.umd.js';

        unset($options['container']);
        $optsJson = json_encode(
            (object) $options,
            JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP
        );

        $idAttr = htmlspecialchars($id, ENT_QUOTES);
        $classAttr = htmlspecialchars(trim('lilac-editor-host ' . $class), ENT_QUOTES);
        $srcJs = json_encode($src, JSON_UNESCAPED_SLASHES);
        $idJs = json_encode($id);

        // One shared loader per page: the first host adds the <script>, later
        // hosts reuse it; each mounts once the global is available.
        return <<<HTML
<div id="{$idAttr}" class="{$classAttr}"></div>
<script>
(function () {
  var id = {$idJs};
  var src = {$srcJs};
  var opts = {$optsJson};
  function mount() {
    if (!window.Lilac || !window.Lilac.LilacEditor) return false;
    opts.container = document.getElementById(id);
    new window.Lilac.LilacEditor(opts);
    return true;
  }
  if (mount()) return;
  var loader = document.getElementById('lilac-umd-loader');
  if (!loader) {
    loader = document.createElement('script');
    loader.id = 'lilac-umd-loader';
    loader.src = src;
    document.head.appendChild(loader);
  }
  loader.addEventListener('load', mount);
})();
</script>
HTML;
    }

    /**
     * Just the `<script>` tag for the UMD build, if you prefer to load the
     * library once yourself and construct editors manually.
     */
    public static function scriptTag(string $version = self::DEFAULT_VERSION, ?string $cdn = null): string
    {
        $base = rtrim($cdn ?? self::CDN, '/');
        $src = htmlspecialchars($base . '@' . $version . '/dist/lilac.umd.js', ENT_QUOTES);

        return '<script src="' . $src . '" id="lilac-umd-loader"></script>';
    }
}
