import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../test/renderWithRouter';
import CultivationLogPage from './CultivationLogPage';

vi.mock('../data/cultivationLogs.json', () => ({
  default: [
    {
      slug: 'N_test_plant',
      name: 'N. test plant',
      alias: 'Test Alias',
      genus: 'nepenthes',
      sub_category: 'species',
      environment: 'highland',
      logs: [
        {
          source: 'BE-1234',
          propagation: '組織培養由来',
          start_date: '2023-04-01',
          entries: [
            {
              date: '2023-04-01',
              contents: [
                {
                  items: [{ text: 'First entry text' }],
                },
              ],
            },
            {
              date: '2024-01-15',
              contents: [
                {
                  items: [
                    { auto_image: { id: 'KF99' } },
                    { text: 'Second entry with image' },
                  ],
                },
              ],
            },
          ],
        },
        {
          source: 'AW Clone 01',
          propagation: null,
          start_date: '2024-06-01',
          entries: [
            {
              date: '2024-06-01',
              contents: [
                {
                  items: [{ text: 'AW clone arrived' }],
                },
              ],
            },
          ],
        },
      ],
      nativeHabitat: {
        locations: [
          { name: 'テスト自生地', maps: ['https://maps.example.com/test'] },
        ],
        elevation: '1000 - 2000m',
        temperature: 'Night 10 - 15℃ / Day 20 - 25℃',
      },
      cultivationEnvironment: {
        temperature: { text: '夜13 - 昼24℃' },
        humidity: { text: '70%~' },
        soil: { text: '', children: [{ text: '鹿沼小粒+パーライト' }] },
        light: { text: '', children: [{ text: '12時間 9000Lux' }] },
      },
      sellerDescription: null,
    },
    {
      slug: 'N_empty',
      name: 'N. empty',
      alias: null,
      genus: 'nepenthes',
      sub_category: 'species',
      environment: 'lowland',
      logs: [],
      nativeHabitat: null,
      cultivationEnvironment: null,
      sellerDescription: null,
    },
    {
      slug: 'N_with_seller',
      name: 'N. with seller',
      alias: null,
      genus: 'nepenthes',
      sub_category: 'species',
      environment: 'lowland',
      logs: [],
      nativeHabitat: null,
      cultivationEnvironment: null,
      sellerDescription: {
        source: 'Test Store',
        quote: ['First paragraph of quote.', 'Second paragraph of quote.'],
        notes: ['A personal note about cultivation.'],
      },
    },
  ],
}));

vi.mock('../utils/imageResolver', () => ({
  resolveAutoImages: vi.fn(() => [
    '/aristo/assets/images/nepenthes/KF99/2024-01-15-01.jpg',
  ]),
  resolveLocalImages: vi.fn((paths: string[]) =>
    paths.map((p) => `/aristo/assets/images/${p}`),
  ),
}));

describe('CultivationLogPage', () => {
  const renderPage = (slug: string) =>
    renderWithRouter(<CultivationLogPage />, {
      path: '/aristo/cultivation_logs/:slug',
      initialEntry: `/aristo/cultivation_logs/${slug}`,
    });

  it('renders the plant name as heading', () => {
    renderPage('N_test_plant');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'N. test plant',
    );
  });

  it('renders the alias', () => {
    renderPage('N_test_plant');
    expect(
      screen.getByRole('heading', { level: 2, name: 'Test Alias' }),
    ).toBeInTheDocument();
  });

  it('computes and displays the last updated date', () => {
    renderPage('N_test_plant');
    // Latest date across all sources is 2024-06-01
    expect(screen.getByText(/最終更新: 2024-06-01/)).toBeInTheDocument();
  });

  it('renders native habitat section', () => {
    renderPage('N_test_plant');
    expect(screen.getByText('自生地')).toBeInTheDocument();
    expect(screen.getByText('テスト自生地')).toBeInTheDocument();
    expect(screen.getByText(/1000 - 2000m/)).toBeInTheDocument();
  });

  it('renders cultivation environment section', () => {
    renderPage('N_test_plant');
    expect(screen.getByText('栽培環境')).toBeInTheDocument();
    expect(screen.getByText(/夜13 - 昼24℃/)).toBeInTheDocument();
    expect(screen.getByText('鹿沼小粒+パーライト')).toBeInTheDocument();
  });

  it('renders source headers with propagation', () => {
    renderPage('N_test_plant');
    expect(screen.getByText('BE-1234 - 組織培養由来')).toBeInTheDocument();
  });

  it('renders source header without propagation when null', () => {
    renderPage('N_test_plant');
    expect(screen.getByText('AW Clone 01')).toBeInTheDocument();
  });

  it('renders start dates', () => {
    renderPage('N_test_plant');
    expect(screen.getByText(/栽培開始日: 2023-04-01/)).toBeInTheDocument();
    expect(screen.getByText(/栽培開始日: 2024-06-01/)).toBeInTheDocument();
  });

  it('renders entry dates in the table', () => {
    renderPage('N_test_plant');
    expect(screen.getByText('2023-04-01')).toBeInTheDocument();
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
  });

  it('renders text items', () => {
    renderPage('N_test_plant');
    expect(screen.getByText('First entry text')).toBeInTheDocument();
    expect(screen.getByText('Second entry with image')).toBeInTheDocument();
  });

  it('renders auto_image as img elements', () => {
    renderPage('N_test_plant');
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(1);
    expect(images[0]).toHaveAttribute(
      'src',
      '/aristo/assets/images/nepenthes/KF99/2024-01-15-01.jpg',
    );
  });

  it('renders 404 for unknown slug', () => {
    renderPage('N_nonexistent');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Page not found',
    );
  });

  it('renders "準備中" when no structured content exists', () => {
    renderPage('N_empty');
    expect(screen.getByRole('heading', { name: '準備中' })).toBeInTheDocument();
  });

  it('renders seller description section', () => {
    renderPage('N_with_seller');
    expect(screen.getByText('販売者情報')).toBeInTheDocument();
    expect(screen.getByText(/Test Storeより引用/)).toBeInTheDocument();
    expect(screen.getByText('First paragraph of quote.')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph of quote.')).toBeInTheDocument();
    expect(
      screen.getByText('A personal note about cultivation.'),
    ).toBeInTheDocument();
  });

  it('renders 特徴 heading when only sellerDescription exists', () => {
    renderPage('N_with_seller');
    expect(
      screen.getByRole('heading', { name: '特徴' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('準備中')).not.toBeInTheDocument();
  });

  it('does not render alias when null', () => {
    renderPage('N_empty');
    const headings = screen.getAllByRole('heading');
    const aliasHeading = headings.find(
      (h) => h.tagName === 'H2' && h.textContent && h.textContent !== '準備中',
    );
    expect(aliasHeading).toBeUndefined();
  });

  it('does not render 栽培株 section when no logs', () => {
    renderPage('N_empty');
    expect(screen.queryByText('栽培株')).not.toBeInTheDocument();
  });
});
