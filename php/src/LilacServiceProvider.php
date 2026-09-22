<?php

declare(strict_types=1);

namespace Lilac;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use Lilac\View\Components\Editor as EditorComponent;

/**
 * Laravel service provider (auto-discovered via composer.json `extra.laravel`).
 *
 * Registers the `<x-lilac />` Blade component so a Laravel view can drop in the
 * editor:
 *
 *   <x-lilac :value="old('body', $post->body)" placeholder="Write…" />
 */
class LilacServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Blade::component('lilac', EditorComponent::class);
    }

    public function register(): void
    {
        // Nothing to bind; the component is stateless.
    }
}
