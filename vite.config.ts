import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  root: './cocos',
  server: {
    port: 5555,
  },
  build: {
    minify: false,
  }
})