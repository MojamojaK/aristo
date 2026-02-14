import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../data/imageManifest.json', () => ({
  default: {
    'nepenthes/KF4/2023-05-07': [
      '/aristo/assets/images/nepenthes/KF4/2023-05-07-01.jpg',
      '/aristo/assets/images/nepenthes/KF4/2023-05-07-02.jpg',
    ],
    'nepenthes/KF12/2024-01-19': [
      '/aristo/assets/images/nepenthes/KF12/2024-01-19-01.jpg',
    ],
    'greenhouse/mist_maker': [
      '/aristo/assets/images/greenhouse/mist_maker.jpg',
    ],
  },
}));

vi.mock('../config', () => ({ BASE: '/aristo' }));

import { resolveAutoImages, resolveLocalImages } from './imageResolver';

describe('resolveAutoImages', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns matching image paths for a valid key', () => {
    const result = resolveAutoImages('nepenthes', 'KF4', '2023-05-07');
    expect(result).toEqual([
      '/aristo/assets/images/nepenthes/KF4/2023-05-07-01.jpg',
      '/aristo/assets/images/nepenthes/KF4/2023-05-07-02.jpg',
    ]);
  });

  it('returns a single image when only one matches', () => {
    const result = resolveAutoImages('nepenthes', 'KF12', '2024-01-19');
    expect(result).toEqual([
      '/aristo/assets/images/nepenthes/KF12/2024-01-19-01.jpg',
    ]);
  });

  it('returns empty array for non-existent key', () => {
    const result = resolveAutoImages('nepenthes', 'KF99', '2023-01-01');
    expect(result).toEqual([]);
  });

  it('warns in DEV mode when no images found', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    resolveAutoImages('nepenthes', 'KF99', '2023-01-01');

    if (import.meta.env.DEV) {
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('nepenthes/KF99/2023-01-01')
      );
    }

    warnSpy.mockRestore();
  });
});

describe('resolveLocalImages', () => {
  it('resolves paths from manifest by stripping extension', () => {
    const result = resolveLocalImages(['greenhouse/mist_maker.jpg']);
    expect(result).toEqual([
      '/aristo/assets/images/greenhouse/mist_maker.jpg',
    ]);
  });

  it('falls back to constructed path when not in manifest', () => {
    const result = resolveLocalImages(['greenhouse/unknown_image.png']);
    expect(result).toEqual(['/aristo/assets/images/greenhouse/unknown_image.png']);
  });

  it('handles multiple image paths', () => {
    const result = resolveLocalImages([
      'greenhouse/mist_maker.jpg',
      'greenhouse/other.jpg',
    ]);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe('/aristo/assets/images/greenhouse/mist_maker.jpg');
    expect(result[1]).toBe('/aristo/assets/images/greenhouse/other.jpg');
  });

  it('returns empty array for empty input', () => {
    const result = resolveLocalImages([]);
    expect(result).toEqual([]);
  });
});
