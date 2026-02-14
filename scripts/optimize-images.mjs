#!/usr/bin/env node
// Image optimization placeholder script.
// To enable full optimization, install sharp: npm install --save-dev sharp
// Then this script can convert images to WebP/AVIF formats.

import { readdirSync } from 'fs';
import { resolve, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const imagesDir = resolve(__dirname, '..', 'assets', 'images');

function countImages(dir) {
  let count = 0;
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        count += countImages(fullPath);
      } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(extname(entry.name).toLowerCase())) {
        count++;
      }
    }
  } catch {
    // Directory may not exist
  }
  return count;
}

const total = countImages(imagesDir);
console.log(`Found ${total} images in assets/images/`);
console.log('Image optimization requires sharp. Install with: npm install --save-dev sharp');
console.log('Skipping optimization for now.');
