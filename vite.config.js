import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173, // 前端端口
    proxy: {
      '/api': { // 只要请求路径以 /api 开头
        target: 'http://localhost:8080', // 就转发给 Go 网关
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '') // 如果后端不需要 /api 前缀可开启此行
      }
    }
  }
})