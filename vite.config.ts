import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
    root: './app-views',
    build: {
        outDir: '../app/node_modules/.views',
        emptyOutDir: true,
        rollupOptions: {
            external: ['electron'],
        },
    },
    plugins: [vue()],
    base: './',
});
