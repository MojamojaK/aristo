# CLAUDE.md

## Project Overview

Aristo is a Japanese-language static site for documenting carnivorous plant cultivation (食虫植物 素人栽培 備忘録). It's a React SPA deployed to GitHub Pages at https://mojamojak.github.io/aristo/.

## Tech Stack

- **React 19** + **TypeScript 5.7** + **Vite 6**
- **React Router DOM v7** for client-side routing
- **Vitest** for testing with jsdom environment
- **ESLint 9** (flat config) + **Prettier** (single quotes, trailing commas)

## Commands

```bash
npm run dev            # Start dev server (auto-runs prebuild scripts)
npm run build          # Type-check + Vite production build
npm run lint           # ESLint
npm run type-check     # TypeScript checking (tsc --noEmit)
npm run format         # Prettier (write)
npm run format:check   # Prettier (check only)
npm test               # Run all tests
npm run test:coverage  # Tests with coverage report
npm run validate       # type-check + lint + test (all at once)
```

## Project Structure

```
src/
  components/       # React components (Layout, Sidebar)
  pages/            # Route page components
  types/index.ts    # All TypeScript interfaces
  data/             # Generated JSON (do NOT edit manually)
  hooks/            # Custom React hooks
  utils/            # Utilities (imageResolver)
  test/setup.ts     # Test environment setup
collections/
  _cultivation_logs/  # Source markdown files with YAML front matter
assets/images/        # Plant photos organized by genus/imageId/date
scripts/              # Build-time data processing scripts (Node ESM)
```

## Data Pipeline

Source markdown files in `collections/_cultivation_logs/` are processed at build time by prebuild scripts into `src/data/cultivationLogs.json`. Images in `assets/images/` are scanned into `src/data/imageManifest.json`. These JSON files in `src/data/` are **generated** — edit the source markdown or scripts instead.

The prebuild chain runs automatically before `dev` and `build`:
1. `link-assets.mjs` — symlinks images into `public/`
2. `generate-image-manifest.mjs` — builds image lookup table
3. `convert-cultivation-logs.mjs` — parses markdown + YAML → JSON
4. `convert-markdown-to-html.mjs` — converts body markdown to HTML
5. `generate-sitemap.mjs` — generates sitemap.xml

## Testing

Tests are co-located with source files (`*.test.tsx`). Coverage thresholds: 80% statements, 75% branches, 80% functions, 80% lines.

## Code Conventions

- TypeScript strict mode is enabled (`noUnusedLocals`, `noUnusedParameters`)
- Components: PascalCase filenames. Hooks: `useXxx`. Utils: camelCase
- ESLint enforces react-hooks rules and react-refresh export rules
- All site content is in Japanese

## CI/CD

GitHub Actions (`.github/workflows/deploy.yml`) runs on push to `main`:
`npm ci` → `lint` → `type-check` → `validate-data.mjs` → `build` → deploy to GitHub Pages

## Key Notes

- Base URL is `/aristo/` (configured in `vite.config.ts` and `src/config.ts`)
- `public/404.html` handles SPA routing on GitHub Pages via redirect script
- Image IDs follow KF# pattern (e.g., KF1, KF55)
- The `add-entry` script (`node scripts/add-entry.mjs`) is a CLI tool for adding new cultivation log entries with EXIF date extraction
