import { svelteDevtools } from '@sveltejs/vite-devtools-svelte';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
    plugins: [
        svelteDevtools(),
        sveltekit({
            compilerOptions: {
                // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
                runes: ({ filename }) =>
                    filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
                experimental: { async: true }
            },
            csp: {
                mode: 'hash',
                directives: {
                    'default-src': ['none'],
                    'base-uri': ['none'],
                    'script-src': ['self'],
                    'style-src': ['self'],
                    'style-src-attr': ['unsafe-inline'],
                    'font-src': ['self'],
                    'img-src': ['self'],
                    'connect-src': ['self'],
                    'object-src': ['none'],
                    'frame-src': ['none'],
                    'form-action': ['none']
                }
            },
            adapter: adapter({
                precompress: true
            }),
            experimental: { remoteFunctions: true, forkPreloads: true }
        })
    ],
    test: {
        expect: { requireAssertions: true },
        projects: [
            {
                extends: './vite.config.js',
                test: {
                    name: 'client',
                    browser: {
                        enabled: true,
                        provider: playwright(),
                        instances: [{ browser: 'chromium', headless: true }]
                    },
                    include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
                    exclude: ['src/lib/server/**']
                }
            },

            {
                extends: './vite.config.js',
                test: {
                    name: 'server',
                    environment: 'node',
                    include: ['src/**/*.{test,spec}.{js,ts}'],
                    exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
                }
            }
        ]
    },
    devtools: { apply: 'serve', clientAuth: true }
});
