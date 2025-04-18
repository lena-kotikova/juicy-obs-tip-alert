import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/juicy-api': {
          target: 'https://enjoyjuicy.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/juicy-api/, '')
        }
      }
    }
  }
})