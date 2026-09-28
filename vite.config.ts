import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { apiServerPlugin } from './server/apiPlugin.ts';

import fs from 'node:fs';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(rootDir, 'src');
const mainPath = path.resolve(srcDir, 'main.tsx');

// Ensure src directory exists on build host
if (!fs.existsSync(srcDir)) {
  try {
    fs.mkdirSync(srcDir, { recursive: true });
  } catch {}
}

// Casing and path variations check (Windows vs Linux vs subfolder discrepancies)
const alternativeMainLocations = [
  path.resolve(srcDir, 'Main.tsx'),
  path.resolve(rootDir, 'Src/main.tsx'),
  path.resolve(rootDir, 'Src/Main.tsx'),
  path.resolve(srcDir, 'main.ts'),
  path.resolve(srcDir, 'main.jsx'),
  path.resolve(rootDir, 'main.tsx'),
  path.resolve(rootDir, 'Main.tsx'),
  path.resolve(srcDir, 'index.tsx'),
  path.resolve(srcDir, 'index.jsx'),
];

if (!fs.existsSync(mainPath)) {
  let restored = false;
  for (const alt of alternativeMainLocations) {
    if (fs.existsSync(alt)) {
      try {
        fs.copyFileSync(alt, mainPath);
        restored = true;
        break;
      } catch {}
    }
  }

  // Fallback: write main.tsx directly if completely missing so Rolldown/Vite never fails with os error 2
  if (!restored) {
    try {
      fs.writeFileSync(
        mainPath,
        `import { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App.tsx';\nimport './index.css';\n\ncreateRoot(document.getElementById('root')!).render(\n  <StrictMode>\n    <App />\n  </StrictMode>\n);\n`,
        'utf-8'
      );
    } catch {}
  }
}

// Ensure index.css exists
const cssPath = path.resolve(srcDir, 'index.css');
if (!fs.existsSync(cssPath)) {
  try {
    fs.writeFileSync(cssPath, `@import "tailwindcss";\n`, 'utf-8');
  } catch {}
}

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
        return mainPath;
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

