import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

// CupAI 前端 Vite 配置
export default defineConfig({
  plugins: [
    vue(),
    // Element Plus 自动按需导入
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      // 开发环境代理后端 API（target 用 127.0.0.1 强制 IPv4，避免 localhost 在 macOS 上解析到 IPv6 ::1）
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      // WebSocket 代理
      '/socket.io': {
        target: 'ws://127.0.0.1:3001',
        ws: true,
      },
    },
  },
})
