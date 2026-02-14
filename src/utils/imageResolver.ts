import imageManifest from '../data/imageManifest.json';
import { BASE } from '../config';

const manifest = imageManifest as Record<string, string[]>;

export function resolveAutoImages(genus: string, imageId: string, date: string): string[] {
  const key = `${genus}/${imageId}/${date}`;
  const paths = manifest[key] || [];
  if (import.meta.env.DEV && paths.length === 0) {
    console.warn(`[imageResolver] No images found for key: ${key}`);
  }
  return paths;
}

export function resolveLocalImages(imagePaths: string[]): string[] {
  const result: string[] = [];
  for (const imagePath of imagePaths) {
    const key = imagePath.replace(/\.[^.]+$/, '');
    const paths = manifest[key] || [`${BASE}/assets/images/${imagePath}`];
    if (import.meta.env.DEV && !manifest[key]) {
      console.warn(`[imageResolver] No manifest entry for: ${key}, using fallback`);
    }
    result.push(...paths);
  }
  return result;
}
