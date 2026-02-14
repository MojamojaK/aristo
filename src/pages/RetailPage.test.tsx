import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../test/renderWithRouter';
import RetailPage from './RetailPage';

vi.mock('../data/domesticStores.json', () => ({
  default: [
    {
      name: 'Test Store',
      location: '東京都',
      types: ['オンライン', '実店舗'],
      link: '<a href="https://example.com">example.com</a>',
      memo: 'テストメモ',
    },
    {
      name: 'No Link Store',
      location: '大阪府',
      types: ['即売会'],
      link: 'リンクなし',
      memo: '',
    },
  ],
}));

vi.mock('../data/internationalStores.json', () => ({
  default: [
    {
      name: 'AW - Andrew Wistuba',
      location: 'Germany ドイツ',
      link: '<a href="https://wistuba.com">wistuba.com</a>',
      notes: '',
      import_logs: '2024年1月 (Coming Soon)',
    },
  ],
}));

describe('RetailPage', () => {
  it('renders domestic stores table', () => {
    renderWithRouter(<RetailPage />);
    expect(screen.getByText('Test Store')).toBeInTheDocument();
    expect(screen.getByText('東京都')).toBeInTheDocument();
  });

  it('renders store types with line breaks for multiple types', () => {
    renderWithRouter(<RetailPage />);
    expect(screen.getByText('オンライン')).toBeInTheDocument();
    expect(screen.getByText('実店舗')).toBeInTheDocument();
  });

  it('renders SafeLink correctly for HTML link', () => {
    renderWithRouter(<RetailPage />);
    const link = screen.getByRole('link', { name: 'example.com' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('renders SafeLink as plain text when HTML does not contain a link', () => {
    renderWithRouter(<RetailPage />);
    expect(screen.getByText('リンクなし')).toBeInTheDocument();
  });

  it('renders international stores table', () => {
    renderWithRouter(<RetailPage />);
    expect(screen.getByText('AW - Andrew Wistuba')).toBeInTheDocument();
    expect(screen.getByText('Germany ドイツ')).toBeInTheDocument();
  });

  it('renders international store link', () => {
    renderWithRouter(<RetailPage />);
    const link = screen.getByRole('link', { name: 'wistuba.com' });
    expect(link).toHaveAttribute('href', 'https://wistuba.com');
  });

  it('renders memo text', () => {
    renderWithRouter(<RetailPage />);
    expect(screen.getByText('テストメモ')).toBeInTheDocument();
  });

  it('sets the page title', () => {
    renderWithRouter(<RetailPage />);
    expect(document.title).toBe('販売業者 - aristo');
  });

  it('renders table headers for domestic stores', () => {
    renderWithRouter(<RetailPage />);
    expect(screen.getByText('業者名')).toBeInTheDocument();
    expect(screen.getByText('拠点 都道府県')).toBeInTheDocument();
    expect(screen.getByText('販売形式')).toBeInTheDocument();
    expect(screen.getByText('Webサイト')).toBeInTheDocument();
    expect(screen.getByText('メモ')).toBeInTheDocument();
  });
});
