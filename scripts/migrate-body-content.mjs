#!/usr/bin/env node

/**
 * migrate-body-content.mjs
 *
 * One-time migration script that parses the HTML in bodyContent
 * and extracts structured nativeHabitat and cultivationEnvironment fields.
 *
 * Usage:
 *   node scripts/migrate-body-content.mjs
 *   node scripts/migrate-body-content.mjs --dry-run
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_FILE = resolve(__dirname, '..', 'src', 'data', 'cultivationLogs.json');
const dryRun = process.argv.includes('--dry-run');

// ── HTML parsing helpers ────────────────────────────────────────────

/**
 * Recursively parse a <ul> list into CultivationNote[] tree structure.
 * Each <li> becomes a CultivationNote with text and optional children.
 */
function parseNoteTree(ulElement) {
  if (!ulElement) return [];
  const notes = [];
  for (const li of ulElement.children) {
    if (li.tagName !== 'LI') continue;
    const note = parseLiNote(li);
    if (note) notes.push(note);
  }
  return notes;
}

/**
 * Parse a single <li> element into a CultivationNote.
 * Text is the direct text content of the <li> (excluding nested <ul>).
 * Children come from any nested <ul> elements.
 */
function parseLiNote(li) {
  // Get direct text content (not from nested elements)
  let text = '';
  for (const node of li.childNodes) {
    if (node.nodeType === 3) { // TEXT_NODE
      text += node.textContent;
    }
  }
  text = text.trim();

  // Find nested <ul> for children
  const nestedUl = li.querySelector(':scope > ul');
  const children = parseNoteTree(nestedUl);

  const note = { text };
  if (children.length > 0) {
    note.children = children;
  }
  return note;
}

/**
 * Parse the 自生地 (Native Habitat) section from a <ul> element.
 */
function parseNativeHabitat(ulElement) {
  const items = Array.from(ulElement.children).filter(
    (el) => el.tagName === 'LI',
  );

  const locations = [];
  let elevation = '';
  let temperature = '';

  for (const li of items) {
    const directText = getDirectText(li).trim();

    if (directText.startsWith('標高')) {
      elevation = directText.replace(/^標高:\s*/, '');
    } else if (directText.startsWith('温度')) {
      temperature = directText.replace(/^温度:\s*/, '');
    } else {
      // This is a location item
      const locationName = directText.replace(/^自生地:\s*/, '');
      const maps = [];
      const iframes = li.querySelectorAll('iframe');
      for (const iframe of iframes) {
        const src = iframe.getAttribute('src');
        if (src) maps.push(src);
      }
      locations.push({ name: locationName, maps });
    }
  }

  return { locations, elevation, temperature };
}

/**
 * Parse the 栽培環境 (Cultivation Environment) section from a <ul> element.
 */
function parseCultivationEnvironment(ulElement) {
  const items = Array.from(ulElement.children).filter(
    (el) => el.tagName === 'LI',
  );

  const env = {};

  for (const li of items) {
    const directText = getDirectText(li).trim();

    if (directText.startsWith('温度理論値')) {
      env.temperatureTheory = directText.replace(/^温度理論値:\s*/, '');
    } else if (directText.startsWith('温度')) {
      const value = directText.replace(/^温度:\s*/, '');
      const nestedUl = li.querySelector(':scope > ul');
      const children = parseNoteTree(nestedUl);
      env.temperature = { text: value };
      if (children.length > 0) env.temperature.children = children;
    } else if (directText.startsWith('空中湿度')) {
      const value = directText.replace(/^空中湿度:\s*/, '');
      const nestedUl = li.querySelector(':scope > ul');
      const children = parseNoteTree(nestedUl);
      env.humidity = { text: value };
      if (children.length > 0) env.humidity.children = children;
    } else if (directText.startsWith('用土')) {
      const value = directText.replace(/^用土:\s*/, '');
      const nestedUl = li.querySelector(':scope > ul');
      const children = parseNoteTree(nestedUl);
      env.soil = { text: value };
      if (children.length > 0) env.soil.children = children;
    } else if (directText.startsWith('日照')) {
      const value = directText.replace(/^日照:\s*/, '');
      const nestedUl = li.querySelector(':scope > ul');
      const children = parseNoteTree(nestedUl);
      env.light = { text: value };
      if (children.length > 0) env.light.children = children;
    } else if (directText.startsWith('経過観察')) {
      // Special field that appears in some entries
      const value = directText.replace(/^経過観察:\s*/, '');
      const nestedUl = li.querySelector(':scope > ul');
      const children = parseNoteTree(nestedUl);
      env.observation = { text: value };
      if (children.length > 0) env.observation.children = children;
    }
  }

  return Object.keys(env).length > 0 ? env : null;
}

/**
 * Get direct text content of an element (not from child elements).
 */
function getDirectText(element) {
  let text = '';
  for (const node of element.childNodes) {
    if (node.nodeType === 3) { // TEXT_NODE
      text += node.textContent;
    }
  }
  return text;
}

/**
 * Check if bodyContent follows the standard pattern (h3 sections or empty).
 */
function isStandardPattern(bodyContent) {
  if (!bodyContent) return true;
  const trimmed = bodyContent.trim();
  if (!trimmed) return true;
  // Standard pattern starts with <h3> for section headers
  return trimmed.startsWith('<h3>');
}

// ── Main migration ──────────────────────────────────────────────────

function migrate() {
  const logs = JSON.parse(readFileSync(LOGS_FILE, 'utf-8'));

  let migratedCount = 0;
  let skippedCount = 0;
  let emptyCount = 0;

  for (const entry of logs) {
    const { bodyContent, slug } = entry;

    // Initialize new fields
    entry.nativeHabitat = null;
    entry.cultivationEnvironment = null;

    if (!bodyContent || !bodyContent.trim()) {
      emptyCount++;
      continue;
    }

    if (!isStandardPattern(bodyContent)) {
      // Keep bodyContent for non-standard entries (e.g., N. sp. Jakarta)
      console.log(`  [SKIP] ${slug}: non-standard bodyContent (keeping as-is)`);
      skippedCount++;
      continue;
    }

    // Parse the HTML
    const dom = new JSDOM(`<div>${bodyContent}</div>`);
    const container = dom.window.document.querySelector('div');
    const h3Elements = container.querySelectorAll('h3');

    for (const h3 of h3Elements) {
      const sectionName = h3.textContent.trim();
      // The <ul> follows the <h3>
      const ul = h3.nextElementSibling;
      if (!ul || ul.tagName !== 'UL') continue;

      if (sectionName === '自生地') {
        entry.nativeHabitat = parseNativeHabitat(ul);
      } else if (sectionName === '栽培環境') {
        entry.cultivationEnvironment = parseCultivationEnvironment(ul);
      }
    }

    // Clear bodyContent since it's been migrated to structured fields
    entry.bodyContent = '';
    migratedCount++;
    console.log(`  [OK] ${slug}`);
  }

  console.log(
    `\nMigration summary: ${migratedCount} migrated, ${skippedCount} skipped, ${emptyCount} empty`,
  );

  if (!dryRun) {
    // Reorder fields for consistency: put nativeHabitat and cultivationEnvironment before bodyContent
    const reordered = logs.map((entry) => {
      const { bodyContent, nativeHabitat, cultivationEnvironment, ...rest } =
        entry;
      return {
        ...rest,
        nativeHabitat,
        cultivationEnvironment,
        bodyContent,
      };
    });

    writeFileSync(LOGS_FILE, JSON.stringify(reordered, null, 2) + '\n', 'utf-8');
    console.log(`\nWrote updated ${LOGS_FILE}`);
  } else {
    console.log('\n[DRY RUN] No files were modified.');
  }
}

migrate();
