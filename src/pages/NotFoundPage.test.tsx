import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../test/renderWithRouter';
import NotFoundPage from './NotFoundPage';

describe('NotFoundPage', () => {
  it('renders the 404 heading', () => {
    renderWithRouter(<NotFoundPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404');
  });

  it('renders error message', () => {
    renderWithRouter(<NotFoundPage />);
    expect(screen.getByText('Page not found :(')).toBeInTheDocument();
  });

  it('renders a link to home', () => {
    renderWithRouter(<NotFoundPage />);
    const link = screen.getByRole('link', { name: 'ホームに戻る' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/aristo/');
  });
});
