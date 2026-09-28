import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { apiServerPlugin } from './server/apiPlugin.ts';

import fs from 'node:fs';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Custom plugin to guarantee main.tsx resolution across any platform, build environment, or path style
function entryResolverPlugin() {
  return {
    name: 'entry-resolver-plugin',
    enforce: 'pre' as const,
    resolveId(source: string) {
      if (
        source === '/src/main.tsx' ||
        source === './src/main.tsx' ||
        source === 'src/main.tsx' ||
        source.endsWith('/src/main.tsx') ||
        source.endsWith('main.tsx')
      ) {
        const resolvedPath = path.resolve(rootDir, 'src/main.tsx');
        if (fs.existsSync(resolvedPath)) {
          return resolvedPath;
        }
      }
      return null;
    },
  };
}

export default defineConfig(() => {
  return {
    root: rootDir,
    base: '/',
    plugins: [entryResolverPlugin(), react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, '.'),
        '/src': path.resolve(rootDir, 'src'),
        './src': path.resolve(rootDir, 'src'),
        'src': path.resolve(rootDir, 'src'),
      },
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

