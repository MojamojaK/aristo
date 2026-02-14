import { describe, it, expect, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePageTitle } from './usePageTitle';

describe('usePageTitle', () => {
  afterEach(() => {
    document.title = '';
  });

  it('sets default title when no argument is provided', () => {
    renderHook(() => usePageTitle());
    expect(document.title).toBe('aristo - 食虫植物 素人栽培 備忘録');
  });

  it('sets default title when undefined is passed', () => {
    renderHook(() => usePageTitle(undefined));
    expect(document.title).toBe('aristo - 食虫植物 素人栽培 備忘録');
  });

  it('sets custom title with site name suffix', () => {
    renderHook(() => usePageTitle('栽培リスト'));
    expect(document.title).toBe('栽培リスト - aristo');
  });

  it('updates title when argument changes', () => {
    const { rerender } = renderHook(
      ({ title }) => usePageTitle(title),
      { initialProps: { title: 'Page A' as string | undefined } }
    );

    expect(document.title).toBe('Page A - aristo');

    rerender({ title: 'Page B' });
    expect(document.title).toBe('Page B - aristo');
  });

  it('reverts to default title when title becomes undefined', () => {
    const { rerender } = renderHook(
      ({ title }) => usePageTitle(title),
      { initialProps: { title: 'Page A' as string | undefined } }
    );

    expect(document.title).toBe('Page A - aristo');

    rerender({ title: undefined });
    expect(document.title).toBe('aristo - 食虫植物 素人栽培 備忘録');
  });

  it('sets default title for empty string', () => {
    renderHook(() => usePageTitle(''));
    expect(document.title).toBe('aristo - 食虫植物 素人栽培 備忘録');
  });
});
