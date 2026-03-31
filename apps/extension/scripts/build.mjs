#!/usr/bin/env node

/**
 * Build script for Be Candid Chrome Extension
 * Copies source files into dist/ and creates a .zip for Chrome Web Store upload.
 */

import { cpSync, mkdirSync, rmSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const ZIP = join(ROOT, 'be-candid-extension.zip');

// Clean previous build
if (existsSync(DIST)) rmSync(DIST, { recursive: true });
if (existsSync(ZIP)) rmSync(ZIP);

// Create dist
mkdirSync(DIST, { recursive: true });

// Copy extension files
cpSync(join(ROOT, 'manifest.json'), join(DIST, 'manifest.json'));
cpSync(join(ROOT, 'src'), join(DIST, 'src'), { recursive: true });

// Copy icons if they exist in the extension root
const iconDirs = ['icons'];
for (const dir of iconDirs) {
  const src = join(ROOT, dir);
  if (existsSync(src)) {
    cpSync(src, join(DIST, dir), { recursive: true });
  }
}

// Copy any top-level icon files referenced in manifest
const iconFiles = ['icon-16.png', 'icon-48.png', 'icon-128.png'];
for (const file of iconFiles) {
  const src = join(ROOT, file);
  if (existsSync(src)) {
    cpSync(src, join(DIST, file));
  }
}

// Create zip
try {
  execSync(`cd "${DIST}" && zip -r "${ZIP}" .`, { stdio: 'pipe' });
  console.log(`\n  Build complete!\n`);
  console.log(`  dist/          — unpacked extension (load in chrome://extensions)`);
  console.log(`  be-candid-extension.zip — ready for Chrome Web Store upload\n`);
} catch {
  console.error('Failed to create zip. Make sure "zip" is installed.');
  console.log(`\n  dist/ folder is ready for manual zipping or "Load Unpacked".\n`);
}
