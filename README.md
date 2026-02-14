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
├── convert-cultivation-logs.mjs # Converts markdown logs to JSON
├── convert-markdown-to-html.mjs # Markdown to HTML conversion
├── generate-sitemap.mjs         # Generates sitemap.xml
└── validate-data.mjs            # Validates JSON data files
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

1. Add markdown files to `collections/_cultivation_logs/`
2. Run `node scripts/convert-cultivation-logs.mjs` to generate JSON
3. Add images to `assets/images/<genus>/<image_id>/`
4. Run `node scripts/generate-image-manifest.mjs` to update the manifest

## Deployment

The site deploys automatically to GitHub Pages on push to `main` via GitHub Actions.
