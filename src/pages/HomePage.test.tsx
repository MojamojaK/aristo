import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../test/renderWithRouter';
import HomePage from './HomePage';

describe('HomePage', () => {
  it('renders the site heading', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'aristo - 食虫植物 素人栽培 備忘録',
    );
  });

  it('renders introductory text content', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByText(/2023年2月より開始/)).toBeInTheDocument();
  });

  it('sets the default page title', () => {
    renderWithRouter(<HomePage />);
    expect(document.title).toBe('aristo - 食虫植物 素人栽培 備忘録');
  });
});
