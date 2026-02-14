import { existsSync, mkdirSync, symlinkSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const publicAssets = resolve(root, 'public', 'assets');
const linkTarget = resolve(publicAssets, 'images');
const source = resolve(root, 'assets', 'images');

if (!existsSync(source)) {
  console.log('No assets/images directory found, skipping symlink.');
  process.exit(0);
}

mkdirSync(publicAssets, { recursive: true });

if (existsSync(linkTarget)) {
  try {
    unlinkSync(linkTarget);
  } catch {
    // Already exists as directory or other - skip
    console.log('public/assets/images already exists, skipping.');
    process.exit(0);
  }
}

symlinkSync(source, linkTarget, 'dir');
console.log('Linked public/assets/images -> assets/images');
