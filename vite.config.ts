import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Force Vite to resolve react/react-dom to the project's node_modules
      react: path.resolve(process.cwd(), 'node_modules', 'react'),
      'react-dom': path.resolve(process.cwd(), 'node_modules', 'react-dom'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
