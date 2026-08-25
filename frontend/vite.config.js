import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Plugin to ensure .htaccess is copied and dist is mirrored to backend/public & root public
const copyBuildArtifactsPlugin = () => ({
  name: 'copy-build-artifacts',
  closeBundle() {
    const dist = path.resolve(__dirname, 'dist');
    const htaccessSrc = path.resolve(__dirname, 'public/.htaccess');
    const htaccessDest = path.join(dist, '.htaccess');

    if (fs.existsSync(htaccessSrc)) {
      fs.copyFileSync(htaccessSrc, htaccessDest);
      console.log('✓ Successfully copied .htaccess to dist/.htaccess');
    }

    // Mirror to backend/public for full-stack Node.js hosting
    const backendPublic = path.resolve(__dirname, '../backend/public');
    copyDirRecursive(dist, backendPublic);
    console.log('✓ Successfully mirrored build to backend/public');

    // Mirror to root public
    const rootPublic = path.resolve(__dirname, '../public');
    copyDirRecursive(dist, rootPublic);
    console.log('✓ Successfully mirrored build to root public');
  },
});

export default defineConfig({
  plugins: [react(), copyBuildArtifactsPlugin()],
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
