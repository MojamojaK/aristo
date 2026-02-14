#!/usr/bin/env node

/**
 * add-entry.mjs
 *
 * CLI tool to add cultivation log entries with automatic EXIF date extraction.
 * Images are auto-dated from EXIF metadata and placed in the correct directory.
 * cultivationLogs.json is updated directly (no markdown intermediary).
 *
 * Usage:
 *   node scripts/add-entry.mjs <slug> <source> [options] <images...>
 *
 * Options:
 *   --text "..."           Text note (added to the latest date's entry)
 *   --propagation "..."    Propagation method (for new sources only)
 *   --image-id KF##        Override auto-detected image ID
 *   --date YYYY-MM-DD      Override EXIF date for all images
 *
 * Examples:
 *   # Add photos to an existing source (dates from EXIF)
 *   node scripts/add-entry.mjs N_aristolochioides "BE-4544" ./photos/*.jpg
 *
 *   # Add photos with a text note
 *   node scripts/add-entry.mjs N_rajah "国内趣味家 #1" ./img.jpg --text "New pitcher!"
 *
 *   # Create a new source (auto-assigns next KF number)
 *   node scripts/add-entry.mjs N_rajah "NewVendor-001" --propagation "実生" ./photo.jpg
 *
 *   # Force a specific date instead of reading EXIF
 *   node scripts/add-entry.mjs N_rajah "国内趣味家 #1" --date 2024-06-15 ./photo.jpg
 *
 * Requires: exifr (npm install --save-dev exifr)
 */

import {
  readFileSync,
  writeFileSync,
  copyFileSync,
  mkdirSync,
  readdirSync,
  existsSync,
  statSync,
} from "node:fs";
import { join, extname, basename, resolve } from "node:path";
import { execSync } from "node:child_process";
import exifr from "exifr";

const ROOT_DIR = join(import.meta.dirname, "..");
const LOGS_FILE = join(ROOT_DIR, "src", "data", "cultivationLogs.json");
const IMAGES_DIR = join(ROOT_DIR, "assets", "images");
const LINK_SCRIPT = join(ROOT_DIR, "scripts", "link-assets.mjs");
const MANIFEST_SCRIPT = join(ROOT_DIR, "scripts", "generate-image-manifest.mjs");

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
]);

// ── Argument parsing ────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);

  if (args.length < 1 || args[0] === "--help" || args[0] === "-h") {
    printUsage();
    process.exit(0);
  }

  if (args.length < 3) {
    printUsage();
    process.exit(1);
  }

  const slug = args[0];
  const source = args[1];
  const options = { text: null, propagation: null, imageId: null, date: null };
  const images = [];

  let i = 2;
  while (i < args.length) {
    switch (args[i]) {
      case "--text":
        options.text = args[++i];
        break;
      case "--propagation":
        options.propagation = args[++i];
        break;
      case "--image-id":
        options.imageId = args[++i];
        break;
      case "--date":
        options.date = args[++i];
        break;
      default:
        images.push(resolve(args[i]));
        break;
    }
    i++;
  }

  return { slug, source, options, images };
}

function printUsage() {
  console.log(`
Usage: node scripts/add-entry.mjs <slug> <source> [options] <images...>

Arguments:
  slug                   Species slug (e.g. N_aristolochioides)
  source                 Source name (e.g. "BE-4544")
  images                 One or more image files

Options:
  --text "..."           Text note (added to latest date's entry)
  --propagation "..."    Propagation method (for new sources only)
  --image-id KF##        Override auto-detected image ID
  --date YYYY-MM-DD      Override EXIF date for all images
  -h, --help             Show this help message

Image dates are automatically extracted from EXIF metadata.
Falls back to file modification date if no EXIF date is found.
`);
}

// ── EXIF date extraction ────────────────────────────────────────────

async function getImageDate(filePath) {
  try {
    const exif = await exifr.parse(filePath, [
      "DateTimeOriginal",
      "CreateDate",
      "ModifyDate",
    ]);
    const date =
      exif?.DateTimeOriginal || exif?.CreateDate || exif?.ModifyDate;
    if (date instanceof Date && !isNaN(date.getTime())) {
      return formatDate(date);
    }
  } catch {
    // Fall through to file stat
  }

  // Fallback: file modification date
  const stat = statSync(filePath);
  console.warn(
    `  Warning: No EXIF date in ${basename(filePath)}, using file modification date`
  );
  return formatDate(stat.mtime);
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ── Image ID helpers ────────────────────────────────────────────────

/**
 * Find all auto_image IDs used by a source's entries.
 */
function findImageIds(logData) {
  const ids = new Set();
  for (const entry of logData.entries) {
    for (const content of entry.contents) {
      for (const item of content.items) {
        if (item.auto_image?.id) {
          ids.add(item.auto_image.id);
        }
      }
    }
  }
  return [...ids];
}

/**
 * Find the highest KF number across all image directories for a genus.
 * Falls back to scanning all genus directories if none specified.
 */
function findNextKfNumber() {
  let maxNum = 0;

  // Scan all genus directories under assets/images/
  if (!existsSync(IMAGES_DIR)) return "KF1";

  for (const genusName of readdirSync(IMAGES_DIR)) {
    const genusDir = join(IMAGES_DIR, genusName);
    if (!statSync(genusDir).isDirectory()) continue;

    for (const dir of readdirSync(genusDir)) {
      const match = dir.match(/^KF(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
  }

  return `KF${maxNum + 1}`;
}

/**
 * Find the next available sequence number for images on a given date.
 */
function findNextSequenceNumber(dir, dateStr) {
  if (!existsSync(dir)) return 1;

  let maxSeq = 0;
  const pattern = new RegExp(`^${dateStr}-(\\d+)\\.`);

  for (const file of readdirSync(dir)) {
    const match = file.match(pattern);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (seq > maxSeq) maxSeq = seq;
    }
  }

  return maxSeq + 1;
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const { slug, source, options, images } = parseArgs(process.argv);

  // Validate image files
  for (const img of images) {
    if (!existsSync(img)) {
      console.error(`Error: File not found: ${img}`);
      process.exit(1);
    }
    const ext = extname(img).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) {
      console.error(
        `Error: Unsupported image format: ${basename(img)} (${ext})`
      );
      console.error(
        `  Supported: ${[...IMAGE_EXTENSIONS].join(", ")}`
      );
      process.exit(1);
    }
  }

  if (images.length === 0) {
    console.error("Error: No image files provided.");
    printUsage();
    process.exit(1);
  }

  // Load cultivation logs
  const logs = JSON.parse(readFileSync(LOGS_FILE, "utf-8"));

  // Find the species
  const species = logs.find((l) => l.slug === slug);
  if (!species) {
    console.error(`Error: Species "${slug}" not found.`);
    console.error("\nAvailable species:");
    for (const l of logs) {
      if (l.logs.length > 0 || l.bodyContent) {
        console.error(`  ${l.slug.padEnd(40)} ${l.name}`);
      }
    }
    process.exit(1);
  }

  // Find or create the source
  let logData = species.logs.find((l) => l.source === source);
  let isNewSource = false;

  if (!logData) {
    isNewSource = true;
    console.log(`New source "${source}" will be created for ${species.name}.`);
  }

  // Determine image ID
  let imageId = options.imageId;

  if (!imageId && logData) {
    const existingIds = findImageIds(logData);

    if (existingIds.length === 1) {
      imageId = existingIds[0];
    } else if (existingIds.length > 1) {
      console.error(
        `Error: Source "${source}" uses multiple image IDs: ${existingIds.join(", ")}`
      );
      console.error(
        "  Please specify which one with --image-id <id>"
      );
      process.exit(1);
    }
    // existingIds.length === 0 falls through to auto-assign
  }

  if (!imageId) {
    imageId = findNextKfNumber();
    console.log(`Auto-assigned image ID: ${imageId}`);
  }

  // Read EXIF dates from images
  console.log("\nReading image metadata...");
  const imagesByDate = new Map();

  for (const img of images) {
    const date = options.date || (await getImageDate(img));
    console.log(`  ${basename(img)} → ${date}`);

    if (!imagesByDate.has(date)) {
      imagesByDate.set(date, []);
    }
    imagesByDate.get(date).push(img);
  }

  const sortedDates = [...imagesByDate.keys()].sort();

  // Copy images to the correct directory
  const targetDir = join(IMAGES_DIR, species.genus, imageId);
  mkdirSync(targetDir, { recursive: true });

  console.log(`\nCopying images to ${species.genus}/${imageId}/`);

  const newEntries = [];

  for (const date of sortedDates) {
    const dateImages = imagesByDate.get(date);
    let nextSeq = findNextSequenceNumber(targetDir, date);

    const items = [{ auto_image: { id: imageId } }];

    for (const img of dateImages) {
      const seqStr = String(nextSeq).padStart(2, "0");
      const destName = `${date}-${seqStr}.jpg`;
      const destPath = join(targetDir, destName);

      copyFileSync(img, destPath);
      console.log(`  ${basename(img)} → ${destName}`);
      nextSeq++;
    }

    // Add text note to the latest date only
    if (options.text && date === sortedDates[sortedDates.length - 1]) {
      items.push({ text: options.text });
    }

    newEntries.push({
      date,
      contents: [{ items }],
    });
  }

  // Update cultivation logs JSON
  if (isNewSource) {
    logData = {
      source,
      propagation: options.propagation || null,
      start_date: sortedDates[0],
      entries: newEntries,
    };
    species.logs.push(logData);
  } else {
    for (const newEntry of newEntries) {
      const existingEntry = logData.entries.find(
        (e) => e.date === newEntry.date
      );

      if (existingEntry) {
        // Append to existing entry's last content block
        const lastContent =
          existingEntry.contents[existingEntry.contents.length - 1];
        lastContent.items.push(...newEntry.contents[0].items);
        console.log(`  Merged into existing entry for ${newEntry.date}`);
      } else {
        // Insert in chronological order
        const insertIdx = logData.entries.findIndex(
          (e) => e.date > newEntry.date
        );
        if (insertIdx === -1) {
          logData.entries.push(newEntry);
        } else {
          logData.entries.splice(insertIdx, 0, newEntry);
        }
      }
    }
  }

  writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2) + "\n", "utf-8");
  console.log(`\nUpdated ${basename(LOGS_FILE)}`);

  // Ensure symlink exists and regenerate image manifest
  console.log("Regenerating image manifest...");
  execSync(`node "${LINK_SCRIPT}"`, { stdio: "inherit" });
  execSync(`node "${MANIFEST_SCRIPT}"`, { stdio: "inherit" });

  // Summary
  console.log("\n── Done ─────────────────────────────────────");
  console.log(`  Species:  ${species.name} (${slug})`);
  console.log(`  Source:   ${source}`);
  console.log(`  Image ID: ${imageId}`);
  console.log(`  Dates:    ${sortedDates.join(", ")}`);
  console.log(`  Images:   ${images.length} file(s) copied`);
  if (options.text) {
    console.log(`  Note:     "${options.text}"`);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
