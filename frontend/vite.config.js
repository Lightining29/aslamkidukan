import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Plugin to ensure .htaccess is copied to dist on every build
const copyHtaccessPlugin = () => ({
  name: 'copy-htaccess',
  closeBundle() {
    const src = path.resolve(__dirname, 'public/.htaccess');
    const dest = path.resolve(__dirname, 'dist/.htaccess');
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log('✓ Successfully copied .htaccess to dist/.htaccess');
    }
  },
});

export default defineConfig({
  plugins: [react(), copyHtaccessPlugin()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
});
