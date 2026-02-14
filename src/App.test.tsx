import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock all pages to isolate routing logic
vi.mock('./pages/HomePage', () => ({
  default: () => <div data-testid="home-page">Home</div>,
}));
vi.mock('./pages/CultivationLogIndexPage', () => ({
  default: () => <div data-testid="log-index-page">Log Index</div>,
}));
vi.mock('./pages/CultivationLogPage', () => ({
  default: () => <div data-testid="log-page">Log Detail</div>,
}));
vi.mock('./pages/GreenhousePage', () => ({
  default: () => <div data-testid="greenhouse-page">Greenhouse</div>,
}));
vi.mock('./pages/RetailPage', () => ({
  default: () => <div data-testid="retail-page">Retail</div>,
}));
vi.mock('./pages/NotFoundPage', () => ({
  default: () => <div data-testid="not-found-page">Not Found</div>,
}));
vi.mock('./components/Sidebar', () => ({
  default: () => <nav data-testid="sidebar">Sidebar</nav>,
}));

// App uses BrowserRouter which reads window.location, so we set it before render
function renderAppAt(path: string) {
  window.history.pushState({}, '', path);
  return render(<App />);
}

describe('App routing', () => {
  it('renders HomePage at /aristo/', () => {
    renderAppAt('/aristo/');
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('renders CultivationLogIndexPage at /aristo/cultivation_logs', () => {
    renderAppAt('/aristo/cultivation_logs');
    expect(screen.getByTestId('log-index-page')).toBeInTheDocument();
  });

  it('renders CultivationLogPage at /aristo/cultivation_logs/:slug', () => {
    renderAppAt('/aristo/cultivation_logs/N_rajah');
    expect(screen.getByTestId('log-page')).toBeInTheDocument();
  });

  it('renders GreenhousePage at /aristo/greenhouse/*', () => {
    renderAppAt('/aristo/greenhouse/tank/mk1');
    expect(screen.getByTestId('greenhouse-page')).toBeInTheDocument();
  });

  it('renders RetailPage at /aristo/purchasing/retail', () => {
    renderAppAt('/aristo/purchasing/retail');
    expect(screen.getByTestId('retail-page')).toBeInTheDocument();
  });

  it('renders NotFoundPage for unknown routes', () => {
    renderAppAt('/aristo/nonexistent/page');
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });

  it('renders Layout shell (sidebar + masthead)', () => {
    renderAppAt('/aristo/');
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'aristo' })).toBeInTheDocument();
  });
});
