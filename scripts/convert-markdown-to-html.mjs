import { readFileSync, writeFileSync } from "node:fs";
import { marked } from "marked";

const filePath = new URL(
  "../src/data/cultivationLogs.json",
  import.meta.url
);

const data = JSON.parse(readFileSync(filePath, "utf-8"));

for (const entry of data) {
  if (typeof entry.bodyContent === "string" && entry.bodyContent.length > 0) {
    // marked.parse returns a string when called synchronously (async: false is default)
    // It preserves inline HTML (iframes, etc.) by default.
    entry.bodyContent = marked.parse(entry.bodyContent).trim();
  }
}

writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");

console.log(`Converted bodyContent in ${data.length} entries.`);
