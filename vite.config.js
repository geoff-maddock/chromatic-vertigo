import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
    plugins: [viteSingleFile()],
    build: {
        // Inline everything; pure client-side output
        target: 'es2020',
        assetsInlineLimit: Infinity,
        cssCodeSplit: false,
        outDir: 'dist',
        rollupOptions: {
            // p5.js and Tone.js are loaded via CDN <script> tags — keep them external
            external: ['p5', 'tone'],
        },
    },
});
