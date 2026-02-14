/**
 * generate-image-manifest.mjs
 *
 * Recursively scans public/assets/images/ for image files,
 * builds a JSON manifest organized by genus/id/date group,
 * and writes the result to src/data/imageManifest.json.
 *
 * The lookup key is the image path without the trailing -NN.ext suffix.
 * For example, files like:
 *   nepenthes/KF55/2024-03-03-01.jpg
 *   nepenthes/KF55/2024-03-03-02.jpg
 * are grouped under key "nepenthes/KF55/2024-03-03".
 *
 * Images that don't match the -NN pattern are grouped under their
 * full path minus the file extension (e.g., "greenhouse/mist_maker").
 *
 * Usage: node scripts/generate-image-manifest.mjs
 */

import { readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, dirname, extname } from "node:path";

const ROOT_DIR = join(import.meta.dirname, "..");
const IMAGES_DIR = join(ROOT_DIR, "public", "assets", "images");
const OUTPUT_FILE = join(ROOT_DIR, "src", "data", "imageManifest.json");

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".avif",
]);

/**
 * Recursively collect all image file paths under a directory.
 */
function collectImages(dir) {
  const results = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...collectImages(fullPath));
    } else if (IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Derive the grouping key from a path relative to the images directory.
 *
 * For files matching the pattern "...-NN.ext" (where NN is digits),
 * the key strips the "-NN.ext" suffix.
 * For other files, the key is the path without the extension.
 *
 * Examples:
 *   "nepenthes/KF1/2024-01-08-01.jpg" -> "nepenthes/KF1/2024-01-08"
 *   "greenhouse/mist_maker.jpg"        -> "greenhouse/mist_maker"
 */
function deriveGroupKey(relativePath) {
  const ext = extname(relativePath);
  const withoutExt = relativePath.slice(0, -ext.length);

  // Match a trailing "-NN" where NN is one or more digits
  const match = withoutExt.match(/^(.+)-(\d+)$/);
  if (match) {
    return match[1];
  }

  return withoutExt;
}

// --- Main ---

const imagePaths = collectImages(IMAGES_DIR);

const manifest = {};

for (const absPath of imagePaths) {
  // Path relative to the images directory, e.g. "nepenthes/KF1/2024-01-08-01.jpg"
  const relToImages = relative(IMAGES_DIR, absPath);

  // Public-facing path with /aristo/ base prefix
  const publicPath = "/aristo/assets/images/" + relToImages.split("\\").join("/");

  const key = deriveGroupKey(relToImages.split("\\").join("/"));

  if (!manifest[key]) {
    manifest[key] = [];
  }
  manifest[key].push(publicPath);
}

// Sort the arrays within each group for deterministic output
for (const key of Object.keys(manifest)) {
  manifest[key].sort();
}

// Sort keys for deterministic output
const sorted = {};
for (const key of Object.keys(manifest).sort()) {
  sorted[key] = manifest[key];
}

// Ensure output directory exists
mkdirSync(dirname(OUTPUT_FILE), { recursive: true });

writeFileSync(OUTPUT_FILE, JSON.stringify(sorted, null, 2) + "\n", "utf-8");

const groupCount = Object.keys(sorted).length;
const imageCount = Object.values(sorted).reduce((sum, arr) => sum + arr.length, 0);

console.log(`Image manifest generated: ${OUTPUT_FILE}`);
console.log(`  ${imageCount} images in ${groupCount} groups`);
