/**
 * convert-cultivation-logs.mjs
 *
 * Reads all 36 markdown files from collections/_cultivation_logs/,
 * parses their YAML front matter and markdown body content,
 * and writes a single JSON array to src/data/cultivationLogs.json.
 *
 * Usage: node scripts/convert-cultivation-logs.mjs
 * Requires: js-yaml (npm install --save-dev js-yaml)
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, basename, extname } from "node:path";
import yaml from "js-yaml";

const LOGS_DIR = join(
  import.meta.dirname,
  "..",
  "collections",
  "_cultivation_logs"
);
const OUTPUT_FILE = join(
  import.meta.dirname,
  "..",
  "src",
  "data",
  "cultivationLogs.json"
);

// Read all .md files from the directory
const files = readdirSync(LOGS_DIR)
  .filter((f) => extname(f) === ".md")
  .sort();

console.log(`Found ${files.length} markdown files in ${LOGS_DIR}`);

const results = [];

for (const file of files) {
  const filePath = join(LOGS_DIR, file);
  const raw = readFileSync(filePath, "utf-8");

  // Extract front matter and body content
  // Front matter is between the first and second '---' lines
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!fmMatch) {
    console.warn(`Warning: Could not parse front matter in ${file}, skipping.`);
    continue;
  }

  const frontMatterYaml = fmMatch[1];
  const bodyContent = (fmMatch[2] || "").trim();

  // Parse the YAML front matter using JSON_SCHEMA to prevent
  // automatic date conversion (keeps dates as "2024-03-03" strings)
  let frontMatter;
  try {
    frontMatter = yaml.load(frontMatterYaml, { schema: yaml.JSON_SCHEMA });
  } catch (err) {
    console.error(`Error parsing YAML in ${file}: ${err.message}`);
    continue;
  }

  // Derive slug from filename (strip .md extension)
  const slug = basename(file, ".md");

  const entry = {
    slug,
    name: frontMatter.name || null,
    alias: frontMatter.alias || null,
    genus: frontMatter.genus || null,
    sub_category: frontMatter.sub_category || null,
    environment: frontMatter.environment || null,
    logs: frontMatter.logs || [],
    bodyContent: bodyContent || "",
  };

  results.push(entry);
}

// Write the output JSON
writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), "utf-8");

console.log(
  `Successfully wrote ${results.length} entries to ${OUTPUT_FILE}`
);
