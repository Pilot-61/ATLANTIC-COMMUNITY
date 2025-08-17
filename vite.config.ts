import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/TEST/',  // Use your repo name here!
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
