#!/usr/bin/env node
import { readdirSync, statSync } from 'fs';
import { resolve, dirname, extname, relative } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const imagesDir = resolve(__dirname, '..', 'assets', 'images');

const MAX_WIDTH = 1200;
const JPEG_QUALITY = 80;
const PNG_COMPRESSION = 9;

function collectImages(dir) {
  const results = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...collectImages(fullPath));
      } else if (
        ['.jpg', '.jpeg', '.png'].includes(extname(entry.name).toLowerCase())
      ) {
        results.push(fullPath);
      }
    }
  } catch {
    // Directory may not exist
  }
  return results;
}

const images = collectImages(imagesDir);
console.log(`Found ${images.length} images in assets/images/`);

let optimized = 0;
let skipped = 0;

for (const imagePath of images) {
  const ext = extname(imagePath).toLowerCase();
  const sizeBefore = statSync(imagePath).size;
  const rel = relative(imagesDir, imagePath);

  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    // Skip small images
    if (sizeBefore < 50 * 1024) {
      skipped++;
      continue;
    }

    let pipeline = sharp(imagePath);

    // Resize if wider than MAX_WIDTH
    if (metadata.width && metadata.width > MAX_WIDTH) {
      pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
    }

    // Apply format-specific optimization
    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ compressionLevel: PNG_COMPRESSION });
    }

    const buffer = await pipeline.toBuffer();

    // Only overwrite if we actually saved space
    if (buffer.length < sizeBefore) {
      const { writeFileSync } = await import('fs');
      writeFileSync(imagePath, buffer);
      const saved = ((1 - buffer.length / sizeBefore) * 100).toFixed(1);
      console.log(`  Optimized ${rel}: ${sizeBefore} -> ${buffer.length} (${saved}% saved)`);
      optimized++;
    } else {
      skipped++;
    }
  } catch (err) {
    console.warn(`  Skipped ${rel}: ${err.message}`);
    skipped++;
  }
}

console.log(`\nDone: ${optimized} optimized, ${skipped} skipped`);
