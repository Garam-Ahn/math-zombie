import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // '' allows loading all env vars, not just VITE_ ones, though VITE_ is standard.
  // Fix: Cast process to any to resolve TS error 'Property cwd does not exist on type Process'
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Vital for making process.env.API_KEY work in the browser with Vite.
      // It replaces the string 'process.env.API_KEY' with the actual value from Vercel/env at build time.
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.API_KEY || '')
    }
  }
})