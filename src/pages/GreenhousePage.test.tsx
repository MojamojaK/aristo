import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../test/renderWithRouter';
import GreenhousePage from './GreenhousePage';

vi.mock('../data/greenhousePages.json', () => ({
  default: [
    {
      slug: 'tank-mk1',
      url: '/greenhouse/tank/mk1',
      title: '自作温室MK1',
      content: '<p>温室の内容です</p>',
    },
    {
      slug: 'tech-system',
      url: '/greenhouse/tech/system',
      title: '温室環境 制御系',
      content: '<h2>構成図</h2>',
    },
  ],
}));

describe('GreenhousePage', () => {
  it('renders a known greenhouse page by wildcard URL', () => {
    renderWithRouter(<GreenhousePage />, {
      path: '/aristo/greenhouse/*',
      initialEntry: '/aristo/greenhouse/tank/mk1',
    });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '自作温室MK1'
    );
    expect(screen.getByText('温室の内容です')).toBeInTheDocument();
  });

  it('renders another greenhouse page', () => {
    renderWithRouter(<GreenhousePage />, {
      path: '/aristo/greenhouse/*',
      initialEntry: '/aristo/greenhouse/tech/system',
    });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '温室環境 制御系'
    );
  });

  it('renders not-found UI for unknown greenhouse URL', () => {
    renderWithRouter(<GreenhousePage />, {
      path: '/aristo/greenhouse/*',
      initialEntry: '/aristo/greenhouse/nonexistent',
    });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Page not found'
    );
    expect(
      screen.getByText('The greenhouse page could not be found.')
    ).toBeInTheDocument();
  });

  it('sets the page title for a found page', () => {
    renderWithRouter(<GreenhousePage />, {
      path: '/aristo/greenhouse/*',
      initialEntry: '/aristo/greenhouse/tank/mk1',
    });
    expect(document.title).toBe('自作温室MK1 - aristo');
  });
});
