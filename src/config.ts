// Single source of truth for the base path.
// Derived from Vite's base config in vite.config.ts.
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
