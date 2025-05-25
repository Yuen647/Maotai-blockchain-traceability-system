import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // 明确包含需要的 polyfills
      include: ['crypto', 'buffer', 'process', 'util'],
      // 是否添加 node global 对象
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      // 保险起见，仍然保留这个别名
      crypto: 'crypto-js',
    }
  },
  define: {
    // 在 Vite 4.x 中使用 window 而不是 globalThis
    global: 'window',
  }
})
