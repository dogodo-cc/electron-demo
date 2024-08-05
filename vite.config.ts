import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    root: './cocos/views',
    server: {
        port: 5555,
    },
    build: {
        minify: false,
        rollupOptions: {
            external: ['electron'],
        },
    },
    base: './', // 重要，否则在 electron 加载 index.html 的时候会找不到资源
});
