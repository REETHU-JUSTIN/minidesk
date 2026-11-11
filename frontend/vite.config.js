import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Vite plugins: react() enables JSX and fast refresh, tailwindcss() generates the CSS.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // jsdom simulates a browser, so components can render without opening one.
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.test.{js,jsx}'],
  },
})
