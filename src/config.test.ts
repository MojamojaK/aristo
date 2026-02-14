import { describe, it, expect } from 'vitest';
import { BASE } from './config';

describe('config', () => {
  it('exports BASE as a string', () => {
    expect(typeof BASE).toBe('string');
  });

  it('BASE does not end with trailing slash', () => {
    expect(BASE.endsWith('/')).toBe(false);
  });

  it('BASE matches the vite base config', () => {
    // In test env, Vite sets BASE_URL based on vite.config.ts base: '/aristo/'
    expect(BASE).toBe('/aristo');
  });
});
