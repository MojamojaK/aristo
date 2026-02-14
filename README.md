# aristo

食虫植物 素人栽培 備忘録 - A carnivorous plant cultivation log

A personal blog/documentation site for tracking carnivorous plant (primarily Nepenthes) cultivation.

Live site: https://mojamojak.github.io/aristo/

## Tech Stack

- **Framework:** React 19 + TypeScript 5.7
- **Build:** Vite 6
- **Routing:** React Router DOM v7
- **Hosting:** GitHub Pages

## Getting Started

### Prerequisites

- Node.js 22+
- npm

### Development

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
npm run preview  # preview production build locally
```

### Validation

```bash
npm run type-check       # TypeScript type checking
node scripts/validate-data.mjs  # Validate JSON data files
```

## Project Structure

```
src/
├── components/    # Layout, Sidebar
├── pages/         # Page components (Home, CultivationLog, Greenhouse, Retail, etc.)
├── types/         # TypeScript type definitions
├── data/          # JSON data files
├── hooks/         # Custom React hooks
├── utils/         # Utility modules
├── config.ts      # App configuration
├── App.tsx        # Root component with routing
├── main.tsx       # Entry point
└── index.css      # Global styles

scripts/
├── link-assets.mjs              # Symlinks image assets to public/
├── generate-image-manifest.mjs  # Generates image manifest JSON
├── generate-sitemap.mjs         # Generates sitemap.xml
├── validate-data.mjs            # Validates JSON data files
└── add-entry.mjs                # CLI tool for adding cultivation log entries
```

## Data Files

Plant cultivation data is stored as JSON in `src/data/`:

- `cultivationLogs.json` - Cultivation records per plant
- `genuses.json` - Plant genus/species taxonomy
- `greenhousePages.json` - Greenhouse setup pages
- `domesticStores.json` - Japanese retail stores
- `internationalStores.json` - International sellers
- `imageManifest.json` - Image path manifest

## Adding Plant Data

Use the CLI tool to add new cultivation log entries:

```bash
node scripts/add-entry.mjs <slug> <source> [options] <images...>
```

Or edit `src/data/cultivationLogs.json` directly. Images go in `assets/images/<genus>/<image_id>/`.

## Deployment

The site deploys automatically to GitHub Pages on push to `main` via GitHub Actions.
