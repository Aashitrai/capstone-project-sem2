import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// This is the Vite configuration file.
// It tells Vite to use the React plugin so JSX works correctly.
export default defineConfig({
  plugins: [react()],
})
