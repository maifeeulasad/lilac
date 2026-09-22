<?php

declare(strict_types=1);

namespace Lilac\View\Components;

use Illuminate\Support\HtmlString;
use Illuminate\View\Component;
use Lilac\Editor as LilacEditor;

/**
 * Laravel Blade component wrapping {@see \Lilac\Editor}.
 *
 *   <x-lilac />
 *   <x-lilac :value="$post->body" placeholder="Write…" theme="auto" :toolbar="true" />
 */
class Editor extends Component
{
    public function __construct(
        public bool $toolbar = true,
        public ?string $placeholder = null,
        public string $theme = 'light',
        public bool $readOnly = false,
        public ?string $value = null,
        public ?string $version = null,
        public ?string $editorClass = null,
    ) {
    }

    public function render(): HtmlString
    {
        $options = [
            'toolbar' => ['show' => $this->toolbar],
            'theme' => $this->theme,
            'readOnly' => $this->readOnly,
        ];
        if ($this->placeholder !== null) {
            $options['placeholder'] = $this->placeholder;
        }
        if ($this->value !== null) {
            $options['initialContent'] = $this->value;
        }

        $attrs = [];
        if ($this->version !== null) {
            $attrs['version'] = $this->version;
        }
        if ($this->editorClass !== null) {
            $attrs['class'] = $this->editorClass;
        }

        return new HtmlString(LilacEditor::render($options, $attrs));
    }
}
