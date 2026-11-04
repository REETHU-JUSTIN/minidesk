import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vite plugins: react() enables JSX and fast refresh, tailwindcss() generates the CSS.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
