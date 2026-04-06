import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.js'],
    include: ['test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,vue}'],
      exclude: [
        'src/**/*.spec.js',
        'src/**/*.test.js',
        'src/boot/**',
        'src/router/**',
        'src/App.vue',
        'src/main.js',
      ],
      all: true,
    },
    pool: 'threads',
    threads: {
      singleThread: true,
    },
    alias: {
      '@asamuzakjp/css-color': fileURLToPath(
        new URL('./test/mocks/css-color-mock.js', import.meta.url),
      ),
    },
    server: {
      deps: {
        inline: ['quasar', 'vue-echarts', 'echarts', 'jsdom', 'cssstyle'],
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      src: fileURLToPath(new URL('./src', import.meta.url)),
      components: fileURLToPath(new URL('./src/components', import.meta.url)),
      layouts: fileURLToPath(new URL('./src/layouts', import.meta.url)),
      assets: fileURLToPath(new URL('./src/assets', import.meta.url)),
      composables: fileURLToPath(new URL('./src/composables', import.meta.url)),
      config: fileURLToPath(new URL('./src/config', import.meta.url)),
      boot: fileURLToPath(new URL('./src/boot', import.meta.url)),
      stores: fileURLToPath(new URL('./src/stores', import.meta.url)),
      '~assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
})
