import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithRouter } from '../test/renderWithRouter';
import Sidebar from './Sidebar';

vi.mock('../data/genuses.json', () => ({
  default: [
    {
      name: 'nepenthes',
      header: 'Nepenthes - ネペンテス',
      sub_categories: [
        {
          name: 'species',
          header: 'Species - 原種',
          environments: [
            { name: 'highland', header: 'Highland - 高山性' },
            { name: 'lowland', header: 'Lowland - 低地性' },
          ],
        },
        {
          name: 'hybrid',
          header: 'Hybrids - 交配種',
          environments: [
            { name: 'highland', header: 'Highland - 高山性温室' },
          ],
        },
      ],
    },
  ],
}));

vi.mock('../data/cultivationLogs.json', () => ({
  default: [
    {
      slug: 'N_rajah',
      name: 'N. rajah',
      alias: null,
      genus: 'nepenthes',
      sub_category: 'species',
      environment: 'highland',
      logs: [{ source: 'S1', entries: [{ date: '2023-01-01' }] }],
      bodyContent: '',
    },
    {
      slug: 'N_ampullaria',
      name: 'N. ampullaria',
      alias: null,
      genus: 'nepenthes',
      sub_category: 'species',
      environment: 'lowland',
      logs: [],
      bodyContent: '',
    },
    {
      slug: 'N_Dyeriana',
      name: 'N. Dyeriana',
      alias: 'Alias D',
      genus: 'nepenthes',
      sub_category: 'hybrid',
      environment: 'highland',
      logs: [],
      bodyContent: '',
    },
  ],
}));

vi.mock('../data/greenhousePages.json', () => ({
  default: [
    { slug: 'tank-mk1', url: '/greenhouse/tank/mk1', title: '自作温室MK1' },
  ],
}));

describe('Sidebar', () => {
  it('renders the Home link', () => {
    renderWithRouter(<Sidebar />);
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/aristo/');
  });

  it('renders the version text', () => {
    renderWithRouter(<Sidebar />);
    expect(screen.getByText('Currently v1.0.0')).toBeInTheDocument();
  });

  it('renders top-level accordion items', () => {
    renderWithRouter(<Sidebar />);
    expect(screen.getByText('栽培リスト')).toBeInTheDocument();
    expect(screen.getByText('温室')).toBeInTheDocument();
    expect(screen.getByText('入手方法')).toBeInTheDocument();
  });

  it('opens 栽培リスト accordion on click', () => {
    renderWithRouter(<Sidebar />);
    const button = screen.getByText('栽培リスト');
    fireEvent.click(button);
    expect(button.closest('li')).toHaveClass('active');
    expect(
      screen.getByText('Nepenthes - ネペンテス')
    ).toBeInTheDocument();
  });

  it('drills down through genus → subcategory → environment', () => {
    renderWithRouter(<Sidebar />);

    fireEvent.click(screen.getByText('栽培リスト'));
    fireEvent.click(screen.getByText('Nepenthes - ネペンテス'));
    fireEvent.click(screen.getByText('Species - 原種'));
    fireEvent.click(screen.getByText('Highland - 高山性'));

    expect(screen.getByRole('link', { name: 'N. rajah' })).toBeInTheDocument();
  });

  it('shows "(Coming Soon)" for logs with no entries', () => {
    renderWithRouter(<Sidebar />);

    fireEvent.click(screen.getByText('栽培リスト'));
    fireEvent.click(screen.getByText('Nepenthes - ネペンテス'));
    fireEvent.click(screen.getByText('Species - 原種'));
    fireEvent.click(screen.getByText('Lowland - 低地性'));

    expect(
      screen.getByText(/N. ampullaria.*Coming Soon/)
    ).toBeInTheDocument();
  });

  it('shows alias in link text', () => {
    renderWithRouter(<Sidebar />);

    fireEvent.click(screen.getByText('栽培リスト'));
    fireEvent.click(screen.getByText('Nepenthes - ネペンテス'));
    fireEvent.click(screen.getByText('Hybrids - 交配種'));
    fireEvent.click(screen.getByText('Highland - 高山性温室'));

    expect(
      screen.getByText(/N. Dyeriana.*Alias D/)
    ).toBeInTheDocument();
  });

  it('closes accordion when clicking same button again', () => {
    renderWithRouter(<Sidebar />);

    const button = screen.getByText('栽培リスト');
    fireEvent.click(button); // open
    expect(button).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(button); // close
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens greenhouse accordion and shows pages', () => {
    renderWithRouter(<Sidebar />);
    fireEvent.click(screen.getByText('温室'));
    expect(
      screen.getByRole('link', { name: '自作温室MK1' })
    ).toBeInTheDocument();
  });

  it('opens purchasing accordion and shows retail link', () => {
    renderWithRouter(<Sidebar />);
    fireEvent.click(screen.getByText('入手方法'));
    expect(
      screen.getByRole('link', { name: '販売業者' })
    ).toBeInTheDocument();
  });

  it('auto-opens accordions based on current cultivation log route', () => {
    renderWithRouter(<Sidebar />, {
      path: '/aristo/cultivation_logs/:slug',
      initialEntry: '/aristo/cultivation_logs/N_rajah',
    });

    // 栽培リスト should be open
    const listButton = screen.getByText('栽培リスト');
    expect(listButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('auto-opens greenhouse accordion based on greenhouse route', () => {
    renderWithRouter(<Sidebar />, {
      path: '/aristo/greenhouse/*',
      initialEntry: '/aristo/greenhouse/tank/mk1',
    });

    const ghButton = screen.getByText('温室');
    expect(ghButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('auto-opens purchasing accordion based on purchasing route', () => {
    renderWithRouter(<Sidebar />, {
      path: '/aristo/purchasing/*',
      initialEntry: '/aristo/purchasing/retail',
    });

    const purchButton = screen.getByText('入手方法');
    expect(purchButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('marks Home link as active on home route', () => {
    renderWithRouter(<Sidebar />, {
      path: '/aristo/',
      initialEntry: '/aristo/',
    });

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveClass('active');
  });
});
