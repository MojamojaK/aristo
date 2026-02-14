import { existsSync, mkdirSync, symlinkSync, unlinkSync, cpSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { platform } from 'os';

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

try {
  // Use 'junction' on Windows (no admin required), 'dir' on other platforms
  const symlinkType = platform() === 'win32' ? 'junction' : 'dir';
  symlinkSync(source, linkTarget, symlinkType);
  console.log('Linked public/assets/images -> assets/images');
} catch (err) {
  console.warn(`Symlink failed (${err.message}), falling back to copy.`);
  cpSync(source, linkTarget, { recursive: true });
  console.log('Copied assets/images -> public/assets/images');
}
