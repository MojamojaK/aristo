import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../test/renderWithRouter';
import CultivationLogIndexPage from './CultivationLogIndexPage';

vi.mock('../data/cultivationLogs.json', () => ({
  default: [
    {
      slug: 'N_plant_a',
      name: 'N. plant A',
      alias: 'Alias A',
      genus: 'nepenthes',
      sub_category: 'species',
      environment: 'highland',
      logs: [
        {
          source: 'Source1',
          propagation: null,
          start_date: '2023-01-01',
          entries: [
            { date: '2023-01-01', contents: [{ items: [] }] },
            { date: '2023-02-01', contents: [{ items: [] }] },
          ],
        },
        {
          source: 'Source2',
          propagation: null,
          start_date: '2023-03-01',
          entries: [{ date: '2023-03-01', contents: [{ items: [] }] }],
        },
      ],
      nativeHabitat: null,
      cultivationEnvironment: null,
      sellerDescription: null,
    },
    {
      slug: 'N_plant_b',
      name: 'N. plant B',
      alias: null,
      genus: 'nepenthes',
      sub_category: 'hybrid',
      environment: 'lowland',
      logs: [],
      nativeHabitat: null,
      cultivationEnvironment: null,
      sellerDescription: null,
    },
  ],
}));

vi.mock('../data/genuses.json', () => ({
  default: [
    {
      name: 'nepenthes',
      header: 'Nepenthes - ネペンテス',
      sub_categories: [],
    },
  ],
}));

describe('CultivationLogIndexPage', () => {
  it('renders the page heading', () => {
    renderWithRouter(<CultivationLogIndexPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '栽培リスト',
    );
  });

  it('displays the total species count', () => {
    renderWithRouter(<CultivationLogIndexPage />);
    expect(screen.getByText(/2種の食虫植物を栽培中/)).toBeInTheDocument();
  });

  it('renders genus section header', () => {
    renderWithRouter(<CultivationLogIndexPage />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nepenthes - ネペンテス' }),
    ).toBeInTheDocument();
  });

  it('renders plant names with aliases', () => {
    renderWithRouter(<CultivationLogIndexPage />);
    expect(screen.getByText(/N. plant A.*Alias A/)).toBeInTheDocument();
  });

  it('renders plant name without alias when null', () => {
    renderWithRouter(<CultivationLogIndexPage />);
    const linkB = screen.getByRole('link', { name: 'N. plant B' });
    expect(linkB).toBeInTheDocument();
  });

  it('calculates entry counts correctly (sum across sources)', () => {
    renderWithRouter(<CultivationLogIndexPage />);
    // N_plant_a: 2 entries + 1 entry = 3 total
    expect(screen.getByText('3')).toBeInTheDocument();
    // N_plant_b: 0 entries
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('creates links to individual log pages', () => {
    renderWithRouter(<CultivationLogIndexPage />);
    const link = screen.getByRole('link', { name: /N. plant A/ });
    expect(link).toHaveAttribute('href', '/aristo/cultivation_logs/N_plant_a');
  });

  it('sets the page title', () => {
    renderWithRouter(<CultivationLogIndexPage />);
    expect(document.title).toBe('栽培リスト - aristo');
  });
});
